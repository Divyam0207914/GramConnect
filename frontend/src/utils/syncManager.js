/**
 * Sync Manager - Handles syncing of offline data when connection is restored
 */

import { 
    getSyncQueue, 
    updateSyncQueueItem, 
    removeFromSyncQueue,
    updateComplaintSyncStatus,
    updateValidationResponseSync,
    getPendingValidationResponses,
    getComplaintsFromDB
  } from './indexedDB.js';
  import { complaintAPI, validationAPI } from '../services/api.js';
  
  let isSyncing = false;
  let syncListeners = [];
  let isInitialized = false; // Prevent multiple initializations
  
  /**
   * Check if online
   */
  export const isOnline = () => {
    return navigator.onLine;
  };
  
  /**
   * Add sync listener
   */
  export const addSyncListener = (callback) => {
    syncListeners.push(callback);
    return () => {
      syncListeners = syncListeners.filter(listener => listener !== callback);
    };
  };
  
  /**
   * Notify sync listeners
   */
  const notifySyncListeners = (event, data) => {
    syncListeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in sync listener:', error);
      }
    });
  };
  
  /**
   * Sync a single complaint
   */
  const syncComplaint = async (complaint) => {
    try {
      const formData = new FormData();
      formData.append('title', complaint.title);
      formData.append('description', complaint.description);
      formData.append('category', complaint.category);
      formData.append('submittedBy', complaint.submittedBy);
      
      // Handle location
      if (complaint.location) {
        formData.append('location', JSON.stringify(complaint.location));
      }
  
      // Handle image if it's a base64 string or blob
      if (complaint.image) {
        if (typeof complaint.image === 'string' && complaint.image.startsWith('data:')) {
          // Convert base64 data URL to blob
          const base64Response = await fetch(complaint.image);
          const blob = await base64Response.blob();
          formData.append('image', blob, complaint.imageName || 'image.jpg');
        } else if (complaint.image instanceof Blob) {
          formData.append('image', complaint.image, complaint.imageName || 'image.jpg');
        }
      }
  
      const response = await complaintAPI.create(formData);
      
      // Update sync status
      if (complaint.tempId) {
        await updateComplaintSyncStatus(complaint.tempId, response.data.complaint._id);
      }
  
      notifySyncListeners('complaint_synced', { tempId: complaint.tempId, serverId: response.data.complaint._id });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error syncing complaint:', error);
      throw error;
    }
  };
  
  /**
   * Sync a validation response
   */
  const syncValidationResponse = async (response) => {
    try {
      // Make sure we have all required data
      if (!response.validationId || !response.userId || !response.response) {
        console.warn('Skipping validation response sync due to missing data:', response);
        await updateValidationResponseSync(response.id, response.validationId, response.userId);
        return { success: true, message: 'Skipped due to missing data' };
      }
      
      const result = await validationAPI.submitResponse({
        validationId: response.validationId,
        userId: response.userId,
        response: response.response,
        comments: response.comments || ''
      });
  
      await updateValidationResponseSync(response.id, response.validationId, response.userId);
      notifySyncListeners('validation_synced', { id: response.id });
      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error syncing validation response:', error);
      throw error;
    }
  };
  
  /**
   * Process sync queue
   */
  const processSyncQueue = async () => {
    if (isSyncing || !isOnline()) {
      return;
    }
  
    isSyncing = true;
    notifySyncListeners('sync_started', {});
  
    try {
      const queue = await getSyncQueue();
      let syncedCount = 0;
      let failedCount = 0;
  
      for (const item of queue) {
        try {
          if (item.type === 'create_complaint') {
            // Get the complaint from IndexedDB
            const complaints = await getComplaintsFromDB();
            const complaint = complaints.find(c => c.tempId === item.tempId);
            
            if (complaint && !complaint.synced) {
              await syncComplaint(complaint);
              await removeFromSyncQueue(item.id);
              syncedCount++;
            }
          } else if (item.type === 'validation_response') {
            // Get validation responses
            const responses = await getPendingValidationResponses();
            const response = responses.find(r => r.validationId === item.validationId && r.userId === item.userId);
            
            if (response && !response.synced) {
              await syncValidationResponse(response);
              await removeFromSyncQueue(item.id);
              syncedCount++;
            }
          } else if (item.type === 'update_complaint_status') {
            // Sync status update
            try {
              await complaintAPI.updateStatus(item.complaintId, item.status);
              await removeFromSyncQueue(item.id);
              syncedCount++;
            } catch (error) {
              if (error.response?.status === 404) {
                // Complaint doesn't exist, remove from queue
                await removeFromSyncQueue(item.id);
              } else {
                throw error;
              }
            }
          }
  
          // Small delay between syncs to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Error syncing item ${item.id}:`, error);
          
          // Update retry count
          item.retryCount = (item.retryCount || 0) + 1;
          
          // Mark as failed if retry limit reached
          if (item.retryCount >= 5) {
            await updateSyncQueueItem(item.id, { 
              status: 'failed', 
              error: error.message,
              failedAt: new Date().toISOString()
            });
            failedCount++;
          } else {
            // Update retry count but keep as pending
            await updateSyncQueueItem(item.id, { retryCount: item.retryCount });
            failedCount++;
          }
        }
      }
  
      notifySyncListeners('sync_completed', { syncedCount, failedCount, total: queue.length });
    } catch (error) {
      console.error('Error processing sync queue:', error);
      notifySyncListeners('sync_error', { error: error.message });
    } finally {
      isSyncing = false;
    }
  };
  
  /**
   * Start sync process
   */
  export const startSync = async () => {
    if (!isOnline()) {
      console.log('Cannot sync: offline');
      return;
    }
  
    await processSyncQueue();
  };
  
  /**
   * Initialize sync manager with event listeners
   */
  export const initSyncManager = () => {
    // Prevent multiple initializations
    if (isInitialized) {
      return;
    }
    
    isInitialized = true;
  
    // Listen for online event
    window.addEventListener('online', () => {
      console.log('Connection restored, starting sync...');
      notifySyncListeners('online', {});
      startSync();
    });
  
    // Listen for offline event
    window.addEventListener('offline', () => {
      console.log('Connection lost');
      notifySyncListeners('offline', {});
    });
  
    // Periodic sync check (every 30 seconds when online)
    setInterval(() => {
      if (isOnline() && !isSyncing) {
        processSyncQueue();
      }
    }, 30000);
  
    // Initial sync check
    if (isOnline()) {
      setTimeout(() => startSync(), 2000);
    }
  };
  
  /**
   * Get sync status
   */
  export const getSyncStatus = async () => {
    const queue = await getSyncQueue();
    const complaints = await getComplaintsFromDB();
    const unsyncedComplaints = complaints.filter(c => !c.synced);
    const pendingResponses = await getPendingValidationResponses();
  
    return {
      isOnline: isOnline(),
      isSyncing,
      pendingOperations: queue.length,
      unsyncedComplaints: unsyncedComplaints.length,
      pendingValidationResponses: pendingResponses.length,
      totalPending: queue.length + unsyncedComplaints.length + pendingResponses.length
    };
  };
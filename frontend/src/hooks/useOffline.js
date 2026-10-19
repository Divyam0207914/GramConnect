/**
 * React hook for offline/online status and sync management
 */

import { useState, useEffect } from 'react';
import { isOnline, initSyncManager, addSyncListener, getSyncStatus, startSync } from '../utils/syncManager.js';

export const useOffline = () => {
  const [online, setOnline] = useState(isOnline());
  const [syncStatus, setSyncStatus] = useState({
    isSyncing: false,
    pendingOperations: 0,
    unsyncedComplaints: 0,
    pendingValidationResponses: 0,
    totalPending: 0
  });

  useEffect(() => {
    // Initialize sync manager (now safe to call multiple times)
    initSyncManager();

    // Update online status
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen to sync events
    const removeListener = addSyncListener((event, data) => {
      if (event === 'sync_started') {
        setSyncStatus(prev => ({ ...prev, isSyncing: true }));
      } else if (event === 'sync_completed' || event === 'sync_error') {
        setSyncStatus(prev => ({ ...prev, isSyncing: false }));
        // Refresh sync status
        updateSyncStatus();
      } else if (event === 'complaint_synced' || event === 'validation_synced') {
        // Refresh sync status after sync
        setTimeout(() => updateSyncStatus(), 500);
      }
    });

    // Initial sync status
    updateSyncStatus();

    // Update sync status periodically
    const interval = setInterval(() => {
      updateSyncStatus();
    }, 5000);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      removeListener();
      clearInterval(interval);
    };
  }, []);

  const updateSyncStatus = async () => {
    try {
      const status = await getSyncStatus();
      setSyncStatus({
        isSyncing: status.isSyncing,
        pendingOperations: status.pendingOperations,
        unsyncedComplaints: status.unsyncedComplaints,
        pendingValidationResponses: status.pendingValidationResponses,
        totalPending: status.totalPending
      });
    } catch (error) {
      console.error('Error updating sync status:', error);
    }
  };

  const triggerSync = async () => {
    if (online) {
      await startSync();
      await updateSyncStatus();
    }
  };

  return {
    online,
    isOnline: online,
    syncStatus,
    triggerSync,
    updateSyncStatus
  };
};


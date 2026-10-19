/**
 * IndexedDB wrapper for offline data storage
 */

const DB_NAME = 'GramConnectDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  COMPLAINTS: 'complaints',
  PENDING_OPERATIONS: 'pendingOperations',
  VALIDATION_RESPONSES: 'validationResponses',
  CACHED_DATA: 'cachedData',
  SYNC_QUEUE: 'syncQueue'
};

let dbInstance = null;

/**
 * Initialize IndexedDB
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Complaints store
      if (!db.objectStoreNames.contains(STORES.COMPLAINTS)) {
        const complaintStore = db.createObjectStore(STORES.COMPLAINTS, { keyPath: 'id', autoIncrement: true });
        complaintStore.createIndex('tempId', 'tempId', { unique: false });
        complaintStore.createIndex('synced', 'synced', { unique: false });
        complaintStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Pending operations store
      if (!db.objectStoreNames.contains(STORES.PENDING_OPERATIONS)) {
        const opsStore = db.createObjectStore(STORES.PENDING_OPERATIONS, { keyPath: 'id', autoIncrement: true });
        opsStore.createIndex('type', 'type', { unique: false });
        opsStore.createIndex('status', 'status', { unique: false });
        opsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Validation responses store
      if (!db.objectStoreNames.contains(STORES.VALIDATION_RESPONSES)) {
        const validationStore = db.createObjectStore(STORES.VALIDATION_RESPONSES, { keyPath: 'id', autoIncrement: true });
        validationStore.createIndex('validationId', 'validationId', { unique: false });
        validationStore.createIndex('synced', 'synced', { unique: false });
      }

      // Cached data store (for API responses)
      if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
        const cacheStore = db.createObjectStore(STORES.CACHED_DATA, { keyPath: 'key' });
        cacheStore.createIndex('expiresAt', 'expiresAt', { unique: false });
      }

      // Sync queue store
      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const queueStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('priority', 'priority', { unique: false });
        queueStore.createIndex('status', 'status', { unique: false });
        queueStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
  });
};

/**
 * Get all complaints from IndexedDB
 */
export const getComplaintsFromDB = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.COMPLAINTS], 'readonly');
    const store = transaction.objectStore(STORES.COMPLAINTS);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save complaint to IndexedDB (for offline mode)
 */
export const saveComplaintToDB = async (complaintData) => {
  const db = await initDB();
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const complaint = {
    ...complaintData,
    tempId,
    synced: false,
    createdAt: new Date().toISOString(),
    status: 'submitted'
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.COMPLAINTS], 'readwrite');
    const store = transaction.objectStore(STORES.COMPLAINTS);
    const request = store.add(complaint);

    request.onsuccess = () => resolve({ ...complaint, id: request.result });
    request.onerror = () => reject(request.error);
  });
};

/**
 * Update complaint sync status
 */
export const updateComplaintSyncStatus = async (tempId, serverId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.COMPLAINTS], 'readwrite');
    const store = transaction.objectStore(STORES.COMPLAINTS);
    const index = store.index('tempId');
    const request = index.openCursor(IDBKeyRange.only(tempId));

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const complaint = cursor.value;
        complaint.synced = true;
        complaint.serverId = serverId;
        complaint.syncedAt = new Date().toISOString();
        cursor.update(complaint);
        resolve(complaint);
      } else {
        reject(new Error('Complaint not found'));
      }
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Add operation to sync queue
 */
export const addToSyncQueue = async (operation) => {
  const db = await initDB();
  const queueItem = {
    ...operation,
    status: 'pending',
    priority: operation.priority || 5,
    createdAt: new Date().toISOString(),
    retryCount: 0
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.add(queueItem);

    request.onsuccess = () => resolve({ ...queueItem, id: request.result });
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get all pending operations from sync queue
 */
export const getSyncQueue = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const index = store.index('status');
    const request = index.getAll('pending');

    request.onsuccess = () => {
      const items = request.result.sort((a, b) => b.priority - a.priority || new Date(a.createdAt) - new Date(b.createdAt));
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Update sync queue item status
 */
export const updateSyncQueueItem = async (id, updates) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.get(id);

    request.onsuccess = () => {
      const item = request.result;
      if (item) {
        Object.assign(item, updates);
        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => resolve(item);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error('Queue item not found'));
      }
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Remove item from sync queue
 */
export const removeFromSyncQueue = async (id) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save validation response for offline sync
 */
export const saveValidationResponse = async (validationData) => {
  const db = await initDB();
  const response = {
    ...validationData,
    synced: false,
    createdAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.VALIDATION_RESPONSES], 'readwrite');
    const store = transaction.objectStore(STORES.VALIDATION_RESPONSES);
    const request = store.add(response);

    request.onsuccess = () => resolve({ ...response, id: request.result });
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get pending validation responses
 */
export const getPendingValidationResponses = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.VALIDATION_RESPONSES], 'readonly');
    const store = transaction.objectStore(STORES.VALIDATION_RESPONSES);
    const request = store.getAll();

    request.onsuccess = () => {
      // Filter for unsynced responses
      const pending = request.result.filter(item => item.synced === false);
      resolve(pending);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Update validation response sync status
 */
export const updateValidationResponseSync = async (id, validationId, userId) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.VALIDATION_RESPONSES], 'readwrite');
    const store = transaction.objectStore(STORES.VALIDATION_RESPONSES);
    
    // First try to get by id
    if (id) {
      const request = store.get(id);
      request.onsuccess = () => {
        const item = request.result;
        if (item) {
          item.synced = true;
          item.syncedAt = new Date().toISOString();
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve(item);
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Validation response not found'));
        }
      };
      request.onerror = () => reject(request.error);
    } else if (validationId && userId) {
      // If no id, try to find by validationId and userId
      const request = store.openCursor();
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const value = cursor.value;
          if (value.validationId === validationId && value.userId === userId && value.synced === false) {
            value.synced = true;
            value.syncedAt = new Date().toISOString();
            const updateRequest = cursor.update(value);
            updateRequest.onsuccess = () => resolve(value);
            updateRequest.onerror = () => reject(updateRequest.error);
            return;
          }
          cursor.continue();
        } else {
          reject(new Error('Validation response not found'));
        }
      };
      request.onerror = () => reject(request.error);
    } else {
      reject(new Error('Either id or (validationId and userId) must be provided'));
    }
  });
};

/**
 * Cache API response
 */
export const cacheAPIResponse = async (key, data, ttlMinutes = 60) => {
  const db = await initDB();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString();
  
  const cacheItem = {
    key,
    data,
    expiresAt,
    cachedAt: new Date().toISOString()
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_DATA], 'readwrite');
    const store = transaction.objectStore(STORES.CACHED_DATA);
    const request = store.put(cacheItem);

    request.onsuccess = () => resolve(cacheItem);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get cached API response
 */
export const getCachedAPIResponse = async (key) => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_DATA], 'readonly');
    const store = transaction.objectStore(STORES.CACHED_DATA);
    const request = store.get(key);

    request.onsuccess = () => {
      const item = request.result;
      if (item && new Date(item.expiresAt) > new Date()) {
        resolve(item.data);
      } else {
        if (item) {
          // Remove expired cache
          const deleteTransaction = db.transaction([STORES.CACHED_DATA], 'readwrite');
          deleteTransaction.objectStore(STORES.CACHED_DATA).delete(key);
        }
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Clear expired cache entries
 */
export const clearExpiredCache = async () => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.CACHED_DATA], 'readwrite');
    const store = transaction.objectStore(STORES.CACHED_DATA);
    const index = store.index('expiresAt');
    const request = index.openCursor();
    const now = new Date().toISOString();

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        if (cursor.value.expiresAt < now) {
          cursor.delete();
        }
        cursor.continue();
      } else {
        resolve();
      }
    };
    request.onerror = () => reject(request.error);
  });
};


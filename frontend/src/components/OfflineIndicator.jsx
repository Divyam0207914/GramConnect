/**
 * Offline status indicator component
 */

import React from 'react';
import { useOffline } from '../hooks/useOffline';
import { WifiOff, Wifi, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const OfflineIndicator = () => {
  const { online, syncStatus, triggerSync } = useOffline();

  const handleManualSync = async () => {
    if (!online) {
      toast.error('Cannot sync while offline');
      return;
    }

    toast.loading('Syncing data...', { id: 'sync' });
    try {
      await triggerSync();
      toast.success('Sync completed successfully', { id: 'sync' });
    } catch (error) {
      toast.error('Sync failed. Please try again.', { id: 'sync' });
    }
  };

  if (online && syncStatus.totalPending === 0) {
    return null; // Don't show anything if online and everything is synced
  }

  return (
    <div className={`fixed bottom-4 right-4 z-50 max-w-sm ${online ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'} border-2 rounded-lg shadow-lg p-4 transition-all duration-300`}>
      <div className="flex items-start gap-3">
        <div className={`flex-shrink-0 ${online ? 'text-blue-600' : 'text-red-600'}`}>
          {online ? (
            syncStatus.isSyncing ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <Wifi className="h-5 w-5" />
            )
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className={`text-sm font-semibold ${online ? 'text-blue-900' : 'text-red-900'}`}>
              {online ? (
                syncStatus.isSyncing ? 'Syncing...' : 'Online - Pending Sync'
              ) : (
                'You are offline'
              )}
            </p>
            
            {online && syncStatus.totalPending > 0 && (
              <button
                onClick={handleManualSync}
                disabled={syncStatus.isSyncing}
                className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {syncStatus.isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            )}
          </div>
          
          {syncStatus.totalPending > 0 && (
            <div className="mt-2 space-y-1">
              <p className="text-xs text-gray-600">
                {syncStatus.unsyncedComplaints > 0 && (
                  <span>{syncStatus.unsyncedComplaints} complaint{syncStatus.unsyncedComplaints !== 1 ? 's' : ''} pending</span>
                )}
                {syncStatus.unsyncedComplaints > 0 && syncStatus.pendingValidationResponses > 0 && ' • '}
                {syncStatus.pendingValidationResponses > 0 && (
                  <span>{syncStatus.pendingValidationResponses} validation response{syncStatus.pendingValidationResponses !== 1 ? 's' : ''} pending</span>
                )}
              </p>
            </div>
          )}
          
          {!online && (
            <p className="text-xs text-red-700 mt-1">
              Changes will be synced when connection is restored
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfflineIndicator;


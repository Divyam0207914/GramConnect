# Offline Mode Features

This application now supports offline functionality, allowing users to perform key actions even when they don't have an internet connection. All offline actions are automatically synced when the connection is restored.

## Features

### ✅ What Works Offline

1. **Submit Complaints**
   - Users can create and submit complaints offline
   - Images are stored locally as base64 data
   - Complaints are queued for sync automatically
   - Complaints are visible in the complaints list with an "Offline" badge

2. **Submit Validation Responses**
   - Users can respond to validation requests offline
   - Responses are queued for sync
   - Status is maintained locally

3. **View Cached Data**
   - Previously loaded complaints are cached
   - Validation requests are cached
   - Last 5 minutes of API responses are cached

4. **Automatic Sync**
   - When connection is restored, all pending operations sync automatically
   - Sync happens every 30 seconds when online
   - Manual sync button available in the offline indicator

## Technical Implementation

### Storage
- **IndexedDB**: Used for storing offline complaints, validation responses, and sync queue
- **Cache API**: Used by Service Worker for caching static assets and API responses
- **LocalStorage**: Used for authentication tokens (existing)

### Components

1. **IndexedDB Utilities** (`src/utils/indexedDB.js`)
   - Manages all IndexedDB operations
   - Stores complaints, validation responses, sync queue, and cached data

2. **Sync Manager** (`src/utils/syncManager.js`)
   - Handles syncing of offline data when connection is restored
   - Monitors online/offline status
   - Processes sync queue with priority ordering
   - Retries failed syncs (up to 5 times)

3. **Offline Hook** (`src/hooks/useOffline.js`)
   - React hook for accessing offline status
   - Provides sync status and controls

4. **Offline Indicator** (`src/components/OfflineIndicator.jsx`)
   - Visual indicator showing online/offline status
   - Displays pending sync count
   - Manual sync button
   - Appears in bottom-right corner when offline or when sync is pending

5. **Service Worker** (`public/sw.js`)
   - Caches static assets for offline access
   - Handles background sync
   - Provides offline fallback for pages

### API Service Updates

The API service (`src/services/api.js`) has been enhanced to:
- Detect offline state automatically
- Save requests to IndexedDB when offline
- Queue operations for sync
- Use cached responses when offline
- Fallback gracefully on network errors

## User Experience

### Offline Indicators

- **Offline Badge**: Orange badge on complaints created offline
- **Offline Indicator Widget**: Bottom-right corner showing:
  - Connection status (Online/Offline)
  - Number of pending syncs
  - Manual sync button
  - Sync progress

### Sync Process

1. When offline, actions are saved locally
2. Connection is detected automatically
3. Sync starts automatically when connection is restored
4. Users see sync progress in the offline indicator
5. Success notifications appear when sync completes

## Limitations

1. **Login/Registration**: Requires online connection (security requirement)
2. **Real-time Updates**: Some real-time data may be stale until sync
3. **Large Files**: Very large images may take longer to sync
4. **Browser Support**: Requires modern browser with IndexedDB and Service Worker support

## Testing Offline Mode

1. Open browser DevTools (F12)
2. Go to Network tab
3. Enable "Offline" checkbox
4. Try submitting a complaint - it should work
5. Check the offline indicator for sync status
6. Disable "Offline" - sync should start automatically

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Opera (latest)

**Note**: Service Workers require HTTPS in production (HTTP is allowed in localhost for development).


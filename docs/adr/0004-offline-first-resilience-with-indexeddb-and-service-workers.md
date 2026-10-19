# ADR-0004: Offline-First Resilience with IndexedDB & Service Workers

## Status
Accepted

## Context
A major barrier to civic grievance redressal in rural and semi-urban communities is unstable, intermittent, or absent cellular connectivity. Traditional web forms fail silently or dump user input when connection drops during photo capture or form submission.

GramConnect requires high accessibility across diverse geographies regardless of immediate internet access.

## Decision
We engineered an offline-first client architecture combining browser Service Workers with client-side IndexedDB persistence:
1. **Service Worker Shell (`sw.js`)**: Caches critical application UI assets, styles, icons, and shell routes for immediate offline loading.
2. **IndexedDB Local Storage (`indexedDB.js`)**:
   - Maintains dedicated object stores: `offline-complaints`, `cached-complaints`, `offline-validations`, and `sync-queue`.
   - Disconnected complaint submissions are assigned client-side temporary UUIDs and serialized immediately to IndexedDB.
3. **Automatic Reconciliation (`syncManager.js`)**:
   - Listens to browser online/offline events (`window.addEventListener('online')`).
   - Drains the offline sync queue via sequential FIFO POST requests when connectivity returns.
   - Updates local UI seamlessly and alerts the user upon successful cloud ingestion.

## Consequences

### Positive
- Zero data loss for citizens submitting reports in remote field locations with zero signal.
- Immediate UI feedback and responsive interactions even on high-latency networks.
- Reduced server load through intelligent caching of static and read-heavy assets.

### Negative
- Client-side storage quotas: High-resolution images stored in IndexedDB must be managed to avoid exceeding mobile browser storage ceilings.
- Conflict resolution: If a complaint is modified concurrently, the server's timestamped state precedence takes effect.

# Issue 001: Runtime Decoupling & Attack Surface Reduction

## What to build

Sever all active runtime dependencies, imports, and endpoints that connect the core MERN application to the blockchain subsystem, while leaving the blockchain directory and Python model files completely untouched on disk as standalone artifacts.

Reroute periodic database tamper detection and hash verification to read the system state hash directly from MongoDB `SystemMeta` rather than attempting to call external Ethereum contract providers. Unmount unused, sprawling maintenance endpoints and dead agent routes from the server router to reduce the unauthenticated attack surface.

## Acceptance criteria

- [ ] The `blockchain/` folder and Python model files remain untouched on disk.
- [ ] No active runtime imports or function calls connect `backend/src` to the `blockchain/` directory.
- [ ] Periodic integrity checks and tamper detection read state hashes directly from MongoDB `SystemMeta` without throwing blockchain provider connection errors.
- [ ] Unused maintenance routes and autonomous agent endpoints are unmounted from the Express application router.
- [ ] Backend server boots cleanly with zero uninitialized smart contract warnings.

## Blocked by

None - can start immediately.

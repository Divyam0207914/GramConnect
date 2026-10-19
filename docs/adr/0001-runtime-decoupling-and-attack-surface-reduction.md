# ADR-0001: Runtime Decoupling & Attack Surface Reduction

## Status
Accepted (Ref: Issue 001)

## Context
Earlier iterations of GramConnect embedded in-process calls to local Python ML scripts (PyTorch ViT classifier, BLIP image captioner, Vosk speech recognizer) and local Ethereum Hardhat smart contracts directly within the Node.js Express server.

This created critical operational and security bottlenecks:
1. **Cloud Deployment Failure**: Hosting platforms (Render, Railway, Vercel) failed to build due to multi-gigabyte PyTorch dependencies, native C++ audio libraries, and memory overruns.
2. **Unauthenticated Attack Surface**: Sprawling maintenance and unverified agent routes were exposed without session validation.
3. **Fragile Runtime Coupling**: A crash or missing model file in the speech or vision pipeline halted the entire core civic complaint API.

## Decision
We severed all active runtime imports and execution dependencies connecting the core MERN application to the blockchain subsystem and Python model processes.
- The `blockchain-systemHash/`, `img_to_txt/`, and `Spch_to_txt/` directories remain preserved on disk as standalone research and extension modules.
- The Express application boots with zero Python or Web3 dependencies.
- Maintenance routes and dead agent endpoints were unmounted from the active router.

## Consequences

### Positive
- **Instant, Reliable Cold Starts**: Backend server boots in milliseconds on standard cloud environments (e.g., Render, Railway) with zero uninitialized smart contract warnings.
- **Drastic Image & Bundle Optimization**: Git repository and container images avoid storing multi-gigabyte PyTorch weights and Vosk binary packages.
- **Hardened Surface**: Elimination of unauthenticated experimental endpoints stops unauthorized probe vectors.

### Negative
- Direct on-the-fly PyTorch vision inference and Vosk audio transcription are decoupled into companion research modules rather than synchronous HTTP handler steps.
- Mitigated by providing lightweight multipart upload handlers and optional webhooks for external model integration.

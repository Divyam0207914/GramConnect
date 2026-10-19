# ADR-0003: State Hash Tamper Detection via MongoDB SystemMeta

## Status
Accepted (Ref: Issues 001, 006)

## Context
Government civic platforms require rigorous data integrity guarantees to detect unauthorized database manipulation (e.g., direct modification of complaint statuses or deletion of records in the database). GramConnect originally intended to write state hashes to an Ethereum smart contract. However, requiring constant live Ethereum RPC nodes during standard civic administration introduced network latency, gas fee unpredictability, and severe startup failure modes when nodes were unreachable.

## Decision
We implemented a native, deterministic cryptographic verification engine backed by a singleton MongoDB `SystemMeta` model (`_id: "main"`):
1. **Deterministic State Hashing**: The system calculates a canonical SHA-256 digest across all complaints sorted strictly by `_id`, incorporating complaint metadata, authors, categories, and individual record hashes.
2. **Versioned Hash History**: `SystemMeta` maintains the active `globalHash`, `previousHash`, and a rolling audit trail of historical hashes with timestamps and version increments.
3. **Automated Auditing**: A background interval runs every 30 minutes (`startPeriodicHashCheck(30)`), comparing the active database calculation against `SystemMeta`.
4. **Privileged Hash Updates**: Modifying or publishing a new state hash (`POST /api/blockchain/update-hash`) is locked strictly to officials authenticated with `designation: "Owner"`.

## Consequences

### Positive
- Sub-second integrity verification with zero reliance on external blockchain RPC providers or gas fees.
- High-resolution audit reporting: detects exactly whether active records match current state, match a prior state, or have suffered unauthorized tampering (`TAMPERED` status).
- The standalone Hardhat contract (`SystemHash.sol`) remains available in `blockchain-systemHash/` for enterprise deployments desiring external on-chain anchoring.

### Negative
- If the MongoDB instance is completely compromised at the physical disk level without backups, an attacker could theoretically tamper both records and `SystemMeta` simultaneously unless external write-once logging is attached.
- Mitigation: In enterprise environments, the `SystemMeta.globalHash` can be periodically mirrored to external append-only audit sinks.

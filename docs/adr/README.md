# Architecture Decision Records (ADRs)

This directory documents the significant architectural decisions for **GramConnect**, capturing context, evaluated options, trade-offs, and consequences.

## Index

| ADR | Title | Status | Date |
| :--- | :--- | :--- | :--- |
| [0001](0001-runtime-decoupling-and-attack-surface-reduction.md) | Runtime Decoupling & Attack Surface Reduction | Accepted | 2026-09-09 |
| [0002](0002-centralized-jwt-and-jurisdictional-rbac.md) | Centralized JWT Engine & Jurisdictional RBAC | Accepted | 2026-09-09 |
| [0003](0003-state-hash-tamper-detection-via-systemmeta.md) | State Hash Tamper Detection via MongoDB SystemMeta | Accepted | 2026-09-09 |
| [0004](0004-offline-first-resilience-with-indexeddb-and-service-workers.md) | Offline-First Resilience with IndexedDB & Service Workers | Accepted | 2026-09-09 |
| [0005](0005-hierarchical-auto-escalation-state-machine.md) | Hierarchical Auto-Escalation State Machine | Accepted | 2026-09-09 |

---

## ADR Lifecycle

```
Proposed ──> Accepted ──> Deprecated ──> Superseded
                 │
                 └──> Rejected
```

To propose an ADR, create a new sequential file `NNNN-short-title.md` following the established structure.

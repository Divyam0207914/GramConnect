# ADR-0005: Hierarchical Auto-Escalation State Machine

## Status
Accepted

## Context
A chronic challenge in public grievance handling is administrative stagnation: complaints filed at local levels often sit unacknowledged or unattended indefinitely due to local resource constraints or bureaucratic negligence. Citizens lose trust when issues have no guaranteed resolution timeframes.

## Decision
We implemented a 3-tier administrative hierarchy backed by an automated cron-driven auto-escalation engine:
1. **Three-Tier Administrative Hierarchy**:
   - Level 1: `Block` (Local administrative officers)
   - Level 2: `District` (District-level supervisors)
   - Level 3: `State` (Apex state governance department)
2. **Automated Escalation Rule**:
   - Any unresolved complaint (`status: "submitted"` or `"in_progress"`) that remains at the same administrative tier for $\ge 10$ days is automatically promoted to the next tier:
     $$\text{Block} \xrightarrow{\ge 10\text{ days}} \text{District} \xrightarrow{\ge 10\text{ days}} \text{State}$$
3. **Audit Trail & Re-assignment**:
   - Each escalation appends an immutable entry to `complaint.escalationHistory` recording `from`, `to`, `reason`, and `escalatedAt`.
   - The previous local assignee is unassigned (`assignedTo = null`), alerting higher authorities to reallocate resources.
4. **Execution Mechanism**:
   - Managed via a dedicated `node-cron` job running daily at 02:00 AM (`0 2 * * *`) calling `autoEscalateComplaints()`.
   - Also exposes an authenticated official route (`POST /api/complaints/auto-escalate`) restricted to `Owner` for on-demand execution.

## Consequences

### Positive
- Strict administrative accountability: local bottlenecks are programmatically surfaced to higher oversight levels.
- Transparent tracking for citizens: citizens can observe exactly which administrative level holds their complaint and the complete chronological history of transfers.
- Deterministic behavior with comprehensive logging.

### Negative
- Higher administrative levels (`District`, `State`) can experience backlog surges if lower levels consistently fail to resolve complaints within 10 days.
- Mitigation: In future iterations, alerts and warning notifications can be dispatched to officials at day 7 before the 10-day escalation boundary triggers.

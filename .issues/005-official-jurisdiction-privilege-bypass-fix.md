# Issue 005: Official Jurisdictional Scoping & Privilege Bypass Remediation

## What to build

Eliminate the parameter-based privilege escalation vulnerability in the official dashboard and establish server-enforced jurisdictional scoping for government officials.

Formally include `"Owner"` in the official schema designation enum to allow legitimate administrative accounts. Require official authentication on dashboard endpoints and derive the official's jurisdiction (Block, District, State, or Owner), department, and location strictly from verified token claims. Prevent arbitrary clients from appending `?designation=Owner` to read out-of-jurisdiction complaints. Restrict complaint status updates and manual escalations to authenticated officials.

## Acceptance criteria

- [ ] The `Official` Mongoose model validates `"Owner"` alongside `"Block"`, `"District"`, and `"State"`.
- [ ] Official dashboard queries read role, designation, and location exclusively from the authenticated token claims.
- [ ] Unauthenticated callers requesting the official dashboard with `?designation=Owner` receive 401 Unauthorized.
- [ ] Non-Owner officials are constrained strictly to complaints matching their department, level, and geographic boundary.
- [ ] Updating complaint status (`submitted`, `in_progress`, `resolved`) requires an authenticated official role.

## Blocked by

- #004 (Complaint Scoping & Mutation IDOR Prevention)

# ADR-0002: Centralized JWT Engine & Jurisdictional RBAC

## Status
Accepted (Ref: Issues 002, 003, 004, 005)

## Context
Prior controllers relied on disparate, decentralized token parsing with hardcoded fallback secrets. Furthermore, API queries suffered from Insecure Direct Object Reference (IDOR) vulnerabilities:
- Clients could self-assign the `official` role during registration.
- Citizens could view and mutate complaints authored by other users.
- Unauthenticated callers could append `?designation=Owner` to access government dashboards across all administrative jurisdictions.
- Password hashes and internal cryptographic fields were exposed in JSON responses.

## Decision
We engineered a centralized authentication and Role-Based Access Control (RBAC) middleware module (`backend/src/middleware/auth.js`) enforcing:
1. **Secret Hygiene & Fail-Fast**: The server immediately terminates with exit code 1 if `JWT_SECRET` is missing or fewer than 32 characters in production.
2. **Citizen Role Guard**: User registration strictly forces `role: "citizen"`, ignoring client-supplied role parameters. Password hashes are stripped before serialization.
3. **IDOR Mitigation**: Complaint author identities are extracted strictly from `req.user.id` verified claims. Citizen queries return only personal complaints.
4. **4-Tier Jurisdictional Enforcement**: Official endpoints check authenticated claims against an explicit designation hierarchy:
   - `Block`: Restricted to localized block-level grievances.
   - `District`: Scoped to district-level departmental complaints.
   - `State`: Scoped to statewide escalations.
   - `Owner`: Platform administrator with full cross-jurisdictional audit access.

## Consequences

### Positive
- Total elimination of IDOR vulnerabilities across complaint creation, update, and retrieval endpoints.
- Robust prevention of privilege escalation and unauthorized departmental snooping.
- Clean separation of concerns between HTTP transport and cryptographic credential verification.

### Negative
- All API client calls (frontend and mobile) must include valid `Authorization: Bearer <token>` headers on protected endpoints.
- Integration tests require pre-seeded authentication tokens matching required roles and designations.

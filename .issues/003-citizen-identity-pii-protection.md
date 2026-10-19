# Issue 003: Citizen Identity Protection, Safe Registration & Mass-Assignment Guard

## What to build

Harden citizen identity flows against credential leakage, privilege escalation, and unauthorized profile tampering.

Force the `citizen` role during registration so clients cannot elevate themselves to administrators or officials. Sanitize all authentication responses (both registration and login) to guarantee that password hashes and internal hash fields are never transmitted over the wire. Restrict citizen registry retrieval so unauthenticated visitors cannot harvest citizen PII. Implement strict field allowlisting on profile updates to prevent mass assignment of protected fields like roles, password hashes, or validation records.

## Acceptance criteria

- [ ] Registration automatically assigns the `citizen` role and ignores any client-supplied role overrides.
- [ ] User registration and login JSON payloads never contain password hashes or internal state fields.
- [ ] User list endpoint is guarded by official authentication and returns sanitized projections without sensitive fields.
- [ ] User profile updates permit only allowlisted fields (`name`, `phone`, `location`) and reject attempts to update roles or passwords via general update endpoints.
- [ ] Direct object reference checks ensure users can only update their own profile unless granted administrative override.

## Blocked by

- #002 (Centralized JWT Engine, Secret Fail-Fast & CORS Hardening)

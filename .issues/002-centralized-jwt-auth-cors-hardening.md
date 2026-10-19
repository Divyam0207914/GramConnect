# Issue 002: Centralized JWT Engine, Secret Fail-Fast & CORS Hardening

## What to build

Implement a centralized authentication and role-based access control (RBAC) middleware module for the Express application. The middleware verifies bearer tokens from the `Authorization` header and populates authenticated caller claims (identity, role, designation, department, and jurisdiction).

Enforce strict secret hygiene: the server must fail fast on startup if `JWT_SECRET` is missing or insecure, eliminating hardcoded fallback strings across all controller files. Restrict Cross-Origin Resource Sharing (CORS) headers to an explicit allowlist of trusted client origins and disable server fingerprinting headers (`x-powered-by`).

## Acceptance criteria

- [ ] Centralized authentication middleware provides token verification (`authenticate`), role enforcement (`requireRole`), and administrative level checks (`requireDesignation`).
- [ ] Application fails fast on boot if `JWT_SECRET` is not configured in production environments.
- [ ] No controller or utility files contain fallback secret keys or hardcoded credential strings.
- [ ] Express CORS configuration restricts access strictly to allowed origins rather than wildcard permissions.
- [ ] Framework fingerprinting header `x-powered-by` is disabled.
- [ ] Incoming requests with missing, malformed, or expired tokens consistently receive 401 Unauthorized errors.

## Blocked by

- #001 (Runtime Decoupling & Attack Surface Reduction)

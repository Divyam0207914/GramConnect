# Issue 004: Complaint Scoping & Mutation IDOR Prevention

## What to build

Secure complaint submission and lifecycle endpoints against Insecure Direct Object References (IDOR) and unauthorized mutation.

Bind newly created complaints strictly to the authenticated user's ID derived from their verified session token, ignoring any author ID passed in the request body. Enforce server-side data scoping so that citizens querying the complaints endpoint only receive records they personally authored, while officials can inspect complaints according to their jurisdictional assignments. Protect update, escalation, and deletion routes with ownership and role verification, and apply strict update field allowlists to block mass assignment of status or community validation flags.

## Acceptance criteria

- [ ] Complaint creation binds the submitter identity strictly to `req.user.id`.
- [ ] Citizen queries to fetch complaints return only complaints submitted by the requesting user.
- [ ] All mutating complaint routes (`POST`, `PUT`, `DELETE`) require an authenticated session token.
- [ ] Complaint updates allow only content fields (`title`, `description`, `category`) and discard modifications to status, escalation history, or validation flags.
- [ ] Unprivileged users cannot modify or delete complaints belonging to other citizens.

## Blocked by

- #003 (Citizen Identity Protection, Safe Registration & Mass-Assignment Guard)

# Issue 006: Community Validation Identity Gate & State Hash Protection

## What to build

Secure the community validation workflow and system integrity endpoints against impersonation and unauthenticated tampering.

Bind community validation submissions strictly to the authenticated user ID extracted from the bearer token, rejecting client-provided `userId` parameters in request bodies to prevent submitter spoofing and fraudulent instant-validation closures. Ensure that validation requests can only be initiated by authenticated officials. Protect system state hash update endpoints so that only authenticated officials with Owner designation can publish or recalculate system state hashes in MongoDB `SystemMeta`.

## Acceptance criteria

- [ ] Validation responses resolve the responding user identity strictly from `req.user.id`.
- [ ] Users cannot submit validation responses for requests assigned to other citizens.
- [ ] Submitter instant-validation logic only triggers when the authenticated token holder is confirmed as the original author of the complaint.
- [ ] Creating community validation requests requires an authenticated official role.
- [ ] System state hash updates and recalculations are protected and restricted to authenticated Owner officials.

## Blocked by

- #005 (Official Jurisdictional Scoping & Privilege Bypass Remediation)

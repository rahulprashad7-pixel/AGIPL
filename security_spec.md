# Security Specification - Accurate Group IT Asset Inventory

## Data Invariants
1. Assets cannot be permanently deleted from the database. Instead, lifecycle statuses RETIRED and SCRAPPED must be used.
2. Every modification to an asset, assignment change, status change, or service log must generate an immutable audit log entry in `/audit_logs`.
3. Only authenticated users with verified identities can read and write asset records and service logs.
4. User management (role changes, new user creation) is restricted to IT Manager / Super Admin.
5. All document IDs must conform to alphanumeric characters and safe hyphens/underscores (`^[a-zA-Z0-9_\\-]+$`).

## The Dirty Dozen Security Attack Payloads (Must be Denied)
1. **Unauthenticated Read of Assets**: Anonymous user attempting `get` or `list` on `/assets`. -> PERMISSION_DENIED
2. **Unauthenticated Asset Creation**: Anonymous user attempting `create` on `/assets/test1`. -> PERMISSION_DENIED
3. **Hard Delete on Asset**: Any user attempting `delete` on `/assets/AGIPL-DSK-001`. -> PERMISSION_DENIED (Hard deletion strictly forbidden)
4. **Hard Delete on Audit Log**: User attempting `delete` on `/audit_logs/log123`. -> PERMISSION_DENIED
5. **Tampering with Past Audit Log**: User attempting `update` on `/audit_logs/log123`. -> PERMISSION_DENIED
6. **Path Traversal / Poisoned ID**: Attacker creating asset with ID `../../etc/passwd` or oversized junk string. -> PERMISSION_DENIED
7. **Privilege Escalation on User Profile**: Non-admin user updating their own role from `IT_SUPPORT` to `IT_MANAGER`. -> PERMISSION_DENIED
8. **Shadow Field Injection**: User inserting unauthorized malicious script attributes or unbounded data fields. -> PERMISSION_DENIED
9. **Unauthenticated Service Record Write**: Unauthenticated user adding repair history. -> PERMISSION_DENIED
10. **Tampering with Company Settings**: Regular support user overwriting organization security master configuration. -> PERMISSION_DENIED
11. **Spoofed Audit Author**: Record created where actor info is empty or invalid. -> PERMISSION_DENIED
12. **Malformed Asset Payload**: Missing required fields like `assetId`, `company`, or `status`. -> PERMISSION_DENIED

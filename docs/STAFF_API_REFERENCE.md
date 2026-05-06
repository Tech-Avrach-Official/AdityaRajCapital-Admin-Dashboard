# Staff Management API Reference

**Status:** Live (Phase 1 + 2 + 3 shipped)
**Base URL:** `https://<your-host>/api`
**Last updated:** 2026-05-06

This document is the complete frontend-facing reference for the new Staff RBAC system. It covers:

- [Part 1 — What this is and why](#part-1--what-this-is-and-why)
- [Part 2 — Authentication](#part-2--authentication)
- [Part 3 — Common conventions](#part-3--common-conventions)
- [Part 4 — Permission catalog](#part-4--permission-catalog)
- [Part 5 — Staff CRUD endpoints (36 routes)](#part-5--staff-crud-endpoints)
- [Part 6 — Frontend integration notes](#part-6--frontend-integration-notes)

---

## Part 1 — What this is and why

### The hierarchy

The system has **8 distinct user types** in this exact order of authority:

```
1. Super Admin    — root, all access, no scope, all permissions
2. Admin          — created by Super Admin only; scoped to nations[]
3. Nation Head    — created by Super Admin or Admin; scoped to nations[]
4. State Head     — created by Super Admin / Admin / Nation Head; scoped to states[]
5. Branch Head    — created by Super Admin / Admin / Nation Head / State Head; scoped to branches[]
6. RM             — sits in exactly one branch
7. Partner        — under one RM
8. Investor       — via Partner OR directly under an RM
```

The first five are called **staff users** and live in the `staff_users` table. RM, Partner, and Investor are unchanged from before this feature.

### Two orthogonal access controls

Every staff user has:

1. **Permissions** — an explicit list of allowed actions (e.g. `partners.view`, `purchases.approve`).
2. **Scope** — the slice of data they can see and act on, expressed as a list of `nations`, `states`, or `branches` depending on their role.

A request is only allowed when **both** checks pass:
- The user holds the required permission for the action.
- The data being touched is inside the user's scope.

**Super Admin bypasses both checks** — they always see everything and can do anything.

### Effective branches

Each non-super-admin staff has an "effective branch set" computed live from their scope:

| Role | Scope unit | Effective branches = |
|---|---|---|
| Admin / Nation Head | `nations[]` | every branch whose state's nation is in scope |
| State Head | `states[]` | every branch in those states |
| Branch Head | `branches[]` | the literal scope.branches list |

When a staff user lists or fetches anything (RMs, partners, investors, purchases), the result is automatically narrowed to their effective branches.

### The privilege-escalation invariant

When a staff member creates or edits a sub-account, **two rules** are enforced server-side:

- **Scope subset:** the new user's effective branches must be a subset of the creator's. A Nation Head with `nations=[1,2]` cannot place a State Head in a state belonging to nation 3.
- **Permission subset:** the creator can only grant permissions they themselves hold. A State Head without `purchases.approve` cannot create a sub-account that has `purchases.approve`.

Violating either rule returns `400 Bad Request` with a clear message.

### Who can create whom

| Creator role | Can create |
|---|---|
| `super_admin` | `admin`, `nation_head`, `state_head`, `branch_head` |
| `admin` | `nation_head`, `state_head`, `branch_head` |
| `nation_head` | `state_head`, `branch_head` |
| `state_head` | `branch_head` |
| `branch_head` | — (no subordinates) |

### Self-protection rules

A staff user CANNOT, on their own account:
- Delete themselves
- Edit their own scope
- Edit their own permissions
- Edit their own status
- Reset their own password through this admin-flow endpoint

They CAN:
- Update their own name/email/mobile via `PUT /<role>/:id`
- View themselves via `GET /<role>/:id`

---

## Part 2 — Authentication

### Login

**`POST /api/staff/login`**

Used by every staff role. Returns a JWT.

**Request body:**

```json
{
  "email": "admin@adityarajcapital.local",
  "password": "Strong1!"
}
```

**Success response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOi...",
    "staff": {
      "id": 1,
      "role": "super_admin",
      "name": "Super Admin",
      "email": "admin@adityarajcapital.local"
    }
  }
}
```

**Failure responses:**

| Status | When | `error_code` |
|---|---|---|
| 400 | Email/password validation fails | `VAL_001` |
| 401 | Email not found OR wrong password | `AUTH_004` |
| 401 | Account is inactive | `AUTH_004` (message says "Account is not active") |
| 429 | More than 5 failed attempts in 15 min from same IP | `RATE_LIMIT_EXCEEDED` (rate limiter) |

### JWT shape

The token (after `jwt.verify`) contains:

```json
{
  "id": 7,
  "role": "state_head",
  "email": "jane@example.com",
  "permissions": ["partners.view", "purchases.approve"],
  "scope": { "nations": [], "states": [12, 14], "branches": [] },
  "version": 2,
  "iat": 1762400000,
  "exp": 1763004800
}
```

- `role` — one of `super_admin`, `admin`, `nation_head`, `state_head`, `branch_head`.
- `permissions` — empty array for super_admin (bypass); explicit list for everyone else.
- `scope` — only the role-relevant key is populated; others are empty arrays.
- `version: 2` — distinguishes new tokens from legacy admin tokens.
- TTL is **7 days** (`JWT_EXPIRES_IN=7d`).

### Using the token

Send it on every authenticated request:

```
Authorization: Bearer eyJhbGciOi...
```

### Token revocation

Scope/permission/status changes do **not** invalidate existing tokens. The new state takes effect at the staff member's next login (up to 7 days). Plan to handle this gracefully in the UI (e.g. show "settings updated; user will see changes after next login").

### Legacy admin login (deprecated)

`POST /api/admin/login` with `{admin_id, password}` still works for backward compatibility but will be removed in Phase 4. Use `POST /api/staff/login` for all new integrations.

---

## Part 3 — Common conventions

### Standard response envelope

**Success:**

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "User-facing reason",
  "developer_message": "More detailed reason for debugging",
  "error_code": "AUTH_004"
}
```

Some endpoints return arrays as `data: { items: [...], total: N }` — see each endpoint for the exact shape.

### HTTP status codes used

| Status | Meaning |
|---|---|
| 200 | Successful read/update |
| 201 | Successful create |
| 400 | Validation error or business rule violation (privilege escalation, empty scope, etc.) |
| 401 | Missing, invalid, or expired token; or login failure |
| 403 | Authenticated but lacks permission OR resource is outside scope |
| 404 | Resource not found OR (intentionally) outside scope and treated as not-found to avoid leaking existence |
| 409 | Email already in use |
| 429 | Rate limited |
| 500 | Server error |

### Common error codes

| `error_code` | Meaning |
|---|---|
| `AUTH_001` | Invalid or expired token |
| `AUTH_003` | Missing token |
| `AUTH_004` | Invalid credentials |
| `VAL_001` | Validation error (Joi) |
| `VAL_002` | Invalid format (privilege/scope failure) |
| `GEN_004` | Resource not found |
| `GEN_005` | Forbidden (permission or scope) |
| `DB_007` | Duplicate entry (e.g. email) |

### Pagination

List endpoints accept query params:

```
?limit=50&offset=0
```

Default `limit=50`, max `limit=100`. Response shape:

```json
{
  "data": {
    "staff": [...],
    "total": 137
  }
}
```

`total` reflects the count visible to the caller (after scope filtering for non-super-admin). Use it to paginate.

---

## Part 4 — Permission catalog

This is the **closed set** of permission keys recognized by the backend. Only these strings (or wildcards over them) can be granted to a staff user. Sending an unknown key returns `400 Bad Request`.

### Wildcards

- `*` — all permissions (super_admin only; cannot be granted to other roles).
- `<module>.*` — all actions on a module (e.g. `partners.*` covers `partners.view`, `partners.update`, `partners.update-rm`, `partners.view-kyc`, `partners.view-nominee`).

### Catalog

| Module | Keys |
|---|---|
| `dashboard` | `dashboard.view` |
| `hierarchy.nations` | `.view`, `.create`, `.update`, `.delete` |
| `hierarchy.states` | `.view`, `.assign-nation` |
| `hierarchy.branches` | `.view`, `.create`, `.update`, `.delete` |
| `rms` | `.view`, `.create`, `.update`, `.delete`, `.view-investors`, `.view-partners`, `.view-visits`, `.view-commissions` |
| `partners` | `.view`, `.update`, `.update-rm`, `.view-kyc`, `.view-nominee` |
| `investors` | `.view`, `.view-kyc`, `.view-nominees`, `.view-bank-accounts`, `.view-purchases` |
| `plans` | `.view`, `.create`, `.update`, `.delete` |
| `purchases` | `.view`, `.approve`, `.reject` |
| `investments` | `.view` |
| `payouts` | `.view`, `.mark-paid` |
| `commissions` | `.view`, `.mark-paid` |
| `tds-settings` | `.view`, `.update` |
| `deletion-requests` | `.view`, `.process` |
| `staff.admin` | `.view`, `.create`, `.update`, `.delete`, `.assign-scope`, `.assign-permissions`, `.reset-password` |
| `staff.nation-head` | `.view`, `.create`, `.update`, `.delete`, `.assign-scope`, `.assign-permissions`, `.reset-password` |
| `staff.state-head` | `.view`, `.create`, `.update`, `.delete`, `.assign-scope`, `.assign-permissions`, `.reset-password` |
| `staff.branch-head` | `.view`, `.create`, `.update`, `.delete`, `.assign-scope`, `.assign-permissions`, `.reset-password` |

**Total: 79 distinct permission keys.**

> **For UI:** when building a "create staff" form, fetch this list dynamically once (a future endpoint may expose it) or hard-code it from this doc. Group by module in the UI for usability.

---

## Part 5 — Staff CRUD endpoints

All endpoints are mounted under `/api/admin/staff/<role-plural>` where role-plural is one of:

- `admins`
- `nation-heads`
- `state-heads`
- `branch-heads`

Each role exposes the **same 9 endpoints**. They share request/response shapes; only the scope structure in the body differs (per role's scope tier).

### Authorization summary

Every endpoint requires:
1. `Authorization: Bearer <token>` header.
2. The matching permission key for the action (see each endpoint).
3. For routes that touch a specific staff row (`/:id` paths), the target's effective branches must intersect the caller's effective branches. Otherwise: 404 (we hide existence). Super Admin bypasses both checks.

For creation: the privilege-escalation invariant runs at the service layer.

---

### 5.1 Create staff

**`POST /api/admin/staff/<role-plural>`**

Required permission: `staff.<role>.create`

#### Request body

The `scope` shape depends on the target role. The backend rejects mismatched shapes (e.g. sending `nations[]` when creating a Branch Head).

| Role | `scope` shape |
|---|---|
| Admin / Nation Head | `{ "nations": [<nation_id>, ...] }` |
| State Head | `{ "states": [<state_id>, ...] }` |
| Branch Head | `{ "branches": [<branch_id>, ...] }` |

**Example — create a Nation Head:**

```http
POST /api/admin/staff/nation-heads
Authorization: Bearer <super_admin_token>
Content-Type: application/json

{
  "name": "Aarti Singh",
  "email": "aarti.north@example.com",
  "mobile": "9876543210",
  "password": "Aarti123!",
  "scope": { "nations": [1] },
  "permissions": [
    "dashboard.view",
    "partners.view",
    "investors.view",
    "purchases.view",
    "purchases.approve",
    "staff.state-head.view",
    "staff.state-head.create",
    "staff.state-head.update",
    "staff.state-head.assign-scope",
    "staff.state-head.assign-permissions"
  ]
}
```

**Field rules:**

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | string | yes | 1–255 chars |
| `email` | string | yes | valid email; lowercased; unique among non-deleted staff |
| `mobile` | string | no | 6–20 chars (digits, +, -, spaces); not unique |
| `password` | string | yes | ≥7 chars, ≥1 digit, ≥1 symbol |
| `scope` | object | yes | role-appropriate shape; **non-empty** |
| `permissions` | string[] | no, default `[]` | each must be from catalog (or `<module>.*` wildcard) |

#### Success response (201)

```json
{
  "success": true,
  "message": "nation_head created",
  "data": {
    "id": 12,
    "role": "nation_head",
    "name": "Aarti Singh",
    "email": "aarti.north@example.com",
    "mobile": "9876543210",
    "status": "active",
    "created_by_staff_id": 1,
    "last_login_at": null,
    "created_at": "2026-05-06T14:00:00.000Z",
    "updated_at": "2026-05-06T14:00:00.000Z",
    "permissions": ["dashboard.view", "partners.view", ...],
    "scope": { "nations": [1], "states": [], "branches": [] }
  }
}
```

#### Failure responses

| Status | `error_code` | Cause |
|---|---|---|
| 400 | `VAL_001` | Field validation (email format, password rules, missing required, empty scope, unknown permission key, wrong scope shape for role) |
| 400 | `VAL_002` | Privilege escalation: scope falls outside creator's scope |
| 400 | `VAL_002` | Privilege escalation: caller doesn't hold a permission they're trying to grant |
| 400 | `VAL_002` | Caller's role can't create the target role (e.g. State Head trying to create Admin) |
| 401 | `AUTH_001` / `AUTH_003` | Missing/invalid token |
| 403 | `GEN_005` | Caller lacks `staff.<role>.create` |
| 409 | `DB_007` | Email already in use by another staff |

#### Precautions

- **Empty `scope.<key>` is rejected.** Send at least one ID. Empty scope means the new user sees nothing — refuse rather than silently create a useless account.
- **Empty `permissions: []` is allowed.** A staff with no permissions can log in but cannot do anything. Useful as a "soft suspend" alternative to deletion.
- **Email is final.** Even after soft-delete, the email is freed via the unique key on the `email_active` generated column — but the deleted row's email is gone. Don't reuse mid-flight.

---

### 5.2 List staff

**`GET /api/admin/staff/<role-plural>?limit=50&offset=0`**

Required permission: `staff.<role>.view`

#### Query

| Param | Type | Default | Max |
|---|---|---|---|
| `limit` | int | 50 | 100 |
| `offset` | int | 0 | — |

#### Response (200)

```json
{
  "success": true,
  "message": "nation_head list retrieved",
  "data": {
    "staff": [
      {
        "id": 12,
        "role": "nation_head",
        "name": "Aarti Singh",
        "email": "aarti.north@example.com",
        "mobile": "9876543210",
        "status": "active",
        "created_by_staff_id": 1,
        "last_login_at": "2026-05-04T09:12:00.000Z",
        "created_at": "2026-05-06T14:00:00.000Z",
        "updated_at": "2026-05-06T14:00:00.000Z",
        "permissions": ["dashboard.view", "partners.view"],
        "scope": { "nations": [1], "states": [], "branches": [] }
      }
    ],
    "total": 1
  }
}
```

#### Scope-narrowed listing

Non-super-admin callers only see staff rows whose effective branches **intersect** their own effective branches. A Nation Head with `nations=[1]` listing State Heads sees only State Heads whose states fall under nation 1.

If the caller has empty effective branches (no scope assigned), the list is empty — no error.

#### Precautions

- `total` reflects the count visible to the caller, not the global count. Don't expose this number as "total state heads in the system" in the UI without role context.
- The `password` field is never included in the response.

---

### 5.3 Get staff by id

**`GET /api/admin/staff/<role-plural>/:id`**

Required permission: `staff.<role>.view`

#### Response (200)

Same shape as a single item from the list response (with permissions + scope).

#### Failure responses

| Status | `error_code` | Cause |
|---|---|---|
| 400 | `VAL_002` | `:id` is not a positive integer |
| 401 | `AUTH_001` | Missing/invalid token |
| 403 | `GEN_005` | Caller lacks `staff.<role>.view` |
| 404 | `GEN_004` | Row not found OR row exists but is outside caller's scope (intentional — we don't leak existence to non-super-admins) |

---

### 5.4 Update profile

**`PUT /api/admin/staff/<role-plural>/:id`**

Required permission: `staff.<role>.update`

#### Request body

```json
{
  "name": "Aarti S.",
  "email": "aarti.s@example.com",
  "mobile": "9988776655"
}
```

All fields optional, but **at least one** must be present.

#### Field rules

| Field | Rules |
|---|---|
| `name` | 1–255 chars |
| `email` | valid format; pre-checked against other staff for uniqueness |
| `mobile` | 6–20 chars, digits/symbols |

#### Response (200)

```json
{
  "success": true,
  "message": "nation_head updated",
  "data": { /* full staff record with updated fields */ }
}
```

#### Failure responses

| Status | `error_code` | Cause |
|---|---|---|
| 400 | `VAL_001` | Validation (empty body, malformed email) |
| 403 | `GEN_005` | Caller lacks permission |
| 404 | `GEN_004` | Not found / outside scope |
| 409 | `DB_007` | Email collides with another staff |

#### Precautions

- **This endpoint does NOT change**: password, scope, permissions, status, or role. Use the dedicated endpoints below.
- A user can edit **their own** name/email/mobile here.

---

### 5.5 Soft delete

**`DELETE /api/admin/staff/<role-plural>/:id`**

Required permission: `staff.<role>.delete`

#### Response (200)

```json
{
  "success": true,
  "message": "nation_head deleted",
  "data": { "id": 12, "role": "nation_head", "deleted": true }
}
```

#### Failure responses

| Status | `error_code` | Cause |
|---|---|---|
| 400 | `VAL_002` | Trying to delete yourself |
| 400 | `VAL_002` | Trying to delete the seeded super admin |
| 400 | `VAL_002` | Target's scope is outside yours (non-super-admin caller) |
| 403 | `GEN_005` | Caller lacks `staff.<role>.delete` |
| 404 | `GEN_004` | Not found |

#### Precautions

- Soft delete sets `deleted_at` AND `status = 'inactive'`. The user can't log in.
- The user's email becomes available for re-creation immediately (via the unique-on-`email_active` generated column).
- Their existing JWTs become invalid at the next request via the freshness check (we don't have a token blocklist; rejection is via the `deleted_at IS NULL` check in `authenticate`).
- Consider showing a confirmation dialog. There's no "undelete" endpoint in v1.

---

### 5.6 Replace scope

**`PATCH /api/admin/staff/<role-plural>/:id/scope`**

Required permission: `staff.<role>.assign-scope`

#### Request body

The shape depends on the target's role:

```json
// For admin or nation-head:
{ "nations": [1, 2] }

// For state-head:
{ "states": [10, 11] }

// For branch-head:
{ "branches": [50, 51] }
```

**Replaces the entire scope set wholesale.** To remove a nation, omit it from the new array. The body must be present and contain exactly the role-appropriate key.

#### Response (200)

```json
{
  "success": true,
  "message": "nation_head scope updated",
  "data": { /* full staff record with new scope */ }
}
```

#### Failure responses

| Status | `error_code` | Cause |
|---|---|---|
| 400 | `VAL_001` | Wrong scope shape, empty array, or invalid IDs |
| 400 | `VAL_002` | Privilege escalation: new scope falls outside caller's |
| 400 | `VAL_002` | Trying to edit your own scope (self-protection) |
| 403 | `GEN_005` | Caller lacks `staff.<role>.assign-scope` |
| 404 | `GEN_004` | Target not found / outside caller's scope |

#### Precautions

- **Wholesale replace**, not append. Read the current scope first via `GET /:id` if you want to add/remove specific entries.
- Privilege check uses the **new** scope as the candidate, not the old one. So you can shrink scope freely; expanding requires the caller to hold superset.
- Existing tokens for the affected staff member retain their old scope until next login.

---

### 5.7 Replace permissions

**`PATCH /api/admin/staff/<role-plural>/:id/permissions`**

Required permission: `staff.<role>.assign-permissions`

#### Request body

```json
{
  "permissions": ["partners.view", "purchases.approve", "dashboard.view"]
}
```

**Replaces the entire permission set wholesale.** Send `[]` to revoke all.

#### Field rules

- Each entry must be a valid catalog key (or `<module>.*` wildcard).
- The caller must hold every key being granted (privilege subset).

#### Response (200)

```json
{
  "success": true,
  "message": "nation_head permissions updated",
  "data": { /* full staff record with new permissions */ }
}
```

#### Failure responses

| Status | `error_code` | Cause |
|---|---|---|
| 400 | `VAL_001` | Unknown permission key |
| 400 | `VAL_002` | Trying to grant a permission caller doesn't hold |
| 400 | `VAL_002` | Trying to edit your own permissions |
| 403 | `GEN_005` | Caller lacks `staff.<role>.assign-permissions` |
| 404 | `GEN_004` | Target not found / outside scope |

#### Precautions

- **Wholesale replace.** Pull the current list with `GET /:id` first if you're building an "add/remove" UI.
- Sending `["*"]` is rejected unless the caller is super_admin (only super_admin holds `*`).

---

### 5.8 Toggle status

**`PATCH /api/admin/staff/<role-plural>/:id/status`**

Required permission: `staff.<role>.update`

#### Request body

```json
{ "status": "inactive" }
```

Allowed values: `"active"` or `"inactive"`.

#### Response (200)

```json
{
  "success": true,
  "message": "nation_head status updated",
  "data": { /* full staff record with new status */ }
}
```

#### Failure responses

| Status | `error_code` | Cause |
|---|---|---|
| 400 | `VAL_001` | Status not in {active, inactive} |
| 400 | `VAL_002` | Trying to change your own status |
| 403 | `GEN_005` | Caller lacks `staff.<role>.update` |
| 404 | `GEN_004` | Target not found / outside scope |

#### Precautions

- Setting `status: 'inactive'` blocks login immediately at next attempt (auth middleware refuses inactive accounts).
- **Existing tokens** issued before the status change remain technically valid until they hit the freshness check on the next request — but the freshness check returns 403, so they effectively stop working.
- Use this for **temporary suspension** (e.g. employee on leave). For permanent removal, use DELETE.

---

### 5.9 Reset password

**`POST /api/admin/staff/<role-plural>/:id/reset-password`**

Required permission: `staff.<role>.reset-password`

This is the **admin-initiated** reset flow (e.g. a manager resets a forgotten password). There is no self-service password reset in v1.

#### Request body

```json
{ "new_password": "BrandNew7!" }
```

#### Field rules

| Field | Rules |
|---|---|
| `new_password` | ≥7 chars, ≥1 digit, ≥1 symbol (same regex as create) |

#### Response (200)

```json
{
  "success": true,
  "message": "nation_head password reset",
  "data": {
    "id": 12,
    "role": "nation_head",
    "email": "aarti.north@example.com"
  }
}
```

The new password is **not** returned (you sent it in the request). Communicate it to the user out-of-band.

#### Failure responses

| Status | `error_code` | Cause |
|---|---|---|
| 400 | `VAL_001` | Password fails strength rules |
| 400 | `VAL_002` | Trying to reset your own password (use a different flow) |
| 403 | `GEN_005` | Caller lacks `staff.<role>.reset-password` |
| 404 | `GEN_004` | Target not found / outside scope |

#### Precautions

- The new password takes effect immediately. Existing sessions for the target staff are NOT terminated — the JWT they hold remains valid until expiry. If you need to force a re-login, also call `PATCH /:id/status` with `inactive` then `active`.
- **Never expose this endpoint to a self-service password change UI.** It's gated by a separate permission key (`staff.<role>.reset-password`) so you can grant "admin can edit profile" without granting "admin can reset passwords."

---

## Part 6 — Frontend integration notes

### Token lifecycle

- Store the token in memory or `localStorage` (per your security posture).
- Decode the JWT client-side to extract `role`, `permissions`, `scope` for UI rendering — never trust them as authorization, only as cosmetic hints.
- Send `Authorization: Bearer <token>` on every API call.
- On 401, redirect to login. On 403, show "Not authorized" — do not log the user out.

### Permission-aware UI

Hide or disable UI affordances the user can't act on. The recommended pattern:

```js
// Client-side helper, mirroring backend `hasPermission`
function hasPermission(held, required) {
  if (held.includes('*')) return true;
  if (held.includes(required)) return true;
  // module.* wildcard
  for (const h of held) {
    if (h.endsWith('.*') && required.startsWith(h.slice(0, -1))) return true;
  }
  return false;
}

// Usage
{hasPermission(user.permissions, 'partners.update') && <EditButton />}
```

Even if you fail to hide a button, the backend rejects the request — but failing to hide creates a confusing UX.

### Form validation — mirror server rules

For the create-staff form, validate client-side first to give instant feedback:

| Field | Client rule (mirror) |
|---|---|
| `email` | `\S+@\S+\.\S+` |
| `password` | `^(?=.*[0-9])(?=.*[^A-Za-z0-9]).{7,}$` |
| `mobile` | `^[0-9+\-\s]{6,20}$` |
| `scope.<key>` | non-empty array |
| `permissions[i]` | string, present in catalog |

Any client validation is advisory — backend is the source of truth.

### Building the create form

For the role being created, render only the relevant scope picker:

| Role | Scope picker |
|---|---|
| Admin / Nation Head | Multi-select of nations |
| State Head | Multi-select of states |
| Branch Head | Multi-select of branches (optionally filterable by nation/state for usability) |

Use existing endpoints to feed pickers:
- `GET /api/admin/nations` — for nation list
- `GET /api/admin/states` (optionally `?nation_id=X`) — for state list
- `GET /api/admin/branches` (optionally `?state_id=X` or `?nation_id=X`) — for branch list

Permission picker: render the catalog grouped by module, with checkboxes. **Filter the catalog to permissions the current logged-in user holds** — the user can't grant what they don't have, so showing more in the UI is misleading.

### Edit flow

`PUT /:id` is for profile fields only. Provide separate UI sections (or modals) for:

- "Change scope" → `PATCH /:id/scope`
- "Change permissions" → `PATCH /:id/permissions`
- "Suspend / Reactivate" → `PATCH /:id/status`
- "Reset password" → `POST /:id/reset-password`

Always pre-fill the scope/permissions modals with current values via `GET /:id`.

### Error handling

Show `message` to the user, log `developer_message` and `error_code` for support.

```js
if (response.status === 400 && body.error_code === 'VAL_002') {
  // Privilege escalation OR self-protection violation
  toast.error(body.message); // "Cannot place state_head in branch 99: outside your scope"
} else if (response.status === 403) {
  toast.error('You do not have permission to perform this action');
} else if (response.status === 409) {
  toast.error('This email is already in use by another staff user');
}
```

### Pagination & total

- The `total` returned is what the caller can see, not the global count.
- Build pagination on the visible total. Don't surface "global" counts in views designed for non-super-admin staff.

### Decoding the JWT

Use a lightweight library (`jose`, `jwt-decode`) — never trust the payload for authorization. Use it for:
- Showing the user's name and role in the navbar
- Pre-rendering UI affordances (hidden behind `hasPermission` checks)
- Detecting expiry to redirect to login before a 401

### Status changes propagate at next login

When you toggle a user inactive or change their permissions/scope, **their existing JWT is unchanged**. The backend enforces freshness on each request — inactive staff get 403 on the next call, but otherwise the old permissions/scope persist in the token until they log out and back in. Tell users this in the UI when they edit a colleague: "Changes will take effect after their next login."

### Self-service tasks v. admin tasks

A staff user editing their own profile uses the same `PUT /<role>/:id` endpoint. They CANNOT use the scope/permissions/status/reset-password endpoints on themselves — those return 400. Build the "my profile" page accordingly: show only the profile-fields form, hide the rest.

### What's NOT here yet

- No self-service password change. If a staff forgets their password, ask an admin with `.reset-password` permission to reset it via the endpoint above.
- No 2FA / OTP for staff.
- No audit log endpoint. The `created_by_staff_id`, `granted_by_staff_id`, `assigned_by_staff_id` columns store who did what, but there's no UI to browse them.
- No bulk operations. Each create/update is one-at-a-time.

---

## Appendix — Quick-reference cURL examples

```bash
# 1. Log in as super-admin
curl -X POST $BASE/api/staff/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@adityarajcapital.local","password":"Admin@123"}'

# (Save the returned token)
TOKEN=eyJhbGciOi...

# 2. Create a Nation Head
curl -X POST $BASE/api/admin/staff/nation-heads \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aarti Singh",
    "email": "aarti@example.com",
    "mobile": "9876543210",
    "password": "Strong1!",
    "scope": { "nations": [1] },
    "permissions": ["dashboard.view","partners.view","purchases.approve"]
  }'

# 3. List Nation Heads
curl $BASE/api/admin/staff/nation-heads -H "Authorization: Bearer $TOKEN"

# 4. Update permissions
curl -X PATCH $BASE/api/admin/staff/nation-heads/12/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"permissions":["dashboard.view","partners.view"]}'

# 5. Suspend
curl -X PATCH $BASE/api/admin/staff/nation-heads/12/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# 6. Reset password
curl -X POST $BASE/api/admin/staff/nation-heads/12/reset-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"new_password":"NewPass1!"}'

# 7. Soft delete
curl -X DELETE $BASE/api/admin/staff/nation-heads/12 -H "Authorization: Bearer $TOKEN"
```

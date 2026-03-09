# Hierarchy Module – Frontend Guide

**Nation → State → Branch → RM (and Partners/Investors by branch)**

This guide is for frontend developers implementing the **Hierarchy** and updated **RM** flows in the admin panel.

---

## Table of Contents

1. [What This Module Is](#1-what-this-module-is)
2. [What the Frontend Needs to Do](#2-what-the-frontend-needs-to-do)
3. [Standard API Response Format](#3-standard-api-response-format)
4. [Authentication](#4-authentication)
5. [Hierarchy APIs (Nations, States, Branches)](#5-hierarchy-apis-nations-states-branches)
6. [RM APIs (with Branch)](#6-rm-apis-with-branch)
7. [Partners & Investors by Branch](#7-partners--investors-by-branch)
8. [How RM Creation Works Now](#8-how-rm-creation-works-now)
9. [Suggested UI Flows](#9-suggested-ui-flows)
10. [Validation & Error Messages](#10-validation--error-messages)

---

## 1. What This Module Is

### Purpose

- **Categorise** the organisation: **Nation** (e.g. North, South, Center) → **State** (Indian states) → **Branch** (Aditya Raj branches) → **RM** (Relationship Managers).
- Every **RM** belongs to **one Branch**. Partners and Investors are **derived** into a branch via their RM (or Partner’s RM).
- No new logins (Nation Head / State Head / Branch Head come later). Only **Super Admin** manages this.

### Hierarchy (data only)

```
Nation (e.g. North, South, Center)
  └── State (e.g. Maharashtra, Gujarat) — each state assigned to one nation
        └── Branch (e.g. Mumbai Main, Pune Central)
              └── RM
                    └── Partner (same branch as RM)
                          └── Investor (via Partner or direct RM)
```

### Rules

- **Nations**: Admin creates/edits/deletes. Delete blocked if any state is assigned.
- **States**: Pre-seeded (36 Indian states/UTs). Admin only **assigns/unassigns** a nation per state. One state → one nation.
- **Branches**: Admin creates under a state. Name unique per state. Delete blocked if any RM is assigned.
- **RM**: Must have a **branch_id** when created (OTP flow or direct). Can update branch later.
- **Partners**: Branch = their RM’s branch (no extra field).
- **Investors**: Branch = RM’s branch or Partner’s RM’s branch (derived).

---

## 2. What the Frontend Needs to Do

### New / Updated Screens

| Area | What to build |
|------|----------------|
| **Hierarchy** | Nations CRUD, States list + assign nation, Branches CRUD (by state). |
| **RM** | Create RM: **require branch selection** (Nation → State → Branch dropdown/cascades). List RMs with optional filters (nation/state/branch) and show branch/state/nation names. Edit RM: allow changing branch. |
| **Partners** | Optional filter by `branch_id`; show branch (e.g. via RM’s branch). |
| **Investors** | Optional filter by `branch_id` (e.g. on list page). |

### Data Flow (high level)

1. **Setup order**: Create Nations → Assign States to Nations → Create Branches (per State) → Create RMs (per Branch).
2. **Create RM**: User must select **Branch** (and thus State/Nation are implied). Send `branch_id` in both OTP and direct create.
3. **List RMs**: Support query params `branch_id`, `state_id`, `nation_id`; display `branch_name`, `state_name`, `nation_name` from response.
4. **List Partners/Investors**: Add optional `branch_id` query; use same list APIs with filter.

---

## 3. Standard API Response Format

All APIs use this shape.

### Success

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

- `data` may be omitted for some responses (e.g. delete).
- HTTP status: `200` (OK), `201` (Created), etc.

### Error

```json
{
  "success": false,
  "message": "User-facing error message",
  "developer_message": "Same or debug message",
  "error_code": "GEN_004"
}
```

- HTTP status: `400` (validation/bad request), `401` (unauthorized), `403` (forbidden), `404` (not found), `500` (server error).
- Use `message` for toasts/UI; `error_code` for conditional handling if needed.

---

## 4. Authentication

- **Base URL**: Your backend base (e.g. `https://api.example.com`).
- **Admin routes**: Require header  
  `Authorization: Bearer <admin_jwt_token>`
- **Login**: `POST /api/admin/login` with `admin_id` and `password`; response includes `data.token`. Store token and send it on every admin API call.

---

## 5. Hierarchy APIs (Nations, States, Branches)

All hierarchy endpoints are **admin-only** (`Authorization: Bearer <token>`).

### 5.1 Nations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/nations` | List all nations |
| GET | `/api/admin/nations/:id` | Get one nation |
| POST | `/api/admin/nations` | Create nation |
| PUT | `/api/admin/nations/:id` | Update nation |
| DELETE | `/api/admin/nations/:id` | Soft delete nation |

**POST body (create):**

```json
{ "name": "North" }
```

- Validation: `name` required, max 100 chars.

**PUT body (update):**

```json
{ "name": "North Zone" }
```

**Success responses:**

- List: `200` → `data: { "nations": [ { "id", "name", "created_at", "updated_at" } ] }`
- Get one: `200` → `data: { "nation": { "id", "name", "created_at", "updated_at" } }`
- Create: `201` → `data: { "nation": { ... } }`
- Update: `200` → `data: { "nation": { ... } }`
- Delete: `200` → `data: null` (or no `data`)

**Error examples:**

- `404` – Nation not found.
- `400` – Cannot delete nation: “X state(s) are assigned. Unassign states first.”

---

### 5.2 States

States are **pre-seeded**. Admin only lists and assigns/unassigns nation.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/states` | List all states (optional filter by nation) |
| GET | `/api/admin/states/:id` | Get one state |
| PATCH | `/api/admin/states/:id/nation` | Assign or unassign nation |

**Query (list):**

- `nation_id` (optional): e.g. `GET /api/admin/states?nation_id=1` → only states in that nation.

**PATCH body (assign nation):**

```json
{ "nation_id": 1 }
```

To **unassign**:

```json
{ "nation_id": null }
```

- Validation: `nation_id` is **required** in body (number ≥ 1 or `null`).

**Success responses:**

- List: `200` → `data: { "states": [ { "id", "name", "nation_id", "nation_name", "created_at", "updated_at" } ] }`
- Get one: `200` → `data: { "state": { "id", "name", "nation_id", "nation_name", ... } }`
- PATCH: `200` → `data: { "state": { ... } }`

**Error examples:**

- `404` – State or Nation not found.

---

### 5.3 Branches

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/branches` | List branches (optional filters) |
| GET | `/api/admin/branches/:id` | Get one branch |
| POST | `/api/admin/branches` | Create branch |
| PUT | `/api/admin/branches/:id` | Update branch name |
| DELETE | `/api/admin/branches/:id` | Soft delete branch |

**Query (list):**

- `state_id` (optional): e.g. `?state_id=14`
- `nation_id` (optional): e.g. `?nation_id=1`

**POST body (create):**

```json
{
  "state_id": 14,
  "name": "Mumbai Main"
}
```

- Validation: `state_id` required (integer ≥ 1), `name` required (max 255). Name is unique per state.

**PUT body (update):**

```json
{ "name": "Mumbai Central" }
```

**Success responses:**

- List: `200` → `data: { "branches": [ { "id", "state_id", "name", "state_name", "nation_id", "nation_name", "created_at", "updated_at" } ] }`
- Get one: `200` → `data: { "branch": { ... } }`
- Create: `201` → `data: { "branch": { ... } }`
- Update: `200` → `data: { "branch": { ... } }`
- Delete: `200` → `data: null` (or no `data`)

**Error examples:**

- `404` – Branch or State not found.
- `400` – “A branch with this name already exists in this state.”
- `400` – “Cannot delete branch: X RM(s) are assigned. Reassign or remove them first.”

---

## 6. RM APIs (with Branch)

All under `/api/admin/rm`, admin auth required (except public RM code check).

### 6.1 List RMs

- **GET** `/api/admin/rm/list`

**Query (optional):**

- `branch_id`, `state_id`, `nation_id` – filter by branch, state, or nation.

**Success (200):**

```json
{
  "success": true,
  "message": "RMs fetched successfully",
  "data": {
    "count": 2,
    "rms": [
      {
        "id": 1,
        "rm_code": "RM-A1B2C3D4",
        "branch_id": 5,
        "name": "John Doe",
        "phone_number": "9876543210",
        "email": "john@example.com",
        "status": "active",
        "created_at": "...",
        "updated_at": "...",
        "branch_name": "Mumbai Main",
        "state_id": 14,
        "state_name": "Maharashtra",
        "nation_id": 1,
        "nation_name": "North",
        "partner_count": 3,
        "aadhaar_front_image_url": "https://...",
        "pan_image_url": "https://..."
      }
    ]
  }
}
```

- RMs without a branch have `branch_id`, `branch_name`, `state_name`, `nation_name` as `null`.

---

### 6.2 Get RM by ID

- **GET** `/api/admin/rm/:id`

**Success (200):**

```json
{
  "success": true,
  "message": "RM fetched successfully",
  "data": {
    "rm": {
      "id": 1,
      "rm_code": "RM-A1B2C3D4",
      "branch_id": 5,
      "name": "John Doe",
      "phone_number": "9876543210",
      "email": "john@example.com",
      "status": "active",
      "partner_count": 3,
      "aadhaar_front_image_url": "...",
      "pan_image_url": "..."
    }
  }
}
```

- Note: Single RM does not include `branch_name`/`state_name`/`nation_name`; you can resolve from `branch_id` via `GET /api/admin/branches/:id` if needed.

---

### 6.3 Create RM – OTP flow (recommended)

Two steps: **initiate** (sends OTPs) → **verify mobile** → **verify email** → **complete**.

**Step 1 – Initiate**

- **POST** `/api/admin/rm/initiate`
- **Content-Type:** `multipart/form-data` (for files) or `application/json` if no files.

**Body (form or JSON):**

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| name | string | Yes | Trimmed |
| phone_number | string | Yes | 10 digits |
| email | string | Yes | Valid email |
| password | string | Yes | Min 6 chars |
| **branch_id** | number | **Yes** | Valid branch ID |
| rm_aadhaar_front | file | Yes* | Image file |
| rm_pan_image | file | Yes* | Image file |

*Required as per your backend; if backend allows optional for testing, it may still require them in production.

**Success (201):**

```json
{
  "success": true,
  "message": "OTPs sent to mobile and email. Please verify to complete RM creation.",
  "data": {
    "signup_request_id": 42,
    "otp_expires_in_minutes": 10,
    "message": "OTPs sent to mobile and email. Please verify to complete RM creation."
  }
}
```

- Store `signup_request_id` for the next steps.
- In dev, backend may also return `mobile_otp` and `email_otp` in `data`; do not rely on them in production.

**Step 2 – Verify mobile OTP**

- **POST** `/api/admin/rm/verify-mobile-otp`  
- Body: `{ "signup_request_id": 42, "mobile_otp": "123456" }`

**Step 3 – Verify email OTP**

- **POST** `/api/admin/rm/verify-email-otp`  
- Body: `{ "signup_request_id": 42, "email_otp": "654321" }`

**Step 4 – Complete**

- **POST** `/api/admin/rm/complete`  
- Body: `{ "signup_request_id": 42 }`

**Success (200):**

```json
{
  "success": true,
  "message": "RM created successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "RM-A1B2C3D4",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "message": "RM created successfully"
  }
}
```

**Resend OTPs (if needed):**

- **POST** `/api/admin/rm/resend-mobile-otp` → Body: `{ "signup_request_id": 42 }`
- **POST** `/api/admin/rm/resend-email-otp` → Body: `{ "signup_request_id": 42 }`

**Get signup status:**

- **GET** `/api/admin/rm/signup-status/:requestId`  
- Response includes `status`, `mobile_verified`, `email_verified`, etc.

---

### 6.4 Create RM – Direct (deprecated)

- **POST** `/api/admin/rm/create`
- **Content-Type:** `multipart/form-data` (same fields as initiate, including files and **branch_id**).

**Body:** Same as initiate (name, phone_number, email, password, **branch_id**, rm_aadhaar_front, rm_pan_image).

**Success (201):**

```json
{
  "success": true,
  "message": "RM created successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "RM-A1B2C3D4",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "aadhaar_front_image_url": "...",
    "pan_image_url": "..."
  }
}
```

---

### 6.5 Update RM

- **PUT** `/api/admin/rm/:id`

**Body (all optional, at least one required):**

```json
{
  "name": "John Updated",
  "phone_number": "9876543210",
  "email": "john.new@example.com",
  "status": "active",
  "branch_id": 6
}
```

- To unassign branch: send `"branch_id": null`.
- Backend validates that `branch_id` exists when it is a number.

**Success (200):** Same shape as “Get RM by ID” (`data.rm`).

**Errors:** `404` RM not found, `404` Branch not found if `branch_id` invalid, `400` validation (e.g. duplicate email/phone).

---

### 6.6 Delete RM

- **DELETE** `/api/admin/rm/:id`  
- Soft delete. Backend may block if partners exist (message in response).

---

### 6.7 Get partners under an RM

- **GET** `/api/admin/rm/:id/partners`  
- Returns list of partners linked to this RM.

---

## 7. Partners & Investors by Branch

Branch is **derived** from RM (and for investors, from Partner’s RM or direct RM). No `branch_id` on partner/investor tables.

### 7.1 List partners (with optional branch filter)

- **GET** `/api/admin/partners`
- **Query:** `branch_id` (optional) – e.g. `?branch_id=5` → only partners whose RM is in that branch.

**Success (200):** Same as existing partners list; `data.partners` filtered by branch when `branch_id` is sent.

---

### 7.2 List investors (with optional branch filter)

- **GET** `/api/users/investors`
- **Auth:** Admin (`Authorization: Bearer <admin_token>`).
- **Query:** `branch_id` (optional) – e.g. `?branch_id=5` → only investors in that branch (via RM or Partner’s RM).

**Success (200):** Same as existing investors list; `data.investors` filtered by branch when `branch_id` is sent.

---

## 8. How RM Creation Works Now

### Summary

1. **Branch is required** for every new RM (OTP flow and direct create).
2. Frontend must:
   - Either show **Nation → State → Branch** (cascading) and send the chosen **branch_id**, or
   - Show a single **Branch** dropdown (loaded from `GET /api/admin/branches`) and send that **branch_id**.
3. Initiate and direct create both require **branch_id** in the body (and files where applicable).
4. After create, RM appears in list with `branch_id`, `branch_name`, `state_name`, `nation_name` when you use `GET /api/admin/rm/list`.

### OTP flow (recommended)

1. User fills: Name, Phone, Email, Password, **Branch** (and uploads Aadhaar + PAN if required).
2. Frontend calls **POST /api/admin/rm/initiate** with those fields + **branch_id**.
3. Backend sends OTPs; returns `signup_request_id`.
4. User enters mobile OTP → **POST verify-mobile-otp**.
5. User enters email OTP → **POST verify-email-otp**.
6. Frontend calls **POST /api/admin/rm/complete** with `signup_request_id`.
7. Backend creates RM with the same **branch_id** stored at initiate; returns RM details.

### Direct create (deprecated)

1. User fills same fields including **Branch** and uploads.
2. Frontend calls **POST /api/admin/rm/create** with **branch_id** and files.
3. Backend creates RM immediately (no OTP).

### Validation (backend)

- **branch_id** required on create (integer ≥ 1).
- Backend checks that the branch exists; if not, returns **404 “Branch not found”**.

---

## 9. Suggested UI Flows

### Hierarchy setup (one-time / ongoing)

1. **Nations:** List → Add/Edit/Delete. Simple name field.
2. **States:** List all states; each row shows current nation (if any). “Assign nation” → dropdown of nations → PATCH `states/:id/nation` with `nation_id` or `null`.
3. **Branches:** List (optional filters: nation, state). Add branch → select State + enter Name → POST. Edit → only name. Delete → block with message if RMs assigned.

### RM create screen

1. Load branches: `GET /api/admin/branches` (optionally with `state_id` or `nation_id` for cascading).
2. Show either:
   - **Cascading:** Nation dropdown → State dropdown (filtered by nation) → Branch dropdown (filtered by state), or
   - **Single:** One “Branch” dropdown (e.g. grouped by Nation > State).
3. Collect: Name, Phone, Email, Password, **Branch** (store `branch_id`), Aadhaar image, PAN image.
4. Submit to **POST /api/admin/rm/initiate** (or direct create) including **branch_id**.
5. If OTP flow: collect OTPs and call verify + complete as above.

### RM list screen

1. Optional filters: Nation, State, Branch (dropdowns; filter branches by state, states by nation).
2. Call `GET /api/admin/rm/list` with `nation_id`, `state_id`, `branch_id` as needed.
3. Table columns: e.g. RM Code, Name, Email, Phone, Branch, State, Nation, Partners count, Status, Actions.

### Partners / Investors list

1. Add optional “Branch” filter.
2. When branch is selected, call same list API with `?branch_id=<id>`.
3. Display branch name (e.g. from RM or from context) if helpful.

---

## 10. Validation & Error Messages

### Hierarchy

- Nation: name required, max 100 chars.
- State: PATCH body must include `nation_id` (number or `null`).
- Branch create: `state_id` required, `name` required (max 255); name unique per state.
- Branch update: `name` required.

### RM create (initiate / direct)

- `name` – required.
- `phone_number` – required, 10 digits.
- `email` – required, valid email.
- `password` – required, min 6 characters.
- **`branch_id`** – **required**, integer ≥ 1 (must be existing branch).

### RM update

- At least one field; `branch_id` optional (number or `null`).

### Common error responses

- **400** – Validation (e.g. “branch_id is required”, “Phone number must be 10 digits”).
- **404** – “Nation not found”, “State not found”, “Branch not found”, “RM not found”.
- **400** – “Cannot delete nation: X state(s) are assigned. Unassign states first.”
- **400** – “Cannot delete branch: X RM(s) are assigned. Reassign or remove them first.”
- **401** – Missing or invalid token.
- **403** – Not admin.

Use the `message` field from the error response for toasts or inline validation; use `error_code` only if you need to branch logic (e.g. redirect on 401).

---

## Quick reference – Base URL and headers

- **Base URL:** `<your_backend_base>`
- **Admin auth:** `Authorization: Bearer <admin_token>`
- **Content-Type:** `application/json` for most endpoints; `multipart/form-data` for RM initiate/create (with file uploads).

If you need a single place to copy-paste, the backend API list is also in `HIERARCHY_API.md`; this document adds request/response shapes, validation, and frontend-specific flows.

---

## Quick API Index

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/admin/nations` | List nations |
| GET | `/api/admin/nations/:id` | Get nation |
| POST | `/api/admin/nations` | Create nation |
| PUT | `/api/admin/nations/:id` | Update nation |
| DELETE | `/api/admin/nations/:id` | Delete nation |
| GET | `/api/admin/states` | List states (`?nation_id=` optional) |
| GET | `/api/admin/states/:id` | Get state |
| PATCH | `/api/admin/states/:id/nation` | Assign/unassign nation |
| GET | `/api/admin/branches` | List branches (`?state_id=`, `?nation_id=` optional) |
| GET | `/api/admin/branches/:id` | Get branch |
| POST | `/api/admin/branches` | Create branch |
| PUT | `/api/admin/branches/:id` | Update branch |
| DELETE | `/api/admin/branches/:id` | Delete branch |
| GET | `/api/admin/rm/list` | List RMs (`?branch_id=`, `?state_id=`, `?nation_id=` optional) |
| GET | `/api/admin/rm/:id` | Get RM |
| POST | `/api/admin/rm/initiate` | Start RM create (OTP) – **requires branch_id** |
| POST | `/api/admin/rm/verify-mobile-otp` | Verify mobile OTP |
| POST | `/api/admin/rm/verify-email-otp` | Verify email OTP |
| POST | `/api/admin/rm/complete` | Complete RM create (OTP) |
| POST | `/api/admin/rm/create` | Create RM direct – **requires branch_id** |
| PUT | `/api/admin/rm/:id` | Update RM (can set branch_id) |
| DELETE | `/api/admin/rm/:id` | Delete RM |
| GET | `/api/admin/partners` | List partners (`?branch_id=` optional) |
| GET | `/api/users/investors` | List investors (`?branch_id=` optional, admin auth) |

# Investor Plan Purchase APIs

Reference for the investor plan purchase flow: initialize purchase (PPID), upload payment proof, and admin payment verification. Deed sign will be added later for purchases with status `payment_verified`. Success responses use the shape `{ "success": true, "message": "...", "data": { ... } }`.

**Investor base path:** `/api/investor`  
**Admin base path:** `/api/admin`  
**Auth:** Investor endpoints require `Authorization: Bearer <jwt_token>` (role: investor). Admin endpoints require admin JWT (role: admin).

---

## Table of Contents

1. [Overview and flow](#overview-and-flow)
2. [Status lifecycle](#status-lifecycle)
3. [Investor endpoints](#investor-endpoints)
4. [Admin endpoints](#admin-endpoints)
5. [Error codes](#error-codes)
6. [Deed sign (later)](#deed-sign-later)

---

## Overview and flow

| Step | Actor | Action | Result |
|------|--------|--------|--------|
| 1 | Investor | Select plan and amount (≥ plan min) | Create purchase (PPID), status `initialized` |
| 2 | Investor | Upload payment proof for PPID | Status `payment_verification` |
| 3 | Admin | Approve or reject payment | Approve → `payment_verified` (eligible for deed sign later); Reject → `payment_failed` |

**Activity:** Counts and history are derived from the purchases table: total initialized, total verified, total failed per investor.

---

## Status lifecycle

- **initialized** – Purchase created; investor must upload payment proof.
- **payment_verification** – Proof uploaded; waiting for admin to approve or reject.
- **payment_verified** – Admin approved; purchase is eligible for deed sign (to be implemented later).
- **payment_failed** – Admin rejected; row kept for audit and stats (rejected items appear in investor list only for 48 hours; see List my purchases).

---

## Investor endpoints

All investor purchase endpoints require authentication and role `investor`.

### 1. Initialize purchase (Step 1)

**Endpoint:** `POST /api/investor/plans/:planId/purchase`

**Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`

**Path params:**

| Param | Type | Description |
|-------|------|-------------|
| `planId` | number | Plan ID (from `GET /api/investor/plans`) |

**Body (JSON):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `amount` | number | Yes | Investment amount (INR). Must be >= plan’s `investment_details.min_investment`. |

**Success (201):**

```json
{
  "success": true,
  "message": "Purchase initialized",
  "data": {
    "purchase_id": 1,
    "plan_id": 1,
    "amount": 100000,
    "status": "initialized",
    "initialized_at": "2025-01-26T10:00:00.000Z"
  }
}
```

**Errors:** 404 if plan not found (`PURCHASE_001`); 400 if amount is below plan minimum (`PURCHASE_002`).

---

### 2. Upload payment proof (Step 2)

**Endpoint:** `POST /api/investor/purchases/:purchaseId/payment-proof`

**Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`

**Path params:**

| Param | Type | Description |
|-------|------|-------------|
| `purchaseId` | number | Purchase ID (PPID) from initialize purchase. |

**Body (form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `payment_proof` | File | Yes | JPEG, PNG, or PDF; max 5MB. |

**Success (200):**

```json
{
  "success": true,
  "message": "Payment proof uploaded successfully",
  "data": {
    "purchase_id": 1,
    "status": "payment_verification",
    "payment_proof_uploaded_at": "2025-01-26T11:00:00.000Z"
  }
}
```

**Errors:** 404 if purchase not found or not owned by investor (`PURCHASE_004`); 400 if purchase status is not `initialized` (`PURCHASE_003`); 400 if file is missing (`FILE_004`).

---

### 3. List my purchases

**Endpoint:** `GET /api/investor/purchases`

**Headers:** `Authorization: Bearer <token>`

Returns all of the investor’s investments in one list, with a display category for each so the app can segment:

- **Verified active** – payment approved and (when deed flow exists) fully completed.
- **Non‑verified pending** – waiting for admin to approve or reject payment (`payment_verification`).
- **Rejected** – admin rejected payment; **only shown for 48 hours** after rejection; includes `rejection_reason`.
- **Approved, pending deed** – payment approved; deed sign pending (to be implemented).
- **Initialized** – purchase created; payment proof not yet uploaded.

When no `status` query is used, **rejected** purchases are included only if `payment_rejected_at` is within the last **48 hours**. When filtering by `status=payment_failed`, all rejected purchases are returned (no 48h limit).

**Query params (optional):**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status: `initialized`, `payment_verification`, `payment_verified`, `payment_failed`. If omitted, all categories above are returned with rejected limited to last 48h. |

**Investment categories (`investment_category`):**

| Value | Description |
|-------|-------------|
| `initialized` | Purchase created; proof not uploaded. |
| `pending_verification` | Proof uploaded; waiting for admin approval. |
| `rejected` | Admin rejected (with reason); shown only within 48h of rejection when not filtering by status. |
| `approved_pending_deed` | Payment verified; deed sign pending. |
| (future) `verified_active` | Deed signed; investment active. |

**Success (200):**

```json
{
  "success": true,
  "message": "Purchases retrieved successfully",
  "data": {
    "purchases": [
      {
        "id": 1,
        "plan_id": 1,
        "plan_name": "ACPL MAX YIELD PLAN (5+5)",
        "slug": "acpl-max-yield-5-5",
        "amount": 100000,
        "status": "payment_verification",
        "investment_category": "pending_verification",
        "initialized_at": "2025-01-26T10:00:00.000Z",
        "payment_proof_uploaded_at": "2025-01-26T11:00:00.000Z",
        "payment_verified_at": null,
        "payment_rejected_at": null,
        "rejection_reason": null,
        "created_at": "2025-01-26T10:00:00.000Z",
        "updated_at": "2025-01-26T11:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

---

### 4. Get my purchase stats

**Endpoint:** `GET /api/investor/purchases/stats`

**Headers:** `Authorization: Bearer <token>`

**Success (200):**

```json
{
  "success": true,
  "message": "Stats retrieved successfully",
  "data": {
    "total_initialized": 5,
    "total_verified": 2,
    "total_failed": 1
  }
}
```

`total_initialized` is the count of all purchases (ever created). `total_verified` and `total_failed` are counts by final status.

---

### 5. Get single purchase

**Endpoint:** `GET /api/investor/purchases/:purchaseId`

**Headers:** `Authorization: Bearer <token>`

**Path params:**

| Param | Type | Description |
|-------|------|-------------|
| `purchaseId` | number | Purchase ID (PPID). |

**Success (200):**

```json
{
  "success": true,
  "message": "Purchase retrieved successfully",
  "data": {
    "id": 1,
    "plan_id": 1,
    "plan_name": "ACPL MAX YIELD PLAN (5+5)",
    "slug": "acpl-max-yield-5-5",
    "amount": 100000,
    "status": "payment_verified",
    "investment_category": "approved_pending_deed",
    "payment_proof_file_path": "investors/42/purchases/1/payment-proof.pdf",
    "initialized_at": "2025-01-26T10:00:00.000Z",
    "payment_proof_uploaded_at": "2025-01-26T11:00:00.000Z",
    "payment_verified_at": "2025-01-26T12:00:00.000Z",
    "payment_rejected_at": null,
    "rejection_reason": null,
    "created_at": "2025-01-26T10:00:00.000Z",
    "updated_at": "2025-01-26T12:00:00.000Z",
    "plan": {
      "id": 1,
      "name": "ACPL MAX YIELD PLAN (5+5)",
      "slug": "acpl-max-yield-5-5",
      "investment_details": { "min_investment": 100000 }
    }
  }
}
```

**Errors:** 404 if not found or not owned by investor (`PURCHASE_004`).

---

## Admin endpoints

All admin purchase endpoints require authentication and role `admin`.

### 1. List pending payment verifications

**Endpoint:** `GET /api/admin/purchases/pending-verification`

**Headers:** `Authorization: Bearer <admin_token>`

**Success (200):**

```json
{
  "success": true,
  "message": "Pending verifications retrieved",
  "data": {
    "purchases": [
      {
        "id": 1,
        "investor_id": 42,
        "plan_id": 1,
        "plan_name": "ACPL MAX YIELD PLAN (5+5)",
        "amount": 100000,
        "payment_proof_file_path": "investors/42/purchases/1/payment-proof.pdf",
        "payment_proof_uploaded_at": "2025-01-26T11:00:00.000Z",
        "initialized_at": "2025-01-26T10:00:00.000Z",
        "created_at": "2025-01-26T10:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

To view the file, use the storage service’s signed URL or your existing file-serving endpoint with `payment_proof_file_path`.

---

### 2. Approve payment

**Endpoint:** `POST /api/admin/purchases/:purchaseId/verify-payment`

**Headers:** `Authorization: Bearer <admin_token>`

**Path params:**

| Param | Type | Description |
|-------|------|-------------|
| `purchaseId` | number | Purchase ID (PPID). |

**Success (200):**

```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "purchase_id": 1,
    "status": "payment_verified",
    "payment_verified_at": "2025-01-26T12:00:00.000Z"
  }
}
```

**Errors:** 400 if purchase not found or status is not `payment_verification` (`PURCHASE_004` or `PURCHASE_003`).

---

### 3. Reject payment

**Endpoint:** `POST /api/admin/purchases/:purchaseId/reject-payment`

**Headers:** `Authorization: Bearer <admin_token>`, `Content-Type: application/json`

**Path params:**

| Param | Type | Description |
|-------|------|-------------|
| `purchaseId` | number | Purchase ID (PPID). |

**Body (JSON, optional):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `reason` | string | No | Rejection reason (max 500 chars). |

**Success (200):**

```json
{
  "success": true,
  "message": "Payment rejected",
  "data": {
    "purchase_id": 1,
    "status": "payment_failed",
    "payment_rejected_at": "2025-01-26T12:00:00.000Z",
    "rejection_reason": "Transaction ID not matching."
  }
}
```

**Errors:** 400 if purchase not found or status is not `payment_verification` (`PURCHASE_004` or `PURCHASE_003`).

---

## Error codes

Error responses use the shape: `{ "success": false, "message": "...", "developer_message": "...", "error_code": "..." }`.

| Code | Constant | Description |
|------|----------|-------------|
| `PURCHASE_001` | PURCHASE_PLAN_NOT_FOUND | Plan not found. |
| `PURCHASE_002` | PURCHASE_AMOUNT_BELOW_MIN | Amount is below the minimum required for this plan. |
| `PURCHASE_003` | PURCHASE_INVALID_STATUS | Purchase cannot be updated in current status. |
| `PURCHASE_004` | PURCHASE_NOT_FOUND | Purchase not found or not owned by caller. |
| `FILE_004` | FILE_NOT_FOUND | Required file missing (e.g. payment proof). |

---

## Deed sign (later)

Purchases with status `payment_verified` will be eligible for the deed sign flow. That flow and its APIs will be documented separately when implemented.

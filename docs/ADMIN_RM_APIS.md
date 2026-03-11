# Admin – RM (Relationship Manager) APIs

**Audience:** Admin panel developers, API testers  
**Base path:** `https://<host>/api/admin`  
**Auth:** All endpoints except **Validate RM code** require **Admin** authentication (JWT with `role: 'admin'`).

This document describes all admin APIs for managing Relationship Managers: list, full details, partners, direct investors, visits, commission summary/history, create (OTP flow), update, and delete.

---

## Table of Contents

1. [Overview](#overview)
2. [Base URLs & Authentication](#base-urls--authentication)
3. [Standard Response Format](#standard-response-format)
4. [API Summary Table](#api-summary-table)
5. [Public: Validate RM Code](#public-validate-rm-code)
6. [RM Creation (OTP Flow)](#rm-creation-otp-flow)
7. [RM CRUD & Full Details](#rm-crud--full-details)
8. [RM Sub-Resources](#rm-sub-resources)
9. [Error Responses](#error-responses)

---

## Overview

- **RM** = Relationship Manager. Created by Admin; has a unique `rm_code` (e.g. `ADCPL-RM-A7F3K9M2`), branch, and can have partners and direct investors.
- **Full details** for an RM include: profile, branch, commission summary, partners (with referral/commission), direct investors (with purchase summary), visits (meetings), and commission distribution.
- **RM code format:** `ADCPL-RM-` followed by 8 uppercase letters/digits.

---

## Base URLs & Authentication

| Environment   | Base URL (Admin)                    |
|---------------|-------------------------------------|
| Local         | `http://localhost:3000/api/admin`   |
| Test/Staging  | `https://<test-host>/api/admin`     |
| Production    | `https://<prod-host>/api/admin`     |

**Headers for authenticated requests:**

```
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json
```

For **multipart** (RM create with documents):

```
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data
```

---

## Standard Response Format

**Success:**

```json
{
  "success": true,
  "message": "<human-readable message>",
  "data": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "<user-facing message>",
  "developer_message": "<optional debug message>",
  "error_code": "<optional code>"
}
```

HTTP status: 200/201 for success; 400 for validation, 404 for not found, 500 for server error.

---

## API Summary Table

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/rm/code/:rmCode` | Validate RM code (for partner signup) | Public |
| POST | `/rm/initiate` | Start RM creation, send OTPs | Admin |
| POST | `/rm/resend-mobile-otp` | Resend mobile OTP | Admin |
| POST | `/rm/resend-email-otp` | Resend email OTP | Admin |
| POST | `/rm/verify-mobile-otp` | Verify mobile OTP | Admin |
| POST | `/rm/verify-email-otp` | Verify email OTP | Admin |
| POST | `/rm/complete` | Complete RM creation (after both OTPs verified) | Admin |
| GET | `/rm/signup-status/:requestId` | Get signup request status | Admin |
| POST | `/rm/create` | Create RM directly (no OTP) – **DEPRECATED** | Admin |
| GET | `/rm/list` | List all RMs (optional filters) | Admin |
| GET | `/rm/:id` | Get RM full in-depth details | Admin |
| GET | `/rm/:id/partners` | List partners under RM (with referral & commission) | Admin |
| GET | `/rm/:id/investors` | List direct investors under RM | Admin |
| GET | `/rm/:id/visits` | List RM visits (meetings) | Admin |
| GET | `/rm/:id/commission-summary` | Get RM commission summary only | Admin |
| GET | `/rm/:id/commissions` | List RM commission history (paginated) | Admin |
| PUT | `/rm/:id` | Update RM | Admin |
| DELETE | `/rm/:id` | Soft delete RM | Admin |

---

## Public: Validate RM Code

Used by partner signup to validate an RM referral code. **No auth.**

### GET /rm/code/:rmCode

**Path params:**

| Param   | Type   | Description                    |
|---------|--------|--------------------------------|
| `rmCode` | string | RM code, e.g. `ADCPL-RM-A7F3K9M2` |

**Success (200) – Valid code:**

```json
{
  "success": true,
  "message": "RM found",
  "data": {
    "valid": true,
    "rm_name": "John Doe"
  }
}
```

**Error (400) – Invalid format:**

```json
{
  "success": false,
  "message": "Invalid RM code format",
  "developer_message": "...",
  "error_code": "RM_INVALID"
}
```

**Error (404) – Code not found / (400) – RM not active:**

```json
{
  "success": false,
  "message": "Invalid RM referral code",
  "error_code": "RM_INVALID"
}
```
or
```json
{
  "success": false,
  "message": "RM is not active",
  "error_code": "RM_NOT_ACTIVE"
}
```

---

## RM Creation (OTP Flow)

Recommended flow: **Initiate** → verify mobile OTP → verify email OTP → **Complete**.

### 1. Initiate RM signup

**POST /rm/initiate**

**Content-Type:** `multipart/form-data`

**Body (form fields):**

| Field         | Type   | Required | Description                    |
|---------------|--------|----------|--------------------------------|
| `name`        | string | Yes      | Full name                      |
| `phone_number`| string | Yes      | 10 digits                      |
| `email`       | string | Yes      | Valid email                    |
| `password`    | string | Yes      | Min 6 characters               |
| `branch_id`   | number | Yes      | Valid branch ID                |
| `rm_aadhaar_front` | file | Optional | Aadhaar front image        |
| `rm_pan_image`     | file | Optional | PAN card image             |

**Success (201):**

```json
{
  "success": true,
  "message": "OTPs sent to mobile and email. Please verify to complete RM creation.",
  "data": {
    "signup_request_id": "uuid-or-id",
    "otp_expires_in_minutes": 10,
    "message": "OTPs sent to mobile and email. Please verify to complete RM creation."
  }
}
```

**Error (400):** Validation (e.g. email/phone already exists, invalid branch).

---

### 2. Resend mobile OTP

**POST /rm/resend-mobile-otp**

**Body:**

```json
{
  "signup_request_id": "<requestId from initiate>"
}
```

**Success (200):**

```json
{
  "success": true,
  "message": "<resend message>",
  "data": {
    "signup_request_id": "<id>",
    "otp_expires_in_minutes": 10,
    "message": "Mobile OTP resent successfully"
  }
}
```

---

### 3. Resend email OTP

**POST /rm/resend-email-otp**

**Body:**

```json
{
  "signup_request_id": "<requestId from initiate>"
}
```

**Success (200):** Same shape as resend mobile (with email message).

---

### 4. Verify mobile OTP

**POST /rm/verify-mobile-otp**

**Body:**

```json
{
  "signup_request_id": "<requestId>",
  "otp": "123456"
}
```

Alternatively: `mobile_otp` instead of `otp`.

**Success (200):**

```json
{
  "success": true,
  "message": "Mobile number verified successfully",
  "data": {
    "signup_request_id": "<id>",
    "mobile_verified": true,
    "email_verified": false,
    "both_verified": false,
    "message": "Mobile number verified successfully"
  }
}
```

---

### 5. Verify email OTP

**POST /rm/verify-email-otp**

**Body:**

```json
{
  "signup_request_id": "<requestId>",
  "otp": "654321"
}
```

Alternatively: `email_otp` instead of `otp`.

**Success (200):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "signup_request_id": "<id>",
    "mobile_verified": true,
    "email_verified": true,
    "both_verified": true,
    "message": "Email verified successfully"
  }
}
```

---

### 6. Complete RM creation

**POST /rm/complete**

**Body:**

```json
{
  "signup_request_id": "<requestId>"
}
```

**Success (201):**

```json
{
  "success": true,
  "message": "RM created successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "ADCPL-RM-A7F3K9M2",
    "name": "John Doe",
    "email": "rm@example.com",
    "phone_number": "9876543210",
    "message": "RM created successfully"
  }
}
```

---

### 7. Get signup request status

**GET /rm/signup-status/:requestId**

**Success (200):**

```json
{
  "success": true,
  "message": "Signup status retrieved",
  "data": {
    "signup_request_id": 1,
    "status": "both_verified",
    "mobile_verified": true,
    "email_verified": true,
    "both_verified": true,
    "name": "John Doe",
    "email": "rm@example.com",
    "phone_number": "9876543210",
    "created_at": "2026-01-15T10:30:00.000Z"
  }
}
```

`status` can be: `pending`, `both_verified`, `completed`, `expired`.

---

## RM CRUD & Full Details

### List all RMs

**GET /rm/list**

**Query (optional):**

| Param       | Type   | Description                    |
|-------------|--------|--------------------------------|
| `branch_id` | number | Filter by branch               |
| `state_id`  | number | Filter by state (via branch)   |
| `nation_id` | number | Filter by nation (via branch) |

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
        "rm_code": "ADCPL-RM-A7F3K9M2",
        "branch_id": 5,
        "name": "John Doe",
        "phone_number": "9876543210",
        "email": "rm@example.com",
        "aadhaar_front_image": "<storage path>",
        "pan_image": "<storage path>",
        "profile_image": "https://...",
        "status": "active",
        "created_at": "2026-01-15T10:30:00.000Z",
        "updated_at": "2026-01-15T10:30:00.000Z",
        "branch_name": "Mumbai Central",
        "state_id": 2,
        "state_name": "Maharashtra",
        "nation_id": 1,
        "nation_name": "India",
        "partner_count": 12,
        "aadhaar_front_image_url": "https://...",
        "pan_image_url": "https://..."
      }
    ]
  }
}
```

---

### Get RM by ID (full in-depth details)

**GET /rm/:id**

Returns full RM profile, branch, commission summary, partners (with referral & commission), direct investors (with purchase summary), visits, and commission distribution.

**Path params:**

| Param | Type   | Description |
|-------|--------|-------------|
| `id`  | number | RM ID       |

**Success (200):**

```json
{
  "success": true,
  "message": "RM details retrieved",
  "data": {
    "rm": {
      "id": 1,
      "rm_code": "ADCPL-RM-A7F3K9M2",
      "branch_id": 5,
      "name": "John Doe",
      "phone_number": "9876543210",
      "email": "rm@example.com",
      "aadhaar_front_image": "<path>",
      "pan_image": "<path>",
      "profile_image": "https://...",
      "status": "active",
      "created_at": "2026-01-15T10:30:00.000Z",
      "updated_at": "2026-01-15T10:30:00.000Z",
      "partner_count": 12,
      "investor_count": 3,
      "aadhaar_front_image_url": "https://...",
      "pan_image_url": "https://..."
    },
    "branch": {
      "id": 5,
      "state_id": 2,
      "name": "Mumbai Central",
      "state_name": "Maharashtra",
      "nation_id": 1,
      "nation_name": "India"
    },
    "commission_summary": {
      "total_commission": 50000.00,
      "paid_commission": 30000.00,
      "pending_commission": 20000.00,
      "receivable_commission": 19400.00
    },
    "partners": [
      {
        "id": 101,
        "name": "Partner One",
        "email": "p1@example.com",
        "mobile": "9876500001",
        "status": "active",
        "signup_status": "completed",
        "partner_referral_code": "ADCPL-P-XXX",
        "rm_id": 1,
        "created_at": "2026-01-20T09:00:00.000Z",
        "referral_summary": {
          "referred_investors_count": 5,
          "total_invested_by_referred": 2500000.00
        },
        "commission_earned": 25000.00,
        "rm_commission_earned_from_their_investors": 5000.00
      }
    ],
    "partner_count": 12,
    "investors": [
      {
        "id": 201,
        "client_number": 1001,
        "client_id": "ACPL1001",
        "name": "Investor Direct",
        "email": "inv@example.com",
        "mobile": "9876511111",
        "status": "active",
        "partner_id": null,
        "rm_id": 1,
        "referral_code": null,
        "kyc_complete": true,
        "has_nominees": true,
        "profile_image": "https://...",
        "created_at": "2026-01-25T11:00:00.000Z",
        "updated_at": "2026-01-25T11:00:00.000Z",
        "purchase_summary": {
          "total_verified_count": 2,
          "total_invested_amount": 500000.00,
          "last_verified_at": "2026-02-01T12:00:00.000Z"
        }
      }
    ],
    "investor_count": 3,
    "visits": [
      {
        "id": 10,
        "rm_id": 1,
        "visit_type": "partner",
        "is_existing": true,
        "partner_id": 101,
        "investor_id": null,
        "contact_name": null,
        "contact_number": null,
        "description": "Monthly review",
        "created_at": "2026-02-10T14:00:00.000Z",
        "updated_at": "2026-02-10T14:00:00.000Z",
        "image_urls": ["https://...", "https://..."]
      }
    ],
    "visits_count": 15,
    "commission_distribution": [
      {
        "id": 501,
        "investor_plan_purchase_id": 301,
        "amount": 2500.00,
        "status": "paid",
        "paid_at": "2026-02-15T10:00:00.000Z",
        "created_at": "2026-02-01T12:00:00.000Z",
        "payment_verified_at": "2026-02-01T12:00:00.000Z",
        "investment_display_id": "INV-2026-001"
      }
    ],
    "commission_distribution_count": 20
  }
}
```

- `branch` may be `null` if RM has no branch.
- `partners`: only partners with `rm_id = this RM`.
- `investors`: only **direct** investors (`investors.rm_id = this RM`).
- `visits`: up to 100 most recent; `image_urls` are signed URLs.
- `commission_distribution`: up to 100 most recent RM commission records.
- `receivable_commission`: after TDS (from plan snapshot).

**Error (404):** RM not found.

---

### Update RM

**PUT /rm/:id**

**Body (all optional; at least one required):**

| Field         | Type   | Description                    |
|---------------|--------|--------------------------------|
| `name`        | string | Full name                      |
| `phone_number`| string | 10 digits                      |
| `email`       | string | Valid email                    |
| `status`      | string | `active` \| `inactive`         |
| `branch_id`   | number \| null | Branch ID or null     |

**Success (200):**

```json
{
  "success": true,
  "message": "RM updated successfully",
  "data": {
    "rm": {
      "id": 1,
      "rm_code": "ADCPL-RM-A7F3K9M2",
      "branch_id": 5,
      "name": "John Doe",
      "phone_number": "9876543210",
      "email": "rm@example.com",
      "profile_image": "https://...",
      "status": "active",
      "created_at": "...",
      "updated_at": "...",
      "aadhaar_front_image_url": "https://...",
      "pan_image_url": "https://..."
    }
  }
}
```

**Error (404):** RM not found. **Error (400):** Validation (e.g. branch not found, duplicate email/phone).

---

### Delete RM (soft delete)

**DELETE /rm/:id**

**Success (200):**

```json
{
  "success": true,
  "message": "RM deleted successfully",
  "data": null
}
```

**Error (404):** RM not found.  
**Error (400):** RM has linked partners (must reassign partners first).

---

## RM Sub-Resources

All use **GET**, require **Admin** auth, and return **404** if the RM is not found.

---

### Get partners under RM

**GET /rm/:id/partners**

Each partner includes referral summary and commission (partner’s earned commission and RM commission from their investors).

**Success (200):**

```json
{
  "success": true,
  "message": "Partners fetched successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "ADCPL-RM-A7F3K9M2",
    "rm_name": "John Doe",
    "partner_count": 12,
    "partners": [
      {
        "id": 101,
        "name": "Partner One",
        "email": "p1@example.com",
        "mobile": "9876500001",
        "status": "active",
        "signup_status": "completed",
        "partner_referral_code": "ADCPL-P-XXX",
        "referral_code": "ADCPL-P-XXX",
        "rm_id": 1,
        "profile_image": "https://...",
        "created_at": "2026-01-20T09:00:00.000Z",
        "referral_summary": {
          "referred_investors_count": 5,
          "total_invested_by_referred": 2500000.00
        },
        "commission_earned": 25000.00,
        "rm_commission_earned_from_their_investors": 5000.00
      }
    ]
  }
}
```

---

### Get direct investors under RM

**GET /rm/:id/investors**

Lists investors with `rm_id = this RM` (direct only). Optional pagination.

**Query:**

| Param   | Type   | Default | Description     |
|---------|--------|---------|-----------------|
| `limit` | number | 50      | 1–100           |
| `offset`| number | 0       | Pagination start |

**Success (200):**

```json
{
  "success": true,
  "message": "Investors fetched successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "ADCPL-RM-A7F3K9M2",
    "rm_name": "John Doe",
    "investor_count": 2,
    "total": 3,
    "limit": 50,
    "offset": 0,
    "investors": [
      {
        "id": 201,
        "client_number": 1001,
        "client_id": "ACPL1001",
        "name": "Investor Direct",
        "email": "inv@example.com",
        "mobile": "9876511111",
        "status": "active",
        "partner_id": null,
        "rm_id": 1,
        "referral_code": null,
        "kyc_complete": true,
        "has_nominees": true,
        "profile_image": "https://...",
        "created_at": "2026-01-25T11:00:00.000Z",
        "updated_at": "2026-01-25T11:00:00.000Z",
        "purchase_summary": {
          "total_verified_count": 2,
          "total_invested_amount": 500000.00,
          "last_verified_at": "2026-02-01T12:00:00.000Z"
        }
      }
    ]
  }
}
```

---

### Get RM visits (meetings)

**GET /rm/:id/visits**

**Query:**

| Param        | Type   | Description                    |
|--------------|--------|--------------------------------|
| `visit_type` | string | `partner` \| `investor` (optional filter) |
| `limit`      | number | 1–100, default 50             |
| `offset`     | number | Default 0                     |

**Success (200):**

```json
{
  "success": true,
  "message": "Visits fetched successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "ADCPL-RM-A7F3K9M2",
    "rm_name": "John Doe",
    "visits": [
      {
        "id": 10,
        "rm_id": 1,
        "visit_type": "partner",
        "is_existing": true,
        "partner_id": 101,
        "investor_id": null,
        "contact_name": null,
        "contact_number": null,
        "description": "Monthly review",
        "created_at": "2026-02-10T14:00:00.000Z",
        "updated_at": "2026-02-10T14:00:00.000Z",
        "image_urls": ["https://...", "https://..."]
      }
    ],
    "visits_count": 2,
    "limit": 50,
    "offset": 0
  }
}
```

- `visit_type`: `partner` or `investor`.
- `is_existing`: whether the visit was linked to an existing partner/investor.
- `image_urls`: signed URLs for up to 4 proof images (1–4 present).

---

### Get RM commission summary

**GET /rm/:id/commission-summary**

**Success (200):**

```json
{
  "success": true,
  "message": "Commission summary retrieved",
  "data": {
    "rm_id": 1,
    "rm_code": "ADCPL-RM-A7F3K9M2",
    "rm_name": "John Doe",
    "commission_summary": {
      "total_commission": 50000.00,
      "paid_commission": 30000.00,
      "pending_commission": 20000.00,
      "receivable_commission": 19400.00
    }
  }
}
```

- `receivable_commission`: pending amount after TDS (from plan snapshot).

---

### Get RM commission history

**GET /rm/:id/commissions**

**Query:**

| Param   | Type   | Default | Description     |
|---------|--------|---------|-----------------|
| `limit` | number | 50      | 1–100           |
| `offset`| number | 0       | Pagination start |

**Success (200):**

```json
{
  "success": true,
  "message": "Commissions fetched successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "ADCPL-RM-A7F3K9M2",
    "rm_name": "John Doe",
    "commissions": [
      {
        "id": 501,
        "investor_plan_purchase_id": 301,
        "amount": 2500.00,
        "status": "paid",
        "paid_at": "2026-02-15T10:00:00.000Z",
        "created_at": "2026-02-01T12:00:00.000Z",
        "payment_verified_at": "2026-02-01T12:00:00.000Z",
        "investment_display_id": "INV-2026-001"
      }
    ],
    "count": 1,
    "limit": 50,
    "offset": 0
  }
}
```

---

## Error Responses

Common error shapes:

**404 – Not found:**

```json
{
  "success": false,
  "message": "RM not found",
  "developer_message": "...",
  "error_code": "DB_RECORD_NOT_FOUND"
}
```

**400 – Validation / business rule:**

```json
{
  "success": false,
  "message": "Cannot delete RM with 5 linked partner(s). Please reassign partners to another RM first.",
  "developer_message": "..."
}
```

**401 – Unauthorized:** Missing or invalid admin JWT.

**500 – Server error:** Generic message; optional `error_code` and `developer_message`.

---

## Related Admin Routes

- **Change partner’s RM:** `PATCH /api/admin/partners/:partnerId/rm` with body `{ "rm_id" }` or `{ "rm_code" }` (see partner admin docs).

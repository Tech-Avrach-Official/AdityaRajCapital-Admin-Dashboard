# Super Admin – Investors & Investments API Guide

**Base URL:** `https://test-api.adityarajcapital.com` (or `VITE_API_BASE_URL` from `.env`)

**Auth:** Admin JWT from `POST /api/admin/login`. Send it as:

```http
Authorization: Bearer <admin_token>
```

---

## 1. Get admin token (login)

| Method | Endpoint | Auth |
|--------|----------|------|
| POST   | `/api/admin/login` | None |

**URL:** `{BASE_URL}/api/admin/login`

**Body (JSON):**
```json
{
  "admin_id": "your_admin_id",
  "password": "your_password"
}
```

**Success (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin_id": "your_admin_id"
  }
}
```

Use `data.token` in the `Authorization` header for all super admin calls below.

---

## 2. Investors (list & details)

### 2.1 List all investors

| Method | Endpoint | Auth |
|--------|----------|------|
| GET    | `/api/users/investors` | Admin Bearer |

**URL:** `{BASE_URL}/api/users/investors`

**Headers:**
```http
Authorization: Bearer <admin_token>
```

**Success (200):**
```json
{
  "success": true,
  "message": "Investors fetched successfully",
  "data": {
    "count": 2,
    "investors": [
      {
        "id": 1,
        "client_number": 1,
        "client_id": "ACPL0001",
        "name": "Investor Name",
        "email": "investor@example.com",
        "mobile": "9876543210",
        "status": "active",
        "partner_id": 5,
        "referral_code": "...",
        "kyc_complete": 1,
        "has_nominees": 1,
        "created_at": "...",
        "updated_at": "...",
        "partner": {
          "partner_id": 5,
          "partner_name": "Partner Name",
          "partner_referral_code": "ADC-PR-5"
        }
      }
    ]
  }
}
```

Use this for "investors list" / "users – investors" in the super admin UI.

**Important:** Do **not** call `/api/financial/investments`; that path does not exist and returns 404.

### 2.2 Get one investor's KYC documents (signed URLs)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET    | `/api/admin/investors/:investorId/kyc-documents` | Admin Bearer |

**Example:** `{BASE_URL}/api/admin/investors/1/kyc-documents`

**Success (200):**
```json
{
  "success": true,
  "message": "Investor KYC documents retrieved",
  "data": {
    "investor_id": 1,
    "documents": [
      { "document_type": "aadhar_front", "url": "https://..." },
      { "document_type": "aadhar_back", "url": "https://..." },
      { "document_type": "pan_card", "url": "https://..." },
      { "document_type": "cancelled_cheque", "url": "https://..." }
    ]
  }
}
```

---

## 3. Investments / plan purchases (super admin)

There is **no** `/api/financial/investments`. Use these instead.

### 3.1 List purchases pending payment verification

| Method | Endpoint | Auth |
|--------|----------|------|
| GET    | `/api/admin/purchases/pending-verification` | Admin Bearer |

**URL:** `{BASE_URL}/api/admin/purchases/pending-verification`

**Success (200):**
```json
{
  "success": true,
  "message": "Pending payment verifications retrieved",
  "data": {
    "count": 1,
    "purchases": [
      {
        "id": 10,
        "investor_id": 1,
        "plan_id": 2,
        "plan_name": "Plan Name",
        "amount": 50000,
        "payment_proof_file_path": "investors/1/purchases/10/...",
        "status": "payment_uploaded",
        "initialized_at": "...",
        "payment_proof_uploaded_at": "..."
      }
    ]
  }
}
```

Use this for "pending investments" / "payments to verify" / "Investments" page in super admin.

### 3.2 Approve payment (verify)

| Method | Endpoint | Auth |
|--------|----------|------|
| POST   | `/api/admin/purchases/:purchaseId/verify-payment` | Admin Bearer |

**Example:** `{BASE_URL}/api/admin/purchases/10/verify-payment`

**Body:** none or `{}`

### 3.3 Reject payment

| Method | Endpoint | Auth |
|--------|----------|------|
| POST   | `/api/admin/purchases/:purchaseId/reject-payment` | Admin Bearer |

**Body (JSON):**
```json
{
  "reason": "Optional rejection reason"
}
```

---

## 4. Investment plans (catalog – no auth)

For listing "plans" / "investment products" (e.g. in dropdowns or plan cards):

| Method | Endpoint | Auth |
|--------|----------|------|
| GET    | `/api/investor/plans` | None |

**URL:** `{BASE_URL}/api/investor/plans`

**Success (200):**
```json
{
  "success": true,
  "message": "Plans retrieved",
  "data": {
    "plans": [
      {
        "id": 1,
        "name": "...",
        "slug": "...",
        "min_amount": 10000,
        "returns": { ... },
        "investment_details": { ... },
        "partner_commission": { ... }
      }
    ]
  }
}
```

---

## 5. Quick reference – frontend mapping

| Super admin need           | Correct API | Wrong (404) |
|---------------------------|-------------|-------------|
| List investors            | `GET /api/users/investors` | — |
| One investor's KYC docs   | `GET /api/admin/investors/:id/kyc-documents` | — |
| Pending payments to verify| `GET /api/admin/purchases/pending-verification` | — |
| Approve payment           | `POST /api/admin/purchases/:id/verify-payment` | — |
| Reject payment            | `POST /api/admin/purchases/:id/reject-payment` | — |
| Investments (list)        | `GET /api/admin/purchases/pending-verification` | ~~GET /api/financial/investments~~ |
| List plans (catalog)      | `GET /api/investor/plans` | — |

---

## 6. Frontend usage tips

1. **Login once:** `POST /api/admin/login` → store `data.token` (e.g. in `localStorage` as `adminToken`).
2. **All super admin requests:** send `Authorization: Bearer <token>`.
3. **Investors screen:** call `GET /api/users/investors` (not `/api/financial/investments`).
4. **Investments / pending payments screen:** call `GET /api/admin/purchases/pending-verification`.
5. **401:** token missing or expired → re-login and retry with new token.

---

## 7. Endpoints in codebase

| Endpoint constant | Path |
|-------------------|------|
| `endpoints.admin.login` | `/api/admin/login` |
| `endpoints.admin.investorKycDocuments(id)` | `/api/admin/investors/:id/kyc-documents` |
| `endpoints.users.investors` | `/api/users/investors` |
| `endpoints.purchases.pendingVerification` | `/api/admin/purchases/pending-verification` |
| `endpoints.purchases.verifyPayment(id)` | `/api/admin/purchases/:id/verify-payment` |
| `endpoints.purchases.rejectPayment(id)` | `/api/admin/purchases/:id/reject-payment` |
| `endpoints.investorPlans` | `/api/investor/plans` |

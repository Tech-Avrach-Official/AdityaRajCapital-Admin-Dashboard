# Investor Module – Frontend Guide (Super Admin)

This guide covers **all APIs** and **frontend responsibilities** for the Super Admin **Investor module**: Investor list, Investor detail (mini dashboard), and Investment detail pages.

**Base URL:** All admin APIs use prefix `/api/admin` (or `/api/users` for the investor list; see below).  
**Auth:** Admin JWT — `Authorization: Bearer <admin_token>`.

---

## Table of Contents

1. [API Reference – Quick Index](#1-api-reference--quick-index)
2. [APIs – Request & Response](#2-apis--request--response)
3. [Page 1: Investor List](#3-page-1-investor-list)
4. [Page 2: Investor Detail (Mini Dashboard)](#4-page-2-investor-detail-mini-dashboard)
5. [Page 3: Investment Detail](#5-page-3-investment-detail)
6. [Errors & Status Codes](#6-errors--status-codes)

---

## 1. API Reference – Quick Index

| Purpose | Method | Path |
|--------|--------|------|
| List all investors | GET | `/api/users/investors` |
| Get single investor | GET | `/api/admin/investors/:investorId` |
| List branches (filter) | GET | `/api/admin/branches` |
| Investor KYC data | GET | `/api/admin/investors/:investorId/kyc-data` |
| Investor KYC documents (URLs) | GET | `/api/admin/investors/:investorId/kyc-documents` |
| Investor bank accounts | GET | `/api/admin/investors/:investorId/bank-accounts` |
| Investor nominees | GET | `/api/admin/investors/:investorId/nominees` |
| Investor purchases | GET | `/api/admin/investors/:investorId/purchases` |
| Single purchase (full) | GET | `/api/admin/purchases/:purchaseId` |
| Payment proof URL(s) | GET | `/api/admin/purchases/:purchaseId/payment-proof-url` |
| Signed deed URL | GET | `/api/admin/purchases/:purchaseId/signed-deed-url` |
| Purchase installments | GET | `/api/admin/purchases/:purchaseId/installments` |
| Verify payment | POST | `/api/admin/purchases/:purchaseId/verify-payment` |
| Reject payment | POST | `/api/admin/purchases/:purchaseId/reject-payment` |

---

## 2. APIs – Request & Response

### 2.1 List all investors

- **Method:** `GET`
- **Path:** `/api/users/investors`
- **Query (optional):** `branch_id` (number) – filter by branch.

**Success (200):** Each investor includes full **partner** or **rm** (mutually exclusive), **branch**, and **investment** details.

- If the investor has a **partner** (referred by partner): `partner` is a full object (id, name, email, mobile, status, signup_status, partner_referral_code, referral_code, rm_id, created_at, updated_at) and **`rm` is null**.
- If the investor has a direct **RM** (no partner): **`partner` is null** and `rm` is a full object (id, rm_code, branch_id, name, phone_number, email, status, created_at, updated_at).
- **`branch`** is always the branch the investor belongs to (from the partner’s RM or the investor’s direct RM), with id, state_id, name, state_name, nation_id, nation_name; null if neither applies.
- **`investment`** (and `purchase_summary`) give total_verified_count, total_invested_amount / total_investment_amount, last_verified_at.

```json
{
  "success": true,
  "message": "Investors fetched successfully",
  "data": {
    "count": 10,
    "investors": [
      {
        "id": 1,
        "client_id": "ACPL0001",
        "client_number": 1,
        "name": "Investor Name",
        "email": "investor@example.com",
        "mobile": "9876543210",
        "status": "active",
        "partner_id": 5,
        "rm_id": null,
        "referral_code": null,
        "email_verified_at": "...",
        "mobile_verified_at": "...",
        "kyc_complete": 1,
        "has_nominees": 1,
        "created_at": "2025-01-15T10:00:00.000Z",
        "updated_at": "2025-01-20T12:00:00.000Z",
        "partner": {
          "id": 5,
          "name": "Partner Name",
          "email": "partner@example.com",
          "mobile": "9876500000",
          "status": "active",
          "signup_status": "completed",
          "partner_referral_code": "ADC-PR-5",
          "referral_code": "ADC-PR-5",
          "rm_id": 2,
          "created_at": "...",
          "updated_at": "..."
        },
        "rm": null,
        "branch": {
          "id": 1,
          "state_id": 1,
          "name": "Mumbai Branch",
          "state_name": "Maharashtra",
          "nation_id": 1,
          "nation_name": "India"
        },
        "investment": {
          "total_verified_count": 2,
          "total_invested_amount": 500000,
          "total_investment_amount": 500000,
          "last_verified_at": "2025-01-18T14:00:00.000Z"
        },
        "purchase_summary": {
          "total_verified_count": 2,
          "total_invested_amount": 500000,
          "last_verified_at": "2025-01-18T14:00:00.000Z"
        }
      }
    ]
  }
}
```

Example when investor has direct RM (no partner): `partner` is `null`, `rm` is populated with full RM details, and `branch` is from that RM.

**What you do:** Use `data.investors` for the table. Use `partner` or `rm` for referral column (partner name or RM name), `branch.name` (or state/nation) for branch, and `investment.total_invested_amount` / `total_investment_amount` for total investment. Omit Nominees column in the table.

---

### 2.2 Get single investor by ID

- **Method:** `GET`
- **Path:** `/api/admin/investors/:investorId`
- **Params:** `investorId` (number).

**Success (200):**

```json
{
  "success": true,
  "message": "Investor retrieved",
  "data": {
    "id": 1,
    "client_id": "ACPL0001",
    "name": "Investor Name",
    "email": "investor@example.com",
    "mobile": "9876543210",
    "status": "active",
    "partner_id": 5,
    "kyc_complete": 1,
    "has_nominees": 1,
    "created_at": "2025-01-15T10:00:00.000Z",
    "updated_at": "2025-01-20T12:00:00.000Z",
    "partner": {
      "partner_id": 5,
      "partner_name": "Partner Name",
      "partner_referral_code": "ADC-PR-5"
    },
    "purchase_summary": {
      "total_verified_count": 2,
      "total_invested_amount": 500000,
      "last_verified_at": "2025-01-18T14:00:00.000Z"
    }
  }
}
```

**Errors:** 400 invalid ID, 404 investor not found.

**What you do:** Use when the user opens the Investor detail page by URL (direct link). Use `data` for header/profile (name, client_id, email, mobile, referral, kyc_complete, has_nominees, purchase_summary).

---

### 2.3 List branches (for filter)

- **Method:** `GET`
- **Path:** `/api/admin/branches`
- **Description:** Returns branches for the branch filter dropdown on the Investor list.

**Success (200):** Response shape is defined in hierarchy APIs. Use the list to populate the branch filter; pass selected `branch_id` to `GET /api/users/investors?branch_id=<id>`.

---

### 2.4 Investor KYC data

- **Method:** `GET`
- **Path:** `/api/admin/investors/:investorId/kyc-data`

**Success (200):**

```json
{
  "success": true,
  "message": "Investor KYC data retrieved",
  "data": {
    "investor_id": 1,
    "kyc": {
      "investor_id": 1,
      "aadhar_name": "...",
      "aadhar_number": "...",
      "aadhar_dob": "...",
      "aadhar_address": "...",
      "aadhar_pin_code": "...",
      "aadhar_state": "...",
      "aadhar_district": "...",
      "aadhar_city": "...",
      "pan_name": "...",
      "pan_number": "...",
      "bank_account_number": "...",
      "bank_ifsc": "...",
      "bank_name": "...",
      "bank_branch": "...",
      "kyc_verified": true,
      "name_match_status": "...",
      "ocr_processing_status": "...",
      "ocr_error_message": null
    },
    "documents": [
      { "document_type": "aadhar_front", "url": "https://..." },
      { "document_type": "aadhar_back", "url": "https://..." },
      { "document_type": "pan_card", "url": "https://..." },
      { "document_type": "cancelled_cheque", "url": "https://..." }
    ]
  }
}
```

If no KYC: `kyc` is `null`, `documents` is `[]`.

**What you do:** Show KYC status and extracted data in the KYC card; use `documents` for “View documents” links (or use the dedicated kyc-documents API for fresh URLs).

---

### 2.5 Investor KYC documents (signed URLs only)

- **Method:** `GET`
- **Path:** `/api/admin/investors/:investorId/kyc-documents`

**Success (200):**

```json
{
  "success": true,
  "message": "Investor KYC documents retrieved",
  "data": {
    "investor_id": 1,
    "documents": [
      { "document_type": "aadhar_front", "url": "https://...?X-Amz-..." },
      { "document_type": "aadhar_back", "url": "https://...?X-Amz-..." },
      { "document_type": "pan_card", "url": "https://...?X-Amz-..." },
      { "document_type": "cancelled_cheque", "url": "https://...?X-Amz-..." }
    ]
  }
}
```

URLs expire in 1 hour (3600 seconds). Use for “View Aadhaar front”, “View PAN”, etc.

---

### 2.6 Investor bank accounts

- **Method:** `GET`
- **Path:** `/api/admin/investors/:investorId/bank-accounts`

**Success (200):**

```json
{
  "success": true,
  "message": "Investor bank accounts retrieved",
  "data": {
    "investor_id": 1,
    "bank_accounts": [
      {
        "id": 10,
        "investor_id": 1,
        "account_number": "****1234",
        "ifsc": "HDFC0001234",
        "bank_name": "HDFC Bank",
        "bank_branch": "Mumbai",
        "status": "active",
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "count": 1
  }
}
```

**What you do:** Show in “Bank accounts” card on Investor detail. On Investment detail, if you need to show “Bank account for this investment”, you can match `purchase.investor_bank_account_id` to `bank_accounts[].id`, or use the resolved `bank_account` from the purchase detail response.

---

### 2.7 Investor nominees

- **Method:** `GET`
- **Path:** `/api/admin/investors/:investorId/nominees`

**Success (200):** Nominees include **signed URLs** for document viewing (`nominee_aadhar_front_url`, `nominee_aadhar_back_url`). Storage paths are not exposed. URLs expire in 1 hour (3600 seconds).

```json
{
  "success": true,
  "message": "Investor nominees retrieved",
  "data": {
    "investor_id": 1,
    "nominees": [
      {
        "id": 1,
        "investor_id": 1,
        "nominee_name": "Nominee Name",
        "nominee_relation": "Spouse",
        "share_percentage": 100,
        "nominee_aadhar_front_url": "https://...?X-Amz-...",
        "nominee_aadhar_back_url": "https://...?X-Amz-...",
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "count": 1
  }
}
```

If a document is not uploaded, the corresponding `_url` field is `null`. Use the URLs to open Aadhar front/back images in a new tab or display in a modal.

**What you do:** Show in “Nominees” card on Investor detail and in “Investor’s nominee(s)” on Investment detail. Use `nominee_aadhar_front_url` and `nominee_aadhar_back_url` for “View Aadhar front” / “View Aadhar back” links.

---

### 2.8 List investor purchases

- **Method:** `GET`
- **Path:** `/api/admin/investors/:investorId/purchases`
- **Query (optional):** `status` (string) – e.g. `active`, `payment_verified`, `payment_verification`.

**Success (200):**

```json
{
  "success": true,
  "message": "Investor purchases retrieved",
  "data": {
    "investor_id": 1,
    "investor": {
      "id": 1,
      "client_id": "ACPL0001",
      "name": "Investor Name",
      "email": "investor@example.com",
      "mobile": "9876543210"
    },
    "purchases": [
      {
        "id": 100,
        "investment_display_id": "INV-2025-001",
        "investor_id": 1,
        "plan_id": 2,
        "plan_name": "Plan A",
        "amount": 250000,
        "status": "active",
        "has_deed": true,
        "payment_proof_file_path": "...",
        "payment_proof_file_paths": ["path1", "path2"],
        "initialized_at": "...",
        "payment_proof_uploaded_at": "...",
        "payment_verified_at": "...",
        "payment_rejected_at": null,
        "rejection_reason": null,
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "total": 1
  }
}
```

**What you do:** Build the investments table. Show “View deed” only when `has_deed === true`. “View” on a row → navigate to Investment detail (e.g. `/admin/purchases/100` or `/admin/investors/1/investments/100`).

---

### 2.9 Get single purchase (full detail)

- **Method:** `GET`
- **Path:** `/api/admin/purchases/:purchaseId`

**Success (200):**

```json
{
  "success": true,
  "message": "Purchase retrieved",
  "data": {
    "id": 100,
    "investment_display_id": "INV-2025-001",
    "investor_id": 1,
    "plan_id": 2,
    "amount": 250000,
    "status": "active",
    "payment_proof_file_path": "...",
    "payment_proof_file_paths": ["path1", "path2"],
    "initialized_at": "...",
    "payment_proof_uploaded_at": "...",
    "payment_verified_at": "...",
    "payment_rejected_at": null,
    "rejection_reason": null,
    "verified_by_admin_id": 1,
    "partner_id": 5,
    "cheque_number": "CHQ123",
    "investor_bank_account_id": 10,
    "leegality_signing_status": "signed",
    "plan_snapshot": {
      "name": "Plan A",
      "slug": "plan-a",
      "returns": { ... },
      "investment_details": { "duration_months": 12, ... },
      "partner_commission": { ... },
      "rm_commission": { ... }
    },
    "signed_deed_url": "https://...?X-Amz-...",
    "bank_account": {
      "id": 10,
      "account_number": "****1234",
      "ifsc": "HDFC0001234",
      "bank_name": "HDFC Bank",
      "bank_branch": "Mumbai",
      "status": "active"
    },
    "created_at": "...",
    "updated_at": "...",
    "plan": {
      "id": 2,
      "name": "Plan A",
      "slug": "plan-a",
      "investment_details": { ... }
    },
    "investor": {
      "id": 1,
      "client_id": "ACPL0001",
      "name": "Investor Name",
      "email": "investor@example.com",
      "mobile": "9876543210"
    }
  }
}
```

`plan_snapshot` is the plan at verification time. `signed_deed_url` is present when a signed deed exists (expires in 1 hour). `bank_account` is resolved from `investor_bank_account_id` (may be null if account deleted or not set).

**What you do:** Use for Investment detail: summary, plan snapshot, bank account for this investment, investor link. Use `signed_deed_url` for “View deed” (or fetch from signed-deed-url when user clicks). Use `investor.id` to call nominees API for this investment’s context.

---

### 2.10 Payment proof URL(s)

- **Method:** `GET`
- **Path:** `/api/admin/purchases/:purchaseId/payment-proof-url`

**Success (200):**

```json
{
  "success": true,
  "message": "Payment proof URL(s) generated",
  "data": {
    "urls": [
      { "url": "https://...?X-Amz-..." }
    ],
    "expires_in_seconds": 3600
  }
}
```

Can be 1–4 URLs when multiple images are uploaded. **What you do:** On “View payment proof”, call this API and open each `url` in a new tab or modal.

**Errors:** 404 if no payment proof uploaded.

---

### 2.11 Signed deed URL

- **Method:** `GET`
- **Path:** `/api/admin/purchases/:purchaseId/signed-deed-url`

**Success (200):**

```json
{
  "success": true,
  "message": "Signed deed URL generated",
  "data": {
    "url": "https://...?X-Amz-...",
    "expires_in_seconds": 3600
  }
}
```

**What you do:** When user clicks “View deed”, call this (or use `signed_deed_url` from purchase detail if you already have it). Open `data.url` in a new tab. If you use the URL from purchase detail, note it expires in 1 hour; for a dedicated “View deed” button, calling this endpoint on click ensures a fresh URL.

**Errors:** 404 if signed deed not available for this purchase.

---

### 2.12 Purchase installments

- **Method:** `GET`
- **Path:** `/api/admin/purchases/:purchaseId/installments`

**Success (200):**

```json
{
  "success": true,
  "message": "Installment schedule retrieved",
  "data": {
    "purchase_id": 100,
    "investment_display_id": "INV-2025-001",
    "plan_name": "Plan A",
    "invested_amount": 250000,
    "total_return": 275000,
    "duration_months": 12,
    "schedule_type": "monthly",
    "installments": [
      {
        "installment_id": 1,
        "investor_plan_purchase_id": 100,
        "installment_number": 1,
        "schedule_type": "monthly",
        "period_start": "2025-02-01",
        "period_end": "2025-02-28",
        "period_label": "Feb 2025",
        "payout_date_from": "2025-03-01",
        "payout_date_to": "2025-03-07",
        "payout_month": 3,
        "payout_year": 2025,
        "payout_window_label": "Mar 2025",
        "gross_amount": 20000,
        "tds_percent": 10,
        "tds_amount": 2000,
        "receivable_amount": 18000,
        "status": "pending",
        "paid_at": null,
        "created_at": "...",
        "updated_at": "..."
      }
    ],
    "summary": {
      "total_installments": 12,
      "total_gross": 275000,
      "total_tds": 25000,
      "total_receivable": 250000,
      "pending_count": 11,
      "paid_count": 1,
      "cancelled_count": 0
    }
  }
}
```

For active purchases with no installments yet, the backend may generate them on first call. If no installments (e.g. deed not signed), `installments` is `[]` and summary counts are 0.

**What you do:** Render the installments table and summary on Investment detail. If empty, show “No installments yet” / “Schedule generated after deed is signed”.

---

### 2.13 Verify payment (admin)

- **Method:** `POST`
- **Path:** `/api/admin/purchases/:purchaseId/verify-payment`
- **Body:** `{ "cheque_number": "CHQ123" }` (required for deed generation).

**Success (200):** Purchase status becomes `payment_verified`; deed flow may be triggered. Response includes updated purchase or success message.

**What you do:** Call from “Verify payment” action on pending-verification purchases (e.g. from dashboard or purchase detail). Send cheque number from form.

---

### 2.14 Reject payment (admin)

- **Method:** `POST`
- **Path:** `/api/admin/purchases/:purchaseId/reject-payment`
- **Body:** `{ "rejection_reason": "Invalid proof" }`.

**Success (200):** Purchase status becomes `payment_failed`.

**What you do:** Call from “Reject payment” with reason; then refresh list or detail.

---

## 3. Page 1: Investor List

### APIs to call

1. **GET /api/users/investors** – on load; optionally with `?branch_id=<id>` when user selects a branch.
2. **GET /api/admin/branches** – to populate the branch filter dropdown.

### Frontend responsibilities

- **Table columns:** Client ID, Name, Email, Mobile, Referral (partner name or “—”), KYC (e.g. Pending / Complete from `kyc_complete`), Total invested (`purchase_summary.total_invested_amount`), Verified count (`purchase_summary.total_verified_count`), Last verified (`purchase_summary.last_verified_at`), Created (`created_at`). **Do not** show a Nominees column.
- **Search:** Client-side filter by `client_id` or `name` (optional).
- **KYC filter:** Client-side filter by `kyc_complete` (All / Pending / Complete).
- **Sort:** Client-side sort by name, date, amount, etc. if needed.
- **Export:** Client-side export (e.g. CSV) of current table data if required.
- **Navigation:** On “View” or row click → navigate to Investor detail with `investorId`, e.g. `/admin/investors/:investorId`.

---

## 4. Page 2: Investor Detail (Mini Dashboard)

### APIs to call

- **When arriving from list:** You can reuse the clicked investor for header/profile.
- **When arriving by URL (direct):** Call **GET /api/admin/investors/:investorId** for profile (name, client_id, email, mobile, partner, purchase_summary, kyc_complete, has_nominees).
- In parallel (or as needed):
  - **GET /api/admin/investors/:investorId/kyc-data** → KYC card (status + extracted data).
  - **GET /api/admin/investors/:investorId/kyc-documents** → “View documents” links (Aadhaar, PAN, cancelled cheque).
  - **GET /api/admin/investors/:investorId/bank-accounts** → Bank accounts card.
  - **GET /api/admin/investors/:investorId/nominees** → Nominees card.
  - **GET /api/admin/investors/:investorId/purchases** → Investments table.

### Frontend responsibilities

- **Header / profile:** Name, Client ID, email, mobile, referral (partner name/code), KYC status, has nominees, created date.
- **KYC card:** Show status and extracted data from kyc-data; “View documents” using kyc-documents URLs.
- **Bank accounts card:** List from bank-accounts API.
- **Nominees card:** List from nominees API.
- **Investments table:** From purchases API. Show plan name, amount, status, dates. Show **“View deed”** only when `has_deed === true`; on click, call **GET /api/admin/purchases/:purchaseId/signed-deed-url** and open the URL in a new tab (or use purchase detail’s `signed_deed_url` if already loaded).
- **“View” on a purchase row:** Navigate to Investment detail, e.g. `/admin/purchases/:purchaseId` or `/admin/investors/:investorId/investments/:purchaseId`.
- **Breadcrumb / back:** Link to Investor list.

---

## 5. Page 3: Investment Detail

### APIs to call

1. **GET /api/admin/purchases/:purchaseId** – full snapshot: investor, plan, plan_snapshot, bank_account, signed_deed_url, cheque_number, leegality_signing_status, etc.
2. **GET /api/admin/purchases/:purchaseId/installments** – installment schedule and summary.
3. **GET /api/admin/investors/:investorId/nominees** – use `investor_id` from purchase response to show “Investor’s nominee(s)” in context of this investment.

Optional: If you need payment proof or deed only on click, call **GET payment-proof-url** and **GET signed-deed-url** when the user clicks “View payment proof” / “View deed”.

### Frontend responsibilities

- **Investment summary:** From purchase detail (investment_display_id, amount, status, plan name, dates).
- **Plan snapshot:** Display `plan_snapshot` (name, returns, investment_details, duration, etc.) as read-only snapshot at verification time.
- **Bank account for this investment:** Use resolved `bank_account` from purchase detail (account_number, ifsc, bank_name, bank_branch, status). If null, you can fallback to bank-accounts list and match `investor_bank_account_id`.
- **Nominee(s):** From nominees API for `purchase.investor_id`.
- **Installments table + summary:** From installments API. If empty, show “No installments yet” / “Schedule generated after deed is signed”.
- **Deed card:** If `signed_deed_url` is present in purchase detail (or from signed-deed-url API), show “View deed” and open URL in new tab. Otherwise show “Deed not signed yet” or “Deed not available”.
- **Payment proof:** “View payment proof” → call **GET /api/admin/purchases/:purchaseId/payment-proof-url** and open each `data.urls[].url` in new tab or modal.
- **Breadcrumb / back:** Link to Investor detail (and optionally to Investor list).

---

## 6. Errors & Status Codes

- **400** – Invalid ID (e.g. non-numeric or &lt; 1 for investorId/purchaseId). Response includes `error_code` and message.
- **404** – Resource not found (investor, purchase, or e.g. “Payment proof not uploaded”, “Signed deed not available”). Use message to show user-friendly text.
- **500** – Server error. Show generic “Something went wrong” and optionally `error_code` for debugging.

All error responses follow the same shape, e.g.:

```json
{
  "success": false,
  "message": "Investor not found",
  "data": null,
  "error_code": "INVESTOR_NOT_FOUND"
}
```

Use `message` for user-facing text; use `error_code` for logging or conditional handling.

---

**End of Investor Module Frontend Guide.**

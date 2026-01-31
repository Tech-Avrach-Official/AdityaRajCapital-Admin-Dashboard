# Admin Panel: Investors & Investments – Implementation Guide

**Base URL:** `https://test-api.adityarajcapital.com` (or your env)  
**API prefix:** `/api`

---

## 1. Auth (required for all admin APIs)

**Login:** `POST /api/admin/login`

**Request:**
```json
{ "admin_id": "your_admin_id", "password": "your_password" }
```

**Success response:** `data.token` and `data.admin_id`.

**Usage:**
- Store `data.token` after login (e.g. in memory, localStorage, or secure storage).
- Send on every admin request:
  ```http
  Authorization: Bearer <token>
  ```
- On **401**, redirect to login and get a new token.

---

## 2. API list (quick reference)

### Investors (users)

| Purpose | Method | Endpoint | Response list/data path |
|--------|--------|----------|--------------------------|
| List all investors | GET | `/api/users/investors` | `data.investors`, `data.count` |
| One investor's KYC docs (URLs) | GET | `/api/admin/investors/:investorId/kyc-documents` | `data.documents`, `data.investor_id` |
| One investor's purchases | GET | `/api/admin/investors/:investorId/purchases` | `data.purchases`, `data.investor`, `data.total` |

### Investments (purchases)

| Purpose | Method | Endpoint | Response list/data path |
|--------|--------|----------|--------------------------|
| Dashboard stats | GET | `/api/admin/purchases/stats` | `data` (total, initialized, payment_verification, payment_verified, payment_failed) |
| List all purchases | GET | `/api/admin/purchases` | `data.purchases`, `data.total` |
| Pending verifications only | GET | `/api/admin/purchases/pending-verification` | `data.purchases`, `data.total` |
| Single purchase (detail) | GET | `/api/admin/purchases/:purchaseId` | `data` (full purchase + `plan` + `investor`) |
| Payment proof URL | GET | `/api/admin/purchases/:purchaseId/payment-proof-url` | `data.url`, `data.expires_in_seconds` |
| Approve payment | POST | `/api/admin/purchases/:purchaseId/verify-payment` | `data.purchase_id`, `data.status`, `data.payment_verified_at` |
| Reject payment | POST | `/api/admin/purchases/:purchaseId/reject-payment` | Body: `{ "reason": "optional" }` |

All responses use: `{ "success": true, "message": "...", "data": { ... } }`.  
With **Axios**, the payload is in `response.data`, so the list/object above is under `response.data.data.*`.

---

## 3. Where to read data (frontend)

- **Axios:** `response.data` = full body → list/object is in `response.data.data`.
  - Investors list: `response.data.data.investors`
  - Count: `response.data.data.count`
  - Purchases list: `response.data.data.purchases`
  - Stats: `response.data.data` (total, initialized, payment_verification, payment_verified, payment_failed)
  - Single purchase: `response.data.data` (with `investor`, `plan`)
  - Payment proof URL: `response.data.data.url`
- **fetch:** After `res.json()` → same structure: `json.data.investors`, `json.data.purchases`, etc.

Use these paths in state (e.g. `setInvestors(response.data.data.investors)`) and in the UI so "data is coming but not showing" is avoided.

---

## 4. Screen-by-screen implementation

### 4.1 Investors list

- **API:** `GET /api/users/investors`  
  Headers: `Authorization: Bearer <token>`
- **Use:** Populate "Investors" / "Users – Investors" table.
- **State:** e.g. `investors = response.data.data.investors`, `total = response.data.data.count`.
- **Display:** e.g. `id`, `client_id`, `name`, `email`, `mobile`, `status`, `kyc_complete`, `has_nominees`, `partner` (partner_name, partner_referral_code), `created_at`.
- **Actions:**  
  - Row click / "View" → go to investor detail (e.g. `/admin/investors/:id`).  
  - "KYC docs" → call KYC docs API and show/open URLs.  
  - "Investments" → go to that investor's purchases (use same investor ID in next screen).

---

### 4.2 Investor detail (optional)

- **APIs:**
  - Same list API gives per-investor fields; or
  - "Investments": `GET /api/admin/investors/:investorId/purchases`  
  - "KYC": `GET /api/admin/investors/:investorId/kyc-documents`
- **Investor info:** From investors list row (or you can add a dedicated "get one investor" API later).
- **KYC:** Use `data.documents` (array of `{ document_type, url }`). Open `url` in new tab or iframe.
- **Investments:** Use `data.purchases`, `data.investor`, `data.total`. Optional: `?status=payment_verification` to show only pending.

---

### 4.3 Investments / purchases (main)

- **Tabs or filters:** "All", "Pending verification", "Verified", "Failed" (and optional "Initialized").
- **APIs:**
  - **All (with optional filters):**  
    `GET /api/admin/purchases?status=payment_verification` (or `payment_verified`, `payment_failed`, `initialized`).  
    Optional: `&investor_id=5` to filter by investor.
  - **Pending only:**  
    `GET /api/admin/purchases/pending-verification`  
    Use this for "Pending verification" tab or primary queue.
- **State:** `purchases = response.data.data.purchases`, `total = response.data.data.total`.
- **Display:** e.g. `id`, `investor_id`, `plan_name`, `amount`, `status`, `payment_proof_uploaded_at`, `initialized_at`.
- **Actions:**  
  - "View" → open purchase detail (next).  
  - "View proof" → get payment proof URL (next) and open in new tab.  
  - "Approve" / "Reject" → call verify or reject (below).

---

### 4.4 Purchase detail (single purchase)

- **API:** `GET /api/admin/purchases/:purchaseId`  
  Headers: `Authorization: Bearer <token>`
- **Use:** When admin clicks one purchase (e.g. from list or from investor's investments).
- **State:** e.g. `purchase = response.data.data` (includes `plan`, `investor`).
- **Display:**
  - Purchase: id, amount, status, timestamps, rejection_reason.
  - `data.investor`: client_id, name, email, mobile.
  - `data.plan`: name, slug, investment_details.
- **Actions:**  
  - "View payment proof" → call payment-proof URL API and open `data.url`.  
  - If `status === 'payment_verification'`: show "Approve" and "Reject" buttons.

---

### 4.5 Payment proof (view / download)

- **API:** `GET /api/admin/purchases/:purchaseId/payment-proof-url`  
  Headers: `Authorization: Bearer <token>`
- **Use:** When admin clicks "View proof" / "View payment proof" from list or detail.
- **Response:** `data.url` (signed URL, 1-hour expiry), `data.expires_in_seconds`.
- **Implementation:**  
  - `window.open(response.data.data.url)` or set `iframe.src` / `<a href={url}>` to open or download.  
  - **Do not use `payment_proof_file_path` directly in the browser; it's not a URL.**

---

### 4.6 Approve payment

- **API:** `POST /api/admin/purchases/:purchaseId/verify-payment`  
  Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`  
  Body: `{}` or omit.
- **When:** Admin confirms approval (e.g. after viewing proof).
- **Success:** e.g. 200, `data.status === 'payment_verified'`.  
  Then: remove that row from pending list or refetch list/detail.
- **Error:** 400 = purchase not found or not in `payment_verification` (e.g. already approved/rejected). Show message; optionally refetch.

---

### 4.7 Reject payment

- **API:** `POST /api/admin/purchases/:purchaseId/reject-payment`  
  Headers: `Authorization: Bearer <token>`, `Content-Type: application/json`  
  Body: `{ "reason": "Optional reason shown to investor" }`
- **When:** Admin clicks "Reject"; optionally show a small form/modal for `reason`.
- **Success:** 200, `data.status === 'payment_failed'`.  
  Then: remove from pending list or refetch.
- **Error:** Same as approve (400 if invalid state). Show message; optionally refetch.

---

## 5. Dashboard (investments summary)

- **API:** `GET /api/admin/purchases/stats`  
  Headers: `Authorization: Bearer <token>`
- **Response:** `data.total`, `data.initialized`, `data.payment_verification`, `data.payment_verified`, `data.payment_failed`.
- **Use:** Cards or summary: "Total investments", "Pending verification (X)", "Verified (X)", "Failed (X)".  
  "Pending verification" count = number to show in badge or sidebar for "Investments to verify".

---

## 6. Error handling

- **401 Unauthorized:** Token missing or expired → redirect to login, store new token.
- **403 Forbidden:** Not admin → show "Access denied", redirect or logout.
- **404:** Purchase/Investor not found → show "Not found", go back or refresh list.
- **400:** e.g. invalid ID, or purchase not in `payment_verification` for verify/reject → show `message` or `developer_message` from response.
- **500:** Show generic "Something went wrong"; optionally log `developer_message` if present.

All error responses follow: `{ "success": false, "message": "...", "developer_message": "...", "error_code": "..." }`. Use `message` for user-facing text.

---

## 7. Suggested flow (order of implementation)

1. **Login** → save token; use it in all admin requests.
2. **Investors list** → `GET /api/users/investors` → render `data.investors` and `data.count`.
3. **Investments dashboard** → `GET /api/admin/purchases/stats` → show counts.
4. **Pending verifications** → `GET /api/admin/purchases/pending-verification` → table with "View proof", "Approve", "Reject".
5. **Payment proof** → `GET /api/admin/purchases/:purchaseId/payment-proof-url` → open `data.url`.
6. **Approve** → `POST .../verify-payment`; **Reject** → `POST .../reject-payment` (with optional `reason`); then refresh list.
7. **All investments** → `GET /api/admin/purchases` (optional `?status=`, `?investor_id=`) for "All investments" / filters.
8. **Single purchase detail** → `GET /api/admin/purchases/:purchaseId` for detail page/modal.
9. **Investor KYC** → `GET /api/admin/investors/:investorId/kyc-documents` → show `data.documents[].url`.
10. **Investor's investments** → `GET /api/admin/investors/:investorId/purchases` (optional `?status=`) on investor detail.

---

## 8. Checklist

- [ ] Base URL and `/api` prefix correct (e.g. `https://test-api.adityarajcapital.com/api`).
- [ ] Admin token sent as `Authorization: Bearer <token>` on every request.
- [ ] Investors list uses `response.data.data.investors` (Axios) or `json.data.investors` (fetch).
- [ ] Purchases lists use `response.data.data.purchases` and `response.data.data.total`.
- [ ] Payment proof opened via URL from `GET .../payment-proof-url` (`data.url`), not from `payment_proof_file_path`.
- [ ] Approve/reject only when `status === 'payment_verification'`; after success, refresh list or remove row.
- [ ] 401 → re-login and retry or redirect to login.

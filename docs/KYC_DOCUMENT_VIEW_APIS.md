# KYC Document View APIs

Reference for APIs that return **KYC documents with signed URLs** for viewing or downloading. Supports both **Partner** and **Investor** KYC: users can fetch their own documents; admins can fetch any partner’s or investor’s documents.

**Super Admin usage:** KYC verification (e.g. Aadhaar/PAN matching) is done on your side. The backend does **not** provide “Verify KYC” or “Reject KYC” actions. In the Super Admin panel, show the **list** of users (e.g. from pending-kyc or partner/investor lists), allow **viewing** KYC documents via the admin endpoints below, and display **status** only. See [DASHBOARD_FRONTEND_GUIDE.md](./DASHBOARD_FRONTEND_GUIDE.md#6-super-admin-kyc-list--view-only) for the full Super Admin KYC flow.

---

## Table of Contents

1. [Overview](#overview)
2. [Partner – Own KYC Documents](#partner--own-kyc-documents)
3. [Admin – Partner KYC Documents](#admin--partner-kyc-documents)
4. [Investor – Own KYC Documents](#investor--own-kyc-documents)
5. [Admin – Investor KYC Documents](#admin--investor-kyc-documents)
6. [Document Types & Response Shape](#document-types--response-shape)
7. [Errors](#errors)
8. [Postman / Integration](#postman--integration)

---

## Overview

| Role    | Endpoint | Description |
|---------|----------|-------------|
| Partner | `GET /api/partner/signup/kyc/documents` | Partner’s own KYC docs (signed URLs) |
| Admin   | `GET /api/admin/partners/:partnerId/kyc-documents` | Any partner’s KYC docs |
| Investor| `GET /api/investor/kyc/documents` | Investor’s own KYC docs (signed URLs) |
| Admin   | `GET /api/admin/investors/:investorId/kyc-documents` | Any investor’s KYC docs |

- **Signed URLs** are valid for **1 hour** (3600 seconds). Use the URL to GET the file (e.g. in browser or `<img>`).
- Only **uploaded** documents are returned; document types with no file yield no entry in `documents`.
- **Document types:** `aadhar_front`, `aadhar_back`, `pan_card`, `cancelled_cheque` (same for Partner and Investor).

---

## Partner – Own KYC Documents

**Endpoint:** `GET /api/partner/signup/kyc/documents`

**Auth:** Partner JWT — `Authorization: Bearer <partner_token>`.

**Description:** Returns all KYC documents for the authenticated partner with signed URLs.

**Success (200):**

```json
{
  "success": true,
  "message": "KYC documents retrieved",
  "data": {
    "documents": [
      { "document_type": "aadhar_front", "url": "https://...?X-Amz-..." },
      { "document_type": "aadhar_back", "url": "https://...?X-Amz-..." },
      { "document_type": "pan_card", "url": "https://...?X-Amz-..." },
      { "document_type": "cancelled_cheque", "url": "https://...?X-Amz-..." }
    ]
  }
}
```

If the partner has no KYC record, `documents` is an empty array `[]`.

---

## Admin – Partner KYC Documents

**Endpoint:** `GET /api/admin/partners/:partnerId/kyc-documents`

**Auth:** Admin JWT — `Authorization: Bearer <admin_token>`.

**URL params:**

| Param       | Type   | Description   |
|------------|--------|---------------|
| `partnerId`| number | Partner ID    |

**Description:** Returns all KYC documents for the given partner with signed URLs.

**Success (200):**

```json
{
  "success": true,
  "message": "Partner KYC documents retrieved",
  "data": {
    "partner_id": 1,
    "documents": [
      { "document_type": "aadhar_front", "url": "https://...?X-Amz-..." },
      { "document_type": "aadhar_back", "url": "https://...?X-Amz-..." },
      { "document_type": "pan_card", "url": "https://...?X-Amz-..." },
      { "document_type": "cancelled_cheque", "url": "https://...?X-Amz-..." }
    ]
  }
}
```

If the partner exists but has no KYC record, `documents` is `[]`.

**Error (404):** `"Partner not found"` when `partnerId` does not exist.

---

## Investor – Own KYC Documents

**Endpoint:** `GET /api/investor/kyc/documents`

**Auth:** Investor JWT — `Authorization: Bearer <investor_token>`.

**Description:** Returns all KYC documents for the authenticated investor with signed URLs.

**Success (200):**

```json
{
  "success": true,
  "message": "KYC documents retrieved",
  "data": {
    "documents": [
      { "document_type": "aadhar_front", "url": "https://...?X-Amz-..." },
      { "document_type": "aadhar_back", "url": "https://...?X-Amz-..." },
      { "document_type": "pan_card", "url": "https://...?X-Amz-..." },
      { "document_type": "cancelled_cheque", "url": "https://...?X-Amz-..." }
    ]
  }
}
```

If the investor has no KYC record, `documents` is an empty array `[]`.

---

## Admin – Investor KYC Documents

**Endpoint:** `GET /api/admin/investors/:investorId/kyc-documents`

**Auth:** Admin JWT — `Authorization: Bearer <admin_token>`.

**URL params:**

| Param        | Type   | Description   |
|-------------|--------|---------------|
| `investorId`| number | Investor ID   |

**Description:** Returns all KYC documents for the given investor with signed URLs.

**Success (200):**

```json
{
  "success": true,
  "message": "Investor KYC documents retrieved",
  "data": {
    "investor_id": 42,
    "documents": [
      { "document_type": "aadhar_front", "url": "https://...?X-Amz-..." },
      { "document_type": "aadhar_back", "url": "https://...?X-Amz-..." },
      { "document_type": "pan_card", "url": "https://...?X-Amz-..." },
      { "document_type": "cancelled_cheque", "url": "https://...?X-Amz-..." }
    ]
  }
}
```

If the investor exists but has no KYC record, `documents` is `[]`.

**Error (404):** `"Investor not found"` when `investorId` does not exist.

---

## Document Types & Response Shape

Each item in `data.documents` has:

| Field           | Type   | Description |
|----------------|--------|-------------|
| `document_type`| string | One of: `aadhar_front`, `aadhar_back`, `pan_card`, `cancelled_cheque` |
| `url`          | string | Signed URL to GET the file (expires in 1 hour) |

- Only document types that have been **uploaded** appear in the list.
- URLs are suitable for direct GET (e.g. open in new tab, or use in `<img src="...">` for images). No request body required.

---

## Errors

| Scenario              | Status | Message / Notes |
|-----------------------|--------|------------------|
| Missing/invalid token | 401    | Authentication token required / Invalid or expired token |
| Partner (own) – wrong role | 401 | Invalid token for partner route |
| Investor (own) – wrong role | 403 | Insufficient permissions (must be investor) |
| Admin – wrong role    | 403    | Insufficient permissions (must be admin) |
| Admin – partner not found | 404 | Partner not found |
| Admin – investor not found | 404 | Investor not found |
| Server/storage error  | 500    | Failed to get KYC documents / Failed to get partner(investor) KYC documents |

---

## Postman / Integration

1. **Partner own docs:**  
   - Method: GET  
   - URL: `{{baseUrl}}/api/partner/signup/kyc/documents`  
   - Header: `Authorization: Bearer {{partnerToken}}`

2. **Admin – partner docs:**  
   - Method: GET  
   - URL: `{{baseUrl}}/api/admin/partners/1/kyc-documents`  
   - Header: `Authorization: Bearer {{adminToken}}`

3. **Investor own docs:**  
   - Method: GET  
   - URL: `{{baseUrl}}/api/investor/kyc/documents`  
   - Header: `Authorization: Bearer {{investorToken}}`

4. **Admin – investor docs:**  
   - Method: GET  
   - URL: `{{baseUrl}}/api/admin/investors/42/kyc-documents`  
   - Header: `Authorization: Bearer {{adminToken}}`

**Frontend:** After receiving `data.documents`, use each `url` as-is for display or download; re-call the API when URLs are close to expiry (e.g. before 1 hour) if the user keeps the screen open.

**Related docs:**  
- Partner KYC (uploads, OCR, confirm): [PARTNER_KYC_APIS.md](./PARTNER_KYC_APIS.md)  
- Investor KYC (uploads, OCR, confirm): [INVESTOR_KYC_APIS.md](./INVESTOR_KYC_APIS.md)

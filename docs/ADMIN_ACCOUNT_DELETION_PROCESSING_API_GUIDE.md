# Admin API Guide — Account Deletion Processing (Investor + Partner)

This doc is for **Super Admin / Ops / Admin Dashboard** integration to **process** account deletion requests.

Investor/Partner apps should use `docs/FRONTEND_ACCOUNT_DELETION_API_GUIDE.md` instead.

## Base rules

- **Auth**: `Authorization: Bearer <ADMIN_JWT>`
- **Role**: token payload must have `role: 'admin'`

## Endpoints

### 0) List deletion requests (Investor/Partner) — Admin only

Use these to build the admin “Deletion Requests” table UI.

#### List Investor deletion requests

- **Method**: `GET`
- **Path**: `/api/admin/deletion-requests/investors?status=requested&limit=50&offset=0`
- **Query params**:
  - `status`: `requested | blocked | processed` (default `requested`)
  - `limit`: number (default from backend, max bounded)
  - `offset`: number (default `0`)

curl:

```bash
curl -X GET "$BASE_URL/api/admin/deletion-requests/investors?status=requested&limit=50&offset=0" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### List Partner deletion requests

- **Method**: `GET`
- **Path**: `/api/admin/deletion-requests/partners?status=requested&limit=50&offset=0`

Note: Use `status=processed` to view already processed deletions (these rows may have `deleted_at` set).

curl:

```bash
curl -X GET "$BASE_URL/api/admin/deletion-requests/partners?status=requested&limit=50&offset=0" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### 1) Process deletion (Investor) — Admin only

- **Method**: `POST`
- **Path**: `/api/admin/investors/:investorId/process-deletion`

#### curl

```bash
curl -X POST "$BASE_URL/api/admin/investors/123/process-deletion" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 200 OK — processed

```json
{
  "success": true,
  "message": "Investor deletion processed",
  "data": { "investor_id": 123 }
}
```

#### 409 Conflict — blocked by obligations

```json
{
  "success": false,
  "message": "Deletion is blocked due to active obligations.",
  "developer_message": "blocked_by_obligations",
  "error_code": "DEL_001",
  "blocked_reasons": ["active_investments"]
}
```

### 2) Process deletion (Partner) — Admin only

- **Method**: `POST`
- **Path**: `/api/admin/partners/:partnerId/process-deletion`

#### curl

```bash
curl -X POST "$BASE_URL/api/admin/partners/45/process-deletion" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

#### 200 OK — processed

```json
{
  "success": true,
  "message": "Partner deletion processed",
  "data": { "partner_id": 45 }
}
```

#### 409 Conflict — blocked by obligations

```json
{
  "success": false,
  "message": "Deletion is blocked due to active obligations.",
  "developer_message": "blocked_by_obligations",
  "error_code": "DEL_001",
  "blocked_reasons": ["pending_commissions"]
}
```

## What “processed” means (backend behavior)

When processed:
- Backend re-checks obligations.
- Backend wipes/anonymizes **PII** on `investors` / `partners` (name/email/mobile/password/mpin/tokens/profile/signature etc.).
- Backend sets:
  - `deletion_status = 'processed'`
  - `deletion_processed_at = NOW()`
  - `deleted_at = NOW()`
  - `status = 'inactive'`
- Financial records and retained documents remain (per policy), but deleted users cannot access anything because auth checks `deleted_at` / `status`.


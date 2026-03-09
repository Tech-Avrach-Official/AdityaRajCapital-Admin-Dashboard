# Super Admin – Investor & Investment: APIs (Existing vs To Build) & Frontend Responsibilities

**→ For the full API reference and page-by-page frontend guide (all request/response shapes), see [INVESTOR_MODULE_FRONTEND_GUIDE.md](./INVESTOR_MODULE_FRONTEND_GUIDE.md).** All “to build” APIs below are now implemented.

This document covers the **three pages**: Investor list, Investor detail, Investment detail. For each it states what APIs already exist, what the backend should add, and what the frontend must do.

---

## Page 1: Investor list

### APIs we already have

| API | Purpose |
|-----|--------|
| `GET /api/admin/investors` | List all investors. Response: `data.investors[]` with id, client_id, name, email, mobile, status, partner_id, rm_id, referral_code, kyc_complete, has_nominees, created_at, updated_at, plus `partner` (partner_id, partner_name, partner_referral_code) and `purchase_summary` (total_verified_count, total_invested_amount, last_verified_at). |
| Query: `?branch_id=<id>` | Filter investors by branch. |
| `GET /api/admin/branches` | List branches for the branch filter dropdown. |

### APIs to build

- **None** for the list page. Optional later: search by name/client_id on the backend (e.g. `?search=`) if you don’t want client-side filtering only.

### What the frontend has to do

- Call `GET /api/admin/investors` on load (optionally with `?branch_id=` when user selects a branch).
- Call `GET /api/admin/branches` to populate the branch filter.
- Build the table: map response fields to columns (Client ID, Name, Email, Mobile, Referral, KYC, Total invested, Verified count, Last verified, Created). Omit Nominees column.
- Implement **client-side** search (by client_id or name) and optional KYC filter (All / Pending / Complete) by filtering `data.investors`.
- Implement **client-side** sort if needed (by name, date, amount, etc.).
- Implement **client-side** export (e.g. CSV of current table data).
- On “View” or row click: navigate to Investor detail with `investorId` (e.g. `/admin/investors/:investorId`).

---

## Page 2: Investor detail (mini dashboard)

### APIs we already have

| API | Purpose |
|-----|--------|
| `GET /api/admin/investors` | List includes all investors; frontend can find the one with `id === investorId` for header/profile when coming from list. If user lands directly on investor URL, see “To build” below. |
| `GET /api/admin/investors/:investorId/purchases` | List purchases for this investor. Response: `investor` (id, client_id, name, email, mobile), `purchases[]` (id, investment_display_id, plan_name, amount, status, dates, etc.), `total`. Optional `?status=` to filter. |
| `GET /api/admin/investors/:investorId/kyc-data` | Full KYC extracted data + document URLs for this investor. |
| `GET /api/admin/investors/:investorId/kyc-documents` | KYC document list with signed URLs (aadhar_front, aadhar_back, pan_card, cancelled_cheque). |
| `GET /api/admin/investors/:investorId/bank-accounts` | All bank accounts (active and inactive) for this investor. |
| `GET /api/admin/investors/:investorId/nominees` | All nominees for this investor. |

### APIs to build

- **Optional but useful:** `GET /api/admin/investors/:investorId`  
  - Returns single investor profile (same fields as one list item: identity, partner, purchase_summary, kyc_complete, has_nominees, etc.) so the detail page can load when opened by URL without fetching the full list.
- **Enhance:** `GET /api/admin/investors/:investorId/purchases`  
  - Add per purchase: `has_deed` (boolean) or `signed_deed_path` (or expose a signed deed URL) so the frontend can show “View deed” only for rows that have a deed. Today the list does not include this; frontend would have to call purchase detail per row (not ideal).

### What the frontend has to do

- **When arriving from list:** Use the clicked investor from the list for header/profile (name, client_id, email, mobile, referral, kyc_complete, has_nominees, created_at).
- **When arriving by URL (direct):** Either call `GET /api/admin/investors` and find `investorId` in the list, or (once available) call `GET /api/admin/investors/:investorId` for profile.
- Call in parallel (or as needed):
  - `GET /api/admin/investors/:investorId/kyc-data` → KYC card (status + extracted data).
  - `GET /api/admin/investors/:investorId/kyc-documents` → “View documents” links.
  - `GET /api/admin/investors/:investorId/bank-accounts` → Bank accounts card.
  - `GET /api/admin/investors/:investorId/nominees` → Nominees card.
  - `GET /api/admin/investors/:investorId/purchases` → Investments table.
- Render each section; show “View deed” per purchase row only when that purchase has a deed (use `has_deed` or equivalent from API when added; until then, e.g. show “View deed” for status `active` and call deed URL when clicked, or hide until backend adds the flag).
- “View” on a purchase row → navigate to Investment detail (e.g. `/admin/investors/:investorId/investments/:purchaseId` or `/admin/purchases/:purchaseId`).

---

## Page 3: Investment detail

### APIs we already have

| API | Purpose |
|-----|--------|
| `GET /api/admin/purchases/:purchaseId` | Single purchase with investor and plan. **Currently returns:** id, investment_display_id, investor_id, plan_id, amount, status, payment_proof paths, dates, rejection_reason, verified_by_admin_id, partner_id, plan (id, name, slug, investment_details), investor (id, client_id, name, email, mobile). **Does not currently return:** plan_snapshot, investor_bank_account_id, cheque_number, signed_deed_path / deed URL, leegality_signing_status. |
| `GET /api/admin/purchases/:purchaseId/payment-proof-url` | Signed URL(s) for payment proof (1–4 images). Use for “View payment proof”. |

### APIs to build

1. **Extend `GET /api/admin/purchases/:purchaseId`**  
   Include in the response so the investment detail page has everything in one place:
   - `plan_snapshot` (object: name, slug, returns, investment_details, partner_commission, rm_commission at time of verification).
   - `investor_bank_account_id`.
   - `cheque_number`.
   - `leegality_signing_status`, `signed_deed_path` (or a ready-to-use `signed_deed_url` so frontend doesn’t need a separate deed endpoint if you prefer).
   Optionally resolve **bank account** server-side and return e.g. `bank_account: { account_number, ifsc, bank_name, branch, is_active }` so the frontend doesn’t have to match from investor bank-accounts list.

2. **`GET /api/admin/purchases/:purchaseId/signed-deed-url`**  
   - Returns `signed_deed_url` (and optionally `expires_in_seconds`).  
   - Use when “View deed” is clicked so the frontend can open the PDF in a new tab.  
   - If you already add `signed_deed_url` inside the extended purchase detail response, you can skip this endpoint and use that URL (mind expiry and refresh if needed).

3. **`GET /api/admin/purchases/:purchaseId/installments`**  
   - Same behaviour and response shape as the investor-facing installments API: full schedule (installments array + summary: total_gross, total_tds, total_receivable, pending_count, paid_count, cancelled_count).  
   - Auth: admin only.  
   - So the Investment detail page can show the full installment table and summary without using the investor token.

### What the frontend has to do

- Call **`GET /api/admin/purchases/:purchaseId`** for summary, plan info, investor link, and (once extended) plan_snapshot, bank account or investor_bank_account_id, cheque_number, deed URL or status.
- Call **`GET /api/admin/purchases/:purchaseId/installments`** (once available) for the installments table and summary. If the API returns 404 or empty, show “No installments yet” / “Schedule generated after deed is signed”.
- Call **`GET /api/admin/investors/:investorId/nominees`** (investorId from purchase response) to show “Investor’s nominee(s)” in context of this investment.
- If purchase detail does **not** return resolved bank account: call **`GET /api/admin/investors/:investorId/bank-accounts`** and find the account where `id === purchase.investor_bank_account_id`; display that in the “Bank account for this investment” card.
- **View payment proof:** Call **`GET /api/admin/purchases/:purchaseId/payment-proof-url`** and open `data.urls[]` in new tab or modal.
- **View deed:** Use the signed deed URL from the extended purchase response or from **`GET /api/admin/purchases/:purchaseId/signed-deed-url`**; open in new tab. If no deed yet, show “Deed not signed yet” (e.g. when status is not active or no URL).
- Render: Investment summary, Plan snapshot (from plan_snapshot), Bank account for this investment, Nominee(s), Installments table + summary, Deed card, Payment proof card, optional Timeline from dates.
- Breadcrumb / back: link to Investor detail (and optionally to Investor list).

---

## Summary tables

### Already have

| Page | API | Use |
|------|-----|-----|
| List | `GET /api/admin/investors?branch_id=` | Table data, branch filter. |
| List | `GET /api/admin/branches` | Branch dropdown. |
| Investor detail | `GET /api/admin/investors/:investorId/purchases` | Investments table; investor snippet when opening by URL. |
| Investor detail | `GET /api/admin/investors/:investorId/kyc-data` | KYC card. |
| Investor detail | `GET /api/admin/investors/:investorId/kyc-documents` | View KYC docs. |
| Investor detail | `GET /api/admin/investors/:investorId/bank-accounts` | Bank accounts card. |
| Investor detail | `GET /api/admin/investors/:investorId/nominees` | Nominees card. |
| Investment detail | `GET /api/admin/purchases/:purchaseId` | Summary, investor, plan (needs extension). |
| Investment detail | `GET /api/admin/purchases/:purchaseId/payment-proof-url` | View payment proof. |

### To build (backend)

| API | Purpose |
|-----|--------|
| Extend `GET /api/admin/purchases/:purchaseId` | Add plan_snapshot, investor_bank_account_id, cheque_number, deed URL or signed_deed_path/leegality_signing_status; optionally resolved bank_account. |
| `GET /api/admin/purchases/:purchaseId/signed-deed-url` | Return signed deed URL for “View deed” (or fold into extended purchase detail). |
| `GET /api/admin/purchases/:purchaseId/installments` | Installment schedule + summary for admin (same shape as investor installments). |
| Optional: add `has_deed` (or deed URL) to `GET /api/admin/investors/:investorId/purchases` | So list can show “View deed” only where applicable. |
| Optional: `GET /api/admin/investors/:investorId` | Single investor profile for direct URL load. |

### Frontend must do (by page)

| Page | Frontend responsibilities |
|------|---------------------------|
| **List** | Call list + branches; build table; client-side search, KYC filter, sort, export; navigate to Investor detail on View/row click. |
| **Investor detail** | Get profile from list or future single-investor API; call kyc-data, kyc-documents, bank-accounts, nominees, purchases; render cards and investments table; show “View deed” per row when API supports it; navigate to Investment detail on View. |
| **Investment detail** | Call purchase detail (and use extended fields when available), installments (when available), nominees; resolve bank account if not in purchase; call payment-proof-url and deed URL; render all sections and links. |

---

## Quick reference: route vs API

- **Investor list** → `GET /api/admin/investors`, `GET /api/admin/branches`.
- **Investor detail** → `GET /api/admin/investors/:investorId/purchases`, `.../kyc-data`, `.../kyc-documents`, `.../bank-accounts`, `.../nominees`; optional `GET /api/admin/investors/:investorId`.
- **Investment detail** → `GET /api/admin/purchases/:purchaseId` (extended), `.../payment-proof-url`, `.../signed-deed-url` (or deed in detail), `.../installments` (to add); `GET /api/admin/investors/:investorId/nominees` and optionally `.../bank-accounts` for nominee and bank display.

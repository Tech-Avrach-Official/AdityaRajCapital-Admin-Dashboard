# Admin Panel – Plan Module (Frontend Guide)

This document is the **single reference** for the admin Plan module: APIs, request/response shapes, **every field** needed for Create/Edit forms, validation rules, and error handling. Use it to build the full admin plan UI.

**Rules:** (1) Ask **plan type first** (Monthly only / Maturity only / Monthly + maturity), then show only the fields for that type. (2) **Description and display strings are templates** – the frontend builds them from placeholders and the user’s inputs; show the auto-generated description in a read-only field that updates live when returns/inputs change. (3) **No duration in Investment details UI** – duration exists only in Returns; set `investment_details.duration_months` from `returns.duration_months` when building the payload. (4) **Calculated fields** – from Returns + Min investment, calculate monthly payout amounts, total received, etc.; show them in the UI (read-only) and send in the payload.

**Base URL:** All endpoints are under `/api/admin`. Admin must be logged in; send the admin auth token (e.g. `Authorization: Bearer <token>`).

---

## 1. What is the Plan module?

Plans are investment products (e.g. “ACPL 5% Monthly”, “13X Wealth”). The admin can:

- **List** all plans (active and inactive).
- **Create** a new plan.
- **Update** an existing plan (partial updates supported).
- **Delete** a plan (only if no investor has invested in it; otherwise “deactivate” instead).

**Important:** Investors see only **active** plans (`is_active = true`). Admin sees **all** plans. Use **Deactivate** (set `is_active` to `false`) to hide a plan from investors without deleting it.

---

## 2. APIs overview

| Action   | Method | Endpoint              | Auth        | Description                    |
|----------|--------|------------------------|-------------|--------------------------------|
| List     | GET    | `/api/admin/plans`    | Admin token | All plans (active + inactive)  |
| Create   | POST   | `/api/admin/plans`    | Admin token | Create a new plan             |
| Update   | PUT    | `/api/admin/plans/:id`| Admin token | Update plan (partial)         |
| Delete   | DELETE | `/api/admin/plans/:id`| Admin token | Delete plan (guarded)         |

---

## 3. Standard response format

- **Success:** `{ success: true, message: "...", data: { ... } }`  
  - `data` may be an object or contain `plans`, `total`, or a single `plan` depending on the API (see below).
- **Error:** `{ success: false, message: "...", developer_message: "...", error_code: "..." }`  
  - Use `error_code` for logic; use `message` for display. See `docs/API_ERROR_CODES.md` for full list.
- **Validation errors:** Include `errors` array with per-field messages; `error_code` is typically `VAL_001` or similar.

---

## 4. API details

### 4.1 List plans – GET `/api/admin/plans`

**Request:** No body. No query params required.

**Success (200):**

```json
{
  "success": true,
  "message": "Plans retrieved",
  "data": {
    "plans": [
      {
        "id": 1,
        "name": "ACPL MAX YIELD PLAN (5+5)",
        "slug": "acpl-max-yield-5-5",
        "display_order": 1,
        "returns": { ... },
        "investment_details": { ... },
        "partner_commission": { ... },
        "is_active": 1,
        "rm_commission": null,
        "created_at": "2025-01-01T00:00:00.000Z",
        "updated_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "total": 6
  }
}
```

- `plans`: array of plan objects (order: `display_order` ASC, then `id` ASC).
- `is_active`: `1` = active (shown to investors), `0` = inactive (hidden from investors).
- `returns`, `investment_details`, `partner_commission`, `rm_commission` are JSON objects (possibly nested).

---

### 4.2 Create plan – POST `/api/admin/plans`

**Request body (JSON):** All required fields must be sent. Optional fields can be omitted (defaults below).

| Field                | Type    | Required | Validation / notes |
|----------------------|---------|----------|---------------------|
| `name`               | string  | Yes      | Max 255 chars, trimmed. |
| `slug`               | string  | Yes      | Lowercase, numbers, hyphens only. Pattern: `^[a-z0-9]+(?:-[a-z0-9]+)*$` (e.g. `my-plan`, `acpl-5-percent`). Must be **unique** across all plans. Max 120. |
| `display_order`      | number  | No       | Integer ≥ 0. Default 0. |
| `returns`            | object  | Yes      | At least one key. **Use the full structure in §5.2** (description, profit_per_month_percent, duration_months, has_monthly_payout, has_maturity_amount, maturity_note, etc.) so the plan works in deed and payouts. |
| `investment_details` | object  | Yes      | Must include `min_investment` (number ≥ 0). **Use the full structure in §5.3** (min_investment_display, monthly payout fields, duration, total_received, maturity_amount, etc.) for correct display everywhere. |
| `partner_commission` | object  | Yes      | Must include `percent` (0–100). Optional `description` (string). |
| `rm_commission`      | object  | No       | If present: `percent` (0–100), optional `description`. Can be `null`. |
| `is_active`          | boolean | No       | Default `true`. Use `false` to create an inactive plan. |

**Slug rules:** Only `a-z`, `0-9`, and `-`. No spaces or special characters. Must be unique; duplicate slug returns **400** with message “Plan slug already exists”.

**Success (201):**

```json
{
  "success": true,
  "message": "Plan created",
  "data": {
    "id": 7,
    "name": "...",
    "slug": "...",
    "display_order": 0,
    "returns": { ... },
    "investment_details": { ... },
    "partner_commission": { ... },
    "is_active": 1,
    "rm_commission": null,
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Errors:**

- **400** – Validation failed (check `errors` array) or slug already exists (`error_code`: `DB_DUPLICATE_ENTRY`, message: “Plan slug already exists”).
- **401** – Unauthorized (invalid/expired token).
- **500** – Server error.

---

### 4.3 Update plan – PUT `/api/admin/plans/:id`

**URL:** Replace `:id` with the plan’s numeric ID (e.g. `PUT /api/admin/plans/3`).

**Request body (JSON):** **Partial update.** Send only the fields you want to change. At least one field must be sent.

| Field                | Type    | Required | Same validation as Create |
|----------------------|---------|----------|----------------------------|
| `name`               | string  | No       | Max 255.                   |
| `slug`               | string  | No       | Same pattern; unique **excluding current plan**. |
| `display_order`      | number  | No       | Integer ≥ 0.               |
| `returns`            | object  | No       | Min 1 key if sent.         |
| `investment_details` | object  | No       | Must include `min_investment` if sent. |
| `partner_commission` | object  | No       | `percent` (0–100) if sent. |
| `rm_commission`      | object  | No       | Or `null`.                 |
| `is_active`          | boolean | No       | Toggle active/inactive.    |

**Success (200):**

```json
{
  "success": true,
  "message": "Plan updated",
  "data": {
    "id": 3,
    "name": "...",
    "slug": "...",
    "display_order": 2,
    "returns": { ... },
    "investment_details": { ... },
    "partner_commission": { ... },
    "is_active": 0,
    "rm_commission": { ... },
    "created_at": "...",
    "updated_at": "..."
  }
}
```

**Errors:**

- **400** – Invalid plan ID (e.g. non-numeric), validation failed, or slug duplicate.
- **404** – Plan not found (`error_code`: `GEN_NOT_FOUND`).
- **401** – Unauthorized.
- **500** – Server error.

---

### 4.4 Delete plan – DELETE `/api/admin/plans/:id`

**URL:** Replace `:id` with the plan’s numeric ID.

**Request:** No body.

**Success (200):**

```json
{
  "success": true,
  "message": "Plan deleted",
  "data": { "id": 3 }
}
```

**Errors:**

- **400** – Invalid plan ID, or plan has at least one linked investment. Message: *“Cannot delete plan: it is linked to one or more investments. Deactivate it instead (set is_active to false).”* Use **Update** with `is_active: false` instead of Delete.
- **404** – Plan not found.
- **401** – Unauthorized.
- **500** – Server error.

---

## 5. UI flow: plan type first, then type-specific fields

**Rule:** The form must ask **first** which type of plan the admin is creating. Then show **only the fields relevant to that type**. Do not show monthly payout inputs for maturity-only plans, or maturity inputs for monthly-only plans.

### 5.0 Step 1 – Choose plan type (required first)

Show three options (radio or dropdown). Store the selection; it drives which sections appear and which values you send.

| Option | Value / internal | `has_monthly_payout` | `has_maturity_amount` | What to show next |
|--------|-------------------|----------------------|------------------------|-------------------|
| **Monthly only** | `monthly_only` | `true` | `false` | Common fields + **Returns (monthly)** + **Investment details (monthly)**. No maturity section. |
| **Maturity only** | `maturity_only` | `false` | `true` | Common fields + **Returns (maturity)** + **Investment details (maturity)**. No monthly payout section. |
| **Monthly + maturity** | `monthly_and_maturity` | `true` | `true` | Common fields + **both** monthly and maturity sections. |

### 5.0.1 Step 2 – Common fields (all plan types)

Show these for every plan:

| Field | Type | Required | Notes |
|-------|------|----------|--------|
| Name | text | Yes | Max 255. |
| Slug | text | Yes | Lowercase, hyphens only, unique. |
| Display order | number | No | Integer ≥ 0. Default 0. |
| Is active | checkbox | No | Default on. |
| Partner commission % | number | Yes | 0–100. |
| Partner commission description | text | No | Or use template: "Partner gets {{percent}}% of investment amount when a referred investor buys this plan." |
| RM commission | optional block | No | "Has RM commission?"; if yes: % and optional description. Send `null` if no. |

### 5.0.2 Step 3 – Type-specific fields (show only for selected type)

**Monthly only**

- **Returns:** Duration (months). Profit per month %, Capital per month %. (No maturity note input – use fixed text or leave empty.)
- **Investment details:** **Only Min investment (number)** as user input. Do **not** show duration in Investment details (use duration from Returns; copy into payload). Monthly payout profit, capital, total, total received – **calculated** from Returns + min_investment (§5C); show in read-only fields. Min investment display, monthly payout display, duration display, total received display – from template/format. Set `maturity_amount` = `null`, `maturity_amount_display` = `null` in payload.

**Maturity only**

- **Returns:** **Duration (months)** and **Maturity return %** (e.g. 100 = capital back, 200 = double, 210 = double + 10% bonus). Maturity note from template using `maturity_return_percent`. Do **not** ask for maturity amount as input.
- **Investment details:** **Only Min investment** as user input. **Maturity amount** is **calculated**: `min_investment × (maturity_return_percent / 100)` (§5C); show in read-only field. No duration in Investment details (copy from Returns). Total received = maturity_amount (calculated). Set monthly payout fields to 0 and `monthly_payout_display` = `"No monthly payouts"` in payload.

**Monthly + maturity**

- **Returns:** **Duration (months)**. Profit per month %, Capital per month % (can be 0). **Maturity return %** (e.g. 100 = capital back at maturity). Maturity note from template.
- **Investment details:** **Only Min investment** as user input. **Maturity amount** is **calculated**: `min_investment × (maturity_return_percent / 100)` (§5C); show read-only. Monthly payout profit/capital/total, total received, total profit – **calculated** (§5C); show in read-only fields. All display strings from template/format.

---

## 5A. Description and display strings as template (frontend-generated)

**Rule:** Do **not** provide a free-text input for `returns.description` (or for other display strings that can be derived). The frontend should build these from **templates** and the values the user entered (percent, duration, amounts, etc.). Same idea for `maturity_note`, `monthly_payout_display`, `min_investment_display`, `duration_display`, `total_received_display`, `maturity_amount_display`: use templates and substitute values.

### 5A.1 `returns.description` – template by plan type

Use one template per plan type. Replace placeholders with actual form values before sending to the API.

| Plan type | Template (placeholders in double braces) | Example output |
|-----------|----------------------------------------|----------------|
| **Monthly only** | `{{profit_per_month_percent}}% profit + {{capital_per_month_percent}}% capital every month for {{duration_months}} months. No maturity amount (capital is already returned in monthly payouts).` | "5% profit + 5% capital every month for 20 months. No maturity amount (capital is already returned in monthly payouts)." |
| **Monthly only** (alt, if no capital) | `{{profit_per_month_percent}}% profit every month for {{duration_months}} months. No maturity amount.` | "5% profit every month for 20 months. No maturity amount." |
| **Maturity only** | `{{maturity_return_percent}}% return on investment at maturity after {{duration_months}} months. Maturity only (no monthly payouts).` | "200% return on investment at maturity after 13 months. Maturity only (no monthly payouts)." |
| **Maturity only** (alt) | `{{maturity_note}}. Duration {{duration_months}} months. No monthly payouts.` | "100% capital returned at maturity. Duration 20 months. No monthly payouts." |
| **Monthly + maturity** | `{{profit_per_month_percent}}% profit every month for {{duration_months}} months. {{maturity_note}}.` | "5% profit every month for 20 months. 100% capital returned at maturity (after 20 months)." |

**UI requirement:** Show the generated description in a **read-only** field (or preview box) on the form. **Update it live** when the user changes duration, percent, or other inputs used in the template. The user must see the description that will be sent but cannot edit it directly. On submit, replace placeholders with current form values and send as `returns.description`.

### 5A.2 `returns.maturity_note` – template

Use `maturity_return_percent` from the form (e.g. 100 = capital back, 200 = double). Examples:

- `"No maturity amount - capital is already returned in monthly payouts."` (monthly only)
- `"{{maturity_return_percent}}% return at maturity (after {{duration_months}} months)."` → e.g. "100% capital returned at maturity (after 20 months)." or "200% (double) at maturity."
- `"Capital doubles at maturity."` (when maturity_return_percent = 200)
- `"Doubled amount + {{bonus_percent}}% bonus on capital."` (when applicable)

Build from template + form values; send as `returns.maturity_note`.

### 5A.3 `investment_details` display strings – template or format

| Key | Rule | Example |
|-----|------|--------|
| `min_investment_display` | Format number as currency (e.g. Indian format). | `100000` → `"₹1,00,000"` |
| `monthly_payout_display` | If monthly: e.g. `"₹X per month (Y% profit)"` or `"₹X per month (₹A profit + ₹B capital)"`. If no monthly: `"No monthly payouts"`. | Use `monthly_payout_profit`, `monthly_payout_capital`, `monthly_payout_total`, `profit_per_month_percent` from form. |
| `duration_display` | `"{{duration_months}} months"` | `"20 months"` |
| `total_received_display` | Format `total_received` as currency. | `200000` → `"₹2,00,000"` |
| `maturity_amount_display` | If no maturity: `null`. Else format amount + optional text, e.g. `"₹X (capital)"` or `"₹X (doubled) + ₹Y (bonus)"`. | Build from `maturity_amount` and any bonus fields. |

Frontend: compute these from numbers and templates; do not ask the user to type them (except maybe a short suffix like "(capital)" if needed).

### 5A.4 Partner / RM commission description – template

- Partner: `"Partner gets {{percent}}% of investment amount when a referred investor buys this plan."`
- RM: `"RM commission {{percent}}%"` or similar.

Replace `{{percent}}` with the commission % from the form.

---

## 5C. Calculated fields (from Returns + Min investment)

**Rule:** Once the user fills **Returns** (duration_months, profit_per_month_percent, capital_per_month_percent, and for maturity types **maturity_return_percent**) and **Min investment**, the frontend must **calculate** the following and **show them in the UI** in read-only (or disabled) fields. Do not ask the user to type maturity amount; derive it from maturity return %.

**Formulas:**

| Field | Formula | When |
|-------|---------|------|
| `monthly_payout_profit` | `min_investment × (profit_per_month_percent / 100)` | Monthly only, Monthly + maturity |
| `monthly_payout_capital` | `min_investment × (capital_per_month_percent / 100)` | Monthly only, Monthly + maturity |
| `monthly_payout_total` | `monthly_payout_profit + monthly_payout_capital` | Monthly only, Monthly + maturity |
| `maturity_amount` | `min_investment × (maturity_return_percent / 100)` | Maturity only, Monthly + maturity |
| `total_received` (monthly only) | `monthly_payout_total × duration_months` | Monthly only |
| `total_received` (maturity only) | `maturity_amount` (= min_investment × maturity_return_percent / 100) | Maturity only |
| `total_received` (monthly + maturity) | `(monthly_payout_total × duration_months) + maturity_amount` | Monthly + maturity |
| `total_profit` (monthly + maturity) | `(monthly_payout_profit × duration_months) + (maturity_amount − min_investment)` when capital returned at maturity | Monthly + maturity |

**Duration in investment_details:** Do **not** show a duration input in Investment details. Set `investment_details.duration_months` = `returns.duration_months` and `investment_details.duration_display` = `"{{duration_months}} months"` when building the payload.

**UI:** Render each calculated value in the corresponding field (e.g. "Monthly payout profit", "Total received") as read-only so the user sees the result of the return formula for the given min investment.

---

## 5B. Full field reference for Create/Edit forms

Use this section to build **all** admin inputs. The app has three plan types; the same fields apply, with some set to `0` or `null` depending on type:

| Plan type | `has_monthly_payout` | `has_maturity_amount` | Monthly payout fields | Maturity fields |
|-----------|----------------------|------------------------|------------------------|-----------------|
| **Monthly only** | `true` | `false` | Fill amounts | `maturity_amount` / `maturity_amount_display` = `null` |
| **Maturity only** | `false` | `true` | Use `0` or "No monthly payouts" | Fill amounts |
| **Monthly + maturity** | `true` | `true` | Fill amounts | Fill amounts |

---

### 5.1 Top-level fields

| Field | Type | Create | Update | Validation | Purpose |
|-------|------|--------|--------|------------|---------|
| `name` | string | **Required** | Optional | Max 255, trimmed | Display name of the plan (e.g. "ACPL 5% Monthly") |
| `slug` | string | **Required** | Optional | Lowercase, `a-z0-9` and `-` only; max 120; **unique** | URL-friendly ID; e.g. `acpl-5-monthly` |
| `display_order` | number | Optional | Optional | Integer ≥ 0; default 0 | Order in list (lower = first) |
| `is_active` | boolean | Optional | Optional | Default `true` | `false` = hidden from investors (admin only) |
| `created_at` / `updated_at` | string | – | – | Read-only | ISO 8601 from API |

---

### 5.2 `returns` object (plan return terms)

**API rule:** Required on create; at least one key. On update, if sent must have at least one key.

**Description and maturity_note:** Build from **templates** (see §5A). Do **not** use a free-text textarea for `description` or `maturity_note`; substitute placeholders from form values.

**Recommended keys** (used across the app for display, deed, and payout logic):

| Key | Type | Required by API | Source in form |
|-----|------|-----------------|----------------|
| `description` | string | No (but recommended) | **Template** – build from §5A.1 using plan type + form values. |
| `profit_per_month_percent` | number | No | Input (number). 0 for maturity-only. |
| `capital_per_month_percent` | number | No | Input (number). 0 if no monthly capital. |
| `duration_months` | number | No | Input (number). Same for all types. |
| `has_monthly_payout` | boolean | No | From **plan type**: monthly_only or monthly_and_maturity → `true`; maturity_only → `false`. |
| `has_maturity_amount` | boolean | No | From **plan type**: maturity_only or monthly_and_maturity → `true`; monthly_only → `false`. |
| `maturity_return_percent` | number | No | **Input** for maturity-only and monthly+maturity. Return at maturity as % of investment (e.g. 100 = capital back, 200 = double). Used to calculate `maturity_amount` = min_investment × (maturity_return_percent / 100). |
| `maturity_note` | string | No | **Template** – build from §5A.2 using `maturity_return_percent`; or fixed string per type. |

---

### 5.3 `investment_details` object (amounts and display strings)

**API rule:** Required on create; must include `min_investment` (number ≥ 0). On update, if sent must include `min_investment`.

**Display strings** (`min_investment_display`, `monthly_payout_display`, `duration_display`, `total_received_display`, `maturity_amount_display`): Build from **templates or format** (see §5A.3). Do not use free-text inputs for these; derive from numbers and template.

| Key | Type | Required by API | Source in form |
|-----|------|-----------------|----------------|
| `min_investment` | number | **Yes** | Input (number). |
| `min_investment_display` | string | No | **Template/format** – e.g. format as "₹1,00,000" from `min_investment`. |
| `monthly_payout_profit` | number | No | **Calculated** – min_investment × (profit_per_month_percent / 100); show read-only (§5C). |
| `monthly_payout_capital` | number | No | **Calculated** – min_investment × (capital_per_month_percent / 100); show read-only (§5C). |
| `monthly_payout_total` | number | No | **Calculated** – monthly_payout_profit + monthly_payout_capital; show read-only (§5C). |
| `monthly_payout_display` | string | No | **Template** – e.g. "₹X per month (Y% profit)" or "No monthly payouts" (§5A.3). |
| `duration_months` | number | No | **Derived** – copy from `returns.duration_months`; do not show duration input in Investment details. |
| `duration_display` | string | No | **Derived** – "{{duration_months}} months" from returns. |
| `total_received` | number | No | **Calculated** – see §5C (by plan type); show read-only. |
| `total_received_display` | string | No | **Format** – currency from `total_received`. |
| `total_profit` | number | No | Optional input for monthly+maturity. |
| `maturity_amount` | number or null | No | **Calculated** for maturity types: `min_investment × (maturity_return_percent / 100)` (§5C); show read-only. `null` for monthly-only. |
| `maturity_amount_display` | string or null | No | **Template** – from §5A.3; `null` if no maturity. |

---

### 5.4 `partner_commission` object

**API rule:** Required on create. Must include `percent` (0–100). Optional `description`.

| Key | Type | Required | Purpose |
|-----|------|----------|---------|
| `percent` | number | **Yes** | Commission % (0–100) |
| `description` | string | No | Short note (e.g. "Partner gets 5% of investment amount") |

**Form:** Two inputs – Commission % (number), Description (optional text).

---

### 5.5 `rm_commission` object

**API rule:** Optional on create/update. Can be `null` if plan has no RM commission. If present: `percent` (0–100), optional `description`.

| Key | Type | Required | Purpose |
|-----|------|----------|---------|
| `percent` | number | Yes if object sent | RM commission % (0–100) |
| `description` | string | No | Short note |

**Form:** Optional section "RM commission" – checkbox "Has RM commission?"; if yes, show percent and optional description. Send `null` when unchecked.

---

### 5.6 Exact form inputs by plan type (summary)

Use this table to show/hide sections. **Common** = show for all types. **Monthly** = show only for Monthly only and Monthly + maturity. **Maturity** = show only for Maturity only and Monthly + maturity.

| Input / section | Monthly only | Maturity only | Monthly + maturity |
|-----------------|--------------|---------------|--------------------|
| **Common** (name, slug, display_order, is_active, partner commission, RM commission) | ✓ | ✓ | ✓ |
| Returns: Duration (months) | ✓ | ✓ | ✓ |
| Returns: Profit per month % | ✓ | – (send 0) | ✓ |
| Returns: Capital per month % | ✓ | – (send 0) | ✓ |
| Returns: Maturity return % | – | ✓ (input) | ✓ (input) |
| Returns: Maturity note (template) | – (send empty or fixed) | ✓ | ✓ |
| Investment: Min investment | ✓ (input) | ✓ (input) | ✓ (input) |
| Investment: Monthly payout profit / capital / total | ✓ (calculated, read-only) | – (send 0) | ✓ (calculated, read-only) |
| Investment: Total received | ✓ (calculated, read-only) | ✓ (calculated, = maturity_amount) | ✓ (calculated, read-only) |
| Investment: Maturity amount | – (send null) | ✓ (calculated, read-only) | ✓ (calculated, read-only) |
| Investment: Total profit | – | – | ✓ (calculated, read-only, optional) |

**No duration in Investment details:** Do not show a duration field under Investment details; copy `returns.duration_months` into `investment_details.duration_months` when building the payload (§5C). **Maturity return %:** For maturity-only and monthly+maturity, user enters **Maturity return %** (e.g. 100, 200) in Returns; **maturity amount** is calculated, not input. **Description:** Never a text input; build from template (§5A.1) and **show in a read-only field** that updates live. **Calculated fields:** Monthly payout amounts, maturity amount, and total received are calculated from Returns + min_investment (§5C); show in read-only fields.

---

## 6. Example: full create body (recommended)

This example includes all recommended keys so the plan works correctly in investor app, deed, and payouts.

```json
{
  "name": "ACPL MONTHLY BOOSTER PLAN (5%)",
  "slug": "acpl-monthly-booster-5",
  "display_order": 2,
  "returns": {
    "description": "5% profit every month for 20 months. 100% capital returned at maturity (after 20 months).",
    "profit_per_month_percent": 5,
    "capital_per_month_percent": 0,
    "duration_months": 20,
    "has_monthly_payout": true,
    "has_maturity_amount": true,
    "maturity_return_percent": 100,
    "maturity_note": "100% capital returned at maturity (after 20 months)."
  },
  "investment_details": {
    "min_investment": 100000,
    "min_investment_display": "₹1,00,000",
    "monthly_payout_profit": 5000,
    "monthly_payout_capital": 0,
    "monthly_payout_total": 5000,
    "monthly_payout_display": "₹5,000 per month (5% profit)",
    "duration_months": 20,
    "duration_display": "20 months",
    "total_received": 200000,
    "total_received_display": "₹2,00,000",
    "total_profit": 100000,
    "maturity_amount": 100000,
    "maturity_amount_display": "₹1,00,000 (capital)"
  },
  "partner_commission": {
    "percent": 5,
    "description": "Partner gets 5% of investment amount when a referred investor buys this plan."
  },
  "rm_commission": {
    "percent": 2,
    "description": "RM commission 2%"
  },
  "is_active": true
}
```

- **Monthly-only plan:** Set `has_maturity_amount: false`, `maturity_amount: null`, `maturity_amount_display: null`; keep monthly fields.
- **Maturity-only plan:** Set `has_monthly_payout: false`, monthly payout numbers to 0, `monthly_payout_display: "No monthly payouts"`. Include **maturity_return_percent** in returns (e.g. 200 for double); **maturity_amount** = min_investment × (maturity_return_percent / 100).
- **Monthly + maturity:** Include **maturity_return_percent** in returns (e.g. 100 for capital back); **maturity_amount** = min_investment × (maturity_return_percent / 100).
- **Maturity-only example:** returns: `duration_months: 13`, `maturity_return_percent: 200`, `has_monthly_payout: false`, `has_maturity_amount: true`, `maturity_note: "Capital doubles at maturity."`; investment_details: `min_investment: 100000`, `maturity_amount: 200000` (calculated: 100000 × 200/100), `total_received: 200000`, monthly payout fields 0.
- Omit `rm_commission` or send `null` if the plan has no RM commission.

---

## 7. Example: partial update (deactivate plan)

To hide a plan from investors without deleting it:

```json
PUT /api/admin/plans/3
{ "is_active": false }
```

To change only name and display order:

```json
PUT /api/admin/plans/3
{ "name": "New Plan Name", "display_order": 5 }
```

---

## 8. UI suggestions

- **List:** Show all plans with columns e.g. name, slug, display order, active (yes/no), actions (Edit, Deactivate/Activate, Delete). Use `display_order` (and optionally `id`) to sort.
- **Create – flow:**
  1. **First:** “Which type of plan?” → Monthly only / Maturity only / Monthly + maturity. Then show only the fields for that type (§5.0, §5.6).
  2. **Common:** Name, slug (validate lowercase + hyphens, check duplicate), display order, is active, partner commission, RM commission.
  3. **Returns:** Duration, profit % / capital % (by type). **Description:** Build from template (§5A.1) and **display in a read-only field** that **updates in real time** when the user changes duration or percent; do not use a textarea.
  4. **Investment details:** **Only Min investment (and for maturity types, Maturity amount) as inputs.** Do **not** show duration here; copy from Returns (§5C). Monthly payout profit/capital/total, total received, total profit – **calculated** from Returns + min_investment (§5C); **show in read-only fields**. All display strings from templates/format (§5A.3).
- **Edit:** Pre-fill form from GET list (or single plan); infer plan type from `has_monthly_payout` and `has_maturity_amount`. Allow partial save. When editing, you can still build description/display from templates if the user changes percent or duration.
- **Delete:** If API returns 400 with “linked to one or more investments”, show that message and suggest “Deactivate instead” and switch to Update with `is_active: false`.
- **Active toggle:** Use Update with `is_active: true` or `false`; no separate “activate” endpoint.

---

## 9. Error codes (relevant to Plan module)

| Code                 | When                          | Suggested UI action |
|----------------------|-------------------------------|---------------------|
| `VAL_001` / validation | Invalid or missing fields   | Show `errors` on fields. |
| `DB_DUPLICATE_ENTRY` | Slug already exists (create/update) | Ask user to choose another slug. |
| `GEN_NOT_FOUND`      | Plan not found (wrong id or deleted) | Show “Plan not found”, go back to list. |
| `DB_QUERY_FAILED`    | Delete blocked (plan has investments) | Show message; offer “Deactivate instead”. |

For full list see `docs/API_ERROR_CODES.md`.

---

## 10. Checklist: form inputs to implement

Use this to ensure no field is missed.

**Flow**

- [ ] Step 1: Plan type selector (Monthly only / Maturity only / Monthly + maturity) – shown first
- [ ] Step 2: Show only type-specific fields per §5.6 (no monthly section for maturity-only, no maturity section for monthly-only)

**Common (all types)**

- [ ] Name (text, required, max 255)
- [ ] Slug (text, required, lowercase + hyphens only, unique)
- [ ] Display order (number ≥ 0, optional)
- [ ] Is active (checkbox, default on)
- [ ] Partner commission % (number, 0–100, required)
- [ ] Partner commission description (template: “Partner gets {{percent}}%…” or optional text)
- [ ] RM commission (optional): Has RM commission? (checkbox); if yes: % and description

**Returns – inputs only (no free-text description)**

- [ ] Duration (months) (number) – all types
- [ ] Profit per month % (number) – monthly only, monthly+maturity
- [ ] Capital per month % (number) – monthly only, monthly+maturity
- [ ] Maturity return % (number) – **input** for maturity only, monthly+maturity (e.g. 100 = capital back, 200 = double)
- [ ] Maturity note – template for maturity only / monthly+maturity (§5A.2), using maturity_return_percent
- [ ] **Description:** built from template (§5A.1), **shown in read-only field**, **updates live** when user changes duration/percent. Not a textarea.

**Investment details – no duration input; maturity amount calculated from maturity return %**

- [ ] Min investment (number, required) – only amount input for all types
- [ ] Maturity amount – **calculated** from min_investment × (maturity_return_percent / 100) (§5C); **not** an input; show read-only for maturity only, monthly+maturity
- [ ] **No duration field** in Investment details – copy from Returns when building payload (§5C)
- [ ] Min investment display – format from min_investment (§5A.3)
- [ ] Monthly payout profit / capital / total – **calculated** (§5C), **shown in read-only fields**
- [ ] Monthly payout display – template (§5A.3); “No monthly payouts” for maturity-only
- [ ] Duration in payload – derived from returns.duration_months (§5C); no duration input in Investment details
- [ ] Total received, Total received display – **calculated** (§5C), **shown read-only**
- [ ] Total profit – calculated for monthly+maturity, shown read-only
- [ ] Maturity amount display – template or null (§5A.3)

**APIs**

- [ ] GET `/api/admin/plans` – list (table/cards)
- [ ] POST `/api/admin/plans` – create (submit full body; description and display strings from templates)
- [ ] PUT `/api/admin/plans/:id` – update (partial body)
- [ ] DELETE `/api/admin/plans/:id` – with handling for 400 “linked to investments” (offer Deactivate)

# Super Admin Dashboard – Frontend Guide

**What the backend provides and what the frontend must do**

This guide is for frontend developers building the **Super Admin main dashboard** (Platform Overview). It describes which APIs to call, what data you get, and what you must implement yourself (formatting, date range, links, etc.).

---

## Table of Contents

1. [What This Guide Covers](#1-what-this-guide-covers)
2. [What the Backend Gives vs What You Do](#2-what-the-backend-gives-vs-what-you-do)
3. [Authentication & Base URL](#3-authentication--base-url)
4. [Response Format & Errors](#4-response-format--errors)
5. [Dashboard Layout → API Mapping](#5-dashboard-layout--api-mapping)
6. [API Reference (Quick)](#6-api-reference-quick)
7. [What You Must Do on the Frontend](#7-what-you-must-do-on-the-frontend)
8. [Date Range & Period](#8-date-range--period)
9. [Formatting & Display](#9-formatting--display)
10. [Suggested Data Loading Strategy](#10-suggested-data-loading-strategy)
11. [Validation & Error Handling](#11-validation--error-handling)

---

## 1. What This Guide Covers

### Purpose

- The **main dashboard** is the first screen after Super Admin login (e.g. “Platform Overview” or “Dashboard”).
- The **backend** exposes dashboard APIs under `/api/admin/dashboard` and related admin endpoints. It returns **raw counts, amounts, and time-series** (no HTML, no UI).
- The **frontend** is responsible for: calling the right APIs, storing the selected date range, formatting numbers (₹, Cr, L, %), building charts, rendering lists, “View all” links, refresh/export, and any “% from last month” or “Requires attention” logic.

### Out of Scope

- Hierarchy CRUD (Nations, States, Branches) and RM/Partner/Investor list screens are documented in [HIERARCHY_FRONTEND_GUIDE.md](./HIERARCHY_FRONTEND_GUIDE.md) and other docs. This guide focuses **only on the dashboard home** and the dashboard APIs.

---

## 2. What the Backend Gives vs What You Do

| Area | Backend provides | Frontend must do |
|------|------------------|------------------|
| **KPI cards** | Counts and amounts via `/dashboard/summary` or `/purchases/stats`. | Format numbers (e.g. ₹5.3 Cr, 145 users), show “% from last month” if you have previous-period data (see below). |
| **Hierarchy summary** | Counts in `summary` (nations, states, branches). | Display “X Nations · Y States · Z Branches” and link each to the hierarchy/state/branch screens. |
| **Charts** | Time-series from `/investment-volume`, `/user-growth`, `/commission-stats`; plan breakdown from `/investment-by-plan`. | Choose chart library, map `series`/`by_month`/`plans` to axes, respect selected date range. |
| **Pending KYC** | Count + list from `/dashboard/pending-kyc`. | Render list (name, type, date), “View all” link to your KYC/pending list screen. |
| **Pending payment verification** | List from `GET /api/admin/purchases/pending-verification` (includes `investor_name`). | Render list, “View all” → purchases list filtered by status; optional quick Approve/Reject (use existing verify/reject APIs). |
| **Recent investments** | List from `GET /api/admin/purchases?limit=10`. | Render table/list, “View all” → full purchases list. |
| **Payouts / installments** | Summary from `/dashboard/installment-summary`. | Show “Payouts due this month” (count/amount), optional “Upcoming payouts” list (you may need a separate list API later). |
| **Date range** | Query param `period` or `from_date` & `to_date` on trend APIs. | Store selected range in state; send same `period` (or from/to) to investment-volume, user-growth, commission-stats. |
| **Refresh** | No dedicated endpoint. | Re-call the same APIs (e.g. summary + trend endpoints). |
| **Export** | No backend export. | Client-side: export current visible data (e.g. CSV) or print. |
| **“% from last month”** | Not computed by backend. | You can derive if you call trend/summary for **current** and **previous** period and compute % change. |
| **“Requires attention” strip** | No dedicated API. | Use `summary.purchase_stats.payment_verification` and `pending_kyc.count` (or same from summary if you add it) to build text and links. |
| **Quick actions** | None. | Only navigation: “Upload Payout PDF”, “Manage Plans”, “View Reports”, “Export Data” → your own routes. |

---

## 3. Authentication & Base URL

- **Base URL**: Same as rest of admin (e.g. `https://api.example.com` or your env).
- **All dashboard endpoints** require admin auth:
  - Header: `Authorization: Bearer <admin_jwt_token>`
- **Getting the token**: `POST /api/admin/login` with `admin_id` and `password`; response `data.token`. Store it and send it on every dashboard (and admin) request.

---

## 4. Response Format & Errors

### Success

Every successful response has this shape:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": { ... }
}
```

- Use `data` for all dashboard state. Ignore `message` for display unless you want a toast.

### Error

```json
{
  "success": false,
  "message": "User-facing error message",
  "developer_message": "Debug details",
  "error_code": "GEN_004"
}
```

- **Frontend:** Show `message` in a toast or inline error. Use `error_code` only if you need conditional UI (e.g. redirect on 401).
- **HTTP status:** 400 (validation), 401 (unauthorized), 403 (forbidden), 404, 500.

---

## 5. Dashboard Layout → API Mapping

Use this to wire each section of the UI to the right API and to your own logic.

| UI section | Primary API / source | Notes |
|------------|----------------------|--------|
| **Header** | — | Title, date range dropdown (you store value), Refresh (re-fetch), Export (client-side), “Last updated” (you set when data was fetched). |
| **“Requires attention” strip** | `GET /dashboard/summary` and/or `GET /dashboard/pending-kyc` | Use `purchase_stats.payment_verification` and `data.count` from pending-kyc (or equivalent). Build text: “5 payments to verify · 8 KYC pending” and link to the right lists. |
| **KPI row (7 cards)** | `GET /dashboard/summary` | Total users → `counts.total_users`. Total investments → `counts` + `purchase_stats` (count + amount). Active investments → `purchase_stats.active` + amount from `total_amount_by_status.active`. Total revenue → **you define** (no backend “revenue” yet; can use a placeholder or same as commission). Pending KYC → `pending_kyc` count (call `/pending-kyc` or add to summary if backend adds it). Pending verification → `purchase_stats.payment_verification`. Commission paid → from `GET /dashboard/commission-stats` `data.total_paid` (or add to summary later). Optional 8th card “Payouts due” → `GET /dashboard/installment-summary` → `due_this_month_count` / `due_this_month_amount`. |
| **Hierarchy summary** | `GET /dashboard/summary` → `data.counts` or `data.hierarchy` | Show “X Nations · Y States · Z Branches”; link to your hierarchy/nations/states/branches pages. |
| **Charts row** | | |
| → Investment volume trend | `GET /dashboard/investment-volume?period=...` | Use `data.series`: `period` (e.g. 2024-07) as X, `amount` as Y. Format amount (e.g. L/Cr) on axis. |
| → User growth | `GET /dashboard/user-growth?period=...` | Use `data.series`: `period` as X; `investors`, `partners`, `rms` as three series (stacked or grouped bars). |
| **Distribution + commission** | | |
| → Investment by plan (pie) | `GET /dashboard/investment-by-plan` | Use `data.plans`: `plan_name`, `amount` or `percentage` for segments. |
| → Commission trends | `GET /dashboard/commission-stats?period=...` | Use `data.by_month`: `period` as X, `amount` as Y. |
| **Lists row** | | |
| → Pending KYC | `GET /dashboard/pending-kyc?limit=10` | Render `data.list` (name, type, created_at); “View all” → your pending KYC page. |
| → Pending payment verification | `GET /api/admin/purchases/pending-verification` | Render `data.purchases` (investor_name, plan_name, amount, date); “View all” → purchases list with status filter. |
| → Recent investments | `GET /api/admin/purchases?limit=10` | Render `data.purchases`; “View all” → full purchases list. |
| **Payouts (optional)** | `GET /dashboard/installment-summary` | Show due_this_month_count/amount; optional list if you have an installments list screen. |
| **Quick actions** | No API | Buttons: Upload Payout PDF, Manage Plans, View Reports, Export Data → your routes. |

---

## 6. API Reference (Quick)

Base path for dashboard: **`/api/admin/dashboard`**. All require `Authorization: Bearer <token>`.

| Method | Path | Query | What you get |
|--------|------|--------|--------------|
| GET | `/summary` | — | Counts (nations, states, branches, rms, partners, investors, plans, total_users), hierarchy, purchase_stats (counts + total_amount + total_amount_by_status). |
| GET | `/pending-kyc` | `limit` (1–100, default 20) | `count`, `list[]` with `id`, `name`, `type` (investor/partner), `created_at`. |
| GET | `/commission-stats` | `period` or `from_date` & `to_date` | `total_paid`, `by_month[]` (`period`, `amount`). |
| GET | `/investment-volume` | Same as above | `series[]` (`period`, `amount`, `count`). |
| GET | `/user-growth` | Same as above | `series[]` (`period`, `investors`, `partners`, `rms`). |
| GET | `/investment-by-plan` | — | `plans[]` (`plan_id`, `plan_name`, `amount`, `count`, `percentage`). |
| GET | `/installment-summary` | — | `total`, `pending`, `paid`, `cancelled`, `total_receivable_pending`, `due_this_month_count`, `due_this_month_amount`. |

**Related (not under /dashboard):**

| Method | Path | Query | What you get |
|--------|------|--------|--------------|
| GET | `/api/admin/purchases/stats` | — | Same purchase counts/amounts as in summary (use if you don’t call summary). |
| GET | `/api/admin/purchases/pending-verification` | — | `purchases[]` with `id`, `investor_id`, `investor_name`, `investor_client_id`, `plan_name`, `amount`, dates. |
| GET | `/api/admin/purchases` | `limit`, `offset`, `status`, `investor_id` | `purchases[]`, `total` (for pagination). |

**Period values:** `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `this_year`.  
**Custom range:** `from_date` and `to_date` in **YYYY-MM-DD**.

---

## 7. What You Must Do on the Frontend

- **Store date range:** Keep the selected period (or from_date/to_date) in component/global state and pass it to investment-volume, user-growth, and commission-stats.
- **Format currency:** Backend returns numbers (e.g. `53000000`). You format as ₹5.3 Cr, ₹32.0 L, etc., and locale (e.g. Indian number grouping).
- **Format dates:** Backend returns ISO strings (e.g. `2024-12-01T10:00:00.000Z`). You format for list (e.g. “Dec 01, 2024”) and for chart labels (e.g. “Jul 2024” from `period` “2024-07”).
- **Charts:** You choose the library (e.g. Chart.js, Recharts). Map:
  - Investment volume: X = `period`, Y = `amount` (and optionally count).
  - User growth: X = `period`, Y = investors / partners / rms (three series).
  - Commission trends: X = `period`, Y = `amount`.
  - Investment by plan: segments from `plan_name` and `amount` or `percentage`.
- **“View all” links:** Navigate to your existing list screens (purchases, pending KYC, pending verification) with the right filters.
- **Refresh:** On “Refresh” click, re-call the APIs you use for the dashboard (e.g. summary + trend endpoints with current period).
- **Export:** Implement client-side (e.g. CSV of current table data or print). No backend export for dashboard.
- **“% from last month”:** Backend does not compute this. Options:
  - Call summary or trend for **current** and **previous** period (e.g. last 30 days vs previous 30 days), then compute `(current - previous) / previous * 100` and show next to each KPI.
  - Or hide this until backend provides it.
- **“Last updated”:** Set a timestamp when you last successfully fetched dashboard data; display it in the header.
- **Loading and empty states:** Show skeletons or spinners while APIs are in flight; show friendly empty state if a list is empty or a chart has no data.

---

## 8. Date Range & Period

- **Dropdown options:** Typically “Last 7 days”, “Last 30 days”, “Last 3 months”, “Last 6 months”, “This year”. Map them to `period`: `last_7_days`, `last_30_days`, `last_3_months`, `last_6_months`, `this_year`.
- **Sending to backend:** For trend APIs use query param:
  - `period=last_30_days` (or the selected value), **or**
  - `from_date=2024-07-01&to_date=2025-01-31` for a custom range.
- **Consistency:** Use the **same** period (or from/to) for:
  - `GET /dashboard/investment-volume`
  - `GET /dashboard/user-growth`
  - `GET /dashboard/commission-stats`
- **Summary and other endpoints:** `/summary`, `/pending-kyc`, `/investment-by-plan`, `/installment-summary` do **not** take a date range; they return current snapshot.

---

## 9. Formatting & Display

- **Amounts:** Backend sends numbers in **rupees** (no decimals for most). Examples:
  - `53000000` → display “₹5.3 Cr” or “₹5,30,00,000”.
  - `3200000` → “₹32.0 L” or “₹32,00,000”.
- **Percentages:** `investment-by-plan` includes `percentage` (e.g. 41.5). Show as “41.5%” or round as you like.
- **Dates:** ISO strings → format for list (e.g. “Dec 01, 2024”) and for chart X-axis (e.g. “Jul 2024” from `period` “2024-07”).
- **Status pills:** For purchases use `status`: e.g. “Pending” for `payment_verification`, “Active” for `active` or `payment_verified`. You define labels and colors.
- **Pending KYC type:** `data.list[].type` is `"investor"` or `"partner"`; use it for a badge or column.

---

## 10. Suggested Data Loading Strategy

- **On dashboard load:**
  1. Call `GET /dashboard/summary` once → use for KPIs, hierarchy, purchase counts/amounts.
  2. Call `GET /dashboard/pending-kyc?limit=10` for the pending KYC list (and count if not in summary).
  3. Call `GET /api/admin/purchases/pending-verification` for pending payment list.
  4. Call `GET /api/admin/purchases?limit=10` for recent investments.
  5. Call `GET /dashboard/investment-volume`, `GET /dashboard/user-growth`, `GET /dashboard/commission-stats` with the selected `period` (e.g. default `last_30_days`).
  6. Call `GET /dashboard/investment-by-plan` for the pie chart.
  7. Call `GET /dashboard/installment-summary` if you show payouts.
- **When user changes date range:** Re-call only the three trend APIs (investment-volume, user-growth, commission-stats) with the new period (or from_date/to_date).
- **Refresh button:** Re-call all of the above (or at least summary + lists + trend APIs with current period).
- You can run 2–4 in parallel and 5–7 in parallel to reduce perceived latency.

---

## 11. Validation & Error Handling

- **Query params:**  
  - `limit` for pending-kyc: integer 1–100.  
  - `period`: one of the allowed values.  
  - `from_date` / `to_date`: YYYY-MM-DD; if both sent, from_date must be ≤ to_date.  
  Backend returns 400 with `errors` array if validation fails.
- **401:** Token missing or invalid → redirect to login and clear stored token.
- **403:** Not admin → show “Access denied” and do not render dashboard data.
- **500 / network error:** Show a generic “Something went wrong” and optionally a retry. Use `message` from body for toast if present.
- **Empty data:** Empty `series` or `list` is valid. Show “No data” or “No pending items” in charts/lists instead of breaking.

---

## Summary Checklist for Frontend

- [ ] Use `Authorization: Bearer <token>` on every dashboard and admin request.
- [ ] Call `GET /dashboard/summary` for KPIs and hierarchy; optionally add `/pending-kyc` for pending KYC count.
- [ ] Call trend APIs with same `period` (or from_date/to_date); store range in state and re-fetch trends when it changes.
- [ ] Format all amounts and percentages on the frontend; format dates for lists and chart labels.
- [ ] Implement “View all” links to your existing list screens (purchases, pending KYC, pending verification).
- [ ] Implement Refresh (re-fetch) and Export (client-side); set “Last updated” when data is fetched.
- [ ] Handle loading and empty states; handle 401/403/500 and validation errors.
- [ ] Quick actions are navigation only; no dashboard API for them.
- [ ] “% from last month” is optional; implement only if you fetch previous-period data and compute the percentage yourself.

For full request/response examples and field-level detail, see [DASHBOARD_API.md](./DASHBOARD_API.md).

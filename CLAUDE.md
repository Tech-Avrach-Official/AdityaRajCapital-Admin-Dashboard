# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # start Vite dev server
npm run build     # production build to dist/
npm run preview   # preview built bundle
npm run lint      # ESLint over the repo (flat config in eslint.config.js)
```

There is no test runner configured.

`main` auto-deploys via `.github/workflows/deploy.yml` (SSHs to the VPS, runs `git pull && npm install && npm run build` in `/srv/apps/dashboard`). Pushing to `main` ships to production.

The `name` in [package.json](package.json) is `"pissed-consumer"` — a template leftover, not the actual product. Don't rely on it.

## Environment

`VITE_API_BASE_URL` and `VITE_STORAGE_BASE_URL` are read from `.env` (see `.env.example`). The API client falls back to `http://localhost:3000` if `VITE_API_BASE_URL` is unset. `VITE_STORAGE_BASE_URL` is used by `getProfileImageUrl` in [src/lib/utils.js](src/lib/utils.js) to resolve relative storage paths.

Path alias `@` → `./src` is configured in both [vite.config.js](vite.config.js) and [jsconfig.json](jsconfig.json) — always use `@/...` in imports rather than long relative paths.

## Architecture

This is a React 18 + Vite + Redux Toolkit admin dashboard for "AdityaRaj Capital". The app is organized as **three sibling modules** (admin, rm, partner) that share infrastructure but are otherwise independent.

### Module layout

```
src/
  modules/
    admin/    # Sub-admin / super-admin panel (this team's primary focus)
    rm/       # Relationship Manager portal (other developer)
    partner/  # Partner portal (other developer)
  global/     # Cross-module infrastructure (router, store wiring, AuthGuard, API factory)
  components/ # Shared UI: shadcn/ui in components/ui, app primitives in components/common
  lib/        # Utilities, theme constants, mock data, backward-compat api re-exports
  pages/      # RoleLandingPage at "/"
```

Each module follows the same internal shape: `api/` (client, endpoints, services), `app/routes.jsx`, `auth/` or `pages/auth/`, `components/`, `hooks/`, `layout/`, `pages/`, `store/` (slices under `store/features/`, combined in `store/reducer.js`).

### Routing — three-tenant layout

[src/global/router/AppRouter.jsx](src/global/router/AppRouter.jsx) is the only place that mounts module routes. It wraps each module's `<Outlet />` layout in a `GlobalAuthGuard` with a module-specific `tokenKey` / `loginPath`:

- `/admin/*` → `adminToken` → `AdminLayout` → `AdminRoutes()`
- `/rm/*` → `rmToken` → `RMLayout` → `RMRoutes()`
- `/partner/*` → `partnerToken` → `PartnerLayout` → `PartnerRoutes()`
- `/` → `RoleLandingPage` (chooser between the three logins)

Add new admin pages by appending `<Route>` entries inside `AdminRoutes()` in [src/modules/admin/app/routes.jsx](src/modules/admin/app/routes.jsx). Do not add routes directly to `AppRouter.jsx`.

### Auth — separate token per module

Auth is intentionally **not** centralized in Redux. [src/global/auth/AuthGuard.jsx](src/global/auth/AuthGuard.jsx) is a stateless guard that just checks `localStorage[tokenKey]` and redirects to `loginPath` if missing. Each module owns its own token key (`adminToken`, `rmToken`, `partnerToken`) and login route. A user can be signed in to multiple portals simultaneously.

### API clients — factory per module

[src/global/api/createApiClient.js](src/global/api/createApiClient.js) is an axios factory that wires up the request `Authorization` header from `localStorage[tokenKey]` and a 401 interceptor that clears `keysToClearOn401` and redirects to `loginPath`. Each module instantiates its own client (e.g. [src/modules/admin/api/client.js](src/modules/admin/api/client.js)) — keep this pattern when adding modules; never share a client across modules.

API surface area for the admin module is centralized:
- [src/modules/admin/api/endpoints.js](src/modules/admin/api/endpoints.js) — single source of truth for backend URLs (path strings and `(id) => ...` builders).
- [src/modules/admin/api/services/](src/modules/admin/api/services/) — thin axios wrappers per domain (users, plans, financial, kyc, dashboard, hierarchy, products, purchases, globalSearch).
- [src/lib/api/index.js](src/lib/api/index.js) is a **backward-compat shim** re-exporting admin services. New code should import from `@/modules/admin/api/...` directly.

### Redux store — namespaced by module

A single store is created in [src/global/store/configureStore.js](src/global/store/configureStore.js) and combined in [src/global/store/rootReducer.js](src/global/store/rootReducer.js):

```
state.admin.{auth, rms, partners, investors, products, financial, kyc, dashboard, ui, purchases}
state.rm.*
state.partner.*
```

Each module's `store/reducer.js` (e.g. [src/modules/admin/store/reducer.js](src/modules/admin/store/reducer.js)) owns its slice tree. Add new admin slices by importing them there — do not touch the `rm` or `partner` keys in `rootReducer.js`.

[src/global/store/middleware/errorMiddleware.js](src/global/store/middleware/errorMiddleware.js) listens for any `*/rejected` thunk action and surfaces a `react-hot-toast` error. 401 handling lives in the API client interceptor, not the middleware. To suppress a toast for a specific rejection, add the action type to `SILENT_ACTIONS`.

`@/store` is a re-export of `@/global/store` (`store`, `useAppDispatch`, `useAppSelector`) kept for older imports.

### Slice & thunk conventions

All admin list slices follow the same shape — match it when adding new ones:

- **Entity adapters**: lists use `createEntityAdapter` so reducers update via `adapter.setAll/upsertOne` and selectors come from `adapter.getSelectors(state => state.admin.<slice>)`.
- **Filters + pagination**: each list keeps `filters: { ... }` and `pagination: { page, limit, total }` on its slice state. Changing filters resets `page` to 1. Thunks accept a `params` object, services pass it to the endpoint, and `fulfilled` updates `pagination.total` from the response.
- **Per-row in-flight state**: when an action targets a single row (verify payment, reject payment, process deletion), store the in-flight `processingId` separately from the global `loading` flag — see [purchases slice](src/modules/admin/store/features/purchases/) and its `selectPurchaseProcessing(id)` selector. Reuse this pattern for any per-row spinner.
- **`ignoredPaths` in [configureStore.js](src/global/store/configureStore.js)** currently exempts `admin.financial.payouts.uploadProgress`, but the slice only sets a boolean `uploading`. The path is a placeholder for future progress tracking — don't expect it to exist today.

### Hooks pattern

[src/modules/admin/hooks/](src/modules/admin/hooks/) (`useAuth`, `useRMs`, `usePartners`, `usePurchases`) are not thin wrappers — they bundle memoized selectors *and* dispatchers and expose convenience helpers like `isPurchaseProcessing(id)`, `pendingCount`, etc. New page-level features should grow a hook here rather than wiring `useSelector`/`useDispatch` directly into components.

### Module boundaries (important)

[docs/ADMIN_MODULE_BOUNDARIES.md](docs/ADMIN_MODULE_BOUNDARIES.md) is the contract between the admin team (this codebase's primary owner) and the developer maintaining `rm`/`partner`. Key rules:

- RM and Partner only import from `@/components/ui/*`, `@/lib/utils` (`cn`), `@/global/api/createApiClient`, `@/global/auth/AuthGuard`, and the shared router/store wiring. They never import from `@/modules/admin` or `@/lib/api`.
- Changes under `src/components/`, `src/lib/`, `src/global/` must be backward-compatible — additive props only, no renames or removals of existing exports/props used by `rm`/`partner`.
- Do not modify the `/rm` or `/partner` route blocks in `AppRouter.jsx`, or the `rm`/`partner` keys in `rootReducer.js`. Search `src/modules/rm` and `src/modules/partner` before editing any shared file.

### UI conventions

- Styling: Tailwind + [shadcn/ui](https://ui.shadcn.com) primitives in [src/components/ui/](src/components/ui/) (configured via [components.json](components.json), base color `slate`, icons `lucide-react`).
- Design tokens (colors, spacing, layout sizes like `headerHeight`, `sidebarWidth`, `contentMaxWidth`) live in [src/lib/theme.js](src/lib/theme.js) — read from there rather than hard-coding pixel values in layouts.
- Toaster is mounted once in [src/App.jsx](src/App.jsx); use `react-hot-toast` directly, not a wrapper.
- Forms use `react-hook-form` + `zod` via `@hookform/resolvers`.
- Tables use `@tanstack/react-table`; the shared [DataTable](src/components/common/DataTable.jsx) and [FilterBar](src/components/common/FilterBar.jsx) take data as props (they don't fetch). Other reusable primitives in [src/components/common/](src/components/common/): `PageHeader`, `MetricCard`, `StatusBadge`, `LoadingSpinner`, `DocumentPreviewModal`, `ImageViewerModal`, `ImageDropzone`.
- [src/lib/utils/errorHandler.js](src/lib/utils/errorHandler.js) is the canonical place to map HTTP errors to user-facing toast text (used widely in services); reach for it before writing ad-hoc try/catch + toast.
- [src/lib/mockData/](src/lib/mockData/) is **not** dead — admin services fall back to it when API calls fail locally, so dev still works without a backend. RM and Partner services don't use it.

### Domain rules to remember

These are non-obvious frontend constraints driven by the backend contract — see [docs/](docs/) for full details. Important ones a future change is likely to trip on:

- **Signed URLs, never raw paths.** Payment proofs and KYC documents must be fetched via dedicated endpoints (`/payment-proof-url`, `/signed-deed-url`, KYC document URL endpoints) that return 1-hour signed URLs. Never construct browser src/href from `payment_proof_file_path` or other stored paths. Re-fetch on click for freshness.
- **Plans are type-first.** Forms in `pages/plans/` must ask plan type (monthly-only / maturity-only / monthly+maturity) first and conditionally render fields. Description, display strings, payout amounts, maturity totals, and partner/RM commission descriptions are **template-generated or backend-calculated** — render them read-only, not as free-text inputs.
- **RM creation is OTP-gated and multipart.** Flow: `initiate` (sends mobile+email OTPs) → `verify-mobile-otp` → `verify-email-otp` → `complete`. Branch is required (Nation/State are derived from it — don't expose them as separate fields). `rm_aadhaar_front` + `rm_pan_image` are required `multipart/form-data` uploads (let the browser set `Content-Type` from `FormData`, don't override). Backend rate-limits OTPs.
- **Investor's upline is partner XOR rm.** When an investor has a `partner`, `rm` is null; when an investor has a direct RM, `partner` is null. Don't render both.
- **Installments lazy-generate.** `GET /purchases/:id/installments` triggers backend generation on first call. An empty array means "not ready yet," not "no installments" — handle that state distinctly.
- **Deletion may be blocked.** Deletion-processing endpoints can return 409 with a `blocked_reasons` array when an investor has active obligations. Surface those reasons rather than collapsing to a generic error.
- **Dashboard date-range fan-out.** When the user changes the date range, re-fetch `investment-volume`, `user-growth`, and `commission-stats` with the same `period` (or `from_date`/`to_date`). Summary endpoints are snapshots and do **not** accept a date range.
- **Staff RBAC is at-next-login.** Scope/permission/status changes for staff users take effect on their next login, not immediately. Surface this in confirmation copy.

### Domain docs

The [docs/](docs/) folder contains per-feature implementation guides and API references (admin RMs, plans, hierarchy, KYC, investor/investment APIs, deletion processing, dashboard, staff RBAC, etc.). Consult the relevant doc when extending a feature — they describe expected request/response shapes that aren't always obvious from the slice code.

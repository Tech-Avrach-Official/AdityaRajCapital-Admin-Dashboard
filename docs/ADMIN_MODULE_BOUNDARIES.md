# Admin Module Boundaries & Conflict-Free Development

This doc defines **safe zones** and **shared surface** so that work on the **Admin** module does not conflict with work on the **RM** and **Partner** modules (owned by another developer).

---

## 1. Module ownership

| Module   | Path                    | Owner / focus        |
|----------|-------------------------|----------------------|
| **Admin**   | `src/modules/admin/`    | This team            |
| **RM**       | `src/modules/rm/`       | Other developer      |
| **Partner**  | `src/modules/partner/`  | Other developer      |

---

## 2. Safe to change (Admin-only)

You can freely add, edit, and refactor anything under:

- **`src/modules/admin/**`**
  - Pages, components, layout, hooks
  - Store: `reducer.js`, all slices under `store/features/`
  - API: `client.js`, `endpoints.js`, all services under `api/services/`
  - Auth: `pages/auth/LoginPage.jsx` (admin login only)

**Also safe:**

- **Admin routes only**  
  Add or change routes only inside `AdminRoutes()` in `src/modules/admin/app/routes.jsx`. Do not modify the RM or Partner `<Route>` blocks in `AppRouter.jsx`.

- **Admin Redux only**  
  All admin selectors use `state.admin.*`. You may change `src/modules/admin/store/reducer.js` (add/remove admin slices). Do not remove or rename the `rm` or `partner` keys in `src/global/store/rootReducer.js`.

---

## 3. Shared surface (double-check before changing)

RM and Partner **do not** import from `@/modules/admin`. They **do** use the following. Any change here must stay **backward-compatible** for RM and Partner.

| Location | Used by RM/Partner | Rule |
|----------|--------------------|------|
| `src/components/ui/button.jsx` | RM layout + login; Partner layout + login | Do not remove or rename props (e.g. `variant`, `size`, `onClick`). Adding new props is OK. |
| `src/components/ui/card.jsx` (Card, CardContent, CardHeader, CardTitle) | RM login; Partner login | Keep existing API; additive changes only. |
| `src/components/ui/input.jsx` | RM login; Partner login | Do not break controlled input or props. |
| `src/components/ui/label.jsx` | RM login; Partner login | Keep export and usage. |
| `src/lib/utils.js` (`cn`) | RM layout; Partner layout | Do not remove or change `cn` signature. |
| `src/global/api/createApiClient.js` | RM `api/client.js`; Partner `api/client.js` | Do not change return shape or usage (base URL, headers, interceptors) in a way that breaks their clients. |
| `src/global/auth/AuthGuard.jsx` | Router (admin, RM, Partner) | Do not change props: `tokenKey`, `loginPath`, `children`. |
| `src/global/router/AppRouter.jsx` | Mounts all three modules | Do not change the `/rm` or `/partner` route blocks (path, Guard, layout, `RMRoutes`/`PartnerRoutes`). Admin route changes are safe. |
| `src/global/store/rootReducer.js` | All modules | Do not remove or rename `rm` or `partner` keys or their reducers. Changing `adminReducer` / `admin` key is safe. |
| `src/global/store/configureStore.js` | Single store | Adding `admin.*` to `ignoredPaths` is safe. Do not change middleware in a way that breaks `state.rm` / `state.partner`. |
| `src/pages/RoleLandingPage.jsx` | Landing (RM/Partner logins) | Uses `Button` and navigates to `/rm/login`, `/partner/login`. Do not remove those flows or break Button. |

Before editing any file under `src/components/`, `src/lib/`, or `src/global/`, search the repo for imports from that path, especially in `src/modules/rm` and `src/modules/partner`.

---

## 4. Pre-commit checklist (Admin work)

Use this before committing Admin-only or shared changes:

- [ ] **Scope**  
  I only changed files under `src/modules/admin/`, **or** I changed a shared file in a backward-compatible way (no removed/renamed exports or props used by RM/Partner).

- [ ] **Redux**  
  I only touched `state.admin` (and possibly added new admin slices in `rootReducer`). I did not remove or rename `rm` or `partner` in `rootReducer`.

- [ ] **Router**  
  I did not change the `/rm` or `/partner` route blocks in `AppRouter.jsx`.

- [ ] **Shared surface**  
  For any change under `components/`, `lib/`, or `global/`: I searched for `@/components/`, `@/lib/`, `@/global/` in `src/modules/rm` and `src/modules/partner` and confirmed no use or backward compatibility.

---

## 5. Quick reference: what RM and Partner import

As of the last update, RM and Partner only import:

- **RM:** `@/components/ui/button`, `@/lib/utils` (`cn`), `@/global/api/createApiClient`
- **Partner:** Same as RM, plus same UI components for login: `@/components/ui/card`, `@/components/ui/input`, `@/components/ui/label`

They do **not** import from `@/modules/admin` or from `@/lib/api` (admin re-exports). Keeping this boundary avoids merge conflicts and broken builds for the other developer.

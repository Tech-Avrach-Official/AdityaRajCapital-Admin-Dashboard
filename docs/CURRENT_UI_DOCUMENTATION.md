# AdityaRaj Capital Admin Dashboard - Current UI Documentation

> **Last Updated:** January 26, 2026  
> **Version:** 1.0.0  
> **Status:** Development (Using Mock Data)

---

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Application Structure](#application-structure)
4. [Layout Components](#layout-components)
5. [Pages & Features](#pages--features)
6. [Common Components](#common-components)
7. [UI Component Library](#ui-component-library)
8. [Styling System](#styling-system)
9. [State Management](#state-management)
10. [API Integration](#api-integration)
11. [Data Visualization](#data-visualization)
12. [Form Handling](#form-handling)
13. [Notifications](#notifications)
14. [Mock Data](#mock-data)
15. [Current Limitations](#current-limitations)

---

## Overview

The AdityaRaj Capital Admin Dashboard is a comprehensive web-based administration panel designed for managing users, investments, financial operations, KYC verification, and system configuration. The application features a responsive layout with a collapsible sidebar, modern UI components, and data visualization capabilities.

### Key Features Currently Implemented

- ✅ Responsive admin layout with sidebar and header
- ✅ Dashboard with metrics and charts
- ✅ User management (RMs, Partners, Investors)
- ✅ Product management with grid/table views
- ✅ Financial management (Investments, Payouts, Commissions)
- ✅ KYC verification workflow
- ✅ System settings configuration
- ✅ Audit trail logging
- ✅ Search and filtering across all pages
- ✅ Modal dialogs for forms and details
- ✅ Toast notifications

---

## Technology Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 18+ with Vite |
| **Routing** | React Router DOM v6 |
| **State Management** | Redux Toolkit |
| **Styling** | Tailwind CSS |
| **UI Components** | Radix UI (shadcn/ui) |
| **Tables** | TanStack Table |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod |
| **HTTP Client** | Axios |
| **Icons** | Lucide React |
| **Notifications** | React Hot Toast |
| **Date Handling** | date-fns |

---

## Application Structure

### File Structure

```
src/
├── admin/
│   ├── components/
│   │   ├── AdminHeader.jsx
│   │   └── AdminSidebar.jsx
│   ├── layout/
│   │   └── AdminLayout.jsx
│   └── pages/
│       ├── audit/
│       │   └── AuditPage.jsx
│       ├── dashboard/
│       │   └── Dashboard.jsx
│       ├── financial/
│       │   ├── commissions/
│       │   │   └── CommissionsPage.jsx
│       │   ├── investments/
│       │   │   └── InvestmentsPage.jsx
│       │   └── payouts/
│       │       └── PayoutsPage.jsx
│       ├── kyc/
│       │   └── KYCPage.jsx
│       ├── products/
│       │   └── ProductsPage.jsx
│       ├── settings/
│       │   └── SettingsPage.jsx
│       └── users/
│           ├── investors/
│           │   └── InvestorsPage.jsx
│           ├── partners/
│           │   └── PartnersPage.jsx
│           └── rms/
│               ├── components/
│               │   ├── AssignPartnersModal.jsx
│               │   ├── CreateRMModal.jsx
│               │   ├── DeleteConfirmationModal.jsx
│               │   ├── EditRMModal.jsx
│               │   ├── RMDetailsModal.jsx
│               │   └── RMsTable.jsx
│               └── RMsPage.jsx
├── components/
│   ├── common/
│   │   ├── DataTable.jsx
│   │   ├── FilterBar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── MetricCard.jsx
│   │   ├── PageHeader.jsx
│   │   ├── scrollToTop.jsx
│   │   └── StatusBadge.jsx
│   └── ui/
│       ├── avatar.jsx
│       ├── badge.jsx
│       ├── button.jsx
│       ├── card.jsx
│       ├── checkbox.jsx
│       ├── dialog.jsx
│       ├── dropdown-menu.jsx
│       ├── input.jsx
│       ├── label.jsx
│       ├── scroll-area.jsx
│       ├── select.jsx
│       ├── separator.jsx
│       ├── skeleton.jsx
│       ├── switch.jsx
│       ├── table.jsx
│       └── tabs.jsx
├── global_redux/
│   ├── features/
│   │   └── counter/
│   │       └── counterSlice.js
│   ├── provider/
│   │   └── provider.jsx
│   └── store/
│       └── store.js
├── lib/
│   ├── api/
│   │   ├── apiClient.js
│   │   ├── endpoints.js
│   │   └── services/
│   │       ├── dashboardService.js
│   │       ├── financialService.js
│   │       ├── index.js
│   │       ├── kycService.js
│   │       ├── productsService.js
│   │       └── usersService.js
│   ├── mockData/
│   │   ├── audit.js
│   │   ├── commissions.js
│   │   ├── dashboard.js
│   │   ├── index.js
│   │   ├── investments.js
│   │   ├── kyc.js
│   │   ├── payouts.js
│   │   ├── products.js
│   │   └── users.js
│   ├── theme.js
│   └── utils.js
├── pages/
│   └── Home/
│       └── Home.jsx
├── routes/
│   └── routes.jsx
├── App.jsx
├── App.css
├── main.jsx
└── index.css
```

### Routing Structure

| Route | Page Component | Description |
|-------|----------------|-------------|
| `/` | Redirect | Redirects to `/admin` |
| `/admin` | Dashboard | Main dashboard overview |
| `/admin/users/rms` | RMsPage | Relationship Managers management |
| `/admin/users/partners` | PartnersPage | Partners management |
| `/admin/users/investors` | InvestorsPage | Investors management |
| `/admin/products` | ProductsPage | Products management |
| `/admin/financial/investments` | InvestmentsPage | Investments tracking |
| `/admin/financial/payouts` | PayoutsPage | Payout processing |
| `/admin/financial/commissions` | CommissionsPage | Commission management |
| `/admin/kyc` | KYCPage | KYC verification |
| `/admin/settings` | SettingsPage | System configuration |
| `/admin/audit` | AuditPage | Audit trail & compliance |

---

## Layout Components

### AdminLayout (`src/admin/layout/AdminLayout.jsx`)

The main layout wrapper that provides the overall structure for the admin interface.

**Features:**
- Responsive design with mobile support
- Collapsible sidebar integration
- Header integration
- Mobile menu toggle
- Content area with max-width constraints
- Mobile overlay for sidebar

**Structure:**
```
┌────────────────────────────────────────────────────────┐
│                     AdminHeader                         │
├──────────────┬─────────────────────────────────────────┤
│              │                                          │
│  AdminSidebar│              Content Area                │
│  (collapsible│         (max-width: 1600px)             │
│   240px/64px)│                                          │
│              │                                          │
└──────────────┴─────────────────────────────────────────┘
```

---

### AdminHeader (`src/admin/components/AdminHeader.jsx`)

The top navigation bar displayed across all admin pages.

**Components:**
| Element | Description |
|---------|-------------|
| **Logo** | "AdityaRaj Capital" branding text |
| **Search Bar** | Center-positioned search input (desktop only) |
| **Notifications** | Bell icon with notification badge indicator |
| **Profile Dropdown** | User avatar with dropdown menu |

**Profile Dropdown Contents:**
- Avatar with initials "SA" (Super Admin)
- User name: "Super Admin"
- User email: "admin@adityarajcapital.com"
- Menu items: Profile, Settings, Logout

---

### AdminSidebar (`src/admin/components/AdminSidebar.jsx`)

The left navigation sidebar with collapsible functionality.

**Properties:**
- **Expanded Width:** 240px
- **Collapsed Width:** 64px
- **Background Color:** #1a1d29 (dark theme)
- **Active State:** Route highlighting with visual indicator

**Navigation Menu Structure:**

```
📊 Dashboard
👥 User Management
   ├── 👔 Relationship Managers
   ├── 🤝 Partners
   └── 👤 Investors
📦 Products
💰 Financial Management
   ├── 📈 Investments
   ├── 💳 Payouts
   └── 💹 Commissions
📋 KYC Verification
⚙️ System Configuration
📑 Audit & Compliance
───────────────────────
🚪 Logout
```

**Features:**
- Collapsible with animated transitions
- Sub-menu expansion for nested items
- Auto-expand submenus based on active route
- Active route highlighting
- Smooth hover effects
- Custom scrollbar styling

---

## Pages & Features

### 1. Dashboard (`src/admin/pages/dashboard/Dashboard.jsx`)

The main overview page displaying platform metrics and analytics.

#### Header Section
- **Title:** "Platform Overview"
- **Last Updated:** Timestamp display
- **Date Range Selector:** 7, 30, 90, 180, 365 days
- **Actions:** Refresh button, Export button

#### Metric Cards (6 cards)

| Metric | Icon | Color | Data Displayed |
|--------|------|-------|----------------|
| Total Users | Users | Blue | User count |
| Total Investments | TrendingUp | Green | Count + Total amount |
| Active Investments | Activity | Orange | Count + Active amount |
| Total Revenue | DollarSign | Purple | Revenue amount |
| Pending KYC | FileCheck | Red | Pending count (highlighted if > 0) |
| Commission Payouts | Percent | Teal | Payout amount |

#### Charts Section

1. **Investment Volume Trend** (LineChart)
   - Shows investment trends over time
   - Responsive container

2. **User Growth** (BarChart)
   - Displays growth by user type: RMs, Partners, Investors
   - Stacked/grouped bars

3. **Investment Distribution** (PieChart)
   - Shows investment breakdown by category
   - Interactive legend

4. **Commission Trends** (LineChart)
   - Tracks commission amounts over time

#### Recent Activity Section

1. **Pending KYC Verifications**
   - List view with status badges
   - User details and submission date

2. **Recent Investments**
   - Investment details with amounts
   - Status indicators

#### Quick Actions

| Action | Description |
|--------|-------------|
| Upload Payout PDF | Opens file upload dialog |
| Configure Commission | Navigate to commission settings |
| View Reports | Navigate to reports section |
| Export Data | Download data export |

---

### 2. Relationship Managers Page (`src/admin/pages/users/rms/RMsPage.jsx`)

Complete CRUD management for Relationship Managers.

#### Page Header
- **Title:** "Relationship Managers"
- **Action Button:** "Create RM"

#### Filter Bar
- Search input (searches by name, email, mobile)
- Status filter dropdown (All, Active, Inactive)

#### Table Columns

| Column | Type | Features |
|--------|------|----------|
| Name | Link | Clickable, opens details modal |
| Email | Text | - |
| Mobile | Text | - |
| Referral Code | Text | Copy to clipboard button |
| Partners | Link | Clickable count, opens assign modal |
| Total Investors | Number | - |
| Status | Badge | Active/Inactive |
| Created Date | Date | Formatted date |
| Actions | Dropdown | View, Edit, Assign Partners, Delete |

#### Modals

1. **CreateRMModal** (`components/CreateRMModal.jsx`)
   - Form fields: Name, Email, Mobile, Password, Confirm Password
   - Status toggle switch
   - Validation with Zod schema

2. **EditRMModal** (`components/EditRMModal.jsx`)
   - Edit fields: Name, Email, Mobile
   - Status toggle switch
   - Pre-populated with existing data

3. **RMDetailsModal** (`components/RMDetailsModal.jsx`)
   - **Tabs:**
     - Basic Info: Profile details, contact info
     - Partners: List of assigned partners
     - Statistics: Performance metrics

4. **AssignPartnersModal** (`components/AssignPartnersModal.jsx`)
   - List of available partners
   - Checkbox selection
   - Save/Cancel actions

5. **DeleteConfirmationModal** (`components/DeleteConfirmationModal.jsx`)
   - Warning message
   - Confirm/Cancel buttons

---

### 3. Partners Page (`src/admin/pages/users/partners/PartnersPage.jsx`)

Management interface for Partners.

#### Filter Bar
- Search input
- Status filter (All, Active, Inactive)

#### Table Columns

| Column | Type | Features |
|--------|------|----------|
| Name | Link | Clickable, opens details |
| Email | Text | - |
| Mobile | Text | - |
| Partner ID | Text | Unique identifier |
| Referral Code | Text | - |
| RM | Text | Assigned RM or "Unassigned" |
| Investors | Number | Count of referred investors |
| Total Commission | Currency | Formatted INR amount |
| Status | Badge | Active/Inactive |
| Actions | Dropdown | View Details, Edit, Assign RM |

---

### 4. Investors Page (`src/admin/pages/users/investors/InvestorsPage.jsx`)

Management interface for Investors.

#### Filter Bar
- Search input
- KYC Status filter (All, Verified, Pending, Rejected)

#### Table Columns

| Column | Type | Features |
|--------|------|----------|
| Name | Link | Clickable, opens details |
| Email | Text | - |
| Mobile | Text | - |
| Investor ID | Text | Unique identifier |
| Partner | Text | Referring partner or "Direct" |
| KYC Status | Badge | Verified/Pending/Rejected |
| Investments | Number | Count of investments |
| Total Invested | Currency | Formatted INR amount |
| Status | Badge | Active/Inactive |
| Actions | Dropdown | View Details, Edit |

---

### 5. Products Page (`src/admin/pages/products/ProductsPage.jsx`)

Product catalog management with dual view modes.

#### Page Header
- **Title:** "Products"
- **Description:** Product management context
- **View Toggle:** Grid / Table buttons

#### Grid View
Product cards displaying:
- Product name
- Status badge (Active/Inactive)
- Product type
- Investment range (Min - Max)
- Duration (months)
- Commission rate (%)
- Action buttons: View Details, Configure

#### Table View

| Column | Type |
|--------|------|
| Product Name | Link |
| Type | Text |
| Status | Badge |
| Min Investment | Currency |
| Max Investment | Currency |
| Duration (Months) | Number |
| Commission Rate | Percentage |
| Total Investments | Number |
| Total Volume | Currency |
| Actions | Dropdown |

---

### 6. Investments Page (`src/admin/pages/financial/investments/InvestmentsPage.jsx`)

Investment tracking and management.

#### Summary Cards (4 cards)

| Card | Data |
|------|------|
| Total Investments | Count + Total Amount |
| Active Investments | Count + Active Amount |
| Completed Investments | Count + Completed Amount |
| Pending Investments | Count + Pending Amount |

#### Filter Bar
- Search input
- Status filter (All, Pending, Active, Completed, Cancelled)

#### Table Columns

| Column | Type | Features |
|--------|------|----------|
| Investment ID | Monospace | Clickable |
| Investor | Link | Clickable investor name |
| Product | Link | Clickable product name |
| Amount | Currency | Formatted INR |
| Date | Date | Investment date |
| Status | Badge | Pending/Active/Completed/Cancelled |
| Expected Returns | Currency | Formatted INR |
| Next Payout | Date | Next payout date or "-" |
| Actions | Icon | View details |

---

### 7. Payouts Page (`src/admin/pages/financial/payouts/PayoutsPage.jsx`)

Payout processing and tracking.

#### Page Header
- **Title:** "Payouts"
- **Action Button:** "Upload Bank PDF"

#### Tabs
- Pending
- Processed
- All

#### Filter Bar
- Search input

#### Table Columns

| Column | Type | Features |
|--------|------|----------|
| Payout ID | Monospace | Clickable |
| Investor | Text | Investor name |
| Investment | Text | Investment ID + Product name |
| Amount | Currency | Formatted INR |
| Due Date | Date | Scheduled payout date |
| Status | Badge | Pending/Processed/Failed |
| CRN Number | Text | Bank reference or "-" |
| Processed Date | Date | Completion date or "-" |
| Actions | Icon | View details |

---

### 8. Commissions Page (`src/admin/pages/financial/commissions/CommissionsPage.jsx`)

Commission tracking and management.

#### Filter Bar
- Search input
- Status filter (All, Pending, Paid)

#### Table Columns

| Column | Type | Features |
|--------|------|----------|
| Commission ID | Monospace | Clickable |
| Partner | Text | Partner name |
| Investment | Text | Investment ID + Product name |
| Investor | Text | Investor name |
| Investment Amount | Currency | Formatted INR |
| Rate | Percentage | Commission rate % |
| Commission | Currency | Calculated commission amount |
| Status | Badge | Pending/Paid |
| Paid Date | Date | Payment date or "-" |
| Actions | Icon | View details |

---

### 9. KYC Page (`src/admin/pages/kyc/KYCPage.jsx`)

KYC verification workflow management.

#### Statistics Cards (4 cards)

| Card | Color | Data |
|------|-------|------|
| Pending | Orange | Pending verification count |
| Verified | Green | Verified count |
| Rejected | Red | Rejected count |
| Total | Blue | Total submissions |

#### Tabs
- Pending
- Verified
- Rejected
- All

#### Filter Bar
- Search input

#### Table Columns

| Column | Type | Features |
|--------|------|----------|
| User Name | Link | Clickable |
| Role | Badge | User role type |
| Email | Text | - |
| Submitted Date | Date | Submission timestamp |
| Status | Badge | Pending/Verified/Rejected |
| Documents | Text | Shows "5 documents" |
| Actions | Icons | View, Verify (pending only), Reject (pending only) |

**Action Icons:**
- 👁️ View (Eye icon) - View documents
- ✅ Verify (CheckCircle icon, green) - Approve KYC
- ❌ Reject (XCircle icon, red) - Reject KYC

---

### 10. Settings Page (`src/admin/pages/settings/SettingsPage.jsx`)

System configuration management.

#### Page Header
- **Title:** "System Configuration"

#### Tabs

**Tab 1: Payout Settings**
- Phase Configuration Cards (3 phases)
  - Phase 1, Phase 2, Phase 3
  - Each displays:
    - Investment Date Range
    - Payout Window
    - Edit button

**Tab 2: System Settings**

*General Settings Section:*
| Setting | Type |
|---------|------|
| Platform Name | Text input |
| Support Email | Email input |
| Support Phone | Phone input |
| Maintenance Mode | Toggle switch |

*Security Settings Section:*
| Setting | Type |
|---------|------|
| Session Timeout | Number input (minutes) |
| 2FA Required | Toggle switch |

**Tab 3: Templates**
- Placeholder section
- Document templates management (not yet implemented)

---

### 11. Audit Page (`src/admin/pages/audit/AuditPage.jsx`)

Audit trail and compliance logging.

#### Page Header
- **Title:** "Audit & Compliance"
- **Action Button:** "Export"

#### Filter Bar
- Search input

#### Table Columns

| Column | Type | Features |
|--------|------|----------|
| Timestamp | Date/Time | Formatted timestamp |
| User | Text | User who performed action |
| Role | Badge | User role |
| Action | Text | Action performed |
| Entity | Text | Affected entity type |
| Entity ID | Monospace | Entity identifier |
| Details | Text | Truncated JSON details |
| IP Address | Text | Source IP |
| Status | Badge | Success/Failed |

---

## Common Components

### PageHeader (`src/components/common/PageHeader.jsx`)

Reusable page header component.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| title | string | Page title (h1) |
| description | string | Optional description text |
| actionButton | ReactNode | Optional action button |

---

### FilterBar (`src/components/common/FilterBar.jsx`)

Reusable search and filter component.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| searchValue | string | Current search value |
| onSearchChange | function | Search change handler |
| filters | array | Filter configuration objects |
| onFilterChange | function | Filter change handler |
| onClearFilters | function | Clear all filters handler |

**Features:**
- Search input with search icon
- Dynamic filter dropdowns (Select components)
- Clear filters button

---

### MetricCard (`src/components/common/MetricCard.jsx`)

Dashboard metric display card.

**Props:**
| Prop | Type | Description |
|------|------|-------------|
| title | string | Card title |
| value | string/number | Main metric value |
| subtitle | string | Optional subtitle |
| icon | ReactNode | Icon component |
| color | string | Color variant |
| trend | object | Trend indicator (direction, percentage) |

**Color Variants:**
- blue, green, orange, purple, red, teal

---

### StatusBadge (`src/components/common/StatusBadge.jsx`)

Colored status indicator badge.

**Variants:**
| Status | Color |
|--------|-------|
| active | Green |
| inactive | Gray |
| pending | Yellow |
| verified | Green |
| rejected | Red |
| completed | Blue |
| cancelled | Gray |
| processed | Green |
| failed | Red |
| paid | Green |

---

### DataTable (`src/components/common/DataTable.jsx`)

Generic table component using TanStack Table.

**Features:**
- Column definitions
- Sorting support
- Filtering support
- Pagination controls
- Page size selector
- Row selection (optional)

---

### LoadingSpinner (`src/components/common/LoadingSpinner.jsx`)

Loading indicator component.

**Size Variants:**
- sm (small)
- default
- lg (large)

---

### scrollToTop (`src/components/common/scrollToTop.jsx`)

Utility component that scrolls to top on route change.

---

## UI Component Library

Located in `src/components/ui/`, built on Radix UI (shadcn/ui pattern):

| Component | File | Purpose |
|-----------|------|---------|
| Avatar | avatar.jsx | User avatars with fallback |
| Badge | badge.jsx | Status and label badges |
| Button | button.jsx | Clickable buttons with variants |
| Card | card.jsx | Container cards |
| Checkbox | checkbox.jsx | Checkbox inputs |
| Dialog | dialog.jsx | Modal dialogs |
| DropdownMenu | dropdown-menu.jsx | Dropdown menus |
| Input | input.jsx | Text inputs |
| Label | label.jsx | Form labels |
| ScrollArea | scroll-area.jsx | Scrollable containers |
| Select | select.jsx | Dropdown selects |
| Separator | separator.jsx | Visual separators |
| Skeleton | skeleton.jsx | Loading skeletons |
| Switch | switch.jsx | Toggle switches |
| Table | table.jsx | Table components |
| Tabs | tabs.jsx | Tab navigation |

---

## Styling System

### Tailwind CSS Configuration

**File:** `tailwind.config.js`

**Features:**
- CSS variable-based color system
- Dark mode support (class-based)
- Custom border radius values
- Chart color palette (5 colors)
- Tailwind Animate plugin

### Color System

Defined in `src/index.css` using CSS variables (HSL format):

| Variable | Purpose | Default Value |
|----------|---------|---------------|
| --primary | Primary brand color | #1890FF (Blue) |
| --success | Success states | #52C41A (Green) |
| --warning | Warning states | #FA8C16 (Orange) |
| --destructive | Error/danger states | #F5222D (Red) |
| --background | Page background | White |
| --foreground | Text color | Dark |
| --muted | Muted backgrounds | Light gray |
| --accent | Accent color | Light blue |
| --border | Border color | Gray |

### Theme Constants

**File:** `src/lib/theme.js`

Contains exported constants for:
- Color palette
- Spacing scale
- Border radius values
- Shadows
- Typography settings
- Layout constants:
  - Header height
  - Sidebar widths (expanded/collapsed)
  - Content max-width

### Custom Styles

- Custom scrollbar styling for sidebar
- Smooth transitions and animations
- Responsive breakpoints

---

## State Management

### Redux Toolkit Setup

**Store Configuration:** `src/global_redux/store/store.js`

**Provider:** `src/global_redux/provider/provider.jsx`

**Current Slices:**
- `counter` (example/placeholder)

**Note:** The Redux setup is ready for additional slices (auth, users, etc.) but currently only contains an example counter slice.

### Local State

Components primarily use React's built-in state management:
- `useState` for local component state
- `useEffect` for side effects and data fetching

---

## API Integration

### API Client (`src/lib/api/apiClient.js`)

Axios instance configuration:

**Features:**
- Base URL from environment variable (`VITE_API_BASE_URL`)
- Request interceptor: Adds Bearer token from localStorage
- Response interceptor: Handles errors, 401 redirects to login

### Endpoints (`src/lib/api/endpoints.js`)

Centralized endpoint definitions:

| Category | Endpoints |
|----------|-----------|
| Auth | login, logout, refresh |
| Users | RMs, Partners, Investors CRUD |
| Products | CRUD operations |
| Financial | Investments, Payouts, Commissions |
| KYC | Verification endpoints |
| Dashboard | Metrics, charts, activity |
| Settings | System configuration |
| Audit | Audit log retrieval |

### Services (`src/lib/api/services/`)

| Service | File | Purpose |
|---------|------|---------|
| Users | usersService.js | RM, Partner, Investor operations |
| Dashboard | dashboardService.js | Dashboard data |
| Financial | financialService.js | Investment, Payout, Commission data |
| KYC | kycService.js | KYC verification |
| Products | productsService.js | Product management |

**Note:** All services currently use mock data with simulated delays. They are ready to be replaced with real API calls.

---

## Data Visualization

### Recharts Library

Used for dashboard charts:

| Chart Type | Usage |
|------------|-------|
| LineChart | Investment trends, Commission trends |
| BarChart | User growth by type |
| PieChart | Investment distribution |

**Features:**
- Responsive containers
- Custom tooltips
- Interactive legends
- Currency formatting (INR)

---

## Form Handling

### React Hook Form + Zod

**Implementation:**
- Zod schemas for validation
- React Hook Form for form state
- Integration with UI components

**Currently Used In:**
- CreateRMModal - RM creation with validation
- EditRMModal - RM editing with validation

**Form Components Used:**
- Input
- Select
- Switch
- Label
- Button

---

## Notifications

### React Hot Toast

**Configuration (in App.jsx):**
- Position: bottom-right
- Duration: 5000ms
- Custom styling
- Success/Error icon themes

**Usage:**
```javascript
import toast from 'react-hot-toast';

toast.success('Operation successful');
toast.error('Operation failed');
```

---

## Mock Data

Located in `src/lib/mockData/`:

| File | Data |
|------|------|
| audit.js | Audit log entries |
| commissions.js | Commission records |
| dashboard.js | Dashboard metrics and chart data |
| investments.js | Investment records |
| kyc.js | KYC submissions |
| payouts.js | Payout records |
| products.js | Product catalog |
| users.js | RMs, Partners, Investors |
| index.js | Export aggregator |

---

## Current Limitations

### Not Yet Implemented

| Feature | Status |
|---------|--------|
| Authentication/Login screens | ❌ Not implemented |
| Real API integration | ❌ Using mock data |
| KYC document viewer modal | ❌ Placeholder only |
| Partner assignment functionality | ⚠️ UI ready, logic pending |
| PDF upload for payouts | ❌ Placeholder only |
| Export functionality | ❌ Placeholder only |
| Report generation | ❌ Not implemented |
| Template management | ❌ Placeholder only |
| Full pagination | ⚠️ DataTable component exists but not widely used |
| User profile editing | ❌ Not implemented |
| Password reset flow | ❌ Not implemented |
| Email notifications | ❌ Not implemented |
| Role-based access control | ❌ Not implemented |

### Known Technical Debt

1. Redux store has only example counter slice
2. Services return mock data instead of API calls
3. Some modals are UI-only without backend logic
4. No error boundary implementation
5. Limited loading state handling on some pages

---

## Currency Formatting

All currency values use Indian Rupee (INR) formatting:

```javascript
new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR'
}).format(amount)
```

---

## Date Formatting

Uses `date-fns` library:

```javascript
import { format } from 'date-fns';

format(date, 'dd MMM yyyy');      // "26 Jan 2026"
format(date, 'dd/MM/yyyy');       // "26/01/2026"
format(date, 'HH:mm:ss');         // "14:30:00"
```

---

## Browser Support

Modern browsers with ES6+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| VITE_API_BASE_URL | Backend API base URL |

---

*This documentation reflects the current state of the AdityaRaj Capital Admin Dashboard as of January 2026.*

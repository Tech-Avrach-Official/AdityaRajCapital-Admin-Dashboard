# Super Admin UI - Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Design Phase  
**Target Audience:** Frontend Developers, UI/UX Designers

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Overall Structure & Navigation](#overall-structure--navigation)
3. [Dashboard](#dashboard)
4. [User Management](#user-management)
5. [Product Management](#product-management)
6. [Financial Management](#financial-management)
7. [KYC Verification](#kyc-verification)
8. [System Configuration](#system-configuration)
9. [Audit & Compliance](#audit--compliance)
10. [Common Components](#common-components)
11. [Modals & Popups](#modals--popups)
12. [Forms & Inputs](#forms--inputs)
13. [Data Tables](#data-tables)
14. [Responsive Design](#responsive-design)
15. [User Flows](#user-flows)

---

## Executive Summary

### Purpose
This PRD defines the complete UI/UX structure, pages, components, modals, and interactions required for the Super Admin dashboard of the AdityaRaj Capital Investment Platform.

### Key Principles
- **Clean & Professional:** Financial platform aesthetic with trust-building design
- **Data-Driven:** Prominent display of metrics and analytics
- **Efficient Navigation:** Quick access to all management functions
- **Action-Oriented:** Clear CTAs and workflows for all operations
- **Responsive:** Works seamlessly on desktop, tablet, and large screens

### Technology Stack (Frontend)
- **Framework:** React/Next.js (recommended) or Vue.js
- **UI Library:** Ant Design, Tailwind CSS, or Shadcn/ui
- **Charts:** Chart.js, Recharts, or D3.js
- **Tables:** React Table, AG-Grid, or Ant Design Table
- **State Management:** Redux, Zustand, or Context API

---

## Overall Structure & Navigation

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Header (Top Bar)                                           │
│  [Logo] [Search] [Notifications] [Profile] [Logout]         │
├──────────┬──────────────────────────────────────────────────┤
│          │                                                   │
│ Sidebar  │  Main Content Area                               │
│ (Menu)   │  (Dynamic based on selected page)                │
│          │                                                   │
│          │                                                   │
│          │                                                   │
└──────────┴───────────────────────────────────────────────────┘
```

### Header (Top Bar)
**Components:**
- **Logo:** AdityaRaj Capital logo (left)
- **Search Bar:** Global search (center, optional)
- **Notifications Icon:** Bell icon with badge count (right)
- **Profile Dropdown:** Admin name/avatar with dropdown menu (right)
- **Logout Button:** Logout option in profile dropdown

**Features:**
- Sticky header (always visible)
- Height: 64px
- Background: White with subtle shadow
- Responsive: Collapses on mobile

### Sidebar Navigation

**Menu Structure:**
```
📊 Dashboard
👥 User Management
   ├─ Relationship Managers (RMs)
   ├─ Partners
   └─ Investors
📦 Products
💰 Financial Management
   ├─ Investments
   ├─ Payouts
   └─ Commissions
📄 KYC Verification
⚙️ System Configuration
📋 Audit & Compliance
```

**Sidebar Features:**
- Collapsible (can be minimized to icons only)
- Active state highlighting
- Submenu expansion/collapse
- Icon + Label for each menu item
- Width: 240px (expanded), 64px (collapsed)
- Sticky sidebar

### Main Content Area
- Dynamic content based on selected page
- Padding: 24px
- Max width: 1400px (centered)
- Scrollable when content exceeds viewport

---

## Dashboard

### Page: Dashboard (Home)

**URL:** `/dashboard` or `/`

**Purpose:** Overview of platform-wide statistics and key metrics

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard Header                                           │
│  "Platform Overview" + Date Range Filter                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Key Metrics Cards (4-6 cards in a row)                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                     │
│  │ Total│ │ Total │ │ Total │ │ Total │                     │
│  │Users │ │Invest │ │Invest │ │Revenue│                     │
│  └──────┘ └──────┘ └──────┘ └──────┘                     │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Charts Section (2 columns)                                  │
│  ┌──────────────────────┐ ┌──────────────────────┐        │
│  │ Investment Volume    │ │ User Growth           │        │
│  │ (Line Chart)        │ │ (Bar Chart)           │        │
│  └──────────────────────┘ └──────────────────────┘        │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Recent Activity / Quick Actions                            │
│  ┌──────────────────────┐ ┌──────────────────────┐        │
│  │ Pending KYC          │ │ Recent Investments   │        │
│  │ (List)               │ │ (List)               │        │
│  └──────────────────────┘ └──────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

**Key Metrics Cards:**
1. **Total Users**
   - Count: All users (RM + Partner + Investor)
   - Trend: % change from last period
   - Icon: Users icon
   - Color: Blue

2. **Total Investments**
   - Count: Total number of investments
   - Amount: Total investment volume (₹)
   - Trend: % change
   - Icon: Investment icon
   - Color: Green

3. **Active Investments**
   - Count: Currently active investments
   - Amount: Active investment volume (₹)
   - Trend: % change
   - Icon: Active icon
   - Color: Orange

4. **Total Revenue**
   - Amount: Total revenue (₹)
   - Trend: % change
   - Icon: Revenue icon
   - Color: Purple

5. **Pending KYC**
   - Count: Pending KYC verifications
   - Link: Navigate to KYC page
   - Icon: Document icon
   - Color: Red (if > 0)

6. **Commission Payouts**
   - Amount: Total commission paid (₹)
   - Trend: % change
   - Icon: Commission icon
   - Color: Teal

**Charts:**
1. **Investment Volume Trend**
   - Type: Line chart
   - X-axis: Date (last 30 days, 3 months, 6 months, 1 year)
   - Y-axis: Amount (₹)
   - Interactive: Hover to see exact values
   - Filter: Date range selector

2. **User Growth**
   - Type: Bar chart or Line chart
   - X-axis: Date (monthly)
   - Y-axis: User count
   - Breakdown: By role (RM, Partner, Investor)
   - Interactive: Toggle between roles

3. **Investment Distribution**
   - Type: Pie chart or Donut chart
   - Segments: By product type
   - Shows: Percentage and amount

4. **Commission Trends**
   - Type: Line chart
   - X-axis: Date
   - Y-axis: Commission amount (₹)
   - Shows: Commission paid over time

**Recent Activity Sections:**
1. **Pending KYC Verifications**
   - List of 5-10 most recent pending KYC
   - Columns: User name, Role, Submitted date, Status badge
   - Action: "View All" button → Navigate to KYC page
   - Action: Click row → Open KYC detail modal

2. **Recent Investments**
   - List of 5-10 most recent investments
   - Columns: Investor name, Product, Amount, Date, Status
   - Action: "View All" button → Navigate to Investments page
   - Action: Click row → Open investment detail modal

3. **System Alerts** (Optional)
   - Critical system notifications
   - Low balance alerts
   - Failed transactions
   - System health warnings

**Quick Actions:**
- Button: "Upload Payout PDF" → Opens upload modal
- Button: "View Reports" → Navigate to reports section
- Button: "Configure Commission" → Navigate to products page

**Features:**
- Real-time data updates (refresh every 30 seconds or manual refresh)
- Date range filter (Last 7 days, 30 days, 3 months, 6 months, 1 year, Custom)
- Export dashboard data (PDF/Excel)
- Print dashboard option

---

## User Management

### Section: User Management

**Main Page:** `/users`

**Sub-sections:**
- Relationship Managers (RMs): `/users/rms`
- Partners: `/users/partners`
- Investors: `/users/investors`
- All Users: `/users/all`

### Page: Relationship Managers (RMs)

**URL:** `/users/rms`

**Purpose:** Manage RM accounts, view RM details, assign Partners

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  "Relationship Managers" + "Create RM" Button              │
├─────────────────────────────────────────────────────────────┤
│  Filters & Search                                          │
│  [Search] [Status Filter] [Date Range] [Export]            │
├─────────────────────────────────────────────────────────────┤
│  RM List Table                                             │
│  [Table with columns: Name, Email, Mobile, Referral Code,  │
│   Partners Count, Status, Actions]                         │
└─────────────────────────────────────────────────────────────┘
```

**Table Columns:**
1. **Name:** RM full name (clickable → View details)
2. **Email:** Email address
3. **Mobile:** Mobile number
4. **Referral Code:** System-generated code (copy button)
5. **Partners Count:** Number of Partners under RM (clickable → View Partners)
6. **Total Investors:** Total investors under all Partners
7. **Status:** Active/Inactive badge
8. **Created Date:** Account creation date
9. **Actions:** View, Edit, Delete, Assign Partners

**Filters:**
- **Search:** By name, email, mobile, referral code
- **Status:** All, Active, Inactive
- **Date Range:** Created date filter
- **Sort:** By name, created date, partners count

**Actions:**
- **Create RM:** Opens "Create RM" modal
- **View:** Opens "RM Details" modal/page
- **Edit:** Opens "Edit RM" modal
- **Delete:** Opens "Delete Confirmation" modal
- **Assign Partners:** Opens "Assign Partners" modal

**RM Details View/Modal:**
- **Basic Information:**
  - Full Name
  - Email
  - Mobile
  - Referral Code (with copy button)
  - Status
  - Created Date
  - Last Login

- **Partner List:**
  - Table of all Partners under this RM
  - Columns: Partner name, Email, Investors count, Status
  - Action: Remove Partner from RM

- **Statistics:**
  - Total Partners
  - Total Investors
  - Total Investment Volume
  - Performance metrics

**Create RM Modal:**
- Form fields:
  - Full Name* (text input)
  - Email* (email input)
  - Mobile* (phone input)
  - Password* (password input with show/hide)
  - Confirm Password* (password input)
  - Status (Active/Inactive toggle)
- Note: "Referral code will be generated automatically"
- Actions: Cancel, Create
- Validation: Email format, mobile format, password strength

**Edit RM Modal:**
- Same fields as Create (except password)
- Optional: Change password section
- Actions: Cancel, Save Changes

**Assign Partners Modal:**
- Search/Filter Partners
- List of available Partners (not assigned to any RM)
- Checkbox selection
- Selected count display
- Actions: Cancel, Assign Selected

### Page: Partners

**URL:** `/users/partners`

**Purpose:** View and manage Partner accounts

**Layout:** Similar to RM page

**Table Columns:**
1. **Name:** Partner full name
2. **Email:** Email address
3. **Mobile:** Mobile number
4. **Partner ID:** System-generated ID
5. **Referral Code:** Partner referral code
6. **RM:** Assigned RM name (if any, clickable)
7. **Investors Count:** Number of referred investors
8. **Total Commission:** Total commission earned (₹)
9. **Status:** Active/Inactive badge
10. **Actions:** View, Edit, Assign RM, Delete

**Filters:**
- Search: By name, email, mobile, Partner ID, referral code
- Status: All, Active, Inactive
- RM Filter: Filter by assigned RM
- Commission Range: Filter by commission earned

**Partner Details View/Modal:**
- **Basic Information:**
  - Full Name
  - Email
  - Mobile
  - Partner ID
  - Referral Code
  - RM (if assigned)
  - Status
  - KYC Status
  - Created Date

- **Investor List:**
  - Table of all referred investors
  - Columns: Investor name, Email, Investments count, Total invested

- **Commission Details:**
  - Total Commission Earned
  - Pending Commission
  - Commission History (table)

- **Performance Metrics:**
  - Total Investors
  - Total Investment Volume
  - Average Investment per Investor

**Assign RM Modal:**
- Current RM display (if any)
- Search/Select RM dropdown
- List of available RMs
- Actions: Cancel, Assign, Remove (if already assigned)

### Page: Investors

**URL:** `/users/investors`

**Purpose:** View all investors and their details

**Layout:** Similar to Partners page

**Table Columns:**
1. **Name:** Investor full name
2. **Email:** Email address
3. **Mobile:** Mobile number
4. **Investor ID:** System-generated ID
5. **Partner:** Referred by Partner name (if any)
6. **KYC Status:** Verified/Pending/Rejected badge
7. **Total Investments:** Number of investments
8. **Total Invested:** Total amount invested (₹)
9. **Status:** Active/Inactive badge
10. **Actions:** View, Edit, Delete

**Filters:**
- Search: By name, email, mobile, Investor ID
- KYC Status: All, Verified, Pending, Rejected
- Partner Filter: Filter by referring Partner
- Investment Range: Filter by investment amount

**Investor Details View/Modal:**
- **Basic Information:**
  - Full Name
  - Email
  - Mobile
  - Investor ID
  - Partner (if referred)
  - KYC Status
  - Status
  - Created Date

- **Investment List:**
  - Table of all investments
  - Columns: Product name, Amount, Date, Status, Returns

- **Transaction History:**
  - Table of all transactions
  - Columns: Type, Amount, Date, Status

---

## Product Management

### Page: Products

**URL:** `/products`

**Purpose:** View all products, configure commission rates

**Important Note:** Products are static/pre-configured. Admin can only VIEW products and CONFIGURE commission rates. Cannot create, edit, or delete products.

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  "Investment Products" + Info: "Products are pre-configured"│
├─────────────────────────────────────────────────────────────┤
│  Filters & Search                                          │
│  [Search] [Status Filter] [Type Filter]                    │
├─────────────────────────────────────────────────────────────┤
│  Product Cards/Table                                        │
│  [Grid or Table view toggle]                               │
└─────────────────────────────────────────────────────────────┘
```

**View Options:**
- **Grid View:** Card-based layout (default)
- **Table View:** List-based layout
- Toggle button to switch between views

**Product Card (Grid View):**
```
┌─────────────────────────────┐
│  Product Name               │
│  [Status Badge]             │
├─────────────────────────────┤
│  Type: [Return Structure]   │
│  Min Investment: ₹X,XX,XXX  │
│  Max Investment: ₹X,XX,XXX  │
│  Duration: X months         │
│  Commission Rate: X%        │
│                             │
│  [View Details] [Configure] │
└─────────────────────────────┘
```

**Product Table (Table View):**
**Columns:**
1. **Product Name:** Product name (clickable)
2. **Type:** Return structure (Installment/Hybrid/Lump-sum)
3. **Status:** Active/Inactive/Archived badge
4. **Min Investment:** Minimum amount (₹)
5. **Max Investment:** Maximum amount (₹)
6. **Duration:** Investment period (months)
7. **Commission Rate:** Current rate (%) (editable)
8. **Total Investments:** Count of investments
9. **Total Volume:** Total investment volume (₹)
10. **Actions:** View Details, Configure Commission

**Filters:**
- **Search:** By product name
- **Status:** All, Active, Inactive, Archived
- **Type:** All, Installment, Hybrid, Lump-sum
- **Sort:** By name, commission rate, total volume

**Product Details Modal/Page:**
- **Product Information:**
  - Product Name
  - Product ID
  - Return Structure Type
  - Status
  - Description

- **Investment Details:**
  - Minimum Investment Amount
  - Maximum Investment Amount
  - Duration (months)
  - Return Structure Details
    - For Installment: Monthly return %
    - For Hybrid: Split details
    - For Lump-sum: Maturity return

- **Commission Configuration:**
  - Current Commission Rate (%)
  - Edit button (triggers 2FA)
  - Commission History (table)

- **Performance Metrics:**
  - Total Investments
  - Total Investment Volume
  - Average Investment Amount
  - Active Investments Count

- **Investment List:**
  - Table of all investments in this product
  - Columns: Investor name, Amount, Date, Status

**Configure Commission Modal:**
- **2FA Verification Required:**
  - Step 1: Enter current commission rate
  - Step 2: Enter new commission rate
  - Step 3: 2FA verification (TOTP/SMS/Email)
  - Step 4: Confirm changes

- **Form Fields:**
  - Current Rate: Display only
  - New Rate: Number input (0-100, with %)
  - Reason/Comment: Text area (optional)
  - 2FA Code: Input field

- **Actions:** Cancel, Verify & Update

**Features:**
- Commission rate change history
- Audit trail for all commission changes
- Warning message before changing rates
- Confirmation after successful update

---

## Financial Management

### Section: Financial Management

**Main Page:** `/financial`

**Sub-sections:**
- Investments: `/financial/investments`
- Payouts: `/financial/payouts`
- Commissions: `/financial/commissions`

### Page: Investments

**URL:** `/financial/investments`

**Purpose:** View all investments across the platform

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  "All Investments" + Summary Cards                            │
├─────────────────────────────────────────────────────────────┤
│  Filters & Search                                          │
│  [Search] [Status] [Product] [Date Range] [Export]        │
├─────────────────────────────────────────────────────────────┤
│  Investments Table                                         │
└─────────────────────────────────────────────────────────────┘
```

**Summary Cards (Top):**
1. **Total Investments:** Count + Amount (₹)
2. **Active Investments:** Count + Amount (₹)
3. **Completed Investments:** Count + Amount (₹)
4. **Pending Investments:** Count + Amount (₹)

**Table Columns:**
1. **Investment ID:** Unique ID (clickable)
2. **Investor:** Investor name (clickable)
3. **Product:** Product name (clickable)
4. **Amount:** Investment amount (₹)
5. **Date:** Investment date
6. **Status:** Pending/Active/Completed/Cancelled badge
7. **Returns:** Expected/Actual returns (₹)
8. **Next Payout:** Next payout date
9. **Actions:** View Details

**Filters:**
- **Search:** By Investment ID, Investor name, Product name
- **Status:** All, Pending, Active, Completed, Cancelled
- **Product:** Filter by product
- **Date Range:** Investment date filter
- **Amount Range:** Filter by investment amount

**Investment Details Modal/Page:**
- **Investment Information:**
  - Investment ID
  - Investor Details (name, email, mobile)
  - Product Details (name, type, duration)
  - Investment Amount
  - Investment Date
  - Status
  - Plan ID

- **Returns Information:**
  - Expected Returns
  - Returns Structure
  - Payout Schedule (table)
  - Payout History (table)

- **Transaction Details:**
  - Payment Method
  - Transaction ID
  - Payment Date
  - Payment Status

- **Documents:**
  - Signed Deed (download link)
  - Related Documents

### Page: Payouts

**URL:** `/financial/payouts`

**Purpose:** Manage investor payouts, upload bank PDFs, reconcile payouts

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  "Payout Management" + "Upload Bank PDF" Button             │
├─────────────────────────────────────────────────────────────┤
│  Tabs: [Pending] [Processed] [All]                         │
├─────────────────────────────────────────────────────────────┤
│  Filters & Search                                          │
│  [Search] [Date Range] [Status] [Export]                   │
├─────────────────────────────────────────────────────────────┤
│  Payouts Table                                            │
└─────────────────────────────────────────────────────────────┘
```

**Tabs:**
- **Pending:** Payouts awaiting processing
- **Processed:** Completed payouts
- **All:** All payouts

**Table Columns:**
1. **Payout ID:** Unique ID
2. **Investor:** Investor name
3. **Investment:** Investment ID + Product name
4. **Amount:** Payout amount (₹)
5. **Due Date:** Expected payout date
6. **Status:** Pending/Processed/Failed badge
7. **CRN Number:** CRN from bank PDF (if processed)
8. **Processed Date:** Actual payout date
9. **Actions:** View Details, Mark as Processed

**Upload Bank PDF Modal:**
- **Upload Section:**
  - File upload area (drag & drop or click to upload)
  - Supported formats: PDF
  - Max file size: 10MB
  - Upload progress indicator

- **Processing Status:**
  - "Processing PDF..." indicator
  - Extracted data preview (after processing)

- **Extracted Data:**
  - CRN Numbers (table)
  - Account Details
  - Amounts Paid
  - Dates

- **Matching Results:**
  - Auto-matched payouts (table)
  - Unmatched entries (table)
  - Manual matching option

- **Actions:**
  - Cancel
  - Process & Match
  - Download Extraction Report

**Payout Details Modal/Page:**
- **Payout Information:**
  - Payout ID
  - Investor Details
  - Investment Details
  - Amount
  - Due Date
  - Status
  - CRN Number (if processed)

- **Transaction Details:**
  - Bank Account
  - Transaction Date
  - Transaction ID
  - Payment Method

- **History:**
  - Status change history
  - Processing notes

### Page: Commissions

**URL:** `/financial/commissions`

**Purpose:** View and manage commission payouts to Partners

**Layout:** Similar to Payouts page

**Table Columns:**
1. **Commission ID:** Unique ID
2. **Partner:** Partner name
3. **Investment:** Investment ID + Product
4. **Investor:** Investor name
5. **Investment Amount:** Amount (₹)
6. **Commission Rate:** Rate (%)
7. **Commission Amount:** Commission (₹)
8. **Status:** Pending/Paid badge
9. **Paid Date:** Payment date (if paid)
10. **Actions:** View Details

**Filters:**
- **Search:** By Commission ID, Partner name, Investment ID
- **Status:** All, Pending, Paid
- **Partner:** Filter by Partner
- **Date Range:** Commission date filter

**Commission Details Modal/Page:**
- **Commission Information:**
  - Commission ID
  - Partner Details
  - Investment Details
  - Investor Details
  - Commission Rate
  - Commission Amount
  - Status
  - Paid Date

- **Payment Details:**
  - Payment Method
  - Transaction ID
  - Payment Date

---

## KYC Verification

### Page: KYC Verification

**URL:** `/kyc`

**Purpose:** Review and verify KYC documents for Investors and Partners

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  "KYC Verification" + Stats                                │
├─────────────────────────────────────────────────────────────┤
│  Tabs: [Pending] [Verified] [Rejected] [All]              │
├─────────────────────────────────────────────────────────────┤
│  Filters & Search                                          │
│  [Search] [Role] [Date Range]                              │
├─────────────────────────────────────────────────────────────┤
│  KYC List Table                                            │
└─────────────────────────────────────────────────────────────┘
```

**Stats Cards:**
1. **Pending:** Count of pending KYC
2. **Verified:** Count of verified KYC
3. **Rejected:** Count of rejected KYC
4. **Total:** Total KYC submissions

**Tabs:**
- **Pending:** KYC awaiting verification
- **Verified:** Approved KYC
- **Rejected:** Rejected KYC
- **All:** All KYC submissions

**Table Columns:**
1. **User Name:** Name (clickable)
2. **Role:** Investor/Partner badge
3. **Email:** Email address
4. **Submitted Date:** KYC submission date
5. **Status:** Pending/Verified/Rejected badge
6. **Documents:** Document count badge
7. **Actions:** Review, View Details

**KYC Review Modal/Page:**
- **User Information:**
  - Name
  - Email
  - Mobile
  - Role
  - Submitted Date

- **Document Viewer:**
  - **Aadhaar Front:** Image viewer with zoom
  - **Aadhaar Back:** Image viewer with zoom
  - **PAN Card:** Image viewer with zoom
  - **Cancelled Cheque:** Image viewer with zoom
  - **Nominee Documents:** Image viewer with zoom

- **Extracted Data:**
  - **Aadhaar Data:**
    - Name
    - Aadhaar Number
    - DOB
    - Address
  - **PAN Data:**
    - Name
    - PAN Number
  - **Bank Details:**
    - Account Number
    - IFSC Code
    - Bank Name
  - **Nominee Data:**
    - Name
    - Aadhaar Number
    - DOB
    - Relation

- **Verification Actions:**
  - **Approve Button:** Green, with confirmation
  - **Reject Button:** Red, with reason input
  - **Request Resubmission:** Option to request specific documents

**Reject KYC Modal:**
- **Reason for Rejection:**
  - Dropdown: Pre-defined reasons
  - Custom reason: Text area
  - Required field

- **Actions:**
  - Cancel
  - Confirm Rejection

**Features:**
- Document zoom and pan
- Side-by-side comparison (extracted data vs documents)
- OCR confidence indicators
- Download documents option
- Print verification report

---

## System Configuration

### Page: System Configuration

**URL:** `/settings` or `/configuration`

**Purpose:** Configure system settings, payout phases, document templates

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  "System Configuration"                                     │
├─────────────────────────────────────────────────────────────┤
│  Tabs: [Payout Settings] [System Settings] [Templates]      │
├─────────────────────────────────────────────────────────────┤
│  Configuration Forms                                       │
└─────────────────────────────────────────────────────────────┘
```

**Tabs:**
1. **Payout Settings**
2. **System Settings**
3. **Document Templates**

### Tab: Payout Settings

**Payout Phase Configuration:**
- **Phase 1 (1-10):**
  - Investment Date Range: 1-10
  - Payout Window: 11-20 (same/next month)
  - Edit button

- **Phase 2 (11-20):**
  - Investment Date Range: 11-20
  - Payout Window: 21-30 (same/next month)
  - Edit button

- **Phase 3 (21-30):**
  - Investment Date Range: 21-30
  - Payout Window: 1-10 (next month)
  - Edit button

**Edit Payout Phase Modal:**
- Form fields:
  - Investment Date Range: Read-only
  - Payout Window Start: Number input (1-31)
  - Payout Window End: Number input (1-31)
  - Month Offset: Dropdown (Same month/Next month)
- Actions: Cancel, Save

### Tab: System Settings

**General Settings:**
- Platform Name
- Support Email
- Support Phone
- Maintenance Mode Toggle
- System Status Indicators

**Security Settings:**
- Session Timeout (minutes)
- Password Policy
- 2FA Settings
- Rate Limiting Settings

### Tab: Document Templates

**Deed Template Management:**
- List of deed templates
- Upload new template
- Edit existing template
- Preview template
- Download template

**Template Editor:**
- Rich text editor
- Variable placeholders (e.g., {{investor_name}}, {{product_name}})
- Preview mode
- Save/Cancel actions

---

## Audit & Compliance

### Page: Audit Trail

**URL:** `/audit`

**Purpose:** View complete audit trail of all system actions

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  "Audit Trail" + Export Button                             │
├─────────────────────────────────────────────────────────────┤
│  Filters & Search                                          │
│  [Search] [User] [Action Type] [Date Range] [Export]      │
├─────────────────────────────────────────────────────────────┤
│  Audit Log Table                                           │
└─────────────────────────────────────────────────────────────┘
```

**Table Columns:**
1. **Timestamp:** Date and time
2. **User:** User who performed action
3. **Role:** User role
4. **Action:** Action type (Create, Update, Delete, etc.)
5. **Entity:** Entity type (User, Product, Investment, etc.)
6. **Entity ID:** ID of affected entity
7. **Details:** Action details (JSON or formatted)
8. **IP Address:** User IP
9. **Status:** Success/Failed badge

**Filters:**
- **Search:** By user, action, entity
- **User:** Filter by user
- **Action Type:** Filter by action type
- **Entity Type:** Filter by entity type
- **Date Range:** Filter by timestamp
- **Status:** Success/Failed

**Features:**
- Export to CSV/Excel
- Export to PDF
- Real-time updates (optional)
- Detailed view modal for each log entry

---

## Common Components

### Buttons

**Primary Button:**
- Background: Primary color (blue)
- Text: White
- Padding: 12px 24px
- Border radius: 4px
- Hover: Darker shade
- Disabled: Gray, no interaction

**Secondary Button:**
- Background: Transparent
- Border: 1px solid primary color
- Text: Primary color
- Padding: 12px 24px
- Border radius: 4px

**Danger Button:**
- Background: Red
- Text: White
- Used for delete/destructive actions

**Icon Buttons:**
- Circular/square with icon only
- Tooltip on hover

### Badges

**Status Badges:**
- **Active:** Green background, white text
- **Inactive:** Gray background, white text
- **Pending:** Yellow/Orange background, white text
- **Verified:** Green background, white text
- **Rejected:** Red background, white text
- **Completed:** Blue background, white text
- **Cancelled:** Red background, white text

**Count Badges:**
- Small circular badge
- Red background, white text
- Positioned on top-right of icon

### Cards

**Metric Card:**
- White background
- Shadow: Subtle
- Padding: 24px
- Border radius: 8px
- Icon + Value + Label + Trend indicator

**Info Card:**
- Similar to metric card
- Used for displaying information sections

### Modals

**Standard Modal:**
- Width: 600px (default), 800px (large), 400px (small)
- Centered on screen
- Backdrop: Semi-transparent overlay
- Close button: Top-right X
- Footer: Action buttons (Cancel, Confirm)

**Full-Screen Modal:**
- Takes full viewport
- Used for complex forms or document viewers

### Loading States

**Spinner:**
- Circular spinner
- Centered
- Used during API calls

**Skeleton Loaders:**
- Placeholder content
- Shimmer effect
- Used while loading data

### Empty States

**No Data:**
- Icon
- Message: "No data available"
- Optional: Action button

**Error State:**
- Error icon
- Error message
- Retry button

---

## Modals & Popups

### 1. Create RM Modal
**Trigger:** "Create RM" button  
**Size:** Medium (600px)  
**Content:** Create RM form (see User Management section)

### 2. Edit RM Modal
**Trigger:** "Edit" action in RM table  
**Size:** Medium (600px)  
**Content:** Edit RM form

### 3. Delete Confirmation Modal
**Trigger:** "Delete" action  
**Size:** Small (400px)  
**Content:**
- Warning message
- Entity name
- Confirmation checkbox: "I understand this action cannot be undone"
- Actions: Cancel, Delete

### 4. Assign Partners Modal
**Trigger:** "Assign Partners" action  
**Size:** Large (800px)  
**Content:** Partner selection interface (see User Management section)

### 5. Configure Commission Modal
**Trigger:** "Configure Commission" action  
**Size:** Medium (600px)  
**Content:** Commission configuration with 2FA (see Product Management section)

### 6. Upload Bank PDF Modal
**Trigger:** "Upload Bank PDF" button  
**Size:** Large (900px)  
**Content:** PDF upload and processing interface (see Financial Management section)

### 7. KYC Review Modal
**Trigger:** "Review" action in KYC table  
**Size:** Full-screen or Large (1200px)  
**Content:** Document viewer and verification interface (see KYC Verification section)

### 8. Reject KYC Modal
**Trigger:** "Reject" button in KYC Review  
**Size:** Medium (500px)  
**Content:** Rejection reason form

### 9. Investment Details Modal
**Trigger:** Click on investment row  
**Size:** Large (900px)  
**Content:** Investment details (see Financial Management section)

### 10. Payout Details Modal
**Trigger:** Click on payout row  
**Size:** Medium (700px)  
**Content:** Payout details

### 11. User Details Modal
**Trigger:** Click on user row  
**Size:** Large (900px)  
**Content:** User details with tabs (Info, Investments, Transactions, etc.)

### 12. Product Details Modal
**Trigger:** Click on product card/row  
**Size:** Large (900px)  
**Content:** Product details (see Product Management section)

### 13. 2FA Verification Modal
**Trigger:** Before critical actions (commission change)  
**Size:** Small (400px)  
**Content:**
- Action description
- 2FA code input
- Resend code button
- Actions: Cancel, Verify

### 14. Export Data Modal
**Trigger:** "Export" button  
**Size:** Small (400px)  
**Content:**
- Format selection: CSV, Excel, PDF
- Date range (if applicable)
- Actions: Cancel, Export

### 15. Filter Modal (Mobile)
**Trigger:** "Filters" button (mobile view)  
**Size:** Bottom sheet or Full-screen  
**Content:** All filter options

---

## Forms & Inputs

### Text Input
- Label above input
- Placeholder text
- Error message below (if invalid)
- Required indicator (*)
- Helper text (optional)

### Email Input
- Email validation
- Auto-format

### Phone Input
- Country code selector (if needed)
- Phone number format validation

### Password Input
- Show/hide toggle
- Strength indicator (optional)
- Requirements list (optional)

### Number Input
- Min/max validation
- Step increment
- Currency format (for amounts)

### Date Picker
- Calendar popup
- Date range selection
- Format: DD/MM/YYYY or MM/DD/YYYY

### Dropdown/Select
- Searchable (if many options)
- Multi-select option (if needed)
- Placeholder: "Select..."

### Textarea
- Resizable
- Character count (if max length)

### Toggle/Switch
- On/Off states
- Label next to toggle

### Checkbox
- Single or multiple selection
- Label next to checkbox

### Radio Buttons
- Single selection from group
- Label next to radio

### File Upload
- Drag & drop area
- Click to browse
- File type validation
- File size validation
- Progress indicator
- Preview (for images)

### Form Validation
- Real-time validation
- Error messages below fields
- Submit button disabled until valid
- Success message after submission

---

## Data Tables

### Table Features

**Sorting:**
- Click column header to sort
- Ascending/Descending indicator
- Multi-column sorting (optional)

**Pagination:**
- Page size selector: 10, 25, 50, 100
- Page numbers
- Previous/Next buttons
- Total count display

**Row Actions:**
- Actions dropdown menu
- Inline action buttons
- Row selection checkbox

**Responsive:**
- Horizontal scroll on mobile
- Stack columns on mobile (optional)
- Hide less important columns on mobile

**Export:**
- Export button in table header
- Export visible data or all data
- Formats: CSV, Excel, PDF

**Bulk Actions:**
- Select all checkbox
- Bulk action dropdown
- Selected count display

**Table Styling:**
- Alternating row colors
- Hover highlight
- Border between rows
- Sticky header (optional)

---

## Responsive Design

### Breakpoints

- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

### Mobile Adaptations

**Header:**
- Logo + Menu icon (hamburger)
- Sidebar becomes drawer/modal
- Search bar collapses to icon

**Sidebar:**
- Hidden by default
- Opens as drawer from left
- Overlay backdrop
- Close button

**Tables:**
- Horizontal scroll
- Or stack columns vertically
- Hide less important columns

**Cards:**
- Stack vertically
- Full width

**Modals:**
- Full-screen on mobile
- Bottom sheet style (optional)

**Filters:**
- Collapsible section
- Or separate modal/page

### Tablet Adaptations

- Sidebar can be collapsible
- Tables show more columns
- Cards in 2 columns

---

## User Flows

### Flow 1: Create RM Account

1. Navigate to `/users/rms`
2. Click "Create RM" button
3. Fill Create RM form
4. Click "Create" button
5. Success message: "RM account created successfully"
6. Redirect to RM details or stay on list
7. New RM appears in table

### Flow 2: Configure Commission Rate

1. Navigate to `/products`
2. Click "Configure" on product card/row
3. Configure Commission modal opens
4. Enter new commission rate
5. Click "Update" button
6. 2FA Verification modal opens
7. Enter 2FA code
8. Click "Verify & Update"
9. Success message: "Commission rate updated successfully"
10. Modal closes, table refreshes

### Flow 3: Upload Bank PDF for Payout Reconciliation

1. Navigate to `/financial/payouts`
2. Click "Upload Bank PDF" button
3. Upload modal opens
4. Drag & drop or select PDF file
5. File uploads, processing indicator shows
6. Extracted data displays
7. Review matched payouts
8. Click "Process & Match"
9. Success message: "X payouts processed successfully"
10. Payouts table updates with new statuses

### Flow 4: Verify KYC

1. Navigate to `/kyc`
2. Click on pending KYC row
3. KYC Review modal/page opens
4. Review documents (zoom, pan)
5. Review extracted data
6. Click "Approve" or "Reject"
7. If Reject: Enter reason, confirm
8. Success message: "KYC [approved/rejected] successfully"
9. KYC status updates in table

### Flow 5: Assign Partner to RM

1. Navigate to `/users/partners`
2. Click "Assign RM" on Partner row
3. Assign RM modal opens
4. Search/Select RM
5. Click "Assign"
6. Success message: "Partner assigned to RM successfully"
7. Partner table updates

---

## Design Guidelines

### Color Palette

**Primary Colors:**
- Primary: Blue (#1890FF or similar)
- Secondary: Teal/Green
- Success: Green (#52C41A)
- Warning: Orange (#FA8C16)
- Error: Red (#F5222D)
- Info: Blue (#1890FF)

**Neutral Colors:**
- Text Primary: #262626
- Text Secondary: #595959
- Border: #D9D9D9
- Background: #FAFAFA
- White: #FFFFFF

### Typography

**Font Family:**
- Primary: System fonts (Arial, Helvetica, sans-serif)
- Or: Google Fonts (Inter, Roboto)

**Font Sizes:**
- H1: 32px
- H2: 24px
- H3: 20px
- H4: 16px
- Body: 14px
- Small: 12px
- Caption: 10px

**Font Weights:**
- Regular: 400
- Medium: 500
- Semi-bold: 600
- Bold: 700

### Spacing

**Grid System:**
- 8px base unit
- Padding: 8px, 16px, 24px, 32px
- Margin: 8px, 16px, 24px, 32px
- Gap between elements: 16px, 24px

### Shadows

- Card shadow: 0 2px 8px rgba(0,0,0,0.1)
- Modal shadow: 0 4px 16px rgba(0,0,0,0.2)
- Hover shadow: 0 4px 12px rgba(0,0,0,0.15)

### Border Radius

- Small: 4px
- Medium: 8px
- Large: 12px
- Circular: 50%

### Icons

- Icon library: Lucide React, Font Awesome, Ant Design Icons, or Heroicons
- Size: 16px, 20px, 24px
- Color: Inherit from text color or use primary color

---

## Performance Requirements

### Loading Times

- Initial page load: < 2 seconds
- API response: < 500ms
- Table rendering: < 1 second (for 100 rows)
- Modal open: < 200ms

### Optimization

- Lazy load images
- Virtual scrolling for large tables
- Pagination for data tables
- Debounce search inputs
- Cache API responses
- Code splitting for routes

---

## Accessibility

### Requirements

- **Keyboard Navigation:** All interactive elements accessible via keyboard
- **Screen Readers:** Proper ARIA labels
- **Color Contrast:** WCAG AA compliance (4.5:1 for text)
- **Focus Indicators:** Visible focus states
- **Alt Text:** Images have alt text
- **Form Labels:** All inputs have labels

---

## Testing Requirements

### Functional Testing

- All user flows work correctly
- Forms validate properly
- Modals open/close correctly
- Tables sort/filter correctly
- Pagination works
- Export functions work

### UI Testing

- Responsive design works on all breakpoints
- Modals display correctly
- Tables render properly
- Forms are accessible
- Buttons are clickable

### Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Future Enhancements

### Phase 2 Features

- Real-time notifications
- Advanced analytics dashboard
- Custom report builder
- Bulk operations
- Advanced search
- Saved filters
- User activity timeline
- System health monitoring dashboard

---

## Appendix

### API Endpoints Reference

(To be added - reference to backend API documentation)

### Component Library

(To be added - specific component library documentation)

### Design Mockups

(To be added - links to Figma/Design files)

---

**Document Version:** 1.0  
**Last Updated:** [Current Date]  
**Status:** Ready for Design & Development  
**Next Steps:** Create design mockups, set up component library, begin development

---

*This PRD is a living document and will be updated as requirements evolve.*

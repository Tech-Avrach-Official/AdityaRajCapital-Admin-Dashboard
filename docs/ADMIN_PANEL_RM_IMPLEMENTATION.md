# Admin Panel - RM Module Implementation Guide

> **Last Updated:** January 25, 2026  
> **Backend Status:** ✅ Complete  
> **Frontend Status:** ⏳ Needs Implementation

---

## Table of Contents

1. [Overview](#1-overview)
2. [File Structure](#2-file-structure)
3. [Admin Authentication](#3-admin-authentication)
4. [API Reference](#4-api-reference)
5. [UI Components - Detailed Instructions](#5-ui-components---detailed-instructions)
6. [Reusable Components](#6-reusable-components)
7. [Error Handling](#7-error-handling)
8. [Loading States](#8-loading-states)
9. [Mock Data Updates](#9-mock-data-updates)
10. [Testing Checklist](#10-testing-checklist)
11. [Common Issues & Solutions](#11-common-issues--solutions)
12. [Frontend Environment Setup](#12-frontend-environment-setup)

---

## 1. Overview

### What's Changed in RM Module

| Feature | Old Behavior | New Behavior |
|---------|--------------|--------------|
| RM Code | Not present | Auto-generated (RM-XXXXXXXX) |
| PAN | Not required | Required |
| Aadhaar Number | Not required | Required (12 digits) |
| Aadhaar Images | Not present | Required (front + back) |
| Bank Details | Required | Removed |
| Partner Signup | Optional referral | RM code mandatory |

### Business Rules

1. **RM Creation**: Admin enters RM details → OTPs sent to mobile & email → Both verified → RM created with auto-generated code
2. **OTP Verification**: Both mobile and email must be verified before RM account is created
3. **OTP Rate Limiting**: Max 3 OTP requests per 10 minutes, 60-second cooldown between requests
4. **OTP Expiry**: OTPs expire after 10 minutes
5. **Partner Signup**: Partner must enter valid RM code → System validates → Links partner to RM
6. **RM Deletion**: Cannot delete RM if partners exist → Must reassign partners first
7. **RM Status**: Only "active" RMs can be used for partner signup
8. **Admin Control**: Super admin can change any partner's RM at any time

---

## 2. File Structure

### New Files to Create

```
src/
├── admin/
│   ├── components/
│   │   └── AuthGuard.jsx                 ← Route protection component
│   └── pages/
│       ├── auth/
│       │   └── LoginPage.jsx             ← Admin login page
│       └── users/
│           └── partners/
│               └── components/
│                   └── ChangeRMModal.jsx ← Change partner's RM
├── components/
│   └── common/
│       ├── ImageDropzone.jsx             ← File upload with drag-drop
│       └── ImageViewerModal.jsx          ← View images fullscreen
└── lib/
    └── utils/
        └── errorHandler.js               ← API error handling utility
```

### Files to Update

| File | Changes |
|------|---------|
| `src/lib/api/apiClient.js` | Add auth interceptors |
| `src/routes/routes.jsx` | Add login route, wrap admin routes with AuthGuard |
| `src/admin/components/AdminHeader.jsx` | Add logout functionality |
| `src/admin/pages/users/rms/components/CreateRMModal.jsx` | Add PAN, Aadhaar, file uploads |
| `src/admin/pages/users/rms/components/RMsTable.jsx` | Add RM code column |
| `src/admin/pages/users/rms/components/RMDetailsModal.jsx` | Add documents tab |
| `src/admin/pages/users/rms/components/EditRMModal.jsx` | Update fields |
| `src/admin/pages/users/partners/PartnersPage.jsx` | Add RM info, Change RM action |
| `src/lib/api/services/usersService.js` | Add RM and Partner API functions |
| `src/lib/api/endpoints.js` | Add new endpoints |
| `src/lib/mockData/users.js` | Update mock data structure |

---

## 3. Admin Authentication

### 3.1 Login API Details

| Property | Value |
|----------|-------|
| Endpoint | `POST /api/admin/login` |
| Auth Required | No |
| Content-Type | application/json |

**Request Body:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| admin_id | string | Yes | Admin username |
| password | string | Yes | Admin password |

**Success Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "admin_id": "superadmin"
  }
}
```

**Error Response (401):**

```json
{
  "success": false,
  "message": "Invalid admin ID or password"
}
```

### 3.2 LoginPage.jsx - Instructions

**Location:** `src/admin/pages/auth/LoginPage.jsx`

**Layout Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    AdityaRaj Capital                        │
│                    Admin Dashboard                          │
│                                                             │
│            ┌─────────────────────────────────┐              │
│            │                                 │              │
│            │         🔒 Admin Login          │              │
│            │                                 │              │
│            │  Admin ID *                     │              │
│            │  ┌─────────────────────────────┐│              │
│            │  │ [text input]                ││              │
│            │  └─────────────────────────────┘│              │
│            │                                 │              │
│            │  Password *                     │              │
│            │  ┌─────────────────────────────┐│              │
│            │  │ [password input]            ││              │
│            │  └─────────────────────────────┘│              │
│            │                                 │              │
│            │  ┌─────────────────────────────┐│              │
│            │  │         Sign In             ││              │
│            │  └─────────────────────────────┘│              │
│            │                                 │              │
│            └─────────────────────────────────┘              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Component Requirements:**

| Element | Type | Details |
|---------|------|---------|
| Container | div | Full screen, centered, gray background |
| Card | Card component | Max width 400px |
| Logo | Icon + Text | Lock icon, "Admin Login" title |
| Subtitle | Text | "AdityaRaj Capital Dashboard" |
| Admin ID | Input | Text type, User icon prefix, required |
| Password | Input | Password type, Lock icon prefix, required |
| Submit Button | Button | Full width, "Sign In" text, loading state |

**State Management:**

| State | Type | Purpose |
|-------|------|---------|
| formData | object | { admin_id: '', password: '' } |
| loading | boolean | Show loading spinner on button |

**Form Submission Logic:**

1. Validate both fields are not empty
2. If empty → Show toast error "Please enter admin ID and password"
3. Set loading = true
4. Call `POST /api/admin/login` with formData
5. On success:
   - Store `response.data.data.token` in `localStorage.setItem('adminToken', token)`
   - Store `response.data.data.admin_id` in `localStorage.setItem('adminId', admin_id)`
   - Show success toast "Login successful"
   - Navigate to `/admin`
6. On error:
   - Show error toast with `error.response?.data?.message` or "Login failed"
7. Set loading = false

### 3.3 AuthGuard.jsx - Instructions

**Location:** `src/admin/components/AuthGuard.jsx`

**Purpose:** Protect admin routes from unauthenticated access

**Component Requirements:**

| Prop | Type | Description |
|------|------|-------------|
| children | ReactNode | Routes to protect |

**Logic:**

1. Get current location using `useLocation()`
2. Check if `localStorage.getItem('adminToken')` exists
3. If NO token:
   - Return `<Navigate to="/admin/login" state={{ from: location }} replace />`
4. If token exists:
   - Return `{children}`

### 3.4 API Client Updates - Instructions

**Location:** `src/lib/api/apiClient.js`

**Add Request Interceptor:**

1. Before each request, read token from `localStorage.getItem('adminToken')`
2. If token exists, add header: `Authorization: Bearer ${token}`
3. Return the modified config

**Add Response Interceptor:**

1. On response error, check if `error.response?.status === 401`
2. If 401:
   - Clear `localStorage.removeItem('adminToken')`
   - Clear `localStorage.removeItem('adminId')`
   - Redirect to `/admin/login` using `window.location.href`
3. Always reject the promise with the error

### 3.5 Route Updates - Instructions

**Location:** `src/routes/routes.jsx`

**Changes:**

1. Import LoginPage and AuthGuard components
2. Add public login route:
   - Path: `/admin/login`
   - Element: `<LoginPage />`
3. Wrap admin layout with AuthGuard:
   - Path: `/admin`
   - Element: `<AuthGuard><AdminLayout /></AuthGuard>`
   - Children: All existing admin routes

### 3.6 Logout - Instructions

**Location:** `src/admin/components/AdminHeader.jsx`

**Add to Profile Dropdown:**

1. Find the "Logout" menu item
2. Add onClick handler that:
   - Calls `localStorage.removeItem('adminToken')`
   - Calls `localStorage.removeItem('adminId')`
   - Redirects to `/admin/login`

---

## 4. API Reference

### 4.1 RM Management APIs

| Action | Method | Endpoint | Auth | Content-Type |
|--------|--------|----------|------|--------------|
| **OTP Flow (Recommended)** |
| Initiate RM Signup | POST | `/api/admin/rm/initiate` | Yes | multipart/form-data |
| Resend Mobile OTP | POST | `/api/admin/rm/resend-mobile-otp` | Yes | application/json |
| Resend Email OTP | POST | `/api/admin/rm/resend-email-otp` | Yes | application/json |
| Verify Mobile OTP | POST | `/api/admin/rm/verify-mobile-otp` | Yes | application/json |
| Verify Email OTP | POST | `/api/admin/rm/verify-email-otp` | Yes | application/json |
| Complete RM Creation | POST | `/api/admin/rm/complete` | Yes | application/json |
| Get Signup Status | GET | `/api/admin/rm/signup-status/:requestId` | Yes | - |
| **Legacy (No OTP)** |
| Create RM Directly | POST | `/api/admin/rm/create` | Yes | multipart/form-data |
| **CRUD Operations** |
| List RMs | GET | `/api/admin/rm/list` | Yes | - |
| Get RM | GET | `/api/admin/rm/:id` | Yes | - |
| Validate Code | GET | `/api/admin/rm/code/:rmCode` | **No** | - |
| Update RM | PUT | `/api/admin/rm/:id` | Yes | application/json |
| Delete RM | DELETE | `/api/admin/rm/:id` | Yes | - |
| Get RM Partners | GET | `/api/admin/rm/:id/partners` | Yes | - |

### 4.2 Partner Management APIs

| Action | Method | Endpoint | Auth | Content-Type |
|--------|--------|----------|------|--------------|
| List Partners | GET | `/api/admin/partners` | Yes | - |
| Change RM | PATCH | `/api/admin/partners/:partnerId/rm` | Yes | application/json |

### 4.3 RM Creation with OTP Flow (Recommended)

The recommended flow for creating an RM with mobile and email verification:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        RM Creation OTP Flow                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Step 1: Initiate                                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ POST /api/admin/rm/initiate                                             ││
│  │ → Uploads documents, sends OTPs to mobile & email                       ││
│  │ → Returns: signup_request_id, mobile_otp, email_otp (dev only)          ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                              ↓                                              │
│  Step 2: Verify Mobile OTP                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ POST /api/admin/rm/verify-mobile-otp                                    ││
│  │ → Verifies mobile OTP                                                   ││
│  │ → Returns: mobile_verified: true                                        ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                              ↓                                              │
│  Step 3: Verify Email OTP                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ POST /api/admin/rm/verify-email-otp                                     ││
│  │ → Verifies email OTP                                                    ││
│  │ → Returns: email_verified: true, both_verified: true                    ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                              ↓                                              │
│  Step 4: Complete Creation                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐│
│  │ POST /api/admin/rm/complete                                             ││
│  │ → Creates RM after both OTPs verified                                   ││
│  │ → Returns: rm_id, rm_code                                               ││
│  └─────────────────────────────────────────────────────────────────────────┘│
│                                                                             │
│  Optional: Resend OTPs                                                      │
│  - POST /api/admin/rm/resend-mobile-otp                                     │
│  - POST /api/admin/rm/resend-email-otp                                      │
│  (Rate limited: 1 min cooldown, max 3 sends per 10 min)                     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### 4.3.1 Initiate RM Signup

**Endpoint:** `POST /api/admin/rm/initiate`

**Request (multipart/form-data):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | Min 1 character |
| phone_number | string | Yes | Exactly 10 digits |
| email | string | Yes | Valid email format |
| password | string | Yes | Min 6 characters |
| rm_aadhaar_front | file | Yes | JPG/PNG, max 5MB (Aadhaar front image) |
| rm_pan_image | file | Yes | JPG/PNG, max 5MB (PAN card image) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "OTPs sent to mobile and email. Please verify to complete RM creation.",
  "data": {
    "signup_request_id": 1,
    "otp_expires_in_minutes": 10,
    "message": "OTPs sent to mobile and email. Please verify to complete RM creation.",
    "mobile_otp": "123456",
    "email_otp": "654321"
  }
}
```

> **Note:** `mobile_otp` and `email_otp` are returned only in development mode for testing. Remove in production.

#### 4.3.2 Verify Mobile OTP

**Endpoint:** `POST /api/admin/rm/verify-mobile-otp`

**Request:**

```json
{
  "signup_request_id": 1,
  "otp": "123456"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Mobile number verified successfully",
  "data": {
    "signup_request_id": 1,
    "mobile_verified": true,
    "email_verified": false,
    "both_verified": false
  }
}
```

#### 4.3.3 Verify Email OTP

**Endpoint:** `POST /api/admin/rm/verify-email-otp`

**Request:**

```json
{
  "signup_request_id": 1,
  "otp": "654321"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": {
    "signup_request_id": 1,
    "mobile_verified": true,
    "email_verified": true,
    "both_verified": true
  }
}
```

#### 4.3.4 Complete RM Creation

**Endpoint:** `POST /api/admin/rm/complete`

**Request:**

```json
{
  "signup_request_id": 1
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "RM created successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "RM-A7F3K9M2",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "9876543210"
  }
}
```

#### 4.3.5 Resend Mobile OTP

**Endpoint:** `POST /api/admin/rm/resend-mobile-otp`

**Request:**

```json
{
  "signup_request_id": 1
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Mobile OTP resent successfully",
  "data": {
    "signup_request_id": 1,
    "otp_expires_in_minutes": 10,
    "mobile_otp": "789012"
  }
}
```

**Rate Limit Errors:**

| Error | Message |
|-------|---------|
| Cooldown | "Please wait X seconds before requesting another OTP" |
| Max reached | "Maximum OTP requests reached. Please wait X minutes." |

#### 4.3.6 Resend Email OTP

**Endpoint:** `POST /api/admin/rm/resend-email-otp`

**Request:**

```json
{
  "signup_request_id": 1
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Email OTP resent successfully",
  "data": {
    "signup_request_id": 1,
    "otp_expires_in_minutes": 10,
    "email_otp": "345678"
  }
}
```

#### 4.3.7 Get Signup Status

**Endpoint:** `GET /api/admin/rm/signup-status/:requestId`

**Success Response (200):**

```json
{
  "success": true,
  "message": "Signup status retrieved",
  "data": {
    "signup_request_id": 1,
    "status": "both_verified",
    "mobile_verified": true,
    "email_verified": true,
    "both_verified": true,
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "created_at": "2026-01-25T10:00:00Z"
  }
}
```

#### 4.3.8 OTP Error Responses

| Scenario | Status | Message |
|----------|--------|---------|
| Invalid OTP | 400 | "Invalid mobile OTP" / "Invalid email OTP" |
| OTP expired | 400 | "Mobile OTP has expired. Please request a new one." |
| Already verified | 400 | "Mobile number is already verified" |
| Request expired | 400 | "Signup request has expired. Please start again." |
| Already completed | 400 | "RM signup already completed" |
| Both not verified | 400 | "Both mobile and email must be verified before completing RM creation" |

### 4.4 Legacy: Create RM Directly (No OTP)

> **⚠️ Deprecated:** Use the OTP flow (`/rm/initiate`) instead for proper verification.

**Endpoint:** `POST /api/admin/rm/create`

**Request (multipart/form-data):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | Yes | Min 1 character |
| phone_number | string | Yes | Exactly 10 digits |
| email | string | Yes | Valid email format |
| password | string | Yes | Min 6 characters |
| rm_aadhaar_front | file | Yes | JPG/PNG, max 5MB (Aadhaar front image) |
| rm_pan_image | file | Yes | JPG/PNG, max 5MB (PAN card image) |

**Success Response (201):**

```json
{
  "success": true,
  "message": "RM created successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "RM-A7F3K9M2",
    "name": "John Doe",
    "email": "john@example.com",
    "phone_number": "9876543210",
    "aadhaar_front_image_url": "https://signed-url...",
    "pan_image_url": "https://signed-url..."
  }
}
```

**Possible Errors:**

| Error | Status | Message |
|-------|--------|---------|
| Duplicate email | 400 | "Email already exists" |
| Duplicate phone | 400 | "Phone number already exists" |
| Missing files | 400 | "Both Aadhaar and PAN documents are required" |
| Invalid file type | 400 | "File type not allowed" |
| File too large | 400 | "File too large. Maximum file size is 5MB" |

### 4.5 List RMs - Response Structure

```json
{
  "success": true,
  "message": "RMs fetched successfully",
  "data": {
    "count": 2,
    "rms": [
      {
        "id": 1,
        "rm_code": "RM-A7F3K9M2",
        "name": "John Doe",
        "phone_number": "9876543210",
        "email": "john@example.com",
        "pan": "ABCDE1234F",
        "aadhaar": "123456789012",
        "aadhaar_front_image": "rms/1/aadhaar/front.jpg",
        "aadhaar_back_image": "rms/1/aadhaar/back.jpg",
        "aadhaar_front_image_url": "https://signed-url...",
        "aadhaar_back_image_url": "https://signed-url...",
        "status": "active",
        "partner_count": 5,
        "created_at": "2026-01-25T10:00:00Z",
        "updated_at": "2026-01-25T10:00:00Z"
      }
    ]
  }
}
```

### 4.5 Validate RM Code (Public)

**Endpoint:** `GET /api/admin/rm/code/:rmCode`

**Note:** This endpoint does NOT require authentication (used by partner signup)

**Success Response (200):**

```json
{
  "success": true,
  "message": "RM found",
  "data": {
    "valid": true,
    "rm_name": "John Doe"
  }
}
```

**Error Response (404):**

```json
{
  "success": false,
  "message": "Invalid RM referral code"
}
```

**Error Response (400 - Inactive RM):**

```json
{
  "success": false,
  "message": "RM is not active"
}
```

### 4.6 Update RM

**Endpoint:** `PUT /api/admin/rm/:id`

**Request Body (all fields optional):**

| Field | Type | Validation |
|-------|------|------------|
| name | string | Min 1 character |
| phone_number | string | 10 digits |
| email | string | Valid email |
| pan | string | Valid PAN format |
| aadhaar | string | 12 digits |
| status | string | "active" or "inactive" |

**Note:** RM code CANNOT be changed

### 4.7 Delete RM

**Endpoint:** `DELETE /api/admin/rm/:id`

**Success Response (200):**

```json
{
  "success": true,
  "message": "RM deleted successfully"
}
```

**Error Response (400 - Has Partners):**

```json
{
  "success": false,
  "message": "Cannot delete RM with 5 linked partner(s). Please reassign partners to another RM first."
}
```

### 4.8 Get RM's Partners

**Endpoint:** `GET /api/admin/rm/:id/partners`

**Response:**

```json
{
  "success": true,
  "message": "Partners fetched successfully",
  "data": {
    "rm_id": 1,
    "rm_code": "RM-A7F3K9M2",
    "rm_name": "John Doe",
    "partner_count": 2,
    "partners": [
      {
        "id": 10,
        "name": "Partner One",
        "email": "partner1@example.com",
        "mobile": "9876543210",
        "status": "active",
        "created_at": "2026-01-25T10:00:00Z"
      }
    ]
  }
}
```

### 4.9 List All Partners

**Endpoint:** `GET /api/admin/partners`

**Response:**

```json
{
  "success": true,
  "message": "Partners fetched successfully",
  "data": {
    "count": 10,
    "partners": [
      {
        "id": 10,
        "name": "Partner One",
        "email": "partner1@example.com",
        "mobile": "9876543210",
        "rm_id": 1,
        "rm": {
          "rm_id": 1,
          "rm_code": "RM-A7F3K9M2",
          "rm_name": "John Doe",
          "rm_status": "active"
        },
        "status": "active",
        "created_at": "2026-01-25T10:00:00Z"
      }
    ]
  }
}
```

### 4.10 Change Partner's RM

**Endpoint:** `PATCH /api/admin/partners/:partnerId/rm`

**Request (choose one):**

```json
{
  "rm_id": 2
}
```
OR
```json
{
  "rm_code": "RM-B8G4L0N3"
}
```

**Success Response:**

```json
{
  "success": true,
  "message": "Partner RM updated successfully",
  "data": {
    "partner_id": 10,
    "previous_rm_id": 1,
    "new_rm_id": 2,
    "new_rm_code": "RM-B8G4L0N3",
    "new_rm_name": "Jane Smith"
  }
}
```

---

## 5. UI Components - Detailed Instructions

### 5.1 CreateRMModal.jsx Updates (Multi-Step OTP Flow)

**Location:** `src/admin/pages/users/rms/components/CreateRMModal.jsx`

**This modal uses a 3-step flow with OTP verification:**

#### Step 1: Enter RM Details

```
┌─────────────────────────────────────────────────────────────┐
│                     Create New RM                       [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ○───────●───────○───────○                                  │
│  Details   OTP    Complete                                  │
│                                                             │
│  Full Name *                                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [text input]                                            ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─────────────────────────┐  ┌────────────────────────────┐│
│  │ Phone Number *          │  │ Email *                    ││
│  │ [10 digits]             │  │ [email input]              ││
│  └─────────────────────────┘  └────────────────────────────┘│
│                                                             │
│  Password *                                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [password input, min 6 chars]                           ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Documents                                                  │
│  ┌─────────────────────────┐  ┌────────────────────────────┐│
│  │ Aadhaar Front *         │  │ PAN Card *                 ││
│  │                         │  │                            ││
│  │   [Drop zone or         │  │   [Drop zone or            ││
│  │    click to upload]     │  │    click to upload]        ││
│  │                         │  │                            ││
│  │ JPG/PNG, max 5MB        │  │ JPG/PNG, max 5MB           ││
│  └─────────────────────────┘  └────────────────────────────┘│
│                                                             │
│  ⓘ OTPs will be sent to mobile and email for verification  │
│                                                             │
│                    [Cancel]  [Send OTPs →]                  │
└─────────────────────────────────────────────────────────────┘
```

#### Step 2: OTP Verification

```
┌─────────────────────────────────────────────────────────────┐
│                     Create New RM                       [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ○───────●───────○───────○                                  │
│  Details   OTP    Complete                                  │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ℹ OTPs sent to:                                         ││
│  │   📱 9876543210    📧 john@example.com                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Mobile OTP *                                ✅ / ❌        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [6 digit OTP input]                                     ││
│  └─────────────────────────────────────────────────────────┘│
│  [Verify]                           [Resend OTP] (in 60s)   │
│                                                             │
│  Email OTP *                                 ✅ / ❌        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ [6 digit OTP input]                                     ││
│  └─────────────────────────────────────────────────────────┘│
│  [Verify]                           [Resend OTP] (in 60s)   │
│                                                             │
│  ⓘ OTPs expire in 10 minutes                               │
│                                                             │
│                    [← Back]  [Complete Creation →]          │
│                              (enabled when both verified)   │
└─────────────────────────────────────────────────────────────┘
```

#### Step 3: Success

```
┌─────────────────────────────────────────────────────────────┐
│                     Create New RM                       [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ○───────○───────●───────○                                  │
│  Details   OTP    Complete                                  │
│                                                             │
│                       ✅                                    │
│                                                             │
│                 RM Created Successfully!                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ RM Code:  RM-A7F3K9M2  [📋 Copy]                        ││
│  │ Name:     John Doe                                      ││
│  │ Phone:    9876543210                                    ││
│  │ Email:    john@example.com                              ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│                              [Close]                        │
└─────────────────────────────────────────────────────────────┘
```

**State Management:**

| State | Type | Purpose |
|-------|------|---------|
| step | number | Current step (1, 2, or 3) |
| signupRequestId | number | ID returned from /initiate |
| formData | object | { name, phone_number, email, password } |
| aadhaarFrontFile | File | Aadhaar front image |
| panImageFile | File | PAN card image |
| aadhaarFrontPreview | string | Base64 preview |
| panImagePreview | string | Base64 preview |
| mobileOtp | string | User input for mobile OTP |
| emailOtp | string | User input for email OTP |
| mobileVerified | boolean | Is mobile OTP verified |
| emailVerified | boolean | Is email OTP verified |
| mobileResendTimer | number | Seconds until resend allowed |
| emailResendTimer | number | Seconds until resend allowed |
| createdRM | object | Created RM data (step 3) |
| loading | boolean | API call in progress |

**Step 1 Flow:**

1. User fills all 6 fields (name, phone, email, password, aadhaar front, pan image)
2. Click "Send OTPs" button
3. Create FormData and call `POST /api/admin/rm/initiate`
4. On success:
   - Store `signup_request_id` in state
   - Start 60-second timers for resend buttons
   - Move to Step 2
5. On error: Show toast with error message

**Step 2 Flow - Mobile OTP:**

1. User enters 6-digit mobile OTP
2. Click "Verify" button (next to Mobile OTP input)
3. Call `POST /api/admin/rm/verify-mobile-otp` with { signup_request_id, otp }
4. On success: Set `mobileVerified = true`, show ✅
5. On error: Show toast "Invalid mobile OTP", show ❌

**Step 2 Flow - Email OTP:**

1. User enters 6-digit email OTP
2. Click "Verify" button (next to Email OTP input)
3. Call `POST /api/admin/rm/verify-email-otp` with { signup_request_id, otp }
4. On success: Set `emailVerified = true`, show ✅
5. On error: Show toast "Invalid email OTP", show ❌

**Step 2 Flow - Resend OTP:**

1. Resend buttons disabled for 60 seconds after initial send/resend
2. Show countdown timer on button: "Resend (45s)"
3. When timer reaches 0, enable button: "Resend OTP"
4. On click: Call `/resend-mobile-otp` or `/resend-email-otp`
5. Reset timer to 60 seconds
6. Show toast "OTP resent successfully"

**Step 2 Flow - Complete:**

1. "Complete Creation" button enabled only when `mobileVerified && emailVerified`
2. On click: Call `POST /api/admin/rm/complete` with { signup_request_id }
3. On success:
   - Store response data in `createdRM`
   - Move to Step 3
   - Show success toast
4. On error: Show toast with error message

**Required Fields (Step 1):**

| Field | Type | Validation | Error Message |
|-------|------|------------|---------------|
| name | Text Input | Min 1 character | "Name is required" |
| phone_number | Text Input | Exactly 10 digits | "Phone number must be 10 digits" |
| email | Text Input | Valid email | "Email must be a valid email address" |
| password | Password Input | Min 6 characters | "Password must be at least 6 characters" |
| rm_aadhaar_front | File Input | JPG/PNG, max 5MB | "Aadhaar front image is required" |
| rm_pan_image | File Input | JPG/PNG, max 5MB | "PAN card image is required" |

**File Input Behavior:**

1. Accept only: `image/jpeg, image/png`
2. Max size: 5MB (5 * 1024 * 1024 bytes)
3. On file select:
   - Validate type and size
   - Create preview using FileReader
   - Store file in state
4. Show preview thumbnail when file selected
5. Show clear/remove button on preview

### 5.2 RMsTable.jsx Updates

**Location:** `src/admin/pages/users/rms/components/RMsTable.jsx`

**Add New Column: RM Code**

| Property | Value |
|----------|-------|
| Position | First column (before Name) |
| Header | "RM Code" |
| Width | ~150px |

**RM Code Cell Content:**

1. Container: flex row, align center, gap 2
2. Code text: monospace font, small size, gray background, padding, rounded
3. Copy button: clipboard icon, on click copies code to clipboard
4. On copy success: show toast "RM code copied!"

**Table Column Order:**

1. RM Code (NEW)
2. Name
3. Email
4. Mobile
5. Partners (clickable count)
6. Status
7. Created Date
8. Actions

**Partners Column Update:**

1. Make the count a clickable link/button
2. Style: blue text, underline on hover
3. On click: call `onViewPartners(rm)` or open partners list modal

### 5.3 RMDetailsModal.jsx Updates

**Location:** `src/admin/pages/users/rms/components/RMDetailsModal.jsx`

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│                      RM Details                         [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  [Avatar]  John Doe                                     ││
│  │            RM-A7F3K9M2  [📋 Copy]                       ││
│  │            ● Active                                     ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ┌─ Basic Info ─┬─ Documents ─┬─ Partners ─┬─ Statistics ─┐ │
│  └──────────────┴─────────────┴────────────┴──────────────┘ │
│                                                             │
│  [Tab Content Area]                                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Header Section Updates:**

1. Display RM Code prominently below name
2. Add copy button next to RM code
3. Show status badge

**Add New Tab: "Documents"**

Documents Tab Content:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Aadhaar Front                    PAN Card                  │
│  ┌────────────────────┐          ┌────────────────────┐     │
│  │                    │          │                    │     │
│  │   [Thumbnail]      │          │   [Thumbnail]      │     │
│  │                    │          │                    │     │
│  └────────────────────┘          └────────────────────┘     │
│  [View Full] [Download]          [View Full] [Download]     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

| Action | Behavior |
|--------|----------|
| View Full | Open ImageViewerModal with full image |
| Download | Download image file |

**"Basic Info" Tab Fields:**

| Field | Label |
|-------|-------|
| name | Full Name |
| phone_number | Phone Number |
| email | Email |
| status | Status |
| created_at | Created Date |

### 5.4 EditRMModal.jsx Updates

**Location:** `src/admin/pages/users/rms/components/EditRMModal.jsx`

**Fields to Display (Read-Only):**

| Field | Notes |
|-------|-------|
| RM Code | Show in header or first field, NOT editable, grayed out |

**Editable Fields:**

| Field | Type | Validation |
|-------|------|------------|
| name | Text | Required |
| phone_number | Text | 10 digits |
| email | Email | Valid email |
| pan | Text | PAN format |
| aadhaar | Text | 12 digits |
| status | Select | active/inactive |

**Fields to REMOVE:**
- Bank Account Number
- Bank IFSC
- Bank Name

### 5.5 DeleteConfirmationModal Updates

**Location:** `src/admin/pages/users/rms/components/DeleteConfirmationModal.jsx`

**Before showing delete confirmation:**

1. Check `rm.partner_count` value
2. If `partner_count > 0`:
   - Show error state instead of confirmation
   - Message: "Cannot delete this RM"
   - Details: "This RM has {count} linked partner(s). Please reassign partners to another RM before deleting."
   - Only show "Close" button, no delete option
3. If `partner_count === 0`:
   - Show normal delete confirmation
   - Message: "Are you sure you want to delete this RM?"
   - Show "Cancel" and "Delete" buttons

### 5.6 PartnersPage.jsx Updates

**Location:** `src/admin/pages/users/partners/PartnersPage.jsx`

**API Change:**

- Change from existing partners API to `GET /api/admin/partners`
- This returns partners with RM info included

**Update RM Column:**

| Condition | Display |
|-----------|---------|
| Partner has RM | RM name (bold) + RM code (small, gray) below |
| Partner has no RM | "Unassigned" in gray italic |

Example cell content:
```
John Doe
RM-A7F3K9M2
```
or
```
Unassigned
```

**Add to Actions Dropdown:**

| Action | Icon | Label |
|--------|------|-------|
| NEW | UserCog icon | "Change RM" |

On "Change RM" click:
1. Set selected partner in state
2. Open ChangeRMModal

**State to Add:**

| State | Type | Purpose |
|-------|------|---------|
| changeRMModalOpen | boolean | Control modal visibility |
| selectedPartnerForRM | object | Partner to change RM for |

### 5.7 ChangeRMModal.jsx (NEW)

**Location:** `src/admin/pages/users/partners/components/ChangeRMModal.jsx`

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│                    Change Assigned RM                   [×] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Partner                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Partner Name (read-only display)                        ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Current RM                                                 │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ John Doe (RM-A7F3K9M2)                                  ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  Select New RM *                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ ▼ Select an RM                                          ││
│  └─────────────────────────────────────────────────────────┘│
│                                                             │
│  ⚠️ This will reassign the partner to a different RM.       │
│                                                             │
│                        [Cancel]  [Change RM]                │
└─────────────────────────────────────────────────────────────┘
```

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| isOpen | boolean | Modal visibility |
| onClose | function | Close handler |
| partner | object | Partner being modified |
| onSuccess | function | Called after successful change |

**Component Behavior:**

1. On modal open:
   - Fetch all RMs from `GET /api/admin/rm/list`
   - Filter to only show `status === 'active'` RMs
   - Store in state
2. Dropdown options format:
   - Text: "{name} ({rm_code}) - {partner_count} partners"
   - Mark current RM with "← Current" label
3. On submit:
   - Validate an RM is selected
   - Validate not same as current RM
   - Call `PATCH /api/admin/partners/:partnerId/rm` with `{ rm_id: selectedId }`
   - On success: show toast, call onSuccess, close modal
   - On error: show error toast

**State:**

| State | Type | Purpose |
|-------|------|---------|
| rms | array | List of RMs from API |
| selectedRM | number | Selected RM's ID |
| loading | boolean | Submit loading state |
| fetchingRMs | boolean | Loading RMs state |

---

## 6. Reusable Components

### 6.1 ImageDropzone.jsx

**Location:** `src/components/common/ImageDropzone.jsx`

**Purpose:** Reusable file upload component with drag-drop and preview

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | - | Label text above dropzone |
| value | File | null | Current file value |
| onChange | function | - | Called with file or null |
| error | string | - | Error message to display |
| accept | string | "image/jpeg,image/png" | Accepted MIME types |
| maxSize | number | 5MB | Max file size in bytes |

**Features:**
1. Drag and drop support
2. Click to open file browser
3. Preview thumbnail when file selected
4. Clear/remove button on preview
5. Size and type validation
6. Error message display
7. Visual feedback on drag over

### 6.2 ImageViewerModal.jsx

**Location:** `src/components/common/ImageViewerModal.jsx`

**Purpose:** View images in fullscreen with zoom and download

**Props:**

| Prop | Type | Description |
|------|------|-------------|
| isOpen | boolean | Modal visibility |
| onClose | function | Close handler |
| imageUrl | string | URL of image to display |
| title | string | Title/filename |

**Features:**
1. Zoom in/out buttons
2. Download button
3. Close button
4. Scrollable container for large images
5. Dark/gray background

---

## 7. Error Handling

### 7.1 API Error Handler

**Location:** `src/lib/utils/errorHandler.js`

**Purpose:** Centralized error handling for API calls

**Function: handleApiError(error, defaultMessage)**

| Status | Behavior |
|--------|----------|
| 400 | Show error message from response |
| 401 | Handled by interceptor (redirect) |
| 403 | Show "You do not have permission to perform this action" |
| 404 | Show message or "Resource not found" |
| 409 | Show message or "Conflict - resource already exists" |
| 500 | Show "Server error. Please try again later." |
| Other | Show error message or default message |

### 7.2 Form Error Display Pattern

For each form field that can have errors:
1. Below the input field
2. Red text (#ef4444 or text-red-500)
3. Small font size
4. Margin top 4px
5. Display field-specific error message

---

## 8. Loading States

### 8.1 Table Loading

When fetching data:
1. Show skeleton loaders (5 rows)
2. Each skeleton: full width, 48px height
3. Animate with pulse effect

### 8.2 Button Loading

When submitting:
1. Disable button
2. Show spinner icon (animate spin)
3. Change text (e.g., "Creating..." instead of "Create RM")

### 8.3 Modal Loading

When fetching data for modal:
1. Show loading spinner centered
2. Or show skeleton for specific fields
3. Disable submit button until loaded

---

## 9. Mock Data Updates

### 9.1 Update mockRMs

**Location:** `src/lib/mockData/users.js`

**Add these fields to each RM object:**

| Field | Example Value |
|-------|---------------|
| rm_code | "RM-A7F3K9M2" |
| pan | "ABCDE1234F" |
| aadhaar | "123456789012" |
| aadhaar_front_image | "rms/1/aadhaar/front.jpg" |
| aadhaar_back_image | "rms/1/aadhaar/back.jpg" |
| aadhaar_front_image_url | "https://placeholder.com/aadhaar-front.jpg" |
| aadhaar_back_image_url | "https://placeholder.com/aadhaar-back.jpg" |
| partner_count | 5 |

**Remove these fields:**
- bank_account_number
- bank_ifsc
- bank_name

### 9.2 Update mockPartners

**Add these fields to each Partner object:**

| Field | Example Value |
|-------|---------------|
| rm_id | 1 |
| rm | { rm_id: 1, rm_code: "RM-A7F3K9M2", rm_name: "John Doe", rm_status: "active" } |

---

## 10. Testing Checklist

### Authentication
- [ ] Login with valid credentials → Token stored, redirects to dashboard
- [ ] Login with invalid admin_id → Error toast shown
- [ ] Login with invalid password → Error toast shown
- [ ] Login with empty fields → Validation error
- [ ] Access /admin without token → Redirects to login
- [ ] API returns 401 → Token cleared, redirects to login
- [ ] Logout → Token cleared, redirects to login

### RM Creation (OTP Flow)

**Step 1: Initiate**
- [ ] Fill all valid fields and click "Send OTPs" → OTPs sent, moves to step 2
- [ ] Password too short (<6 chars) → Validation error (client-side)
- [ ] Missing Aadhaar front image → Error
- [ ] Missing PAN card image → Error
- [ ] File too large (>5MB) → Error
- [ ] Invalid file type (not JPG/PNG) → Error
- [ ] Duplicate email → Error from API
- [ ] Duplicate phone → Error from API

**Step 2: OTP Verification**
- [ ] Enter correct mobile OTP and click Verify → Shows ✅
- [ ] Enter incorrect mobile OTP → Shows error toast, ❌
- [ ] Enter expired mobile OTP → Shows error "OTP expired"
- [ ] Enter correct email OTP and click Verify → Shows ✅
- [ ] Enter incorrect email OTP → Shows error toast, ❌
- [ ] Resend mobile OTP before 60s → Button disabled with countdown
- [ ] Resend mobile OTP after 60s → OTP resent, timer resets
- [ ] Resend email OTP after 60s → OTP resent, timer resets
- [ ] Click "Complete Creation" before both verified → Button disabled
- [ ] Both OTPs verified → "Complete Creation" button enabled

**Step 3: Complete**
- [ ] Click "Complete Creation" with both verified → RM created, shows success screen
- [ ] Success screen shows RM code, name, phone, email
- [ ] Copy RM code button works
- [ ] Click "Close" → Modal closes, refreshes RM list

### RM List
- [ ] Table shows RM code column
- [ ] Copy RM code button works
- [ ] Partner count is displayed
- [ ] Partner count is clickable
- [ ] Status badge shows correctly

### RM Details
- [ ] Header shows RM code
- [ ] Copy RM code works
- [ ] Basic Info tab shows all fields including PAN, Aadhaar
- [ ] Documents tab shows image thumbnails
- [ ] View Full opens image viewer
- [ ] Download works
- [ ] Partners tab shows list

### RM Edit
- [ ] RM code is displayed but NOT editable
- [ ] Can edit name, email, phone
- [ ] Can edit PAN, Aadhaar
- [ ] Can change status
- [ ] Save successful → Updates list

### RM Delete
- [ ] RM with 0 partners → Delete successful
- [ ] RM with partners → Error shown with count
- [ ] After reassigning partners → Can delete

### Partner RM Management
- [ ] Partners table shows RM name and code
- [ ] Partners without RM show "Unassigned"
- [ ] "Change RM" action visible in dropdown
- [ ] Change RM modal opens
- [ ] Modal loads RM list
- [ ] Current RM marked in dropdown
- [ ] Cannot select same RM → Validation
- [ ] Change successful → Toast shown
- [ ] Partner list reflects new RM

---

## 11. Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 error on all requests | Check if token is stored in localStorage after login |
| File upload fails | Ensure using FormData and multipart/form-data content type |
| CORS error | Backend must allow frontend origin in CORS config |
| RM code not showing in table | Verify rm_code field exists in API response and column is added |
| Images not loading | Signed URLs expire - refresh data to get new URLs |
| Can't delete RM | Check partner_count - must reassign partners first |
| Login redirect loop | Check AuthGuard is not on login route |
| Form validation not working | Check Zod schema matches new field requirements |

---

## 12. Frontend Environment Setup

### Create `.env` File

Create a `.env` file in the **frontend admin dashboard project root**.

### Local Development

When running the backend locally on port 3000:

```env
VITE_API_BASE_URL=http://localhost:3000
```

### Production

When deploying to production:

```env
VITE_API_BASE_URL=https://api.adityarajcapital.com
```

### Environment Files

| File | Purpose | API URL |
|------|---------|---------|
| `.env` | Default local development | `http://localhost:3000` |
| `.env.development` | Development specific | `http://localhost:3000` |
| `.env.production` | Production build | `https://api.adityarajcapital.com` |

### Important Notes

1. **Vite Prefix**: All frontend env variables MUST start with `VITE_` to be accessible in code
2. **Restart Required**: After changing `.env`, restart the dev server (`npm run dev`)
3. **Git Ignore**: Add `.env` to `.gitignore` (don't commit secrets)
4. **Backend Must Be Running**: Ensure backend is running on the specified port before testing

### Usage in Code

The API client reads this variable:

```
baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
```

---

## Quick Reference

### API Endpoints

```
POST   /api/admin/login                 # Login (public)
POST   /api/admin/rm/create             # Create RM (multipart)
GET    /api/admin/rm/list               # List RMs
GET    /api/admin/rm/:id                # Get RM by ID
GET    /api/admin/rm/code/:code         # Validate RM code (public)
PUT    /api/admin/rm/:id                # Update RM
DELETE /api/admin/rm/:id                # Delete RM
GET    /api/admin/rm/:id/partners       # Get RM's partners
GET    /api/admin/partners              # List all partners
PATCH  /api/admin/partners/:id/rm       # Change partner's RM
```

### Implementation Priority

| Priority | Task |
|----------|------|
| 1 | Login page + AuthGuard + API client updates |
| 2 | CreateRMModal updates (files, new fields) |
| 3 | RMsTable (RM code column) |
| 4 | RMDetailsModal (documents tab) |
| 5 | PartnersPage + ChangeRMModal |
| 6 | EditRMModal + DeleteConfirmationModal |
| 7 | Reusable components (ImageDropzone, ImageViewer) |

---

*End of Implementation Guide*

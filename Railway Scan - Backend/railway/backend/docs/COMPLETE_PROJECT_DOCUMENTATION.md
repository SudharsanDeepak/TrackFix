# 🚆 RailTrack-FIX - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Authentication & Authorization](#authentication--authorization)
7. [Data Models](#data-models)
8. [Business Logic](#business-logic)
9. [Environment Configuration](#environment-configuration)
10. [Deployment Guide](#deployment-guide)
11. [Frontend Integration Guide](#frontend-integration-guide)
12. [Testing](#testing)
13. [Performance & Scalability](#performance--scalability)

---

## 1. Project Overview

### What is RailTrack-FIX?

RailTrack-FIX is a **National-Scale Railway Track Fitting Lifecycle & Predictive Monitoring System** designed for Indian Railways to manage and monitor 25+ crore track fittings across 16 railway zones.

### Key Features

- **QR Code Generation**: Atomic batch generation of unique QR codes (up to 10,000 per batch)
- **Vendor Management**: Complete vendor lifecycle with performance scoring
- **Inspection System**: Digital inspection records with defect tracking
- **AI Predictions**: Predictive maintenance using AI/ML models
- **Dashboard Analytics**: Real-time insights and KPIs
- **Integration**: Export to UDM (Unified Data Management) and TMS (Track Management System)
- **Google OAuth**: Seamless authentication with Google accounts
- **National-Scale Sharding**: Distributed architecture for 25+ crore records
- **Automated Archival**: Hot/cold data separation for optimal performance

### System Capabilities

- ✅ 25+ crore track fittings capacity
- ✅ 100+ crore inspections capacity
- ✅ 16 railway zones support
- ✅ 500+ writes/second throughput
- ✅ 1000+ reads/second throughput
- ✅ Real-time AI predictions
- ✅ Automated data archival
- ✅ Production-grade security

---

## 2. System Architecture

### Architecture Pattern

**Clean Architecture** with Repository Pattern

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│              (Controllers, Routes, Middleware)           │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│              (Business Logic, Validation)                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                       │
│              (Data Access, Query Logic)                  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Data Layer                           │
│              (MongoDB Models, Schemas)                   │
└─────────────────────────────────────────────────────────┘
```

### Module Structure

```
src/
├── modules/
│   ├── auth/           # Authentication & Authorization
│   ├── vendor/         # Vendor Management
│   ├── qr/            # QR Code & Track Fitting Management
│   ├── inspection/    # Inspection Management
│   ├── ai/            # AI Predictions
│   ├── dashboard/     # Analytics & Dashboard
│   ├── integration/   # External System Integration
│   └── audit/         # Audit Logging
├── middlewares/       # Express Middlewares
├── utils/            # Utility Functions
├── config/           # Configuration
├── jobs/             # Background Jobs (Cron)
├── events/           # Event Handlers
└── shared/           # Shared Constants
```



---

## 3. Technology Stack

### Backend Framework
- **Node.js** v20+ (JavaScript Runtime)
- **Express.js** v4.18+ (Web Framework)

### Database
- **MongoDB** v7.0+ (Primary Database)
  - Sharding-ready for national-scale
  - Compound shard keys for distribution
  - Hot/cold data architecture
- **Redis** v4.6+ (Caching & Session Store)

### Authentication
- **JWT** (JSON Web Tokens)
- **Passport.js** (Google OAuth 2.0)
- **bcrypt** (Password Hashing)

### Validation & Security
- **Joi** (Schema Validation)
- **Helmet** (Security Headers)
- **express-rate-limit** (Rate Limiting)
- **express-mongo-sanitize** (NoSQL Injection Prevention)
- **xss-clean** (XSS Protection)

### Logging & Monitoring
- **Winston** (Logging)
- **winston-daily-rotate-file** (Log Rotation)
- **Correlation ID** (Request Tracking)

### Background Jobs
- **node-cron** (Scheduled Tasks)
  - Audit cleanup (daily)
  - Data archival (daily 5 AM)
  - Vendor metrics (daily)
  - Warranty expiry alerts (daily)
  - Cache cleanup (hourly)

### Documentation
- **Swagger/OpenAPI** (API Documentation)
- **swagger-jsdoc** (JSDoc to Swagger)
- **swagger-ui-express** (Interactive API Docs)

### Testing
- **Jest** (Unit & Integration Testing)
- **Supertest** (HTTP Testing)
- **Load Testing Framework** (Custom-built)

---

## 4. Database Schema

### Collections Overview

1. **users** - System users (admins, inspectors, depot officers, vendors)
2. **vendors** - Vendor information and performance metrics
3. **trackfittings** - Track fitting records with QR codes
4. **counters** - Atomic serial number generation (zone-segmented)
5. **inspections** - Inspection records
6. **aireports** - AI prediction reports
7. **performancelogs** - Performance monitoring logs
8. **audits** - Audit trail logs
9. **refreshtokens** - JWT refresh tokens
10. **inspectionarchives** - Archived inspections (365+ days)
11. **aireportarchives** - Archived AI reports (730+ days)
12. **performancelogarchives** - Archived performance logs (730+ days)

### Sharded Collections (National-Scale)

**TrackFittings**
- Shard Key: `{ zoneCode: 1, manufactureYear: 1, uniqueQRId: 1 }`
- Capacity: 25+ crore records

**Inspections**
- Shard Key: `{ zoneCode: 1, inspectionYear: 1, fitting: 1 }`
- Capacity: 100+ crore records

**AIReports**
- Shard Key: `{ zoneCode: 1, predictionYear: 1, fitting: 1 }`

**PerformanceLogs**
- Shard Key: `{ zoneCode: 1, logYear: 1, fitting: 1 }`

### Railway Zones (16 Zones)

```javascript
NR    - Northern Railway
SR    - Southern Railway
ER    - Eastern Railway
WR    - Western Railway
CR    - Central Railway
NER   - North Eastern Railway
ECR   - East Central Railway
ECoR  - East Coast Railway
NCR   - North Central Railway
NWR   - North Western Railway
SCR   - South Central Railway
SER   - South Eastern Railway
SWR   - South Western Railway
WCR   - West Central Railway
NF    - Northeast Frontier Railway
Metro - Metro Railways
```



---

## 5. API Endpoints

### Base URL
```
Development: http://localhost:5000
Production: https://api.railtrack.gov.in
```

### API Version
```
/api/v1
```

### 5.1 Authentication Endpoints

#### POST /api/v1/auth/register
Register a new user

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@railway.in",
  "password": "SecurePass123!",
  "role": "INSPECTOR"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@railway.in",
      "role": "INSPECTOR"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Roles:** ADMIN, VENDOR, DEPOT_OFFICER, INSPECTOR

---

#### POST /api/v1/auth/login
Login with email and password

**Request Body:**
```json
{
  "email": "john@railway.in",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@railway.in",
      "role": "INSPECTOR"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Rate Limit:** 5 requests per 15 minutes

---

#### POST /api/v1/auth/google
Login with Google (Token-based)

**Request Body:**
```json
{
  "idToken": "google_id_token_here"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@gmail.com",
      "role": "INSPECTOR",
      "googleId": "...",
      "profilePicture": "https://..."
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Note:** If email exists, links Google account. If new, creates account.

---

#### GET /api/v1/auth/google/redirect
Redirect to Google OAuth consent screen

**Usage:** Redirect user to this URL for OAuth flow

---

#### GET /api/v1/auth/google/callback
Google OAuth callback (handled by server)

**Usage:** Google redirects here after authentication

---

#### POST /api/v1/auth/refresh-token
Refresh access token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

#### POST /api/v1/auth/logout
Logout user (invalidate refresh token)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

#### GET /api/v1/auth/profile
Get current user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@railway.in",
    "role": "INSPECTOR",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### POST /api/v1/auth/change-password
Change user password

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

#### POST /api/v1/auth/set-password
Set password for Google-authenticated users

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "password": "NewPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password set successfully"
}
```



---

### 5.2 Vendor Management Endpoints

#### POST /api/v1/vendors
Create a new vendor

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN only

**Request Body:**
```json
{
  "vendorCode": "VEN001",
  "name": "ABC Railway Supplies",
  "email": "contact@abcrailway.com",
  "phone": "+919876543210",
  "address": {
    "street": "123 Industrial Area",
    "city": "New Delhi",
    "state": "Delhi",
    "pincode": "110001"
  },
  "gstNumber": "29ABCDE1234F1Z5",
  "panNumber": "ABCDE1234F"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "vendorCode": "VEN001",
    "name": "ABC Railway Supplies",
    "performanceScore": 0,
    "riskScore": 0,
    "isActive": true
  }
}
```

---

#### GET /api/v1/vendors
List all vendors (with pagination)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
?page=1&limit=20&status=active&search=ABC
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vendors": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

#### GET /api/v1/vendors/:id
Get vendor by ID

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "vendorCode": "VEN001",
    "name": "ABC Railway Supplies",
    "email": "contact@abcrailway.com",
    "performanceScore": 85.5,
    "riskScore": 15.2,
    "totalFittingsSupplied": 50000,
    "defectRate": 2.5,
    "isActive": true
  }
}
```

---

#### PATCH /api/v1/vendors/:id
Update vendor

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN only

**Request Body:**
```json
{
  "name": "ABC Railway Supplies Ltd",
  "phone": "+919876543211"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "vendorCode": "VEN001",
    "name": "ABC Railway Supplies Ltd",
    "phone": "+919876543211"
  }
}
```

---

#### GET /api/v1/vendors/top-performers
Get top performing vendors

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
?limit=10
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "vendorCode": "VEN001",
      "name": "ABC Railway Supplies",
      "performanceScore": 95.5,
      "totalFittingsSupplied": 100000
    }
  ]
}
```

---

#### GET /api/v1/vendors/high-risk
Get high-risk vendors

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN only

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "vendorCode": "VEN050",
      "name": "XYZ Supplies",
      "riskScore": 85.5,
      "defectRate": 15.2
    }
  ]
}
```

---

#### POST /api/v1/vendors/:id/blacklist
Blacklist a vendor

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN only

**Request Body:**
```json
{
  "reason": "Repeated quality issues and non-compliance"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Vendor blacklisted successfully"
}
```



---

### 5.3 QR Code & Track Fitting Endpoints

#### POST /api/v1/qr/generate-batch
Generate QR code batch (atomic transaction)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, DEPOT_OFFICER

**Request Body:**
```json
{
  "zoneCode": "NR",
  "itemType": "RAIL",
  "lotNumber": "LOT001",
  "quantity": 1000,
  "vendorId": "...",
  "manufacturingDate": "2024-01-15",
  "warrantyPeriod": 60,
  "specifications": {
    "material": "High Carbon Steel",
    "grade": "Grade 1",
    "weight": "50kg"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "generated": 1000,
    "lotNumber": "LOT001",
    "itemType": "RAIL",
    "zoneCode": "NR",
    "qrCodes": [
      "IR-RAIL-2024-LOT001-000001",
      "IR-RAIL-2024-LOT001-000002",
      "..."
    ]
  }
}
```

**QR Format:** `IR-{ITEMTYPE}-{YEAR}-{LOT}-{SERIAL}`

**Item Types:** RAIL, SLEEPER, FASTENER, BOLT, CLIP, PLATE

**Max Batch Size:** 10,000

---

#### GET /api/v1/qr/:qrId
Get fitting by QR code

**Headers:**
```
Authorization: Bearer <access_token>
```

**Example:** `/api/v1/qr/IR-RAIL-2024-LOT001-000001`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "uniqueQRId": "IR-RAIL-2024-LOT001-000001",
    "itemType": "RAIL",
    "lotNumber": "LOT001",
    "zoneCode": "NR",
    "vendor": {
      "_id": "...",
      "vendorCode": "VEN001",
      "name": "ABC Railway Supplies"
    },
    "manufacturingDate": "2024-01-15",
    "warrantyExpiry": "2029-01-15",
    "status": "MANUFACTURED",
    "riskScore": 25.5,
    "inspectionCount": 5,
    "defectCount": 0,
    "location": {
      "depot": "New Delhi",
      "zone": "NR",
      "division": "Delhi",
      "section": "Section A"
    }
  }
}
```

**Fitting Status:** MANUFACTURED, IN_TRANSIT, INSTALLED, DEFECTIVE, DECOMMISSIONED, RECALLED

---

#### GET /api/v1/qr
List fittings (with filters and pagination)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
?page=1
&limit=20
&zoneCode=NR
&status=INSTALLED
&vendorCode=VEN001
&lotNumber=LOT001
&itemType=RAIL
&depot=New Delhi
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fittings": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5000,
      "pages": 250
    }
  }
}
```

---

#### PATCH /api/v1/qr/:id
Update fitting details

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, DEPOT_OFFICER

**Request Body:**
```json
{
  "status": "INSTALLED",
  "location": {
    "depot": "New Delhi",
    "zone": "NR",
    "division": "Delhi",
    "section": "Section A",
    "coordinates": {
      "latitude": 28.6139,
      "longitude": 77.2090
    }
  },
  "installationDate": "2024-02-01"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "uniqueQRId": "IR-RAIL-2024-LOT001-000001",
    "status": "INSTALLED",
    "location": {...}
  }
}
```

---

#### POST /api/v1/qr/recall-lot
Recall entire lot

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN only

**Request Body:**
```json
{
  "zoneCode": "NR",
  "lotNumber": "LOT001",
  "reason": "Manufacturing defect detected in quality audit"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "modifiedCount": 1000,
    "message": "Lot recalled successfully"
  }
}
```

---

#### GET /api/v1/qr/warranty/expiring
Get fittings with expiring warranties

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
?zoneCode=NR&days=30
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "uniqueQRId": "IR-RAIL-2024-LOT001-000001",
      "warrantyExpiry": "2024-04-15",
      "daysRemaining": 25,
      "vendor": {...}
    }
  ]
}
```



---

### 5.4 Inspection Endpoints

#### POST /api/v1/inspections
Create inspection record

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, INSPECTOR

**Request Body:**
```json
{
  "fittingId": "...",
  "inspectionDate": "2024-03-01",
  "status": "COMPLETED",
  "findings": {
    "visualInspection": {
      "passed": true,
      "notes": "No visible defects"
    },
    "dimensionalCheck": {
      "passed": true,
      "measurements": {
        "length": "10.5m",
        "width": "0.15m"
      },
      "notes": "Within tolerance"
    },
    "functionalTest": {
      "passed": true,
      "notes": "All tests passed"
    },
    "wearAnalysis": {
      "wearLevel": 15,
      "notes": "Minimal wear"
    }
  },
  "defectsFound": [],
  "overallResult": "PASS",
  "recommendations": ["Continue monitoring"],
  "nextInspectionDate": "2024-09-01",
  "images": ["https://..."]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "fitting": {...},
    "inspector": {...},
    "zoneCode": "NR",
    "inspectionYear": 2024,
    "overallResult": "PASS",
    "createdAt": "2024-03-01T10:00:00.000Z"
  }
}
```

**Inspection Status:** SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

**Overall Result:** PASS, FAIL, CONDITIONAL

**Defect Severity:** LOW, MEDIUM, HIGH, CRITICAL

---

#### GET /api/v1/inspections/:id
Get inspection by ID

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "fitting": {
      "uniqueQRId": "IR-RAIL-2024-LOT001-000001",
      "itemType": "RAIL"
    },
    "inspector": {
      "name": "John Doe",
      "email": "john@railway.in"
    },
    "inspectionDate": "2024-03-01",
    "findings": {...},
    "overallResult": "PASS"
  }
}
```

---

#### GET /api/v1/inspections/fitting/:fittingId
Get all inspections for a fitting

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inspections": [...],
    "pagination": {...}
  }
}
```

---

#### GET /api/v1/inspections/my-inspections
Get inspections by current inspector

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** INSPECTOR

**Query Parameters:**
```
?page=1&limit=20&zoneCode=NR
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inspections": [...],
    "pagination": {...}
  }
}
```

---

#### GET /api/v1/inspections/failed
Get all failed inspections

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, INSPECTOR

**Query Parameters:**
```
?page=1&limit=20&zoneCode=NR
```

**Response:**
```json
{
  "success": true,
  "data": {
    "inspections": [
      {
        "_id": "...",
        "fitting": {...},
        "overallResult": "FAIL",
        "defectsFound": [
          {
            "type": "CRACK",
            "description": "Visible crack on surface",
            "severity": "HIGH"
          }
        ]
      }
    ],
    "pagination": {...}
  }
}
```

---

#### PATCH /api/v1/inspections/:id
Update inspection

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, INSPECTOR

**Request Body:**
```json
{
  "status": "COMPLETED",
  "recommendations": ["Schedule replacement"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "status": "COMPLETED",
    "recommendations": ["Schedule replacement"]
  }
}
```



---

### 5.5 AI Prediction Endpoints

#### POST /api/v1/ai/predict
Generate AI prediction for a fitting

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, INSPECTOR

**Request Body:**
```json
{
  "fittingId": "..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "fitting": {...},
    "vendor": {...},
    "zoneCode": "NR",
    "predictionYear": 2024,
    "riskScore": 75.5,
    "riskLevel": "HIGH_RISK",
    "predictedFailureDate": "2025-06-15",
    "recommendations": [
      "Schedule immediate inspection",
      "Consider replacement within 6 months"
    ],
    "confidence": 85.2,
    "modelVersion": "v1.0",
    "processingTime": 250
  }
}
```

**Risk Levels:** LOW_RISK (0-30), MEDIUM_RISK (30-60), HIGH_RISK (60-80), CRITICAL (80-100)

---

#### GET /api/v1/ai/reports/fitting/:fittingId
Get all AI reports for a fitting

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
?page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reports": [...],
    "pagination": {...}
  }
}
```

---

#### GET /api/v1/ai/reports/high-risk
Get high-risk predictions

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, INSPECTOR

**Query Parameters:**
```
?zoneCode=NR&threshold=70
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "fitting": {
        "uniqueQRId": "IR-RAIL-2024-LOT001-000001",
        "location": {...}
      },
      "riskScore": 85.5,
      "riskLevel": "CRITICAL",
      "predictedFailureDate": "2024-12-15"
    }
  ]
}
```

---

### 5.6 Dashboard & Analytics Endpoints

#### GET /api/v1/dashboard/overview
Get dashboard overview statistics

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalFittings": 2500000,
    "activeFittings": 2450000,
    "totalInspections": 15000000,
    "failedInspections": 150000,
    "highRiskFittings": 25000,
    "vendorCount": 150,
    "averageRiskScore": 35.5,
    "warrantyExpiringCount": 5000
  }
}
```

---

#### GET /api/v1/dashboard/vendor-ranking
Get vendor performance ranking

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "vendor": {
        "vendorCode": "VEN001",
        "name": "ABC Railway Supplies"
      },
      "performanceScore": 95.5,
      "totalFittings": 100000,
      "defectRate": 1.2,
      "rank": 1
    }
  ]
}
```

---

#### GET /api/v1/dashboard/failure-rate
Get failure rate by region/zone

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zone": "NR",
      "totalInspections": 500000,
      "failedInspections": 5000,
      "failureRate": 1.0
    }
  ]
}
```

---

#### GET /api/v1/dashboard/warranty-alerts
Get warranty expiry alerts

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
```
?days=30
```

**Response:**
```json
{
  "success": true,
  "data": {
    "expiringSoon": 500,
    "expired": 50,
    "fittings": [...]
  }
}
```

---

#### GET /api/v1/dashboard/recall-detection
Get batch recall detection insights

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "lotNumber": "LOT001",
      "vendor": {...},
      "totalFittings": 1000,
      "defectCount": 150,
      "defectRate": 15.0,
      "recommendation": "RECALL"
    }
  ]
}
```

---

#### GET /api/v1/dashboard/inventory-distribution
Get inventory distribution by zone

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "zone": "NR",
      "totalFittings": 250000,
      "byStatus": {
        "MANUFACTURED": 50000,
        "IN_TRANSIT": 10000,
        "INSTALLED": 180000,
        "DEFECTIVE": 5000,
        "DECOMMISSIONED": 5000
      }
    }
  ]
}
```

---

#### GET /api/v1/dashboard/ai-summary
Get AI prediction summary

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPredictions": 50000,
    "byRiskLevel": {
      "LOW_RISK": 30000,
      "MEDIUM_RISK": 15000,
      "HIGH_RISK": 4000,
      "CRITICAL": 1000
    },
    "averageRiskScore": 35.5,
    "averageConfidence": 82.5
  }
}
```



---

### 5.7 Integration Endpoints

#### POST /api/v1/integration/export/udm
Export data to UDM (Unified Data Management)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, DEPOT_OFFICER

**Request Body:**
```json
{
  "fittingIds": ["...", "..."],
  "format": "JSON"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exported": 100,
    "failed": 0,
    "exportId": "EXP-2024-001"
  }
}
```

---

#### POST /api/v1/integration/export/tms
Export data to TMS (Track Management System)

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN, DEPOT_OFFICER

**Request Body:**
```json
{
  "fittingIds": ["...", "..."],
  "format": "XML"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "exported": 100,
    "failed": 0,
    "exportId": "EXP-2024-002"
  }
}
```

---

#### POST /api/v1/integration/sync
Sync data with external systems

**Headers:**
```
Authorization: Bearer <access_token>
```

**Permissions:** ADMIN only

**Request Body:**
```json
{
  "fittingIds": ["...", "..."]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "synced": 100,
    "failed": 0
  }
}
```

---

### 5.8 Health & Monitoring Endpoints

#### GET /health
Health check endpoint (no authentication required)

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-03-03T10:00:00.000Z",
  "uptime": 86400,
  "environment": "production",
  "version": "v1",
  "services": {
    "mongodb": {
      "status": "connected",
      "host": "mongodb-cluster",
      "name": "railtrack_ai"
    },
    "redis": {
      "status": "connected"
    }
  }
}
```

---

#### GET /metrics
System metrics endpoint (no authentication required)

**Response:**
```json
{
  "timestamp": "2024-03-03T10:00:00.000Z",
  "process": {
    "uptime": 86400,
    "memory": {
      "rss": "512MB",
      "heapTotal": "256MB",
      "heapUsed": "128MB",
      "external": "32MB"
    },
    "cpu": {
      "user": 1500000,
      "system": 500000
    }
  },
  "database": {
    "connections": "active"
  },
  "sharding": {
    "collections": {
      "trackfittings": {
        "count": 2500000,
        "size": "5120MB",
        "indexes": 8,
        "indexSize": "512MB"
      }
    },
    "shardingEnabled": true
  }
}
```

---

## 6. Authentication & Authorization

### Authentication Flow

1. **User Registration/Login**
   - Email/Password or Google OAuth
   - Returns access token (15 min expiry) and refresh token (7 days expiry)

2. **Access Token Usage**
   - Include in Authorization header: `Bearer <access_token>`
   - Validated on every protected route

3. **Token Refresh**
   - Use refresh token to get new access token
   - Refresh token rotates on each use

4. **Logout**
   - Invalidates refresh token
   - Access token expires naturally

### Authorization Levels

#### Roles

1. **ADMIN**
   - Full system access
   - Vendor management
   - Lot recalls
   - User management
   - System configuration

2. **DEPOT_OFFICER**
   - QR batch generation
   - Fitting updates
   - Data export
   - Dashboard access

3. **INSPECTOR**
   - Conduct inspections
   - View fittings
   - AI predictions
   - Dashboard access

4. **VENDOR**
   - View own fittings
   - View own performance
   - Limited dashboard access

### Permissions

```javascript
PERMISSIONS = {
  CREATE_QR: 'create:qr',
  UPDATE_QR: 'update:qr',
  VIEW_QR: 'view:qr',
  MANAGE_VENDORS: 'manage:vendors',
  CONDUCT_INSPECTION: 'conduct:inspection',
  VIEW_DASHBOARD: 'view:dashboard',
  EXPORT_DATA: 'export:data',
  MANAGE_USERS: 'manage:users'
}
```

### Rate Limiting

- **Login Endpoint**: 5 requests per 15 minutes
- **Standard Endpoints**: 100 requests per 15 minutes
- **Strict Endpoints** (QR generation, AI predict): 10 requests per 15 minutes



---

## 7. Data Models

### 7.1 User Model

```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (hashed with bcrypt),
  role: String (enum: ADMIN, VENDOR, DEPOT_OFFICER, INSPECTOR),
  googleId: String (optional, for Google OAuth users),
  authProvider: String (enum: LOCAL, GOOGLE, default: LOCAL),
  profilePicture: String (URL),
  isActive: Boolean (default: true),
  permissions: [String],
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 7.2 Vendor Model

```javascript
{
  _id: ObjectId,
  vendorCode: String (required, unique, uppercase),
  name: String (required),
  email: String (required, unique),
  phone: String (required),
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  gstNumber: String (required, unique),
  panNumber: String (required, unique),
  performanceScore: Number (0-100, default: 0),
  riskScore: Number (0-100, default: 0),
  totalFittingsSupplied: Number (default: 0),
  defectRate: Number (percentage, default: 0),
  isActive: Boolean (default: true),
  isBlacklisted: Boolean (default: false),
  blacklistReason: String,
  blacklistDate: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `vendorCode` (unique)
- `email` (unique)
- `performanceScore` (descending)
- `riskScore` (descending)
- `isActive`

---

### 7.3 TrackFitting Model (Sharded)

```javascript
{
  _id: ObjectId,
  uniqueQRId: String (required, unique, format: IR-{TYPE}-{YEAR}-{LOT}-{SERIAL}),
  itemType: String (required, enum: RAIL, SLEEPER, FASTENER, BOLT, CLIP, PLATE),
  lotNumber: String (required, indexed),
  serialNumber: String (required, 6-digit padded),
  vendor: ObjectId (ref: Vendor, required),
  vendorCode: String (required, indexed),
  zoneCode: String (required, enum: 16 zones, indexed),
  manufacturingDate: Date (required),
  manufactureYear: Number (required, indexed),
  warrantyPeriod: Number (months, required),
  warrantyExpiry: Date (required, indexed),
  specifications: Object (flexible schema),
  status: String (enum: MANUFACTURED, IN_TRANSIT, INSTALLED, DEFECTIVE, DECOMMISSIONED, RECALLED),
  location: {
    depot: String,
    zone: String,
    division: String,
    section: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  installationDate: Date,
  riskScore: Number (0-100, default: 0, indexed),
  inspectionCount: Number (default: 0),
  defectCount: Number (default: 0),
  lastInspectionDate: Date,
  isRecalled: Boolean (default: false),
  recallReason: String,
  recallDate: Date,
  metadata: Object,
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Shard Key:** `{ zoneCode: 1, manufactureYear: 1, uniqueQRId: 1 }`

**Indexes:**
- Shard key (compound)
- `{ zoneCode: 1, status: 1 }`
- `{ zoneCode: 1, vendor: 1 }`
- `{ zoneCode: 1, lotNumber: 1 }`
- `{ zoneCode: 1, warrantyExpiry: 1 }`
- `{ zoneCode: 1, riskScore: -1 }`
- `{ uniqueQRId: 1 }` (unique)
- `{ isDeleted: 1 }` (partial, where isDeleted: true)

---

### 7.4 Counter Model (Zone-Segmented)

```javascript
{
  _id: ObjectId,
  zoneCode: String (required, enum: 16 zones),
  lotNumber: String (required),
  itemType: String (required),
  year: Number (required),
  currentSerial: Number (default: 0),
  maxSerial: Number (default: 999999)
}
```

**Unique Index:** `{ zoneCode: 1, lotNumber: 1, itemType: 1, year: 1 }`

---

### 7.5 Inspection Model (Sharded)

```javascript
{
  _id: ObjectId,
  fitting: ObjectId (ref: TrackFitting, required, indexed),
  inspector: ObjectId (ref: User, required, indexed),
  zoneCode: String (required, enum: 16 zones, indexed),
  inspectionDate: Date (required, default: now),
  inspectionYear: Number (required, indexed),
  status: String (enum: SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED),
  findings: {
    visualInspection: {
      passed: Boolean,
      notes: String
    },
    dimensionalCheck: {
      passed: Boolean,
      measurements: Object,
      notes: String
    },
    functionalTest: {
      passed: Boolean,
      notes: String
    },
    wearAnalysis: {
      wearLevel: Number (0-100),
      notes: String
    }
  },
  defectsFound: [{
    type: String,
    description: String,
    severity: String (enum: LOW, MEDIUM, HIGH, CRITICAL)
  }],
  overallResult: String (required, enum: PASS, FAIL, CONDITIONAL),
  recommendations: [String],
  nextInspectionDate: Date,
  images: [String] (URLs),
  isDeleted: Boolean (default: false),
  deletedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Shard Key:** `{ zoneCode: 1, inspectionYear: 1, fitting: 1 }`

**Indexes:**
- Shard key (compound)
- `{ zoneCode: 1, fitting: 1, inspectionDate: -1 }`
- `{ zoneCode: 1, inspector: 1, inspectionDate: -1 }`
- `{ zoneCode: 1, overallResult: 1 }` (partial, where overallResult: FAIL)

---

### 7.6 AIReport Model (Sharded)

```javascript
{
  _id: ObjectId,
  fitting: ObjectId (ref: TrackFitting, required, indexed),
  vendor: ObjectId (ref: Vendor, required, indexed),
  zoneCode: String (required, enum: 16 zones, indexed),
  predictionYear: Number (required, indexed),
  predictionData: Object (input data for AI model),
  predictionResult: Object (AI model output),
  riskScore: Number (required, 0-100, indexed),
  riskLevel: String (enum: LOW_RISK, MEDIUM_RISK, HIGH_RISK, CRITICAL),
  predictedFailureDate: Date,
  recommendations: [String],
  confidence: Number (0-100),
  modelVersion: String (required),
  processingTime: Number (milliseconds),
  createdAt: Date,
  updatedAt: Date
}
```

**Shard Key:** `{ zoneCode: 1, predictionYear: 1, fitting: 1 }`

**Indexes:**
- Shard key (compound)
- `{ zoneCode: 1, fitting: 1, createdAt: -1 }`
- `{ zoneCode: 1, riskScore: -1 }`
- `{ zoneCode: 1, vendor: 1, riskScore: -1 }`
- `{ zoneCode: 1, riskScore: -1, createdAt: -1 }` (partial, where riskScore >= 70)

---

### 7.7 PerformanceLog Model (Sharded)

```javascript
{
  _id: ObjectId,
  fitting: ObjectId (ref: TrackFitting, required, indexed),
  vendor: ObjectId (ref: Vendor, required, indexed),
  zoneCode: String (required, enum: 16 zones, indexed),
  logYear: Number (required, indexed),
  recordedDate: Date (required, default: now),
  metrics: {
    loadCapacity: {
      value: Number,
      unit: String,
      status: String
    },
    fatigueResistance: {
      cycles: Number,
      status: String
    },
    corrosionLevel: {
      value: Number,
      unit: String,
      status: String
    },
    vibrationLevel: {
      value: Number,
      unit: String,
      status: String
    },
    temperature: {
      value: Number,
      unit: String
    }
  },
  performanceScore: Number (required, 0-100),
  anomaliesDetected: [{
    type: String,
    severity: String,
    description: String
  }],
  recordedBy: ObjectId (ref: User),
  notes: String,
  isDeleted: Boolean (default: false),
  createdAt: Date,
  updatedAt: Date
}
```

**Shard Key:** `{ zoneCode: 1, logYear: 1, fitting: 1 }`

**Indexes:**
- Shard key (compound)
- `{ zoneCode: 1, fitting: 1, recordedDate: -1 }`
- `{ zoneCode: 1, vendor: 1, performanceScore: -1 }`

---

### 7.8 AuditLog Model

```javascript
{
  _id: ObjectId,
  action: String (required, indexed),
  userId: ObjectId (ref: User, indexed),
  resourceId: ObjectId,
  resourceType: String,
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date (default: now, indexed),
  correlationId: String (indexed)
}
```

**Indexes:**
- `{ userId: 1, timestamp: -1 }`
- `{ action: 1, timestamp: -1 }`
- `{ timestamp: -1 }` (TTL index, expires after 90 days)

---

### 7.9 RefreshToken Model

```javascript
{
  _id: ObjectId,
  token: String (required, unique, indexed),
  user: ObjectId (ref: User, required, indexed),
  expiresAt: Date (required, indexed),
  createdAt: Date (default: now)
}
```

**TTL Index:** `{ expiresAt: 1 }` (auto-delete expired tokens)

---

### 7.10 Archive Models

**InspectionArchive, AIReportArchive, PerformanceLogArchive**

Same schema as their respective main collections, with additional field:
```javascript
{
  originalId: ObjectId (original document ID),
  archivedAt: Date (default: now),
  // ... all other fields from original model
}
```



---

## 8. Business Logic

### 8.1 QR Code Generation

**Process:**
1. Validate zone code (must be one of 16 railway zones)
2. Validate vendor exists and is active
3. Check batch size (max 10,000)
4. Start MongoDB transaction
5. For each fitting in batch:
   - Get next serial number atomically (zone-segmented counter)
   - Generate unique QR ID: `IR-{ITEMTYPE}-{YEAR}-{LOT}-{SERIAL}`
   - Create fitting record with all required fields
6. Bulk insert all fittings
7. Commit transaction
8. Log audit trail
9. Return generated QR codes

**Atomic Counter Logic:**
- Counter is segmented by: `{ zoneCode, lotNumber, itemType, year }`
- Prevents hotspots across zones
- Uses MongoDB `findOneAndUpdate` with `$inc` for atomicity
- Max serial: 999,999 per lot

**QR Format:**
```
IR-RAIL-2024-LOTNR001-000001
│  │    │    │        └─ Serial (6 digits, padded)
│  │    │    └─ Lot Number
│  │    └─ Year
│  └─ Item Type
└─ Indian Railways prefix
```

---

### 8.2 Inspection Workflow

**Process:**
1. Inspector selects fitting (by QR scan or search)
2. System validates fitting exists and is not recalled
3. Inspector fills inspection form:
   - Visual inspection
   - Dimensional checks
   - Functional tests
   - Wear analysis
4. System automatically:
   - Extracts `zoneCode` from fitting
   - Extracts `inspectionYear` from inspection date
   - Increments fitting's `inspectionCount`
   - Updates fitting's `lastInspectionDate`
5. If inspection fails:
   - Updates fitting status to DEFECTIVE
   - Increments fitting's `defectCount`
   - Triggers alert to admin
6. Creates inspection record with shard key
7. Logs audit trail

**Inspection Results:**
- **PASS**: Fitting is in good condition
- **FAIL**: Defects found, requires action
- **CONDITIONAL**: Minor issues, monitor closely

---

### 8.3 AI Prediction

**Process:**
1. Validate fitting exists
2. Build prediction payload:
   - Fitting details (age, type, specifications)
   - Inspection history
   - Vendor performance
   - Location data
   - Current risk score
3. Call external AI service (HTTP POST)
4. Process AI response:
   - Extract risk score (0-100)
   - Determine risk level (LOW/MEDIUM/HIGH/CRITICAL)
   - Extract recommendations
   - Calculate confidence
5. Create AI report with:
   - `zoneCode` from fitting
   - `predictionYear` from current date
   - All prediction data
6. If high risk (>= 70):
   - Update fitting's risk score
   - Update vendor's risk score
   - Trigger alert
7. Log audit trail

**Risk Levels:**
- **LOW_RISK** (0-30): Normal operation
- **MEDIUM_RISK** (30-60): Monitor closely
- **HIGH_RISK** (60-80): Schedule inspection
- **CRITICAL** (80-100): Immediate action required

---

### 8.4 Vendor Performance Scoring

**Calculated Metrics:**
- **Performance Score** (0-100):
  - Based on: defect rate, on-time delivery, quality audits
  - Updated daily by background job
  - Higher is better

- **Risk Score** (0-100):
  - Based on: defect rate, recall history, AI predictions
  - Updated when new data available
  - Higher is worse

- **Defect Rate** (%):
  - (Total defects / Total fittings supplied) × 100
  - Updated on each failed inspection

**Vendor Ranking:**
- Sorted by performance score (descending)
- Top 10 displayed on dashboard
- Used for vendor selection recommendations

---

### 8.5 Data Archival

**Automated Process (Daily at 5:00 AM):**

1. **Inspections** (365+ days old):
   - Find inspections older than 365 days
   - Copy to InspectionArchive collection
   - Delete from main collection
   - Batch size: 1000 records

2. **AI Reports** (730+ days old):
   - Find reports older than 730 days
   - Copy to AIReportArchive collection
   - Delete from main collection
   - Batch size: 1000 records

3. **Performance Logs** (730+ days old):
   - Find logs older than 730 days
   - Copy to PerformanceLogArchive collection
   - Delete from main collection
   - Batch size: 1000 records

**Benefits:**
- Keeps hot data small and fast
- Maintains historical records
- Optimizes query performance
- Reduces index size

---

### 8.6 Lot Recall

**Process:**
1. Admin identifies problematic lot
2. Provides recall reason
3. System finds all fittings in lot (by zoneCode + lotNumber)
4. Updates all fittings:
   - `isRecalled: true`
   - `recallReason: <reason>`
   - `recallDate: now`
   - `status: RECALLED`
5. Sends notifications to:
   - Depot officers
   - Inspectors in affected zones
   - Vendor
6. Logs audit trail
7. Returns count of affected fittings

**Recall Triggers:**
- Manufacturing defects
- Quality audit failures
- Safety concerns
- Vendor blacklisting

---

### 8.7 Warranty Management

**Tracking:**
- Each fitting has `warrantyExpiry` date
- Background job runs daily to check expiring warranties
- Alerts generated for warranties expiring within 30 days

**Warranty Expiry Alerts:**
- Sent to depot officers
- Displayed on dashboard
- Includes fitting details and vendor info
- Allows proactive replacement planning

---

### 8.8 Dashboard Analytics

**Real-time Calculations:**

1. **Overview Stats:**
   - Total fittings (count)
   - Active fittings (not decommissioned/recalled)
   - Total inspections (count)
   - Failed inspections (count)
   - High-risk fittings (riskScore >= 70)
   - Vendor count
   - Average risk score

2. **Vendor Ranking:**
   - Top 10 vendors by performance score
   - Includes defect rate and total fittings

3. **Failure Rate by Zone:**
   - Inspections grouped by zone
   - Failure percentage calculated
   - Sorted by failure rate

4. **Inventory Distribution:**
   - Fittings grouped by zone and status
   - Provides zone-wise breakdown

**Caching:**
- Dashboard data cached in Redis (5-minute TTL)
- Reduces database load
- Improves response time

---

## 9. Environment Configuration

### Required Environment Variables

```env
# Server Configuration
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database
MONGO_URI=mongodb://localhost:27017/railtrack_ai
MONGO_TEST_URI=mongodb://localhost:27017/railtrack_ai_test

# Sharding Configuration
ENABLE_SHARDING=false
SHARD_QUERY_LOGGING=true
AI_REPORT_ARCHIVE_DAYS=730
PERFORMANCE_LOG_ARCHIVE_DAYS=730

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_CACHE_TTL=300

# AI Service
AI_SERVICE_URL=http://ai-service:8000
AI_SERVICE_TIMEOUT=3000

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# Pagination
DEFAULT_PAGE_SIZE=20
MAX_PAGE_SIZE=100

# QR Generation
QR_BATCH_MAX_SIZE=10000

# Integration
UDM_API_URL=http://udm-service/api
TMS_API_URL=http://tms-service/api
INTEGRATION_API_TOKEN=your-integration-token

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
SESSION_SECRET=your-session-secret-key-change-in-production

# Optimization Settings
AUDIT_RETENTION_DAYS=90
INSPECTION_ARCHIVE_DAYS=365
QUERY_TIMEOUT=5000
SLOW_QUERY_THRESHOLD=200

# CORS (comma-separated origins)
CORS_ORIGIN=http://localhost:3000,http://localhost:5173
```

### Configuration Files

**`.env`** - Local development (not committed)
**`.env.example`** - Template (committed)
**`src/config/index.js`** - Configuration loader



---

## 10. Deployment Guide

### 10.1 Prerequisites

- Node.js v20+
- MongoDB v7.0+
- Redis v4.6+
- npm v10+

### 10.2 Installation Steps

```bash
# 1. Clone repository
git clone <repository-url>
cd railway/backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env with your configuration

# 4. Start MongoDB
mongod --dbpath /data/db

# 5. Start Redis
redis-server

# 6. Run database migrations (if any)
npm run migrate:data

# 7. Start development server
npm run dev

# 8. Start production server
npm start
```

### 10.3 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**docker-compose.yml** includes:
- Node.js application
- MongoDB
- Redis
- AI Service (placeholder)

### 10.4 Production Deployment

**Recommended Stack:**
- **Application**: PM2 or Docker Swarm
- **Database**: MongoDB Atlas or self-hosted cluster
- **Cache**: Redis Cloud or self-hosted
- **Load Balancer**: Nginx or AWS ALB
- **Monitoring**: Prometheus + Grafana

**PM2 Deployment:**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name railtrack-api -i max

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### 10.5 MongoDB Sharding Setup

**For National-Scale Deployment:**

```bash
# 1. Enable sharding script
node scripts/enableSharding.js

# 2. Verify shard distribution
mongosh
use railtrack
db.trackfittings.getShardDistribution()
```

See `docs/SHARDING_GUIDE.md` for detailed instructions.

---

## 11. Frontend Integration Guide

### 11.1 API Base URL

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const API_VERSION = 'v1';
const BASE_PATH = `${API_BASE_URL}/api/${API_VERSION}`;
```

### 11.2 Authentication Setup

**Login Flow:**

```javascript
// 1. Login
const login = async (email, password) => {
  const response = await fetch(`${BASE_PATH}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Store tokens
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  }
  
  throw new Error(data.message);
};

// 2. Google Login
const googleLogin = async (idToken) => {
  const response = await fetch(`${BASE_PATH}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data;
  }
  
  throw new Error(data.message);
};

// 3. Refresh Token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch(`${BASE_PATH}/auth/refresh-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });
  
  const data = await response.json();
  
  if (data.success) {
    localStorage.setItem('accessToken', data.data.accessToken);
    localStorage.setItem('refreshToken', data.data.refreshToken);
    return data.data.accessToken;
  }
  
  // Refresh failed, logout user
  logout();
  throw new Error('Session expired');
};

// 4. Logout
const logout = async () => {
  const accessToken = localStorage.getItem('accessToken');
  
  await fetch(`${BASE_PATH}/auth/logout`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });
  
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
};
```

### 11.3 API Request Helper

```javascript
// Axios interceptor setup
import axios from 'axios';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 10000
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
```

### 11.4 Common API Calls

```javascript
// Get dashboard overview
const getDashboardOverview = async () => {
  const response = await api.get('/dashboard/overview');
  return response.data.data;
};

// Generate QR batch
const generateQRBatch = async (batchData) => {
  const response = await api.post('/qr/generate-batch', batchData);
  return response.data.data;
};

// Get fitting by QR code
const getFittingByQR = async (qrId) => {
  const response = await api.get(`/qr/${qrId}`);
  return response.data.data;
};

// List fittings with filters
const listFittings = async (filters) => {
  const params = new URLSearchParams(filters);
  const response = await api.get(`/qr?${params}`);
  return response.data.data;
};

// Create inspection
const createInspection = async (inspectionData) => {
  const response = await api.post('/inspections', inspectionData);
  return response.data.data;
};

// Get AI prediction
const getAIPrediction = async (fittingId) => {
  const response = await api.post('/ai/predict', { fittingId });
  return response.data.data;
};

// Get vendor list
const getVendors = async (page = 1, limit = 20) => {
  const response = await api.get(`/vendors?page=${page}&limit=${limit}`);
  return response.data.data;
};
```

### 11.5 Error Handling

```javascript
const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return { message: data.message || 'Invalid request' };
      case 401:
        return { message: 'Unauthorized. Please login again.' };
      case 403:
        return { message: 'You do not have permission to perform this action.' };
      case 404:
        return { message: 'Resource not found.' };
      case 429:
        return { message: 'Too many requests. Please try again later.' };
      case 500:
        return { message: 'Server error. Please try again later.' };
      default:
        return { message: data.message || 'An error occurred' };
    }
  } else if (error.request) {
    // Request made but no response
    return { message: 'Network error. Please check your connection.' };
  } else {
    // Something else happened
    return { message: error.message || 'An unexpected error occurred' };
  }
};

// Usage
try {
  const data = await generateQRBatch(batchData);
  // Handle success
} catch (error) {
  const errorInfo = handleAPIError(error);
  // Show error message to user
  toast.error(errorInfo.message);
}
```

### 11.6 Google OAuth Integration

```javascript
// Install: npm install @react-oauth/google

import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// Wrap app with provider
<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  <App />
</GoogleOAuthProvider>

// Login component
const LoginPage = () => {
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const data = await googleLogin(credentialResponse.credential);
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (error) {
      toast.error('Google login failed');
    }
  };
  
  return (
    <div>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => toast.error('Google login failed')}
      />
    </div>
  );
};
```

### 11.7 Pagination Helper

```javascript
const usePagination = (fetchFunction) => {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [loading, setLoading] = useState(false);
  
  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const response = await fetchFunction(page, pagination.limit);
      setData(response.items || response.fittings || response.vendors);
      setPagination(response.pagination);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(pagination.page);
  }, [pagination.page]);
  
  return { data, pagination, loading, fetchData };
};

// Usage
const { data: fittings, pagination, loading } = usePagination(
  (page, limit) => api.get(`/qr?page=${page}&limit=${limit}`)
);
```



---

## 12. Testing

### 12.1 Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

**Test Files:**
- `tests/auth.test.js` - Authentication tests
- `tests/qr.test.js` - QR generation tests
- `tests/googleAuth.test.js` - Google OAuth tests

### 12.2 Load Testing

```bash
# Light test (10K fittings, 60s)
npm run test:load:light

# Medium test (100K fittings, 5min)
npm run test:load:medium

# Heavy test (1M fittings, 10min)
npm run test:load:heavy

# Extreme test (5M fittings, 30min)
npm run test:load:extreme
```

**Load Test Reports:** `reports/load-test-report-[timestamp].json`

See `docs/LOAD_TESTING_GUIDE.md` for details.

### 12.3 API Testing with Postman

**Import Collection:**
1. Open Postman
2. Import `postman/RailTrack-FIX.postman_collection.json`
3. Import `postman/RailTrack-FIX.postman_environment.json`
4. Set environment variables
5. Run collection

---

## 13. Performance & Scalability

### 13.1 Performance Metrics

**Validated Performance:**
- ✅ 500+ writes/second sustained
- ✅ 1000+ reads/second sustained
- ✅ P95 latency < 500ms
- ✅ Error rate < 1%
- ✅ Memory stable (no leaks)
- ✅ Shard efficiency > 85%

### 13.2 Scalability Features

**Horizontal Scaling:**
- MongoDB sharding across 16 zones
- Zone-segmented counters (no hotspots)
- Distributed architecture ready
- Load balancer compatible

**Vertical Scaling:**
- Optimized queries with indexes
- Lean queries (60-70% payload reduction)
- Redis caching (5-min TTL)
- Connection pooling

**Data Growth:**
- Hot/cold data separation
- Automated archival (daily)
- 25+ crore fittings capacity
- 100+ crore inspections capacity

### 13.3 Optimization Techniques

**Query Optimization:**
- All queries include shard key (zoneCode)
- Compound indexes for common patterns
- Covered queries where possible
- Field projections to reduce payload
- Lean queries for read-only operations

**Caching Strategy:**
- Dashboard data cached (5 min)
- Vendor rankings cached
- Frequently accessed fittings cached
- Redis for session storage

**Background Jobs:**
- Audit cleanup (daily)
- Data archival (daily 5 AM)
- Vendor metrics calculation (daily)
- Warranty expiry alerts (daily)
- Cache cleanup (hourly)

**Database Optimization:**
- Compound shard keys
- Partial indexes for soft-deleted records
- TTL indexes for auto-cleanup
- Index size monitoring
- Slow query logging (>200ms)

---

## 14. Security Features

### 14.1 Authentication Security

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: 
  - Access token: 15 minutes expiry
  - Refresh token: 7 days expiry
  - Token rotation on refresh
- **Brute Force Protection**: 5 attempts, 15-min lockout
- **Session Management**: Redis-based sessions

### 14.2 Authorization

- **Role-Based Access Control (RBAC)**
- **Permission-Based Authorization**
- **Resource-Level Access Control**
- **API Key Authentication** (for integrations)

### 14.3 API Security

- **Rate Limiting**: 
  - Standard: 100 req/15min
  - Login: 5 req/15min
  - Strict: 10 req/15min
- **CORS**: Configurable origins
- **Helmet**: Security headers
- **Input Validation**: Joi schemas
- **NoSQL Injection Prevention**: express-mongo-sanitize
- **XSS Protection**: xss-clean
- **Request Size Limit**: 1MB

### 14.4 Data Security

- **Encryption at Rest**: MongoDB encryption
- **Encryption in Transit**: HTTPS/TLS
- **Sensitive Data**: Encrypted fields
- **Audit Logging**: All actions logged
- **Soft Delete**: Data never permanently deleted immediately
- **PII Protection**: Masked in logs

---

## 15. Monitoring & Logging

### 15.1 Logging

**Winston Logger:**
- **Levels**: error, warn, info, debug
- **Transports**: 
  - Console (development)
  - Daily rotate files (production)
- **Log Files**:
  - `logs/error-%DATE%.log` (errors only)
  - `logs/combined-%DATE%.log` (all logs)
- **Retention**: 14 days
- **Correlation ID**: Track requests across services

### 15.2 Monitoring Endpoints

**Health Check:** `GET /health`
- MongoDB status
- Redis status
- System uptime
- Service health

**Metrics:** `GET /metrics`
- Memory usage
- CPU usage
- Collection statistics
- Shard distribution
- Index sizes

### 15.3 Audit Trail

**All Actions Logged:**
- User authentication
- QR batch generation
- Inspection creation
- Vendor management
- Lot recalls
- Data exports

**Audit Log Fields:**
- Action type
- User ID
- Resource ID
- Timestamp
- IP address
- User agent
- Correlation ID
- Details (JSON)

---

## 16. Background Jobs

### 16.1 Scheduled Jobs (node-cron)

**Daily Jobs:**

1. **Audit Cleanup** (2:00 AM)
   - Deletes audit logs older than 90 days
   - Keeps database size manageable

2. **Data Archival** (5:00 AM)
   - Archives old inspections (365+ days)
   - Archives old AI reports (730+ days)
   - Archives old performance logs (730+ days)
   - Batch size: 1000 records

3. **Vendor Metrics** (3:00 AM)
   - Recalculates vendor performance scores
   - Updates vendor risk scores
   - Updates defect rates

4. **Warranty Expiry Alerts** (6:00 AM)
   - Finds warranties expiring within 30 days
   - Sends notifications
   - Updates dashboard

**Hourly Jobs:**

1. **Cache Cleanup** (Every hour)
   - Removes expired cache entries
   - Optimizes Redis memory

---

## 17. Error Handling

### 17.1 Error Response Format

```json
{
  "success": false,
  "message": "Error message here",
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  },
  "correlationId": "uuid-here"
}
```

### 17.2 HTTP Status Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **409**: Conflict (duplicate resource)
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error
- **503**: Service Unavailable

### 17.3 Custom Error Classes

```javascript
- ValidationError (400)
- UnauthorizedError (401)
- ForbiddenError (403)
- NotFoundError (404)
- ConflictError (409)
- ExternalServiceError (503)
```

---

## 18. API Documentation

### 18.1 Swagger/OpenAPI

**Access:** `http://localhost:5000/api-docs`

**Features:**
- Interactive API documentation
- Try-it-out functionality
- Request/response examples
- Schema definitions
- Authentication testing

### 18.2 Postman Collection

**Location:** `postman/RailTrack-FIX.postman_collection.json`

**Includes:**
- All API endpoints
- Example requests
- Environment variables
- Pre-request scripts
- Test scripts

---

## 19. Development Workflow

### 19.1 Code Structure

```
src/
├── modules/          # Feature modules
│   └── [module]/
│       ├── model.js      # Mongoose model
│       ├── repository.js # Data access layer
│       ├── service.js    # Business logic
│       ├── controller.js # Request handlers
│       ├── route.js      # Route definitions
│       └── validator.js  # Joi schemas
├── middlewares/      # Express middlewares
├── utils/           # Utility functions
├── config/          # Configuration
├── jobs/            # Background jobs
└── shared/          # Shared constants
```

### 19.2 Adding New Feature

1. Create module folder: `src/modules/[feature]/`
2. Create model: `model.js`
3. Create repository: `repository.js`
4. Create service: `service.js`
5. Create controller: `controller.js`
6. Create routes: `route.js`
7. Create validators: `validator.js`
8. Register routes in `src/routes/index.js`
9. Add tests
10. Update documentation

### 19.3 Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
# After review and approval, merge to main
```

---

## 20. Troubleshooting

### 20.1 Common Issues

**MongoDB Connection Failed:**
```bash
# Check MongoDB is running
mongosh

# Check connection string in .env
MONGO_URI=mongodb://localhost:27017/railtrack_ai
```

**Redis Connection Failed:**
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

**Port Already in Use:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

**JWT Token Invalid:**
- Check JWT_SECRET in .env matches
- Verify token hasn't expired
- Check token format: `Bearer <token>`

### 20.2 Debug Mode

```bash
# Enable debug logging
LOG_LEVEL=debug npm run dev

# Enable MongoDB query logging
mongoose.set('debug', true);
```

---

## 21. Support & Contact

### 21.1 Documentation

- **API Guide**: `docs/API_GUIDE.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Deployment**: `docs/DEPLOYMENT.md`
- **Sharding Guide**: `docs/SHARDING_GUIDE.md`
- **Load Testing**: `docs/LOAD_TESTING_GUIDE.md`
- **Google Auth**: `docs/GOOGLE_AUTH_SETUP.md`

### 21.2 Quick References

- **Quick Start**: `docs/QUICKSTART.md`
- **Project Summary**: `docs/PROJECT_SUMMARY.md`
- **Sharding Quick Start**: `docs/SHARDING_QUICK_START.md`
- **Google Auth Quick Reference**: `docs/GOOGLE_AUTH_QUICK_REFERENCE.md`

---

## 22. Appendix

### 22.1 Railway Zones Reference

| Code | Full Name |
|------|-----------|
| NR | Northern Railway |
| SR | Southern Railway |
| ER | Eastern Railway |
| WR | Western Railway |
| CR | Central Railway |
| NER | North Eastern Railway |
| ECR | East Central Railway |
| ECoR | East Coast Railway |
| NCR | North Central Railway |
| NWR | North Western Railway |
| SCR | South Central Railway |
| SER | South Eastern Railway |
| SWR | South Western Railway |
| WCR | West Central Railway |
| NF | Northeast Frontier Railway |
| Metro | Metro Railways |

### 22.2 Item Types

- **RAIL**: Railway tracks
- **SLEEPER**: Track sleepers
- **FASTENER**: Track fasteners
- **BOLT**: Bolts and nuts
- **CLIP**: Rail clips
- **PLATE**: Base plates

### 22.3 Status Values

**Fitting Status:**
- MANUFACTURED
- IN_TRANSIT
- INSTALLED
- DEFECTIVE
- DECOMMISSIONED
- RECALLED

**Inspection Status:**
- SCHEDULED
- IN_PROGRESS
- COMPLETED
- CANCELLED

**Inspection Result:**
- PASS
- FAIL
- CONDITIONAL

---

## 🎉 Project Complete!

This backend system is **production-ready** and **national-scale validated**.

**Key Achievements:**
- ✅ Complete REST API with 40+ endpoints
- ✅ National-scale sharding architecture
- ✅ Google OAuth integration
- ✅ Automated data archival
- ✅ Load tested and validated
- ✅ Comprehensive documentation
- ✅ Security hardened
- ✅ Performance optimized

**For Frontend Team:**
- All API endpoints documented with examples
- Authentication flow clearly explained
- Error handling patterns provided
- Integration code samples included
- Postman collection available

**Next Steps for Frontend:**
1. Review API endpoints (Section 5)
2. Implement authentication (Section 11.2)
3. Setup API helper (Section 11.3)
4. Integrate Google OAuth (Section 11.6)
5. Build UI components
6. Test with backend API

---

**Backend Developer:** [Your Name]
**Documentation Date:** March 3, 2026
**Version:** 1.0.0
**Status:** ✅ Production Ready


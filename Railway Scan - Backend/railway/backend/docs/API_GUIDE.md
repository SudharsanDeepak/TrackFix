# RailTrack AI - API Integration Guide

## Overview

This guide provides detailed information for integrating with the RailTrack AI backend system.

## Base URL

- Development: `http://localhost:5000/api/v1`
- Production: `https://api.railtrack.gov.in/api/v1`

## Authentication

All API requests (except registration and login) require authentication using JWT Bearer tokens.

### Getting Started

1. **Register a User**
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "role": "VENDOR",
  "vendorCode": "VEN001",
  "phone": "9876543210"
}
```

2. **Login**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass@123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

3. **Use Access Token**
```bash
GET /qr/IR-ERC-2026-LOT001-000001
Authorization: Bearer eyJhbGc...
```

### Token Refresh

Access tokens expire after 15 minutes. Use the refresh token to get a new access token:

```bash
POST /auth/refresh-token
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

## QR Code Generation

### Generate Batch

```bash
POST /qr/generate-batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemType": "ERC",
  "lotNumber": "LOT2026001",
  "quantity": 100,
  "vendorId": "65f1234567890abcdef12345",
  "manufacturingDate": "2026-01-15",
  "warrantyPeriod": 24,
  "specifications": {
    "material": "High Carbon Steel",
    "grade": "Grade A"
  }
}
```

Response:
```json
{
  "success": true,
  "message": "QR batch generated successfully",
  "data": {
    "generated": 100,
    "lotNumber": "LOT2026001",
    "itemType": "ERC",
    "qrCodes": [
      "IR-ERC-2026-LOT2026001-000001",
      "IR-ERC-2026-LOT2026001-000002",
      ...
    ]
  }
}
```

### Get Fitting by QR Code

```bash
GET /qr/IR-ERC-2026-LOT2026001-000001
Authorization: Bearer <token>
```

### List Fittings

```bash
GET /qr?vendorCode=VEN001&status=OPERATIONAL&page=1&limit=20
Authorization: Bearer <token>
```

## AI Predictions

### Run Prediction

```bash
POST /ai/predict
Authorization: Bearer <token>
Content-Type: application/json

{
  "fittingId": "65f1234567890abcdef12345"
}
```

Response:
```json
{
  "success": true,
  "message": "AI prediction completed successfully",
  "data": {
    "fitting": "65f1234567890abcdef12345",
    "riskScore": 45,
    "riskLevel": "MEDIUM_RISK",
    "predictedFailureDate": "2027-06-15",
    "recommendations": [
      "Schedule inspection within 30 days",
      "Monitor wear levels closely"
    ],
    "confidence": 87.5,
    "modelVersion": "v1.0"
  }
}
```

### Get High Risk Predictions

```bash
GET /ai/reports/high-risk?threshold=70
Authorization: Bearer <token>
```

## Dashboard Analytics

### Overview Statistics

```bash
GET /dashboard/overview
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "fittings": {
      "total": 250000,
      "active": 245000,
      "defective": 3000,
      "recalled": 2000,
      "highRisk": 5000
    },
    "vendors": {
      "total": 50,
      "active": 48,
      "blacklisted": 2
    }
  }
}
```

### Vendor Ranking

```bash
GET /dashboard/vendor-ranking?limit=10
Authorization: Bearer <token>
```

### Warranty Alerts

```bash
GET /dashboard/warranty-alerts?days=30
Authorization: Bearer <token>
```

## Inspections

### Create Inspection

```bash
POST /inspections
Authorization: Bearer <token>
Content-Type: application/json

{
  "fittingId": "65f1234567890abcdef12345",
  "findings": {
    "visualInspection": {
      "passed": true,
      "notes": "No visible defects"
    },
    "dimensionalCheck": {
      "passed": true,
      "measurements": {
        "length": "150mm",
        "width": "50mm"
      }
    }
  },
  "overallResult": "PASS",
  "recommendations": ["Next inspection in 6 months"]
}
```

### Get Inspections by Fitting

```bash
GET /inspections/fitting/65f1234567890abcdef12345?page=1&limit=10
Authorization: Bearer <token>
```

## Integration (UDM/TMS)

### Export to UDM

```bash
POST /integration/export/udm
Authorization: Bearer <token>
Content-Type: application/json

{
  "fittingIds": [
    "65f1234567890abcdef12345",
    "65f1234567890abcdef12346"
  ]
}
```

### Sync Data

```bash
POST /integration/sync
Authorization: Bearer <token>
Content-Type: application/json

{
  "fittingIds": ["65f1234567890abcdef12345"]
}
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes

- `VALIDATION_ERROR` (400): Invalid request data
- `AUTHENTICATION_ERROR` (401): Invalid or missing token
- `AUTHORIZATION_ERROR` (403): Insufficient permissions
- `NOT_FOUND` (404): Resource not found
- `DUPLICATE_ENTRY` (409): Resource already exists
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `INTERNAL_ERROR` (500): Server error

## Rate Limiting

- General API: 100 requests per 15 minutes
- Login: 5 attempts per 15 minutes
- QR Generation: 10 requests per 15 minutes

## Pagination

List endpoints support pagination:

```bash
GET /qr?page=2&limit=50
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 1000,
    "page": 2,
    "limit": 50,
    "totalPages": 20,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

## Best Practices

1. **Store tokens securely** - Never expose tokens in client-side code
2. **Implement token refresh** - Refresh tokens before they expire
3. **Handle rate limits** - Implement exponential backoff
4. **Validate responses** - Always check the `success` field
5. **Use pagination** - Don't fetch all records at once
6. **Cache when possible** - Dashboard data is cached for 5 minutes
7. **Log errors** - Track API errors for debugging

## Webhooks (Future)

Webhook support is planned for:
- QR batch completion
- AI prediction alerts
- Inspection failures
- Warranty expiry notifications

## Support

For API support:
- Email: api-support@railtrack.gov.in
- Documentation: https://docs.railtrack.gov.in
- Status Page: https://status.railtrack.gov.in

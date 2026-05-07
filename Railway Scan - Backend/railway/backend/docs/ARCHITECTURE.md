# RailTrack-FIX - System Architecture

## Overview

RailTrack-FIX is a national-scale backend system designed for Indian Railways to manage track fitting lifecycle and predictive monitoring. The system is built to handle 25+ crore records with high availability and performance.

## Architecture Principles

1. **Clean Architecture**: Separation of concerns with clear boundaries
2. **Scalability**: Horizontal scaling capability
3. **Security**: Defense in depth with multiple security layers
4. **Reliability**: Fault tolerance and graceful degradation
5. **Maintainability**: Modular design with clear interfaces

## System Components

### 1. Application Layer

```
┌─────────────────────────────────────────────────────────┐
│                    API Gateway (Nginx)                   │
│                  Load Balancer + SSL/TLS                 │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Express.js Application (Node.js)            │
│  ┌──────────┬──────────┬──────────┬──────────────────┐  │
│  │  Auth    │  Vendor  │   QR     │  Inspection      │  │
│  │  Module  │  Module  │  Module  │  Module          │  │
│  ├──────────┼──────────┼──────────┼──────────────────┤  │
│  │   AI     │Dashboard │Integration│  Audit          │  │
│  │  Module  │  Module  │  Module  │  Module          │  │
│  └──────────┴──────────┴──────────┴──────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2. Data Layer

```
┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│    MongoDB       │    │      Redis       │    │   AI Service     │
│  (Primary DB)    │    │   (Cache Layer)  │    │  (FastAPI/ML)    │
│                  │    │                  │    │                  │
│  - Users         │    │  - Dashboard     │    │  - Predictions   │
│  - Vendors       │    │  - Vendor Rank   │    │  - Risk Scoring  │
│  - Fittings      │    │  - Failure Rate  │    │  - Analytics     │
│  - Inspections   │    │  - Warranty      │    │                  │
│  - AI Reports    │    │                  │    │                  │
│  - Audit Logs    │    │                  │    │                  │
└──────────────────┘    └──────────────────┘    └──────────────────┘
```

### 3. External Integrations

```
┌─────────────────────────────────────────────────────────┐
│                  RailTrack-FIX Backend                    │
└─────────────────────────────────────────────────────────┘
                    │           │
        ┌───────────┘           └───────────┐
        ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│   UDM System     │              │   TMS System     │
│  (Unified Data   │              │  (Track Mgmt)    │
│   Management)    │              │                  │
└──────────────────┘              └──────────────────┘
```

## Module Architecture

Each module follows clean architecture pattern:

```
Module/
├── controller.js    → HTTP request/response handling
├── service.js       → Business logic
├── repository.js    → Database operations
├── model.js         → Data schema
├── validator.js     → Input validation
└── route.js         → Route definitions
```

### Data Flow

```
Request → Route → Middleware → Validator → Controller → Service → Repository → Database
                                                            ↓
                                                        Cache Layer
                                                            ↓
                                                      External APIs
```

## Security Architecture

### 1. Authentication Flow

```
User Login
    ↓
Credentials Validation
    ↓
Generate Access Token (15 min)
Generate Refresh Token (7 days)
    ↓
Store Refresh Token in DB
    ↓
Return Tokens to Client
    ↓
Client stores tokens securely
    ↓
Subsequent requests use Access Token
    ↓
Token expires → Use Refresh Token
    ↓
Get new Access Token
```

### 2. Authorization (RBAC)

```
Request with JWT
    ↓
Verify Token Signature
    ↓
Extract User Role
    ↓
Check Role Permissions
    ↓
Check Specific Permission
    ↓
Allow/Deny Access
```

### 3. Security Layers

1. **Network Layer**: Firewall, DDoS protection
2. **Transport Layer**: SSL/TLS encryption
3. **Application Layer**: Helmet, CORS, Rate limiting
4. **Authentication Layer**: JWT, bcrypt
5. **Authorization Layer**: RBAC, permissions
6. **Data Layer**: MongoDB injection prevention, XSS protection
7. **Audit Layer**: Comprehensive logging

## QR Generation Architecture

### Atomic Counter System

```
Request: Generate 100 QR codes for LOT2026001
    ↓
Start MongoDB Transaction
    ↓
Lock Counter Document (LOT2026001)
    ↓
Get Current Serial: 50
    ↓
Increment Counter: 50 → 150
    ↓
Generate QR IDs: 000051 to 000150
    ↓
Bulk Insert Fittings
    ↓
Commit Transaction
    ↓
Return QR Codes
```

### QR Format

```
IR-{ITEMTYPE}-{YEAR}-{LOT}-{SERIAL}
│   │          │      │     │
│   │          │      │     └─ 6-digit serial (000001-999999)
│   │          │      └─────── Lot number (LOT2026001)
│   │          └────────────── Year (2026)
│   └───────────────────────── Item type (ERC, PANDROL, etc.)
└───────────────────────────── Prefix (Indian Railways)

Example: IR-ERC-2026-LOT2026001-000045
```

## AI Integration Architecture

### Prediction Flow

```
Trigger AI Prediction
    ↓
Fetch Fitting Data
    ↓
Fetch Inspection History
    ↓
Build Prediction Payload
    ↓
Call AI Service (FastAPI)
    ↓
Receive Prediction Result
    ↓
Store AI Report
    ↓
Update Fitting Risk Score
    ↓
Update Vendor Risk Score (if high risk)
    ↓
Return Prediction
```

### Circuit Breaker Pattern

```
AI Service Call
    ↓
Success? → Store result
    ↓
Failure? → Retry (max 3 times)
    ↓
Still failing? → Open circuit
    ↓
Use fallback (cached data or default)
    ↓
After timeout → Half-open circuit
    ↓
Test with single request
    ↓
Success? → Close circuit
Failure? → Keep open
```

## Dashboard Architecture

### Aggregation Pipeline

```
Dashboard Request
    ↓
Check Redis Cache
    ↓
Cache Hit? → Return cached data
    ↓
Cache Miss? → Run MongoDB Aggregation
    ↓
Complex aggregations:
  - Vendor ranking
  - Failure rate by region
  - Warranty alerts
  - Batch recall detection
  - Inventory distribution
    ↓
Store in Redis (5 min TTL)
    ↓
Return data
```

### Caching Strategy

- **Dashboard Stats**: 5 minutes
- **Vendor Ranking**: 5 minutes
- **Failure Rate**: 5 minutes
- **Warranty Alerts**: 5 minutes
- **User Sessions**: 15 minutes

## Database Design

### Indexing Strategy

```javascript
// TrackFitting Collection
{
  uniqueQRId: 1,                    // Unique index
  vendorCode: 1, status: 1,         // Compound index
  lotNumber: 1, serialNumber: 1,    // Compound index
  warrantyExpiry: 1, status: 1,     // Compound index
  'location.depot': 1, status: 1,   // Compound index
  riskScore: -1,                    // Descending index
  createdAt: -1                     // Descending index
}

// User Collection
{
  email: 1, isDeleted: 1,           // Compound index
  role: 1, isActive: 1,             // Compound index
  vendorCode: 1                     // Sparse index
}

// Vendor Collection
{
  vendorCode: 1,                    // Unique index
  performanceScore: -1,             // Descending index
  riskScore: -1,                    // Descending index
  isActive: 1, isBlacklisted: 1     // Compound index
}
```

### Sharding Strategy (for 25+ crore records)

```
Shard Key: vendorCode + lotNumber

Shard 1: Vendors A-G
Shard 2: Vendors H-N
Shard 3: Vendors O-U
Shard 4: Vendors V-Z
```

## Performance Optimization

### 1. Database Optimization
- Compound indexes for common queries
- Lean queries for read operations
- Aggregation pipeline optimization
- Connection pooling

### 2. Caching Strategy
- Redis for frequently accessed data
- 5-minute TTL for dashboard data
- Cache invalidation on updates

### 3. API Optimization
- Response compression
- Pagination for list endpoints
- Async/await for non-blocking I/O
- Bulk operations for batch processing

### 4. Monitoring
- API latency tracking
- Database query performance
- Cache hit rate
- Error rate monitoring

## Scalability

### Horizontal Scaling

```
Load Balancer
    ↓
┌────────┬────────┬────────┬────────┐
│ Node 1 │ Node 2 │ Node 3 │ Node 4 │
└────────┴────────┴────────┴────────┘
    ↓
MongoDB Replica Set
    ↓
┌────────┬────────┬────────┐
│Primary │Secondary│Secondary│
└────────┴────────┴────────┘
```

### Capacity Planning

- **Current**: 3 application nodes, 3 DB nodes
- **Target**: 10 application nodes, 5 DB shards
- **Peak Load**: 10,000 concurrent users
- **Data Volume**: 25+ crore records
- **API Latency**: <300ms (p95)
- **Availability**: 99.9% uptime

## Disaster Recovery

### Backup Strategy
- **MongoDB**: Daily full backup, hourly incremental
- **Redis**: AOF persistence, daily RDB backup
- **Logs**: 90-day retention, archived to S3

### Recovery Procedures
- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 1 hour
- **Backup Location**: Multi-region cloud storage

## Monitoring & Observability

### Metrics
- Request rate, response time, error rate
- Database connections, query performance
- Cache hit rate, memory usage
- CPU usage, disk I/O

### Logging
- Application logs (Winston)
- Access logs (Nginx)
- Error logs (centralized)
- Audit logs (security events)

### Alerting
- High error rate (>5%)
- Slow response time (>1s)
- Database connection issues
- High memory usage (>80%)
- Disk space low (<20%)

## Technology Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js
- **Database**: MongoDB 7.0
- **Cache**: Redis 7
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Testing**: Jest, Supertest
- **Documentation**: Swagger
- **Containerization**: Docker
- **Orchestration**: Kubernetes (optional)

## Future Enhancements

1. **GraphQL API**: For flexible data querying
2. **WebSocket**: Real-time updates
3. **Message Queue**: RabbitMQ/Kafka for async processing
4. **Microservices**: Split into smaller services
5. **Event Sourcing**: For audit trail
6. **CQRS**: Separate read/write models
7. **Machine Learning**: Enhanced AI predictions
8. **Mobile App**: Native iOS/Android apps

---

**Document Version**: 1.0  
**Last Updated**: March 2026  
**Maintained By**: RailTrack-FIX Development Team

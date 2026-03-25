# RailTrack AI - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js 20+ installed
- Docker & Docker Compose installed
- Git installed

### Option 1: Docker (Recommended)

```bash
# 1. Navigate to backend directory
cd railway/backend

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up --build

# 4. Wait for services to start (30-60 seconds)
# You'll see: "RailTrack AI Backend running on port 5000"

# 5. Test the API
curl http://localhost:5000/health
```

That's it! Your backend is running at http://localhost:5000

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env

# 3. Start MongoDB and Redis locally
# (or update .env to point to your instances)

# 4. Start the server
npm run dev
```

## 📝 First API Calls

### 1. Register a User

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@railtrack.gov.in",
    "password": "Admin@1234",
    "role": "ADMIN",
    "phone": "9876543210"
  }'
```

### 2. Login (Email/Password)

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@railtrack.gov.in",
    "password": "Admin@1234"
  }'
```

Save the `accessToken` from the response!

### 2b. Login with Google (Optional)

If you've configured Google OAuth:

```bash
curl -X POST http://localhost:5000/api/v1/auth/google \
  -H "Content-Type: application/json" \
  -d '{
    "token": "google-id-token-from-frontend"
  }'
```

**Note**: Google OAuth is optional. See [GOOGLE_AUTH_QUICK_REFERENCE.md](GOOGLE_AUTH_QUICK_REFERENCE.md) for setup.

### 3. Create a Vendor

```bash
curl -X POST http://localhost:5000/api/v1/vendors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "vendorCode": "VEN001",
    "name": "Test Vendor Ltd",
    "email": "vendor@test.com",
    "phone": "9876543210",
    "address": {
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    }
  }'
```

### 4. Generate QR Batch

```bash
curl -X POST http://localhost:5000/api/v1/qr/generate-batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "itemType": "ERC",
    "lotNumber": "LOT2026001",
    "quantity": 10,
    "vendorId": "VENDOR_ID_FROM_STEP_3",
    "manufacturingDate": "2026-01-15",
    "warrantyPeriod": 24
  }'
```

### 5. View Dashboard

```bash
curl http://localhost:5000/api/v1/dashboard/overview \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📚 Explore API Documentation

Open your browser and visit:
```
http://localhost:5000/api-docs
```

Interactive Swagger UI with all endpoints, schemas, and examples!

## 🔍 Check Logs

```bash
# View backend logs
docker-compose logs -f backend

# View MongoDB logs
docker-compose logs -f mongodb

# View Redis logs
docker-compose logs -f redis
```

## 🛑 Stop Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 🧪 Run Tests

```bash
# Install dependencies first
npm install

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

## 📊 Monitor Services

### Check Health
```bash
curl http://localhost:5000/health
```

### Check MongoDB
```bash
docker exec -it railtrack-mongodb mongosh
> show dbs
> use railtrack_ai
> show collections
```

### Check Redis
```bash
docker exec -it railtrack-redis redis-cli
> PING
> KEYS *
```

## 🔧 Common Issues

### Port Already in Use
```bash
# Change ports in docker-compose.yml
# Or stop conflicting services
```

### MongoDB Connection Failed
```bash
# Check MongoDB is running
docker ps | grep mongodb

# Check logs
docker-compose logs mongodb
```

### Redis Connection Failed
```bash
# Redis is optional - system works without it
# Check logs
docker-compose logs redis
```

## 📖 Next Steps

1. **Read Documentation**
   - [README.md](README.md) - Complete guide
   - [API_GUIDE.md](docs/API_GUIDE.md) - API integration
   - [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design
   - [DEPLOYMENT.md](docs/DEPLOYMENT.md) - Production deployment
   - [GOOGLE_AUTH_QUICK_REFERENCE.md](GOOGLE_AUTH_QUICK_REFERENCE.md) - Google OAuth setup

2. **Explore Modules**
   - Authentication & Authorization (with Google OAuth)
   - Vendor Management
   - QR Code Generation
   - AI Predictions
   - Dashboard Analytics
   - Inspections
   - External Integrations

3. **Test Features**
   - Create users with different roles
   - Generate QR batches
   - Run AI predictions
   - View dashboard analytics
   - Export data to UDM/TMS

4. **Customize**
   - Update environment variables
   - Configure external services
   - Add custom business logic
   - Extend API endpoints

## 💡 Pro Tips

1. **Use Postman Collection**: Import Swagger JSON for easy testing
2. **Enable Debug Logs**: Set `LOG_LEVEL=debug` in .env
3. **Monitor Performance**: Check logs for slow queries
4. **Cache Warming**: Hit dashboard endpoints to populate cache
5. **Backup Data**: Regular MongoDB backups before testing

## 🎯 Sample Workflow

```bash
# 1. Register Admin
POST /api/v1/auth/register

# 2. Login as Admin
POST /api/v1/auth/login

# 3. Create Vendor
POST /api/v1/vendors

# 4. Generate QR Batch
POST /api/v1/qr/generate-batch

# 5. View Generated QR
GET /api/v1/qr/IR-ERC-2026-LOT2026001-000001

# 6. Create Inspection
POST /api/v1/inspections

# 7. Run AI Prediction
POST /api/v1/ai/predict

# 8. View Dashboard
GET /api/v1/dashboard/overview

# 9. Export to UDM
POST /api/v1/integration/export/udm
```

## 🆘 Need Help?

- **Documentation**: Check docs/ folder
- **API Reference**: http://localhost:5000/api-docs
- **Logs**: docker-compose logs -f
- **Issues**: Check error logs in logs/ folder

## ✅ Verification Checklist

- [ ] Services started successfully
- [ ] Health check returns 200
- [ ] Can register a user
- [ ] Can login and get token
- [ ] Can create a vendor
- [ ] Can generate QR batch
- [ ] Can view dashboard
- [ ] API docs accessible
- [ ] Logs are being written

---

**Ready to build?** Start with the API documentation at http://localhost:5000/api-docs

**Questions?** Check [README.md](README.md) for detailed information.

**Production deployment?** See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for production setup.

# RailTrack AI - Deployment Guide

## Production Deployment Checklist

### Pre-Deployment

- [ ] Review and update all environment variables
- [ ] Set strong JWT secrets (minimum 64 characters)
- [ ] Configure production MongoDB URI with authentication
- [ ] Set up Redis cluster for high availability
- [ ] Configure SSL/TLS certificates
- [ ] Set up domain and DNS records
- [ ] Configure firewall rules
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up automated backups
- [ ] Review security settings
- [ ] Load test the application
- [ ] Prepare rollback plan

### Environment Variables (Production)

```bash
# Server
NODE_ENV=production
PORT=5000
API_VERSION=v1

# Database (Use MongoDB Atlas or self-hosted cluster)
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/railtrack_ai?retryWrites=true&w=majority

# JWT (Generate strong secrets)
JWT_SECRET=<64-character-random-string>
JWT_REFRESH_SECRET=<64-character-random-string>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Redis (Use Redis Cloud or self-hosted cluster)
REDIS_URL=redis://username:password@redis-host:6379
REDIS_CACHE_TTL=300

# AI Service
AI_SERVICE_URL=https://ai.railtrack.gov.in
AI_SERVICE_TIMEOUT=3000

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_DIR=logs

# CORS
CORS_ORIGIN=https://railtrack.gov.in,https://admin.railtrack.gov.in

# Integration
UDM_API_URL=https://udm.railways.gov.in/api
TMS_API_URL=https://tms.railways.gov.in/api
INTEGRATION_API_TOKEN=<secure-token>
```

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t railtrack-backend:1.0.0 .
```

### 2. Tag for Registry

```bash
docker tag railtrack-backend:1.0.0 registry.railtrack.gov.in/railtrack-backend:1.0.0
docker tag railtrack-backend:1.0.0 registry.railtrack.gov.in/railtrack-backend:latest
```

### 3. Push to Registry

```bash
docker push registry.railtrack.gov.in/railtrack-backend:1.0.0
docker push registry.railtrack.gov.in/railtrack-backend:latest
```

### 4. Deploy with Docker Compose

```bash
# Production docker-compose.yml
version: '3.8'

services:
  backend:
    image: registry.railtrack.gov.in/railtrack-backend:1.0.0
    restart: always
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env.production
    volumes:
      - ./logs:/app/logs
    depends_on:
      - mongodb
      - redis
    networks:
      - railtrack-network
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G

  mongodb:
    image: mongo:7.0
    restart: always
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
      - mongodb_config:/data/configdb
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=<secure-password>
      - MONGO_INITDB_DATABASE=railtrack_ai
    networks:
      - railtrack-network

  redis:
    image: redis:7-alpine
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    command: redis-server --requirepass <secure-password> --appendonly yes
    networks:
      - railtrack-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - backend
    networks:
      - railtrack-network

volumes:
  mongodb_data:
  mongodb_config:
  redis_data:

networks:
  railtrack-network:
    driver: bridge
```

### 5. Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Kubernetes Deployment

### 1. Create Namespace

```bash
kubectl create namespace railtrack
```

### 2. Create Secrets

```bash
kubectl create secret generic railtrack-secrets \
  --from-literal=jwt-secret=<secret> \
  --from-literal=jwt-refresh-secret=<secret> \
  --from-literal=mongo-uri=<uri> \
  --from-literal=redis-url=<url> \
  -n railtrack
```

### 3. Deploy Application

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: railtrack-backend
  namespace: railtrack
spec:
  replicas: 3
  selector:
    matchLabels:
      app: railtrack-backend
  template:
    metadata:
      labels:
        app: railtrack-backend
    spec:
      containers:
      - name: backend
        image: registry.railtrack.gov.in/railtrack-backend:1.0.0
        ports:
        - containerPort: 5000
        env:
        - name: NODE_ENV
          value: "production"
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: railtrack-secrets
              key: jwt-secret
        - name: MONGO_URI
          valueFrom:
            secretKeyRef:
              name: railtrack-secrets
              key: mongo-uri
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 5000
          initialDelaySeconds: 10
          periodSeconds: 5
```

```bash
kubectl apply -f deployment.yaml
```

### 4. Create Service

```yaml
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: railtrack-backend-service
  namespace: railtrack
spec:
  selector:
    app: railtrack-backend
  ports:
  - protocol: TCP
    port: 80
    targetPort: 5000
  type: LoadBalancer
```

```bash
kubectl apply -f service.yaml
```

## Nginx Configuration

```nginx
upstream backend {
    least_conn;
    server backend:5000 max_fails=3 fail_timeout=30s;
}

server {
    listen 80;
    server_name api.railtrack.gov.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.railtrack.gov.in;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 10M;

    location / {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## Monitoring Setup

### Prometheus Configuration

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'railtrack-backend'
    static_configs:
      - targets: ['backend:5000']
```

### Grafana Dashboard

Import dashboard for:
- API request rate
- Response times
- Error rates
- Database connections
- Redis cache hit rate
- Memory usage
- CPU usage

## Backup Strategy

### MongoDB Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGO_URI" --out="/backups/mongodb_$DATE"
# Upload to S3 or cloud storage
aws s3 cp "/backups/mongodb_$DATE" s3://railtrack-backups/mongodb/ --recursive
# Keep only last 30 days
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

### Redis Backup

```bash
# Redis persistence is enabled with AOF
# Backup RDB file daily
cp /data/dump.rdb /backups/redis_$(date +%Y%m%d).rdb
```

## Scaling

### Horizontal Scaling

```bash
# Docker Swarm
docker service scale railtrack_backend=5

# Kubernetes
kubectl scale deployment railtrack-backend --replicas=5 -n railtrack
```

### Database Scaling

- Set up MongoDB replica set (3+ nodes)
- Enable sharding for collections with 25+ crore records
- Use read replicas for analytics queries

### Redis Scaling

- Set up Redis Cluster (6+ nodes)
- Use Redis Sentinel for high availability

## Security Hardening

1. **Firewall Rules**
```bash
# Allow only necessary ports
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

2. **SSL/TLS**
- Use Let's Encrypt or government-issued certificates
- Enable HSTS
- Configure strong cipher suites

3. **Database Security**
- Enable authentication
- Use encrypted connections
- Restrict network access
- Regular security audits

4. **Application Security**
- Keep dependencies updated
- Run security scans (npm audit)
- Enable rate limiting
- Implement IP whitelisting for admin endpoints

## Rollback Procedure

```bash
# Docker
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --force-recreate

# Kubernetes
kubectl rollout undo deployment/railtrack-backend -n railtrack
kubectl rollout status deployment/railtrack-backend -n railtrack
```

## Health Checks

```bash
# Application health
curl https://api.railtrack.gov.in/health

# Database health
mongo --eval "db.adminCommand('ping')"

# Redis health
redis-cli ping
```

## Troubleshooting

### High Memory Usage
```bash
# Check container stats
docker stats

# Restart service
docker-compose restart backend
```

### Database Connection Issues
```bash
# Check MongoDB logs
docker logs railtrack-mongodb

# Test connection
mongo $MONGO_URI --eval "db.adminCommand('ping')"
```

### Application Errors
```bash
# View logs
docker logs -f railtrack-backend

# Check error logs
tail -f logs/error-*.log
```

## Post-Deployment

- [ ] Verify all endpoints are working
- [ ] Run smoke tests
- [ ] Check monitoring dashboards
- [ ] Verify backup jobs
- [ ] Update documentation
- [ ] Notify stakeholders
- [ ] Monitor for 24 hours

## Support Contacts

- DevOps Team: devops@railtrack.gov.in
- Database Team: dba@railtrack.gov.in
- Security Team: security@railtrack.gov.in
- On-call: +91-XXXX-XXXXXX

# Production-Only Notification Microservice (2MB)

Single-file Node.js microservice optimized exclusively for production deployment. Extracts user ID from JWT tokens and queries notifications from MySQL. Runs in just 2MB of RAM.

## Features

- Production-only configuration
- JWT verification
- Notification retrieval by user ID
- Role-based access control
- Ultra-minimal (2MB RAM)
- Single file implementation

## Environment Variables

```
PORT
DATABASE_HOST
DATABASE_DEFAULT
DATABASE_PASSWORD
DATABASE_PORT
DATABASE_USER
JWT_SECRET
```

## API Endpoints

- `GET /api/notifications` - Get notifications (optional: ?userId=UID007)
- `GET /notifications` - Redirects to /api/notifications
- `GET /ping` - Health check

## JWT Token

Requires:
- `uid` or `sub`: User ID
- `role`: 'ROLE_MANAGER' for manager access

## Deployment

```bash
# Production-only deployment
docker build -t noti-service .
docker run -p 8080:8080 \
  -e DATABASE_HOST=host \
  -e DATABASE_USER=user \
  -e DATABASE_PASSWORD=pass \
  -e DATABASE_DEFAULT=db \
  -e JWT_SECRET=secret \
  noti-service
``` 
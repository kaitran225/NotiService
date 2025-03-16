# Ultra-Lightweight Notification Service

A minimal Node.js microservice that extracts user ID from JWT tokens and queries notifications from an existing MySQL database. Optimized to run in just 10-15MB of RAM.

## Features

- JWT token verification
- Notification retrieval by user ID
- Role-based access control (manager role)
- Ultra-lightweight (10-15MB RAM usage)
- Extreme memory optimization
- Production-ready

## Prerequisites

- Node.js (v14+)
- Existing MySQL database

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/noti-service.git
   cd noti-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Environment Variables:
   ```
   PORT
   DATABASE_HOST
   DATABASE_DEFAULT
   DATABASE_PASSWORD
   DATABASE_PORT
   DATABASE_USER
   JWT_SECRET
   ```

4. Start the server:
   ```
   npm start
   ```

## Memory Optimization

Extreme memory optimization techniques:

- Sets max old space size to just 15MB
- Multi-stage Docker build for minimal footprint
- Minimal middleware usage
- Limited query results (20 notifications max)
- Reduced buffer pool size
- Minimal connection pool (2 connections max)
- Stripped error messages
- No default values for critical config
- Graceful shutdown handling

## API Endpoints

### Notifications

Requires JWT token with uid claim:
`Authorization: Bearer your_jwt_token`

- **Get notifications**
  - `GET /api/notifications`
  - Returns up to 20 most recent notifications for the authenticated user
  - Optional query parameter: `userId` (only for managers)
  - Example: `GET /api/notifications?userId=123`

### Health Check

- **Ping**
  - `GET /ping`
  - Returns: `{ "message": "pong" }`

## JWT Token Requirements

The JWT token must include:
- `uid`: User ID for authentication
- `isManager` (optional): Boolean flag indicating if user has manager role

## Existing Database Schema

The service integrates with an existing Spring Boot database schema:

```java
@Entity
@Table(name = "Notifications")
public class Notifications {
    @Id
    @Column(name = "NotificationID", length = 36)
    private String notificationID;

    @Column(name = "UserID", length = 36, nullable = false)
    private String userID;

    @Column(name = "Title", length = 255, nullable = false)
    private String title;

    @Column(name = "Message", columnDefinition = "TEXT", nullable = false)
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "Type", nullable = false, length = 20)
    private NotificationType type;

    @Column(name = "IsRead")
    private Boolean isRead;

    @Column(name = "CreatedAt", updatable = false)
    private LocalDateTime createdAt;
    
    // Additional fields and relationships...
}
```

## Docker Support

```bash
# Build
docker build -t noti-service .

# Run
docker run -p 3000:3000 \
  -e DATABASE_HOST=your_db_host \
  -e DATABASE_USER=your_db_user \
  -e DATABASE_PASSWORD=your_db_password \
  -e DATABASE_DEFAULT=your_db_name \
  -e JWT_SECRET=your_jwt_secret \
  noti-service
```

## License

MIT 
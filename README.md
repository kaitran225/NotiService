# Notification Service API

A lightweight Node.js API service that extracts user ID (uid) from JWT tokens and uses it to query notifications from an existing MySQL database created by a Spring Boot application.

## Features

- JWT token verification and claim extraction
- Notification retrieval based on user ID (uid) from JWT
- Mark notifications as read
- Integration with existing Spring Boot database
- Lightweight design (< 10MB)
- Production-ready configuration

## Prerequisites

- Node.js (v14 or higher)
- Existing MySQL database from Spring Boot application

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
   The service is configured to use the following production environment variables:
   ```
   PORT
   DATABASE_HOST
   DATABASE_NAME
   DATABASE_PASSWORD
   DATABASE_PORT
   DATABASE_USER
   JWT_SECRET
   ```
   
   These should be set in your production environment. The service runs in production mode by default.

4. Start the server:
   ```
   npm start
   ```

## API Endpoints

### Notifications

All endpoints require authentication with a JWT token in the Authorization header:
`Authorization: Bearer your_jwt_token`

The JWT token must contain a `uid` claim that identifies the user.

- **Get all notifications for the authenticated user**
  - `GET /api/notifications`
  - Returns notifications for the user identified by the uid in the JWT token

- **Mark a notification as read**
  - `PATCH /api/notifications/:id`
  - Marks the specified notification as read if it belongs to the user

### Token Verification

- **Verify Token**
  - `GET /api/verify-token`
  - Returns the decoded JWT token claims if the token is valid

### Health Check

- **Ping**
  - `GET /ping`
  - Returns: `{ "message": "pong" }`

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

To build and run the service using Docker:

```bash
# Build the Docker image
docker build -t noti-service .

# Run the container with environment variables
docker run -p 3000:3000 \
  -e DATABASE_HOST=your_db_host \
  -e DATABASE_USER=your_db_user \
  -e DATABASE_PASSWORD=your_db_password \
  -e DATABASE_NAME=your_db_name \
  -e JWT_SECRET=your_jwt_secret \
  noti-service
```

## License

MIT 
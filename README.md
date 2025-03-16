# Notification Service API

A lightweight Node.js API service that extracts user ID (uid) from JWT tokens and uses it to query notifications from a MySQL database.

## Features

- JWT token verification and claim extraction
- Notification retrieval based on user ID (uid) from JWT
- Mark notifications as read
- MySQL database integration
- Lightweight design (< 10MB)
- Production-ready configuration

## Prerequisites

- Node.js (v14 or higher)
- MySQL server

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

## Database Schema

The service uses a simple database schema:

```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id)
)
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
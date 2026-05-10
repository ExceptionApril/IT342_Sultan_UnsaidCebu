# Unsaid Cebu - User Authentication System

## Project Information
- **Group ID**: edu.cit.sultan
- **Artifact ID**: unsaidcebu
- **Spring Boot Version**: 3.5.11
- **Database**: PostgreSQL (Supabase)

## Features Implemented
✅ User Registration
✅ User Login
✅ Secure Password Storage (BCrypt)
✅ Duplicate Email Prevention
✅ Input Validation

## Database Schema

### Table: users

| Column     | Type         | Constraints           | Description                    |
|------------|--------------|----------------------|--------------------------------|
| id         | BIGSERIAL    | PRIMARY KEY          | Auto-generated user ID         |
| name       | VARCHAR(100) | NOT NULL             | User's full name               |
| email      | VARCHAR(255) | NOT NULL, UNIQUE     | User's email address           |
| password   | VARCHAR      | NOT NULL             | Hashed password (BCrypt)       |
| created_at | TIMESTAMP    | NOT NULL, DEFAULT NOW| Account creation timestamp     |

## API Endpoints

### 1. User Registration
**POST** `/api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (201 Created):**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "message": "User registered successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Email already registered"
}
```

### 2. User Login
**POST** `/api/auth/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (200 OK):**
```json
{
  "userId": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "message": "Login successful"
}
```

**Error Response (401 Unauthorized):**
```json
{
  "message": "Invalid email or password"
}
```

### 3. Health Check
**GET** `/api/auth/health`

**Response:**
```
Authentication API is running
```

## Validation Rules

### Registration:
- **Name**: 2-100 characters, required
- **Email**: Valid email format, required, must be unique
- **Password**: Minimum 6 characters, required

### Login:
- **Email**: Valid email format, required
- **Password**: Required

## Security Features
1. **Password Hashing**: All passwords are hashed using BCrypt before storage
2. **Duplicate Prevention**: Email uniqueness is enforced at both database and application level
3. **Input Validation**: All inputs are validated using Jakarta Validation (Bean Validation)
4. **CORS Enabled**: Cross-Origin Resource Sharing enabled for frontend integration

## How to Run

1. Make sure PostgreSQL database is running and connection details in `application.properties` are correct

2. Build the project:
```bash
mvnw clean install
```

3. Run the application:
```bash
mvnw spring-boot:run
```

4. The API will be available at: `http://localhost:8080`

## Testing with Postman or cURL

### Register a new user:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Login:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

## Project Structure
```
src/main/java/edu/cit/sultan/unsaidcebu/
├── config/
│   └── SecurityConfig.java          # Spring Security configuration
├── controller/
│   └── AuthController.java          # REST API endpoints
├── dto/
│   ├── RegisterRequest.java         # Registration request DTO
│   ├── LoginRequest.java            # Login request DTO
│   └── AuthResponse.java            # Authentication response DTO
├── entity/
│   └── User.java                    # User entity/model
├── exception/
│   └── GlobalExceptionHandler.java  # Global exception handling
├── repository/
│   └── UserRepository.java          # Database operations
├── service/
│   └── AuthService.java             # Business logic
└── UnsaidcebuApplication.java       # Main application class
```

## Notes
- The application uses Spring Boot 3.5.11
- Database tables are auto-created using JPA (spring.jpa.hibernate.ddl-auto=update)
- Passwords are never stored in plain text
- All authentication endpoints are publicly accessible (no authentication required)

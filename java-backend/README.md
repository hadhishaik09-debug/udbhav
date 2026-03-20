# Health Record Backend

This is the Spring Boot backend for the QR-based health record system.

## Features
- RESTful API for admin, patient, document, and public endpoints
- JWT-based authentication
- MySQL database integration
- Email notifications
- QR code generation for sharing records
- Dockerized for easy deployment
- Health check endpoint at `/api/health`
- Global CORS enabled for frontend/mobile integration

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 17 (for local development)
- Maven

### Running with Docker Compose
```sh
docker-compose up --build
```
- Backend: http://localhost:8081
- MySQL: localhost:3306 (user: root, password: password)

### Running Locally
```sh
cd java-backend
mvn spring-boot:run
```

## API Endpoints
- `/api/auth/*` — Patient registration/login
- `/api/admin/*` — Admin registration/login
- `/api/patient/*` — Patient document/QR management
- `/api/documents/*` — Document upload and retrieval
- `/api/public/*` — Public sharing endpoints
- `/api/health` — Health check

## Environment Variables
See `application.properties` and `docker-compose.yml` for configuration.

## CORS
CORS is enabled for all origins and methods by default. Adjust in `CorsConfig.java` if needed.

---
For more details, see the source code and configuration files.

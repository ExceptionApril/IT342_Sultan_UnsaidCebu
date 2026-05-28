# Setup Guide

## Prerequisites

| Tool | Version |
|------|---------|
| Java | 11+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| Android Studio | Ladybug / 2024.x |
| Git | any |

---

## 1. Backend (Spring Boot)

```bash
cd unsaidcebu/unsaidcebu
mvn spring-boot:run
```

The API starts at **http://localhost:8080**.

### Configuration

The backend reads database credentials and JWT secret from `application.properties` (defaults shown).  
To override without editing the file, set environment variables:

| Env Var | Default | Description |
|---------|---------|-------------|
| `DB_URL` | Supabase pooler URL | PostgreSQL JDBC URL |
| `DB_USERNAME` | `postgres.ddybaipugbtjeyyvdkgz` | DB user |
| `DB_PASSWORD` | `ASA2NVui28750ZGH` | DB password |
| `JWT_SECRET` | built-in dev secret | Min 32 chars; change in production |

> **Security note:** Rotate the `DB_PASSWORD` and set a strong `JWT_SECRET` before any public deployment.

### Health check

```
GET http://localhost:8080/api/auth/health
→ "Authentication API is running"
```

---

## 2. Web App (React)

```bash
cd web
npm install
npm start
```

Opens at **http://localhost:3000**. The CRA proxy forwards all `/api/**` requests to `localhost:8080`.

---

## 3. Android App

### Emulator (default)
Open the project in Android Studio, sync Gradle, then **Run** on any API 24+ emulator.

The app connects to `http://10.0.2.2:8080` (Android emulator's alias for host `localhost`).

### Physical device
Edit [`app/src/main/java/com/example/mobileunsaidcebu/ApiClient.kt`](app/src/main/java/com/example/mobileunsaidcebu/ApiClient.kt) and change `BASE_URL`:

```kotlin
const val BASE_URL = "http://YOUR_LOCAL_IP:8080/"
```

Replace `YOUR_LOCAL_IP` with your computer's local network IP (e.g. `192.168.1.5`).

Make sure the phone and computer are on the same Wi-Fi network.

---

## Database

The Supabase PostgreSQL database is already provisioned. Hibernate `ddl-auto=update` creates/updates tables on first run automatically. No manual SQL migration needed.

Tables created:
- `users`
- `app_posts`
- `app_votes`
- `app_flags`

---

## Common Issues

| Problem | Fix |
|---------|-----|
| Mobile "Connection error" | Backend not running, or wrong `BASE_URL` in `ApiClient.kt` |
| Web 401 on post creation | JWT expired — log out and log back in |
| Map tiles not loading | Check internet connection / firewall |
| Gradle sync fails | Make sure Android Studio has JDK 11 configured |

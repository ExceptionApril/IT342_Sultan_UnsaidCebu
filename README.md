# Unsaid Cebu

**Unsaid Cebu** is a location-based anonymous feelings-sharing platform for Cebu, Philippines. Users can drop anonymous "whispers" on an interactive map, see what others nearby are feeling, and engage with posts through hearts, downvotes, and flags — all without revealing their identity.

---

## System Overview

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Backend** | Spring Boot 2.7 · Java 11 · PostgreSQL (Supabase) | REST API, business logic, JWT auth |
| **Web Frontend** | React 18 · Leaflet · OpenStreetMap | Browser-based map feed |
| **Android App** | Kotlin · XML Views · osmdroid · Retrofit | Mobile map feed (same features as web) |
| **Database** | Supabase PostgreSQL (hosted) | All persistent data |

---

## Key Features

- **Anonymous posting** — Identity hidden behind generated codenames (e.g. `ANON-Serene-Sunset-901`)
- **Location pinning** — Posts pinned to the poster's GPS coordinates
- **Interactive map** — Browse nearby posts as markers; "hot" posts glow orange
- **Voting & flagging** — Upvote / downvote posts; auto-hide at 5+ flags
- **Toxicity filter** — Keyword-based blocking prevents harmful content
- **JWT security** — Stateless authentication; every mutation requires a valid Bearer token
- **Real-time polling** — Feed refreshes every 30 seconds

---

## Architecture Diagram

```
┌─────────────────────┐        ┌─────────────────────────────────────────┐
│  Web (React)        │        │  Spring Boot Backend                    │
│  localhost:3000     │──────▶ │  localhost:8080                         │
│                     │  HTTP  │                                         │
│  Leaflet map        │        │  ┌──────────────┐  ┌─────────────────┐ │
│  JWT stored in      │        │  │ AuthController│  │ PostController  │ │
│  localStorage       │        │  └──────┬───────┘  └────────┬────────┘ │
└─────────────────────┘        │         │                   │          │
                               │  ┌──────▼───────────────────▼────────┐ │
┌─────────────────────┐        │  │   AuthService / PostService       │ │
│  Android App        │        │  │   JwtService                      │ │
│  (Kotlin)           │──────▶ │  └──────────────────┬───────────────┘ │
│                     │  HTTP  │                      │                 │
│  osmdroid map       │        │  ┌───────────────────▼──────────────┐  │
│  JWT stored in      │        │  │   JPA Repositories               │  │
│  SharedPreferences  │        │  └───────────────────┬──────────────┘  │
└─────────────────────┘        └──────────────────────┼─────────────────┘
                                                       │ JDBC
                               ┌───────────────────────▼──────────────┐
                               │   Supabase PostgreSQL (hosted)       │
                               │   users · app_posts · app_votes      │
                               │   app_flags                          │
                               └──────────────────────────────────────┘
```

---

## Quick Start

See [SETUP.md](SETUP.md) for full setup instructions.

```bash
# 1. Start the backend
cd unsaidcebu/unsaidcebu
mvn spring-boot:run

# 2. Start the web app
cd web
npm install && npm start

# 3. Open Android Studio, sync Gradle, run on emulator
```

---

## Documentation

| File | Contents |
|------|----------|
| [SETUP.md](SETUP.md) | How to run locally (backend, web, Android) |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Full architecture & component interaction |
| [API_DOCS.md](API_DOCS.md) | All REST API endpoints with request/response examples |

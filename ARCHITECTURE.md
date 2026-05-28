# System Architecture

## Overview

Unsaid Cebu follows a **3-tier client-server architecture** with two client types (Web and Android) talking to the same backend over REST, sharing a single Supabase-hosted PostgreSQL database.

```
Clients                    Backend                    Database
──────────────────────     ──────────────────────     ─────────────────
React Web App       ──┐    Spring Boot 2.7            Supabase
(React + Leaflet)     ├──▶ Port 8080          ──────▶ PostgreSQL
                      │    Java 11                    (hosted)
Android App         ──┘    Maven build
(Kotlin + osmdroid)
```

---

## Layer Breakdown

### Presentation Layer (Clients)

**Web (React 18)**
- Single-page application, no routing library — state-driven page switching
- Leaflet renders an interactive OpenStreetMap with post markers
- Session stored in `localStorage` as `{ userId, name, email, token }`
- All API calls proxied through CRA's `proxy` in `package.json` to `localhost:8080`

**Android (Kotlin / XML Views)**
- Activity-based navigation: `LoginActivity → RegisterActivity → FeedActivity`
- `FeedActivity` hosts three panels: Map (osmdroid), List (RecyclerView), Profile
- Session (userId, name, email, JWT) stored in `SharedPreferences` via `SessionManager`
- Retrofit + OkHttp for all API calls; JWT attached via `Interceptor`

### Application Layer (Spring Boot)

```
controller/
  AuthController   POST /api/auth/register, /login, GET /health
  PostController   GET /api/posts, POST /api/posts, /vote, /flag

service/
  AuthService      Register/login logic, BCrypt + JWT generation
  PostService      Post CRUD, voting toggle, flag & auto-hide
  JwtService       HS256 token generate/validate/extract

config/
  SecurityConfig   Stateless JWT filter chain
  JwtAuthFilter    OncePerRequestFilter — extracts userId from Bearer token

dto/
  AuthResponse     { userId, name, email, message, token }
  PostDTO          Full post projection with userVote + userFlagged enrichment

entity/
  User, Post, Vote, Flag  — JPA entities, mapped to Supabase tables

repository/
  UserRepository, PostRepository, VoteRepository, FlagRepository
```

### Data Layer (Supabase PostgreSQL)

| Table | Key Columns |
|-------|------------|
| `users` | id (PK), name, email, password (BCrypt), created_at |
| `app_posts` | id (PK), user_id (FK), content, latitude, longitude, upvotes, downvotes, flag_count, is_hidden, created_at |
| `app_votes` | id (PK), post_id (FK), user_id (FK), vote_type — UNIQUE(post_id, user_id) |
| `app_flags` | id (PK), post_id (FK), user_id (FK), reason — UNIQUE(post_id, user_id) |

---

## Authentication & Security Flow

```
1. User submits email + password
2. Backend verifies BCrypt hash
3. Backend issues signed JWT (HS256, 24h expiry)
4. Client stores JWT
5. Every mutation (POST /posts, /vote, /flag) sends "Authorization: Bearer <token>"
6. JwtAuthFilter validates token, extracts userId
7. PostController overrides request body userId with JWT userId (prevents impersonation)
8. GET /api/posts is public — no token needed to browse
```

---

## Data Flow Example: Creating a Post

```
Mobile App
  │  1. User taps "Post Anonymously"
  │  2. FeedActivity.showComposeDialog()
  │  3. ApiClient.getService(token).createPost(CreatePostRequest)
  │     Header: Authorization: Bearer <jwt>
  ▼
Spring Boot
  │  4. JwtAuthFilter validates token → sets userId=42 in SecurityContext
  │  5. PostController.createPost() → request.setUserId(42) from JWT
  │  6. PostService.createPost() → toxicity check → save Post
  │  7. Returns PostDTO { id, anonName, content, lat, lng, upvotes=0, ... }
  ▼
Mobile App
  │  8. FeedActivity refreshes posts list
  │  9. New marker appears on osmdroid map at GPS coordinates
  ▼
Web App (next poll in ≤30s)
     10. FeedPage.fetchPosts() → new post appears as Leaflet marker
```

---

## Design Patterns

| Pattern | Where Used |
|---------|-----------|
| Repository Pattern | `*Repository` interfaces (Spring Data JPA) |
| Service Layer | `AuthService`, `PostService` — no business logic in controllers |
| DTO Pattern | `PostDTO`, `AuthResponse` — entities never exposed directly |
| Filter Chain | `JwtAuthFilter` — cross-cutting auth concern |
| Singleton | `ApiClient` (mobile), `SupabaseConfig` removed in Phase 3 |

---

## API Design

- **Stateless REST** — no server-side sessions
- **JWT Bearer tokens** — all mutations authenticated
- **GET is always public** — supports read-only guests
- **CORS open** — allows web + mobile + Postman access
- **CSRF disabled** — stateless API doesn't need CSRF protection

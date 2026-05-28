# API Documentation

Base URL: `http://localhost:8080`

All mutation endpoints (POST) require the header:
```
Authorization: Bearer <jwt_token>
```
(obtained from login or register)

---

## Authentication

### Register
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "April John",
  "email": "april@example.com",
  "password": "mypassword"
}
```
**Response 201:**
```json
{
  "userId": 1,
  "name": "April John",
  "email": "april@example.com",
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```
**Error 400:** `{ "message": "Email already registered" }`

---

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "april@example.com",
  "password": "mypassword"
}
```
**Response 200:**
```json
{
  "userId": 1,
  "name": "April John",
  "email": "april@example.com",
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiJ9..."
}
```
**Error 401:** `{ "message": "Invalid email or password" }`

---

### Health Check
```
GET /api/auth/health
→ 200 "Authentication API is running"
```

---

## Posts

### Get All Posts
```
GET /api/posts
GET /api/posts?userId=1
```
Returns all non-hidden posts sorted by newest first.  
Passing `userId` enriches each post with `userVote` and `userFlagged` for that user.

**Response 200:** `PostDTO[]`
```json
[
  {
    "id": 5,
    "userId": 1,
    "anonName": "Anonymous Dreamer",
    "content": "The streets of Cebu feel like home.",
    "latitude": 10.3157,
    "longitude": 123.8854,
    "upvotes": 3,
    "downvotes": 0,
    "flagCount": 0,
    "isHidden": false,
    "createdAt": "2026-05-28T10:30:00",
    "userVote": null,
    "userFlagged": false,
    "replyCount": 0
  }
]
```

---

### Create Post *(requires JWT)*
```
POST /api/posts
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "content": "It's a beautiful evening in Cebu.",
  "latitude": 10.3157,
  "longitude": 123.8854
}
```
**Response 201:** `PostDTO`  
**Error 400:** `"Post blocked due to inappropriate content"` (toxicity ≥ 70%)  
**Error 401:** No/invalid JWT

---

### Vote on Post *(requires JWT)*
```
POST /api/posts/{id}/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "voteType": "UPVOTE"
}
```
`voteType` is `"UPVOTE"` or `"DOWNVOTE"`.  
Voting the same type again **removes** the vote (toggle). Voting opposite **switches** the vote.

**Response 200:** `PostDTO` (updated counts)

---

### Flag Post *(requires JWT)*
```
POST /api/posts/{id}/flag
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "reason": "INAPPROPRIATE"
}
```
Each user can flag a post only once. At 5 flags, `isHidden` becomes `true`.

**Response 200:** `PostDTO`  
**Error 400:** `"Already flagged"`

---

## Business Rules

| Rule | Detail |
|------|--------|
| Toxicity check | Post blocked if ≥ 70% of toxic keywords match |
| Auto-hide | Post hidden when `flagCount ≥ 5` |
| Vote toggle | Same vote type again → vote removed |
| Vote switch | Different vote type → previous vote replaced |
| Anonymous name | Deterministic from `userId`: `ANON-{Adj1}-{Adj2}-{num}` |
| JWT expiry | 24 hours from issue time |

---

## Testing with Postman / curl

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@cebu.ph","password":"test123"}'

# Login (save the token)
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@cebu.ph","password":"test123"}' | python -c "import sys,json; print(json.load(sys.stdin)['token'])")

# Create post
curl -X POST http://localhost:8080/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userId":1,"content":"Hello Cebu!","latitude":10.3157,"longitude":123.8854}'

# Get all posts
curl http://localhost:8080/api/posts
```

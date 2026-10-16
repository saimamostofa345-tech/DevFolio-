# DevFolio Backend — Django REST Framework

> High-performance, single-owner REST API powering Saima Mostofa Moni's professional portfolio and blog.

- **Frontend Repository**: [saimamostofa345-portfolio-frontend](https://github.com/saimamostofa345-tech/My-frist-project-)
- **Postman Collection**: [`postman_collection.json`](./postman_collection.json)

---

## 1. Tech Stack
- **Python**: 3.10+
- **Django**: 5.x / 4.2+
- **Django REST Framework** (DRF)
- **djangorestframework-simplejwt**: JWT Authentication with Refresh Token rotation & blacklisting
- **django-filter**: Queryset filtering
- **django-cors-headers**: Whitelisted CORS origins
- **Pillow**: Image processing & validation
- **Database**: SQLite (local) / PostgreSQL ready

---

## 2. Key Architecture & Security Decisions

### Single-Owner Security (B-1, B-13, S-1)
- The site has exactly one administrative owner.
- There is **no public registration**, no signup endpoint, and any call to `/api/auth/register/` returns an explicit **404**.
- Custom permission class `IsOwnerOrReadOnly` (`portfolio.permissions`) permits safe HTTP methods (`GET`, `HEAD`, `OPTIONS`) to public visitors and restricts write methods (`POST`, `PATCH`, `DELETE`) exclusively to `request.user.is_authenticated and request.user.is_superuser`.
- Non-superuser tokens are rejected with **403 Forbidden**.
- Login rejects invalid credentials with **401 Unauthorized** without revealing whether the username exists.

### View Counter with Atomic Updates & Cooldown (B-16)
- Incrementing a post's view counter utilizes Django's atomic `F('views_count') + 1` expression to eliminate race conditions.
- To prevent spam on page refreshes or double-firing in React 18 StrictMode, the counter checks the `X-Visitor-Id` header (with IP fallback) against a 1-hour cache cooldown (`viewed_post_{id}_{visitor_id}`).

### Scoped Rate Throttling (B-17)
- **Anonymous visitors**: `20/minute`
- **Authenticated owner**: `100/minute`
- **Comment submission**: `5/hour` per IP
- **Contact message submission**: `3/hour` per IP
- **Like toggle**: `30/minute` per visitor ID / IP

### Performance Middleware (B-19)
- Custom `ResponseTimeLoggingMiddleware` measures each request duration, logs `METHOD /path -> status (xx ms)`, and attaches an `X-Response-Time` header.

### Single-Query Dashboard Aggregation
- `GET /api/dashboard/stats/` aggregates post counts, views, likes, comments, and a 6-month monthly post timeline using Django ORM aggregation (`Count`, `Sum`, `TruncMonth`) in a single consolidated response.

---

## 3. Environment Variables

| Variable | Description | Default (Local) |
| :--- | :--- | :--- |
| `SECRET_KEY` | Django cryptographic signing key | Provided in `.env.example` |
| `DEBUG` | Debug mode | `True` |
| `ALLOWED_HOSTS` | Comma-separated allowed hostnames | `localhost,127.0.0.1,0.0.0.0` |
| `CORS_ALLOWED_ORIGINS` | Whitelisted frontend origins | `http://localhost:5173,http://127.0.0.1:5173` |

---

## 4. API Endpoints Table

| Method | Endpoint | Access Level | Description / Notes |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login/` | Public | Body: `{username, password}` -> `{access, refresh, user}` |
| `POST` | `/api/auth/refresh/` | Public | Refresh expired access token |
| `POST` | `/api/auth/logout/` | Owner | Blacklists refresh token |
| `GET` | `/api/auth/me/` | Owner | Rehydrates session for dashboard |
| `POST` | `/api/auth/change-password/` | Owner | Change superuser password |
| `POST` | `/api/auth/register/` | **Blocked** | Returns **404 Not Found** |
| `GET` | `/api/profile/` | Public | Single owner Profile object |
| `PATCH` | `/api/profile/` | Owner | Partial update, avatar & resume upload |
| `GET` | `/api/skills/` | Public | Filter `?category=`, `?is_featured=`, search, order |
| `POST/PATCH/DELETE`| `/api/skills/`, `/api/skills/<id>/` | Owner | Skill CRUD |
| `GET` | `/api/experiences/` | Public | Work experience ordered by `-start_date` |
| `POST/PATCH/DELETE`| `/api/experiences/`, `.../<id>/` | Owner | Experience CRUD |
| `GET` | `/api/education/` | Public | Academic history ordered by `-start_year` |
| `POST/PATCH/DELETE`| `/api/education/`, `.../<id>/` | Owner | Education CRUD |
| `GET` | `/api/projects/` | Public | Paginated (9/page), filter `?category=`, `?tech=` |
| `GET` | `/api/projects/<slug>/` | Public | Project detail lookup by slug |
| `POST/PATCH/DELETE`| `/api/projects/`, `.../<slug>/` | Owner | Project CRUD |
| `GET` | `/api/posts/` | Public | Published posts only (6/page); drafts for Owner |
| `GET` | `/api/posts/<slug>/` | Public | Draft -> 404 for visitor, 200 for Owner |
| `POST/PATCH/DELETE`| `/api/posts/`, `.../<slug>/` | Owner | Post CRUD (Markdown body) |
| `POST` | `/api/posts/<slug>/like/` | Public | Toggle post like (requires `X-Visitor-Id`) |
| `GET` | `/api/posts/<slug>/comments/` | Public | Approved threaded comments (newest first) |
| `POST` | `/api/posts/<slug>/comments/` | Public | Submits comment (`is_approved=False` -> 201) |
| `GET` | `/api/comments/` | Owner | Moderation queue (`?is_approved=false`) |
| `PATCH/DELETE` | `/api/comments/<id>/` | Owner | Approve / unapprove / delete comment |
| `GET` | `/api/categories/`, `/api/tags/`| Public | Includes published `posts_count` |
| `POST/PATCH/DELETE`| `/api/categories/`, `/api/tags/` | Owner | Taxonomy CRUD |
| `POST` | `/api/contact/` | Public | Contact inquiry (throttled 3/hr per IP) |
| `GET/PATCH/DELETE` | `/api/contact/`, `.../<id>/` | Owner | Contact inbox (filter `?is_read=false`) |
| `GET` | `/api/dashboard/stats/` | Owner | ORM aggregated analytics & monthly chart data |

---

## 5. Local Setup Instructions

```bash
# 1. Navigate to backend directory
cd devfolio-backend

# 2. Create and activate Python virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env

# 5. Run database migrations
python manage.py makemigrations portfolio blog
python manage.py migrate

# 6. Create site owner superuser
python manage.py createsuperuser

# 7. Start local development server
python manage.py runserver
```

---

## 6. Running Acceptance Tests
Run the suite covering Section 6 specifications:
```bash
python manage.py test portfolio blog
```

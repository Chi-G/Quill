# Changelog

All notable changes to the **Quill — Modular Content Publishing Engine** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-19

### Added
- Modular architecture with clean service layer pattern (`AuthService`, `PostService`, `CommentService`, `ReactionService`, `CacheService`).
- Dual-Token JWT authentication with MongoDB `RefreshToken` server-side tracking, single logout, and all-device logout.
- 4-Tier Role-Based Access Control (`USER`, `AUTHOR`, `EDITOR`, `ADMIN`).
- State machine editorial workflow (`DRAFT` → `PENDING_REVIEW` → `PUBLISHED` / `REJECTED` → `ARCHIVED`).
- Unique slug auto-generation (`slugify`) and reading time computation.
- Nested reply comments with soft deletion.
- Reaction voting with compound unique index `{ user, post }`.
- Redis cache-aside response caching and invalidation.
- Outbound Webhook event bus listener with HMAC-SHA256 signature dispatch and synthetic test trigger (`POST /api/v1/webhooks/:id/test`).
- Multi-stage production `Dockerfile` and `docker-compose.yml`.
- GitHub Actions CI pipeline (`.github/workflows/ci.yml`).
- Interactive Swagger UI documentation at `/api-docs`.

import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Quill — Modular Content Publishing Engine API",
      version: "1.0.0",
      description:
        "Production-grade, modular, TypeScript-first Headless CMS & Content Publishing Engine API.",
    },
    servers: [
      {
        url: "http://localhost:8000/api/v1",
        description: "Local Development Server (v1)",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      "/auth/register": {
        post: {
          tags: ["Authentication"],
          summary: "Register new user account",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password"],
                  properties: {
                    name: { type: "string", example: "John Doe" },
                    email: { type: "string", example: "john@example.com" },
                    password: { type: "string", example: "Password123!" },
                    bio: { type: "string", example: "Tech writer and editor" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "User registered successfully" },
            400: { description: "Invalid input or email already exists" },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Authentication"],
          summary: "Authenticate user and issue tokens",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "john@example.com" },
                    password: { type: "string", example: "Password123!" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Logged in successfully, returns accessToken and sets refreshToken cookie" },
            400: { description: "Invalid credentials" },
          },
        },
      },
      "/auth/refresh-token": {
        post: {
          tags: ["Authentication"],
          summary: "Rotate refresh token and issue new access token",
          responses: {
            200: { description: "Token rotated successfully" },
            401: { description: "Invalid or revoked refresh token" },
          },
        },
      },
      "/auth/logout": {
        post: {
          tags: ["Authentication"],
          summary: "Logout current device",
          responses: {
            200: { description: "Logged out successfully" },
          },
        },
      },
      "/auth/logout-all": {
        post: {
          tags: ["Authentication"],
          summary: "Logout from all devices",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Revoked all active sessions" },
          },
        },
      },
      "/users/me": {
        get: {
          tags: ["Users"],
          summary: "Get logged-in user profile",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "User profile fetched" } },
        },
        patch: {
          tags: ["Users"],
          summary: "Update user profile",
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    bio: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 200: { description: "Profile updated" } },
        },
      },
      "/posts": {
        get: {
          tags: ["Posts"],
          summary: "Get paginated, searchable published articles",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "tag", in: "query", schema: { type: "string" } },
            { name: "category", in: "query", schema: { type: "string" } },
          ],
          responses: { 200: { description: "Article list returned" } },
        },
        post: {
          tags: ["Posts"],
          summary: "Create draft article (AUTHOR, EDITOR, ADMIN)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "content"],
                  properties: {
                    title: { type: "string", example: "Mastering Node.js and Express" },
                    content: { type: "string", example: "A comprehensive guide to building scalable backend APIs." },
                    excerpt: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    category: { type: "string" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Draft post created" }, 403: { description: "Forbidden" } },
        },
      },
      "/posts/{slug}": {
        get: {
          tags: ["Posts"],
          summary: "Get article by slug",
          parameters: [{ name: "slug", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Article details" }, 404: { description: "Article not found" } },
        },
      },
      "/posts/{id}/submit-review": {
        patch: {
          tags: ["Editorial Workflow"],
          summary: "Submit draft article for review (AUTHOR+)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Status changed to PENDING_REVIEW" } },
        },
      },
      "/posts/{id}/approve": {
        patch: {
          tags: ["Editorial Workflow"],
          summary: "Approve and publish article (EDITOR, ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Status changed to PUBLISHED" } },
        },
      },
      "/posts/{id}/reject": {
        patch: {
          tags: ["Editorial Workflow"],
          summary: "Reject pending article with reason (EDITOR, ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["reason"],
                  properties: { reason: { type: "string", example: "Needs clearer code examples" } },
                },
              },
            },
          },
          responses: { 200: { description: "Status changed to REJECTED" } },
        },
      },
      "/posts/{id}/comments": {
        get: {
          tags: ["Comments"],
          summary: "Get article comments",
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Comment list" } },
        },
        post: {
          tags: ["Comments"],
          summary: "Add comment or nested reply",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["content"],
                  properties: {
                    content: { type: "string", example: "Great article!" },
                    parentComment: { type: "string", description: "Parent comment ID for nested reply" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Comment created" } },
        },
      },
      "/posts/{id}/reactions": {
        post: {
          tags: ["Reactions"],
          summary: "Toggle LIKE / DISLIKE reaction",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["type"],
                  properties: { type: { type: "string", enum: ["LIKE", "DISLIKE"] } },
                },
              },
            },
          },
          responses: { 200: { description: "Reaction toggled" } },
        },
      },
      "/webhooks": {
        get: {
          tags: ["Webhooks"],
          summary: "List active webhooks (ADMIN)",
          security: [{ bearerAuth: [] }],
          responses: { 200: { description: "Webhook subscriptions list" } },
        },
        post: {
          tags: ["Webhooks"],
          summary: "Register new webhook (ADMIN)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["url", "event"],
                  properties: {
                    url: { type: "string", example: "https://example.com/webhook" },
                    event: { type: "string", example: "post.published" },
                  },
                },
              },
            },
          },
          responses: { 201: { description: "Webhook created" } },
        },
      },
      "/webhooks/{id}/test": {
        post: {
          tags: ["Webhooks"],
          summary: "Trigger synthetic webhook test event (ADMIN)",
          security: [{ bearerAuth: [] }],
          parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
          responses: { 200: { description: "Synthetic test event dispatched" } },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);

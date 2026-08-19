import request from "supertest";
import app from "../../backend/src/app.js";
import { User } from "../../backend/src/models/user.model.js";
import { UserRole } from "../../backend/src/constants/roles.js";
import { connectTestDb, disconnectTestDb, clearTestDb } from "../setup/testDb.js";

describe("RBAC & Editorial Workflow Integration Tests", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it("should block USER role from creating a post", async () => {
    await request(app).post("/api/v1/auth/register").send({
      name: "Normal User",
      email: "user@example.com",
      password: "Password123!",
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "user@example.com",
      password: "Password123!",
    });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Unauthorized Article Title",
        content: "This is sample article body text exceeding 10 characters.",
      });

    expect(res.status).toBe(403);
  });

  it("should allow AUTHOR to create post and submit for review", async () => {
    await User.create({
      name: "Author User",
      email: "author@example.com",
      password: "Password123!",
      role: UserRole.AUTHOR,
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email: "author@example.com",
      password: "Password123!",
    });

    const token = loginRes.body.data.accessToken;

    const createRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Author Article Title",
        content: "This is sample article body text exceeding 10 characters.",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data.status).toBe("DRAFT");

    const postId = createRes.body.data._id;

    const submitRes = await request(app)
      .patch(`/api/v1/posts/${postId}/submit-review`)
      .set("Authorization", `Bearer ${token}`);

    expect(submitRes.status).toBe(200);
    expect(submitRes.body.data.status).toBe("PENDING_REVIEW");
  });

  it("should allow EDITOR to approve pending article", async () => {
    await User.create({
      name: "Author User",
      email: "author@example.com",
      password: "Password123!",
      role: UserRole.AUTHOR,
    });

    await User.create({
      name: "Editor User",
      email: "editor@example.com",
      password: "Password123!",
      role: UserRole.EDITOR,
    });

    const authorLogin = await request(app).post("/api/v1/auth/login").send({
      email: "author@example.com",
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${authorLogin.body.data.accessToken}`)
      .send({
        title: "Pending Article Title",
        content: "This is sample article body text exceeding 10 characters.",
      });

    const postId = createRes.body.data._id;

    await request(app)
      .patch(`/api/v1/posts/${postId}/submit-review`)
      .set("Authorization", `Bearer ${authorLogin.body.data.accessToken}`);

    const editorLogin = await request(app).post("/api/v1/auth/login").send({
      email: "editor@example.com",
      password: "Password123!",
    });

    const approveRes = await request(app)
      .patch(`/api/v1/posts/${postId}/approve`)
      .set("Authorization", `Bearer ${editorLogin.body.data.accessToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe("PUBLISHED");
  });
});

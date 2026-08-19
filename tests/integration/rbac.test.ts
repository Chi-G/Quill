import request from "supertest";
import app from "../../backend/src/app.js";
import { User } from "../../backend/src/models/user.model.js";
import { UserRole } from "../../backend/src/constants/roles.js";
import { connectTestDb, disconnectTestDb, clearTestDb } from "../setup/testDb.js";

const getRandomEmail = (role: string) => `${role}_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

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
    const email = getRandomEmail("user");
    await request(app).post("/api/v1/auth/register").send({
      name: "Normal User",
      email,
      password: "Password123!",
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!",
    });

    const token = loginRes.body.data.accessToken;

    const res = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: `Unauthorized Article Title ${Date.now()}`,
        content: "This is sample article body text exceeding 10 characters.",
      });

    expect(res.status).toBe(403);
  });

  it("should allow AUTHOR to create post and submit for review", async () => {
    const email = getRandomEmail("author");
    await User.create({
      name: "Author User",
      email,
      password: "Password123!",
      role: UserRole.AUTHOR,
    });

    const loginRes = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!",
    });

    const token = loginRes.body.data.accessToken;

    const createRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: `Author Article Title ${Date.now()}`,
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
    const authorEmail = getRandomEmail("author");
    const editorEmail = getRandomEmail("editor");

    await User.create({
      name: "Author User",
      email: authorEmail,
      password: "Password123!",
      role: UserRole.AUTHOR,
    });

    await User.create({
      name: "Editor User",
      email: editorEmail,
      password: "Password123!",
      role: UserRole.EDITOR,
    });

    const authorLogin = await request(app).post("/api/v1/auth/login").send({
      email: authorEmail,
      password: "Password123!",
    });

    const createRes = await request(app)
      .post("/api/v1/posts")
      .set("Authorization", `Bearer ${authorLogin.body.data.accessToken}`)
      .send({
        title: `Pending Article Title ${Date.now()}`,
        content: "This is sample article body text exceeding 10 characters.",
      });

    const postId = createRes.body.data._id;

    await request(app)
      .patch(`/api/v1/posts/${postId}/submit-review`)
      .set("Authorization", `Bearer ${authorLogin.body.data.accessToken}`);

    const editorLogin = await request(app).post("/api/v1/auth/login").send({
      email: editorEmail,
      password: "Password123!",
    });

    const approveRes = await request(app)
      .patch(`/api/v1/posts/${postId}/approve`)
      .set("Authorization", `Bearer ${editorLogin.body.data.accessToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe("PUBLISHED");
  });
});

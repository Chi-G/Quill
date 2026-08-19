import request from "supertest";
import app from "../../backend/src/app.js";
import { connectTestDb, disconnectTestDb, clearTestDb } from "../setup/testDb.js";

describe("Auth Module Integration Tests", () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  beforeEach(async () => {
    await clearTestDb();
  });

  it("should register a new user successfully", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe("test@example.com");
    expect(res.body.data.password).toBeUndefined();
  });

  it("should login user and return access token + refresh cookie", async () => {
    await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();

    const cookies = res.get("Set-Cookie");
    expect(cookies).toBeDefined();
    expect(cookies![0]).toContain("refreshToken");
  });

  it("should reject login with wrong password", async () => {
    await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email: "test@example.com",
      password: "Password123!",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email: "test@example.com",
      password: "WrongPassword!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

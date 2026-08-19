import request from "supertest";
import app from "../../backend/src/app.js";
import { connectTestDb, disconnectTestDb, clearTestDb } from "../setup/testDb.js";

const getRandomEmail = (prefix: string) => `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`;

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
    const email = getRandomEmail("test");
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({
        name: "Test User",
        email,
        password: "Password123!",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe(email);
    expect(res.body.data.password).toBeUndefined();
  });

  it("should login user and return access token + refresh cookie", async () => {
    const email = getRandomEmail("test");
    await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email,
      password: "Password123!",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "Password123!",
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();

    const cookies = res.get("Set-Cookie");
    expect(cookies).toBeDefined();
    expect(cookies![0]).toContain("refreshToken");
  });

  it("should reject login with wrong password", async () => {
    const email = getRandomEmail("test");
    await request(app).post("/api/v1/auth/register").send({
      name: "Test User",
      email,
      password: "Password123!",
    });

    const res = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "WrongPassword!",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

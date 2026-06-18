import request from "supertest";
import { app } from "../src/index";

describe("GET /health", () => {
  it("returns ok status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("GET /unknown", () => {
  it("returns 404", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.status).toBe(404);
  });
});

describe("GET /api/events/transfers — validation", () => {
  it("rejects missing token param", async () => {
    const res = await request(app).get("/api/events/transfers");
    expect(res.status).toBe(400);
  });

  it("rejects invalid address", async () => {
    const res = await request(app).get("/api/events/transfers?token=0xinvalid");
    expect(res.status).toBe(400);
  });
});

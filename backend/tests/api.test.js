const request = require("supertest");

const BASE_URL = "http://localhost:5000";

describe("ERP System API Tests", () => {
  let adminToken;
  let salesToken;

  test("ADMIN login should return JWT token", async () => {
    const response = await request(BASE_URL)
      .post("/auth/login")
      .send({
        email: "admin@erp.com",
        password: "Admin@123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();

    adminToken = response.body.token;
  });

  test("SALES login should return JWT token", async () => {
    const response = await request(BASE_URL)
      .post("/auth/login")
      .send({
        email: "sales@erp.com",
        password: "Sales@123",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.token).toBeDefined();

    salesToken = response.body.token;
  });

  test("Unauthorized user cannot confirm sales order", async () => {
    const response = await request(BASE_URL)
      .post("/api/sales-orders/1/confirm")
      .set("Authorization", `Bearer ${salesToken}`);

    expect(response.statusCode).toBe(403);
  });

  test("Duplicate sales order should be blocked", async () => {
    const response = await request(BASE_URL)
      .post("/api/sales-orders/1/convert")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(409);
  });

  test("Dispatched sales order cannot be cancelled", async () => {
    const response = await request(BASE_URL)
      .patch("/api/sales-orders/1/cancel")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.statusCode).toBe(400);
  });
});
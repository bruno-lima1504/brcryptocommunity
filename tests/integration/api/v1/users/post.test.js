import { version as uuidVersion } from "uuid";
import orchestrator from "../orchestrator";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/users", () => {
  describe("Anonymous user", () => {
    test("with unique and valid data", async () => {
      const response = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "brunolima",
          email: "bruno@teste.com",
          password: "senhateste",
        }),
      });

      const ResponseBody = await response.json();

      expect(response.status).toBe(201);
      expect(ResponseBody).toEqual({
        id: ResponseBody.id,
        username: "brunolima",
        email: "bruno@teste.com",
        password: ResponseBody.password,
        created_at: ResponseBody.created_at,
        updated_at: ResponseBody.updated_at,
      });
      expect(uuidVersion(ResponseBody.id)).toBe(4);
      expect(Date.parse(ResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(ResponseBody.updated_at)).not.toBeNaN();

      const userInDatabase = await user.findOneByUsername("brunolima");
      const correctPasswordMatch = await password.compare(
        "senhateste",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "senhateste2",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });

    test("with duplicated email", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado1",
          email: "duplicado@teste.com",
          password: "senhateste",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "emailduplicado2",
          email: "Duplicado@teste.com",
          password: "senhateste",
        }),
      });

      expect(response2.status).toBe(400);

      const Response2Body = await response2.json();

      expect(Response2Body).toEqual({
        name: "ValidationError",
        message: "Email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar o cadastro.",
        status_code: 400,
      });
    });

    test("with duplicate username", async () => {
      const response1 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "usernameDuplicado1",
          email: "usernameDuplicado1@teste.com",
          password: "senhateste",
        }),
      });

      expect(response1.status).toBe(201);

      const response2 = await fetch("http://localhost:3000/api/v1/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "UsernameDuplicado1",
          email: "usernameDuplicado2@teste.com",
          password: "senhateste",
        }),
      });

      expect(response2.status).toBe(400);

      const Response2Body = await response2.json();

      expect(Response2Body).toEqual({
        name: "ValidationError",
        message: "Username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar o cadastro.",
        status_code: 400,
      });
    });
  });
});

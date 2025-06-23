import { version as uuidVersion } from "uuid";
import orchestrator from "../../orchestrator";
import user from "models/user";
import password from "models/password";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("PATCH /api/v1/users/[username]", () => {
  describe("With user", () => {
    test("With none existing 'username'", async () => {
      const response = await fetch(
        "http://localhost:3000/api/v1/users/UsuarioInexistente",
        {
          method: "PATCH",
        },
      );

      expect(response.status).toBe(404);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "NotFoundError",
        message: "O usuário não foi encontrado no sistema.",
        action: "Verifique se o username está digitado corretamente.",
        status_code: 404,
      });
    });

    test("with duplicate username", async () => {
      await orchestrator.createUser({
        username: "user1",
      });

      await orchestrator.createUser({
        username: "user2",
      });

      const response = await fetch("http://localhost:3000/api/v1/users/user2", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: "user1",
        }),
      });

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Username informado já está sendo utilizado.",
        action: "Utilize outro username para realizar esta operação.",
        status_code: 400,
      });
    });

    test("with duplicate 'email'", async () => {
      await orchestrator.createUser({
        email: "email1@teste.com",
      });

      const createdUser2 = await orchestrator.createUser({
        email: "email2@teste.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser2.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "email1@teste.com",
          }),
        },
      );

      expect(response.status).toBe(400);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "ValidationError",
        message: "Email informado já está sendo utilizado.",
        action: "Utilize outro email para realizar esta operação.",
        status_code: 400,
      });
    });

    test("with unique username", async () => {
      const createdUser1 = await orchestrator.createUser({
        username: "uniqueUsername1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser1.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: "uniqueUsername2",
          }),
        },
      );

      const ResponseBody = await response.json();

      expect(response.status).toBe(200);
      expect(ResponseBody).toEqual({
        id: ResponseBody.id,
        username: "uniqueUsername2",
        email: createdUser1.email,
        password: ResponseBody.password,
        created_at: ResponseBody.created_at,
        updated_at: ResponseBody.updated_at,
      });
      expect(uuidVersion(ResponseBody.id)).toBe(4);
      expect(Date.parse(ResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(ResponseBody.updated_at)).not.toBeNaN();

      expect(ResponseBody.updated_at > ResponseBody.created_at).toBe(true);
    });

    test("with unique email", async () => {
      const createdUser = await orchestrator.createUser({
        email: "uniqueEmail1@teste.com",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "uniqueEmail2@teste.com",
          }),
        },
      );

      const ResponseBody = await response.json();

      expect(response.status).toBe(200);
      expect(ResponseBody).toEqual({
        id: ResponseBody.id,
        username: createdUser.username,
        email: "uniqueEmail2@teste.com",
        password: ResponseBody.password,
        created_at: ResponseBody.created_at,
        updated_at: ResponseBody.updated_at,
      });
      expect(uuidVersion(ResponseBody.id)).toBe(4);
      expect(Date.parse(ResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(ResponseBody.updated_at)).not.toBeNaN();

      expect(ResponseBody.updated_at > ResponseBody.created_at).toBe(true);
    });

    test("with new password", async () => {
      const createdUser = await orchestrator.createUser({
        password: "newpassword1",
      });

      const response = await fetch(
        `http://localhost:3000/api/v1/users/${createdUser.username}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "newPassword2",
          }),
        },
      );

      const ResponseBody = await response.json();

      expect(response.status).toBe(200);
      expect(ResponseBody).toEqual({
        id: ResponseBody.id,
        username: createdUser.username,
        email: createdUser.email,
        password: ResponseBody.password,
        created_at: ResponseBody.created_at,
        updated_at: ResponseBody.updated_at,
      });
      expect(uuidVersion(ResponseBody.id)).toBe(4);
      expect(Date.parse(ResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(ResponseBody.updated_at)).not.toBeNaN();

      expect(ResponseBody.updated_at > ResponseBody.created_at).toBe(true);

      const userInDatabase = await user.findOneByUsername(createdUser.username);

      const correctPasswordMatch = await password.compare(
        "newPassword2",
        userInDatabase.password,
      );

      const incorrectPasswordMatch = await password.compare(
        "newpassword1",
        userInDatabase.password,
      );

      expect(correctPasswordMatch).toBe(true);
      expect(incorrectPasswordMatch).toBe(false);
    });
  });
});

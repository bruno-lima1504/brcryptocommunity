import setCookieParser from "set-cookie-parser";
import orchestrator from "../orchestrator";
import { version as uuidVersion } from "uuid";
import session from "models/session";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
  await orchestrator.clearDatabase();
  await orchestrator.runPendingMigrations();
});

describe("POST /api/v1/sessions", () => {
  describe("Anonymous user", () => {
    test("with incorrect `email` but correct `password`", async () => {
      await orchestrator.createUser({
        password: "senha-correta",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "emailerrado@teste.com",
          password: "senha-correta",
        }),
      });

      expect(response.status).toBe(401);

      const ResponseBody = await response.json();

      expect(ResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se o email e a senha estão corretos.",
        status_code: 401,
      });
    });

    test("with incorrect `password` but correct `email`", async () => {
      await orchestrator.createUser({
        email: "emailcorreto@teste.com",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "emailcorreto@teste.com",
          password: "senha-incorreta",
        }),
      });

      expect(response.status).toBe(401);

      const ResponseBody = await response.json();

      expect(ResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se o email e a senha estão corretos.",
        status_code: 401,
      });
    });

    test("with incorrect `password` and `email`", async () => {
      await orchestrator.createUser({});

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "emailincorreto2@teste.com",
          password: "senha-incorreta2",
        }),
      });

      expect(response.status).toBe(401);

      const ResponseBody = await response.json();

      expect(ResponseBody).toEqual({
        name: "UnauthorizedError",
        message: "Dados de autenticação não conferem.",
        action: "Verifique se o email e a senha estão corretos.",
        status_code: 401,
      });
    });

    test("with correct `password` and `email`", async () => {
      const user = await orchestrator.createUser({
        email: "tudo.correto@teste.com",
        password: "senha-correta",
      });

      const response = await fetch("http://localhost:3000/api/v1/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "tudo.correto@teste.com",
          password: "senha-correta",
        }),
      });

      expect(response.status).toBe(201);

      const ResponseBody = await response.json();
      expect(ResponseBody).toEqual({
        id: ResponseBody.id,
        token: ResponseBody.token,
        user_id: user.id,
        expires_at: ResponseBody.expires_at,
        created_at: ResponseBody.created_at,
        updated_at: ResponseBody.updated_at,
      });

      expect(uuidVersion(ResponseBody.id)).toBe(4);
      expect(Date.parse(ResponseBody.expires_at)).not.toBeNaN();
      expect(Date.parse(ResponseBody.created_at)).not.toBeNaN();
      expect(Date.parse(ResponseBody.updated_at)).not.toBeNaN();

      const expiresAt = new Date(ResponseBody.expires_at);
      const createdAt = new Date(ResponseBody.created_at);

      expiresAt.setMilliseconds(0);
      createdAt.setMilliseconds(0);

      expect(expiresAt - createdAt).toBe(session.EXPIRATION_IN_MILLISECONDS);

      const parsedSetCookie = setCookieParser(response, {
        map: true,
      });

      expect(parsedSetCookie.session_id).toEqual({
        name: "session_id",
        value: ResponseBody.token,
        path: "/",
        maxAge: session.EXPIRATION_IN_MILLISECONDS / 1000,
        httpOnly: true,
      });
    });
  });
});

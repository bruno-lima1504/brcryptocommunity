import orchestrator from "../orchestrator";

beforeAll(async () => {
  await orchestrator.waitForAllServices();
});
describe("PUT /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retriving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "PUT",
      });
      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para esse endpoint.",
        action:
          "Verifique se o método HTTP enviado é valido para este endpoint.",
        status_code: 405,
      });
    });
  });
});

describe("DELETE /api/v1/migrations", () => {
  describe("Anonymous user", () => {
    test("Retriving current system status", async () => {
      const response = await fetch("http://localhost:3000/api/v1/migrations", {
        method: "DELETE",
      });
      expect(response.status).toBe(405);

      const responseBody = await response.json();

      expect(responseBody).toEqual({
        name: "MethodNotAllowedError",
        message: "Método não permitido para esse endpoint.",
        action:
          "Verifique se o método HTTP enviado é valido para este endpoint.",
        status_code: 405,
      });
    });
  });
});

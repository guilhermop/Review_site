import { describe, it, expect, jest } from "@jest/globals";
import request from "supertest";
import app from "../app";

// Evita conectar ao banco de verdade nestes testes
jest.mock("../prisma", () => ({ prisma: {} }));

describe("rota raiz", () => {
  it("GET / responde 200", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("API rodando!");
  });
});

describe("autenticação (middleware)", () => {
  it("retorna 401 quando não envia token", async () => {
    const res = await request(app).get("/reviews/mine");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Token não fornecido");
  });

  it("retorna 403 quando o token é inválido", async () => {
    const res = await request(app)
      .get("/reviews/mine")
      .set("Authorization", "Bearer token_invalido");
    expect(res.status).toBe(403);
    expect(res.body.error).toBe("Token inválido ou expirado");
  });
});
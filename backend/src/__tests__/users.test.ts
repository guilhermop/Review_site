import { describe, it, expect, jest, beforeAll, beforeEach } from "@jest/globals";
import request from "supertest";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../prisma";

jest.mock("../prisma", () => ({
  prisma: {
    user: { create: jest.fn(), findUnique: jest.fn() },
  },
}));

const userMock = prisma.user as any;

beforeEach(() => {
  jest.resetAllMocks();
});

describe("POST /users/register", () => {
  it("retorna 400 quando faltam campos", async () => {
    const res = await request(app)
      .post("/users/register")
      .send({ email: "a@a.com" });

    expect(res.status).toBe(400);
    expect(userMock.create).not.toHaveBeenCalled();
  });

  it("cria usuário, salva a senha com hash e não devolve a senha", async () => {
    userMock.create.mockResolvedValue({
      id: 1,
      email: "a@a.com",
      name: "Ana",
      password: "hash_qualquer",
    });

    const res = await request(app)
      .post("/users/register")
      .send({ email: "a@a.com", password: "123456", name: "Ana" });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ id: 1, email: "a@a.com", name: "Ana" });

    const dadosSalvos = userMock.create.mock.calls[0][0].data;
    expect(dadosSalvos.password).not.toBe("123456");
  });

  it("retorna 409 quando o email já existe", async () => {
    userMock.create.mockRejectedValue({ code: "P2002" });

    const res = await request(app)
      .post("/users/register")
      .send({ email: "a@a.com", password: "123456", name: "Ana" });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email já cadastrado");
  });
});

describe("POST /users/login", () => {
  let hashDaSenha: string;

  beforeAll(async () => {
    hashDaSenha = await bcrypt.hash("123456", 4);
  });

  it("retorna 400 quando faltam campos", async () => {
    const res = await request(app).post("/users/login").send({ email: "a@a.com" });
    expect(res.status).toBe(400);
  });

  it("retorna 401 quando o usuário não existe", async () => {
    userMock.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post("/users/login")
      .send({ email: "x@x.com", password: "123456" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Credenciais inválidas");
  });

  it("retorna 401 quando a senha está errada", async () => {
    userMock.findUnique.mockResolvedValue({ id: 1, email: "a@a.com", password: hashDaSenha });

    const res = await request(app)
      .post("/users/login")
      .send({ email: "a@a.com", password: "senha_errada" });

    expect(res.status).toBe(401);
  });

  it("retorna 200 com um token JWT válido quando as credenciais estão certas", async () => {
    userMock.findUnique.mockResolvedValue({ id: 1, email: "a@a.com", password: hashDaSenha });

    const res = await request(app)
      .post("/users/login")
      .send({ email: "a@a.com", password: "123456" });

    expect(res.status).toBe(200);

    const payload = jwt.verify(res.body.token, process.env.JWT_SECRET as string) as { userId: number };
    expect(payload.userId).toBe(1);
  });
});
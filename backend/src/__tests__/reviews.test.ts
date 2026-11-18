import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../prisma";

jest.mock("../prisma", () => ({
  prisma: {
    review: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const reviewMock = prisma.review as any;

// Gera um token válido para o usuário informado
const tokenDe = (userId: number) =>
  jwt.sign({ userId }, process.env.JWT_SECRET as string);

const auth = (userId: number) => ({ Authorization: `Bearer ${tokenDe(userId)}` });

beforeEach(() => {
  jest.resetAllMocks();
});

describe("POST /reviews", () => {
  it("retorna 401 sem token", async () => {
    const res = await request(app).post("/reviews").send({ mediaId: 1, rating: 5 });
    expect(res.status).toBe(401);
  });

  it("retorna 400 quando faltam campos", async () => {
    const res = await request(app).post("/reviews").set(auth(1)).send({ mediaId: 1 });
    expect(res.status).toBe(400);
  });

  it("retorna 400 quando a nota está fora de 1 a 5", async () => {
    const res = await request(app)
      .post("/reviews")
      .set(auth(1))
      .send({ mediaId: 1, rating: 6 });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("rating deve ser entre 1 e 5");
    expect(reviewMock.create).not.toHaveBeenCalled();
  });

  it("cria a review usando o userId que vem do token", async () => {
    reviewMock.create.mockResolvedValue({ id: 10, rating: 4, userId: 7, mediaId: 1 });

    const res = await request(app)
      .post("/reviews")
      .set(auth(7))
      .send({ mediaId: 1, rating: 4, comment: "Muito bom" });

    expect(res.status).toBe(201);
    expect(reviewMock.create.mock.calls[0][0].data.userId).toBe(7);
  });
});

describe("GET /reviews/mine", () => {
  it("busca apenas as reviews do usuário logado", async () => {
    reviewMock.findMany.mockResolvedValue([]);

    const res = await request(app).get("/reviews/mine").set(auth(3));

    expect(res.status).toBe(200);
    expect(reviewMock.findMany.mock.calls[0][0].where).toEqual({ userId: 3 });
  });
});

describe("PUT /reviews/:id", () => {
  it("retorna 404 quando a review não existe", async () => {
    reviewMock.findUnique.mockResolvedValue(null);

    const res = await request(app).put("/reviews/99").set(auth(1)).send({ rating: 3 });
    expect(res.status).toBe(404);
  });

  it("retorna 403 quando a review é de outro usuário", async () => {
    reviewMock.findUnique.mockResolvedValue({ id: 5, userId: 1 });

    const res = await request(app).put("/reviews/5").set(auth(2)).send({ rating: 3 });

    expect(res.status).toBe(403);
    expect(reviewMock.update).not.toHaveBeenCalled();
  });

  it("retorna 400 quando a nota é inválida", async () => {
    reviewMock.findUnique.mockResolvedValue({ id: 5, userId: 1 });

    const res = await request(app).put("/reviews/5").set(auth(1)).send({ rating: 9 });
    expect(res.status).toBe(400);
  });

  it("atualiza quando o usuário é o dono", async () => {
    reviewMock.findUnique.mockResolvedValue({ id: 5, userId: 1 });
    reviewMock.update.mockResolvedValue({ id: 5, userId: 1, rating: 3, comment: "ok" });

    const res = await request(app)
      .put("/reviews/5")
      .set(auth(1))
      .send({ rating: 3, comment: "ok" });

    expect(res.status).toBe(200);
    expect(res.body.rating).toBe(3);
  });
});

describe("DELETE /reviews/:id", () => {
  it("retorna 404 quando a review não existe", async () => {
    reviewMock.findUnique.mockResolvedValue(null);

    const res = await request(app).delete("/reviews/99").set(auth(1));
    expect(res.status).toBe(404);
  });

  it("retorna 403 e NÃO apaga quando a review é de outro usuário", async () => {
    reviewMock.findUnique.mockResolvedValue({ id: 5, userId: 1 });

    const res = await request(app).delete("/reviews/5").set(auth(2));

    expect(res.status).toBe(403);
    expect(reviewMock.delete).not.toHaveBeenCalled();
  });

  it("retorna 204 e apaga quando o usuário é o dono", async () => {
    reviewMock.findUnique.mockResolvedValue({ id: 5, userId: 1 });
    reviewMock.delete.mockResolvedValue({});

    const res = await request(app).delete("/reviews/5").set(auth(1));

    expect(res.status).toBe(204);
    expect(reviewMock.delete).toHaveBeenCalledWith({ where: { id: 5 } });
  });
});
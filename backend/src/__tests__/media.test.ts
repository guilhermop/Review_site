import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../app";
import { prisma } from "../prisma";

jest.mock("../prisma", () => ({
  prisma: {
    media: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

const mediaMock = prisma.media as any;

const auth = (userId = 1) => ({
  Authorization: `Bearer ${jwt.sign({ userId }, process.env.JWT_SECRET as string)}`,
});

beforeEach(() => {
  jest.resetAllMocks();
});

describe("GET /media", () => {
  it("calcula a nota média e a quantidade de reviews", async () => {
    mediaMock.findMany.mockResolvedValue([
      { id: 1, title: "Dune", type: "BOOK", reviews: [{ rating: 4 }, { rating: 5 }] },
    ]);

    const res = await request(app).get("/media");

    expect(res.status).toBe(200);
    expect(res.body[0].averageRating).toBe(4.5);
    expect(res.body[0].reviewCount).toBe(2);
    expect(res.body[0].reviews).toBeUndefined();
  });

  it("retorna averageRating null quando a mídia não tem reviews", async () => {
    mediaMock.findMany.mockResolvedValue([
      { id: 2, title: "Hades", type: "GAME", reviews: [] },
    ]);

    const res = await request(app).get("/media");

    expect(res.status).toBe(200);
    expect(res.body[0].averageRating).toBeNull();
    expect(res.body[0].reviewCount).toBe(0);
  });
});

describe("GET /media/:id", () => {
  it("retorna 404 quando a mídia não existe", async () => {
    mediaMock.findUnique.mockResolvedValue(null);

    const res = await request(app).get("/media/99");

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Mídia não encontrada");
  });

  it("retorna 200 com a mídia e suas reviews", async () => {
    mediaMock.findUnique.mockResolvedValue({ id: 1, title: "Dune", reviews: [] });

    const res = await request(app).get("/media/1");

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Dune");
  });
});

describe("POST /media", () => {
  it("retorna 401 sem token", async () => {
    const res = await request(app).post("/media").send({ type: "BOOK", title: "Dune" });
    expect(res.status).toBe(401);
  });

  it("retorna 400 quando faltam type ou title", async () => {
    const res = await request(app).post("/media").set(auth()).send({ title: "Dune" });

    expect(res.status).toBe(400);
    expect(mediaMock.create).not.toHaveBeenCalled();
  });

  it("cria a mídia e retorna 201", async () => {
    mediaMock.create.mockResolvedValue({ id: 1, type: "BOOK", title: "Dune" });

    const res = await request(app)
      .post("/media")
      .set(auth())
      .send({ type: "BOOK", title: "Dune", creator: "Frank Herbert", year: 1965 });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Dune");
  });
});

describe("DELETE /media/:id", () => {
  it("retorna 401 sem token", async () => {
    const res = await request(app).delete("/media/1");
    expect(res.status).toBe(401);
  });

  it("retorna 404 quando a mídia não existe", async () => {
    mediaMock.findUnique.mockResolvedValue(null);

    const res = await request(app).delete("/media/99").set(auth());

    expect(res.status).toBe(404);
    expect(mediaMock.delete).not.toHaveBeenCalled();
  });

  it("retorna 204 e apaga a mídia", async () => {
    mediaMock.findUnique.mockResolvedValue({ id: 1 });
    mediaMock.delete.mockResolvedValue({});

    const res = await request(app).delete("/media/1").set(auth());

    expect(res.status).toBe(204);
    expect(mediaMock.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });
});
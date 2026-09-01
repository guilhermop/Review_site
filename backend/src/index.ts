import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import cors from "cors";

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

interface AuthRequest extends Request {
  userId?: number;
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token não fornecido" });
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: "Token inválido ou expirado" });
    }

    req.userId = (decoded as { userId: number }).userId;
    next();
  });
}

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("API rodando!");
});

app.post("/users/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "email, password e name são obrigatórios" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar usuário" });
  }
});

app.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email e password são obrigatórios" });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

app.post("/media", authenticateToken, async (req, res) => {
  try {
    const { type, title, creator, year, attributes } = req.body;

    if (!type || !title) {
      return res.status(400).json({ error: "type e title são obrigatórios" });
    }

    const media = await prisma.media.create({
      data: {
        type,
        title,
        creator,
        year,
        attributes,
      },
    });

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar mídia" });
  }
});

app.delete("/media/:id", authenticateToken, async (req, res) => {
  try {
    const mediaId = Number(req.params.id);

    const existingMedia = await prisma.media.findUnique({
      where: { id: mediaId },
    });

    if (!existingMedia) {
      return res.status(404).json({ error: "Mídia não encontrada" });
    }

    await prisma.media.delete({
      where: { id: mediaId },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar mídia" });
  }
});

app.post("/reviews", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { mediaId, rating, comment } = req.body;

    if (!mediaId || !rating) {
      return res.status(400).json({ error: "mediaId e rating são obrigatórios" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "rating deve ser entre 1 e 5" });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: req.userId!,
        mediaId,
      },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar review" });
  }
});

app.get("/reviews", async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true },
        },
        media: true,
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar reviews" });
  }
});

app.get("/reviews/mine", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        media: true,
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar suas reviews" });
  }
});

app.put("/reviews/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const reviewId = Number(req.params.id);
    const { rating, comment } = req.body;

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review não encontrada" });
    }

    if (existingReview.userId !== req.userId) {
      return res.status(403).json({ error: "Você não tem permissão para editar esta review" });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "rating deve ser entre 1 e 5" });
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: { rating, comment },
    });

    res.status(200).json(updatedReview);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar review" });
  }
});

app.delete("/reviews/:id", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const reviewId = Number(req.params.id);

    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!existingReview) {
      return res.status(404).json({ error: "Review não encontrada" });
    }

    if (existingReview.userId !== req.userId) {
      return res.status(403).json({ error: "Você não tem permissão para deletar esta review" });
    }

    await prisma.review.delete({
      where: { id: reviewId },
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar review" });
  }
});

app.get("/media/:id", async (req, res) => {
  try {
    const mediaId = Number(req.params.id);

    const media = await prisma.media.findUnique({
      where: { id: mediaId },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!media) {
      return res.status(404).json({ error: "Mídia não encontrada" });
    }

    res.status(200).json(media);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar mídia" });
  }
});

app.get("/media", async (req, res) => {
  try {
    const mediaList = await prisma.media.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    const mediaWithRating = mediaList.map((media) => {
      const ratings = media.reviews.map((r) => r.rating);
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : null;

      const { reviews, ...rest } = media;
      return {
        ...rest,
        averageRating,
        reviewCount: ratings.length,
      };
    });

    res.status(200).json(mediaWithRating);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar mídias" });
  }
});
app.get("/reviews/mine", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
      include: {
        media: true,
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar suas reviews" });
  }
});
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

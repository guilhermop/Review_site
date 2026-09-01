import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Review {
  id: number;
  rating: number;
  comment: string;
  user: { id: number; name: string };
}

interface Media {
  id: number;
  title: string;
  type: string;
  creator: string;
  year: number;
  reviews: Review[];
}

const typeLabels: Record<string, string> = {
  BOOK: "Livro",
  GAME: "Jogo",
  MOVIE: "Filme",
};

function MediaDetail() {
  const { id } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [media, setMedia] = useState<Media | null>(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch(`http://localhost:3000/media/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Erro ao carregar mídia");
          return;
        }

        setMedia(data);
      } catch (err) {
        setError("Erro de conexão com o servidor");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          mediaId: Number(id),
          rating: Number(rating),
          comment,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao enviar review");
        return;
      }

      navigate("/");
    } catch (err) {
      setError("Erro de conexão com o servidor");
    }
  }

  if (loading) return <p className="text-center mt-10">Carregando...</p>;
  if (!media) return <p className="text-center mt-10">Mídia não encontrada</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{media.title}</h1>
            <Badge variant="secondary">{typeLabels[media.type] ?? media.type}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            {media.creator} {media.year ? `· ${media.year}` : ""}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Deixe sua review</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="space-y-1">
              <Select
                value={rating}
                onValueChange={(value) => value && setRating(value)}
              >
                <SelectTrigger>
                  <SelectValue>
                    {(value: string) => `${value} ${value === "1" ? "estrela" : "estrelas"}`}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} {n === 1 ? "estrela" : "estrelas"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder="Escreva sua opinião..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />

            <Button type="submit">Enviar review</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Reviews ({media.reviews.length})</h2>
        {media.reviews.length === 0 && (
          <p className="text-sm text-gray-500">Nenhuma review ainda.</p>
        )}
        {media.reviews.map((r) => (
          <Card key={r.id}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{r.user?.name ?? "Usuário"}</span>
                <Badge>{r.rating} ★</Badge>
              </div>
              <p className="text-sm text-gray-600">{r.comment}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default MediaDetail;
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MyReview {
  id: number;
  rating: number;
  comment: string;
  media: { id: number; title: string };
}

function MyReviews() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState("5");
  const [editComment, setEditComment] = useState("");

  function loadReviews() {
    if (!token) return;
    fetch("http://localhost:3000/reviews/mine", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setReviews)
      .catch(() => setError("Erro ao carregar suas reviews"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReviews();
  }, [token]);

  async function handleDelete(reviewId: number) {
    try {
      const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        setError("Erro ao excluir review");
        return;
      }
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
    } catch (err) {
      setError("Erro de conexão com o servidor");
    }
  }

  function startEdit(review: MyReview) {
    setEditingId(review.id);
    setEditRating(String(review.rating));
    setEditComment(review.comment || "");
  }

  async function saveEdit(reviewId: number) {
    try {
      const response = await fetch(`http://localhost:3000/reviews/${reviewId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating: Number(editRating),
          comment: editComment,
        }),
      });

      if (!response.ok) {
        setError("Erro ao atualizar review");
        return;
      }

      setEditingId(null);
      loadReviews();
    } catch (err) {
      setError("Erro de conexão com o servidor");
    }
  }

  if (loading) return <p className="text-center mt-10">Carregando...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4 px-4">
      <Button
        variant="ghost"
        size="sm"
        className="w-fit -ml-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Voltar
      </Button>

      <h1 className="text-2xl font-bold">Minhas reviews</h1>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {reviews.length === 0 && (
        <p className="text-sm text-gray-500">Você ainda não fez nenhuma review.</p>
      )}

      {reviews.map((r) => (
        <Card key={r.id}>
          <CardContent className="pt-4">
            {editingId === r.id ? (
              <div className="space-y-3">
                <Link to={`/media/${r.media.id}`} className="font-medium hover:underline">
                  {r.media.title}
                </Link>

                <Select
                  value={editRating}
                  onValueChange={(value) => value && setEditRating(value)}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue>
                      {(value: string) =>
                        `${value} ${value === "1" ? "estrela" : "estrelas"}`
                      }
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

                <Textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                />

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => saveEdit(r.id)}>
                    Salvar
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditingId(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <Link
                    to={`/media/${r.media.id}`}
                    className="font-medium hover:underline"
                  >
                    {r.media.title}
                  </Link>
                  <Badge>{r.rating} ★</Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">{r.comment}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(r.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default MyReviews;
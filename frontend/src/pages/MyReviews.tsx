import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMyReviews, deleteReview, updateReview, type MyReview } from "../services/api";

function MyReviews() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState("");

  function loadReviews() {
    if (!token) return;
    getMyReviews(token)
      .then(setReviews)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadReviews();
  }, [token]);

  async function handleDelete(id: number) {
    if (!token) return;
    if (!confirm("Tem certeza que deseja deletar essa review?")) return;

    await deleteReview(id, token);
    loadReviews();
  }

  function startEdit(review: MyReview) {
    setEditingId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment || "");
  }

  async function saveEdit(id: number) {
    if (!token) return;
    await updateReview(id, editRating, editComment, token);
    setEditingId(null);
    loadReviews();
  }

  if (loading) return <p className="p-8">Carregando...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Voltar
        </Link>

        <h1 className="text-2xl font-bold my-4">Minhas reviews</h1>

        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded shadow">
              <p className="font-semibold mb-2">{review.media.title}</p>

              {editingId === review.id ? (
                <div>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 mb-2 w-20"
                  />
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1 mb-2"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(review.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="bg-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-400"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-yellow-600 font-bold">
                      {review.rating}/5
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(review)}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="text-red-600 text-sm hover:underline"
                      >
                        Deletar
                      </button>
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-gray-700">{review.comment}</p>
                  )}
                </div>
              )}
            </div>
          ))}

          {reviews.length === 0 && (
            <p className="text-gray-500">Você ainda não fez nenhuma review.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyReviews;
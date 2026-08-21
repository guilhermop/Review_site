import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMediaById, createReview, type MediaWithReviews } from "../services/api";

function MediaDetail() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [media, setMedia] = useState<MediaWithReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [formError, setFormError] = useState("");

  function loadMedia() {
    if (!id) return;
    getMediaById(id)
      .then(setMedia)
      .catch(() => setError("Erro ao carregar mídia"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadMedia();
  }, [id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!token || !media) return;

    try {
      await createReview(media.id, rating, comment, token);
      setComment("");
      setRating(5);
      loadMedia();
    } catch (err) {
      if (err instanceof Error) setFormError(err.message);
    }
  }

  if (loading) return <p className="p-8">Carregando...</p>;
  if (error) return <p className="p-8 text-red-500">{error}</p>;
  if (!media) return null;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Voltar
        </Link>

        <div className="bg-white p-6 rounded shadow mt-4 mb-6">
          <span className="text-xs font-semibold text-blue-600 uppercase">
            {media.type}
          </span>
          <h1 className="text-2xl font-bold">{media.title}</h1>
          {media.creator && <p className="text-gray-600">{media.creator}</p>}
          {media.year && <p className="text-gray-500">{media.year}</p>}
        </div>

        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-lg font-bold mb-4">Deixar uma review</h2>

          {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Nota (1-5)</label>
              <input
                type="number"
                min={1}
                max={5}
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Comentário</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Enviar review
            </button>
          </form>
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Reviews ({media.reviews.length})</h2>
          <div className="space-y-4">
            {media.reviews.map((review) => (
              <div key={review.id} className="bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold">{review.user.name}</span>
                  <span className="text-yellow-500 font-bold">{review.rating}/5</span>
                </div>
                {review.comment && <p className="text-gray-700">{review.comment}</p>}
              </div>
            ))}
            {media.reviews.length === 0 && (
              <p className="text-gray-500">Nenhuma review ainda. Seja o primeiro!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaDetail;
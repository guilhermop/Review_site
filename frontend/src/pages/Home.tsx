import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMedia, type Media } from "../services/api";

function Home() {
  const { logout } = useAuth();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMedia()
      .then(setMediaList)
      .catch(() => setError("Erro ao carregar mídias"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reviews</h1>
          <button
            onClick={logout}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sair
          </button>
        </div>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mediaList.map((media) => (
            <Link
              key={media.id}
              to={`/media/${media.id}`}
              className="bg-white p-4 rounded shadow hover:shadow-md transition"
            >
              <span className="text-xs font-semibold text-blue-600 uppercase">
                {media.type}
              </span>
              <h2 className="text-lg font-bold">{media.title}</h2>
              {media.creator && (
                <p className="text-sm text-gray-600">{media.creator}</p>
              )}
              {media.year && (
                <p className="text-sm text-gray-500">{media.year}</p>
              )}
            </Link>
          ))}
        </div>

        {!loading && mediaList.length === 0 && (
          <p className="text-gray-500">Nenhuma mídia cadastrada ainda.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
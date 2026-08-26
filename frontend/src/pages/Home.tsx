import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMedia, type Media } from "../services/api";

function Home() {
  const { logout } = useAuth();
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | "BOOK" | "GAME" | "MOVIE">("ALL");

  useEffect(() => {
    getMedia()
      .then(setMediaList)
      .catch(() => setError("Erro ao carregar mídias"))
      .finally(() => setLoading(false));
  }, []);

  const filteredList = mediaList.filter((media) => {
  const matchesSearch = media.title.toLowerCase().includes(search.toLowerCase());
  const matchesType = typeFilter === "ALL" || media.type === typeFilter;

  return matchesSearch && matchesType;
});
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reviews</h1>
          <div className="flex gap-2">
            <Link
              to="/media/new"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              + Nova mídia
            </Link>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Sair
            </button>
            <Link
              to="/my-reviews"
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800"
            >
              Minhas reviews
            </Link>
          </div>
        </div>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as "ALL" | "BOOK" | "GAME" | "MOVIE")}
          className="border border-gray-300 rounded px-3 py-2"
        >
          <option value="ALL">Todos</option>
          <option value="BOOK">Livros</option>
          <option value="GAME">Jogos</option>
          <option value="MOVIE">Filmes</option>
        </select>
      </div>
        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((media) => (
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
              {media.averageRating !== null ? (
                <p className="text-sm text-yellow-600 font-semibold mt-1">
                  ⭐ {media.averageRating.toFixed(1)} ({media.reviewCount}{" "}
                  {media.reviewCount === 1 ? "review" : "reviews"})
                </p>
              ) : (
                <p className="text-sm text-gray-400 mt-1">Sem reviews ainda</p>
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
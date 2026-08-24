import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createMedia } from "../services/api";

function CreateMedia() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [type, setType] = useState<"BOOK" | "GAME" | "MOVIE">("BOOK");
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) return;

    try {
      const media = await createMedia(
        {
          type,
          title,
          creator: creator || undefined,
          year: year ? Number(year) : undefined,
        },
        token
      );
      navigate(`/media/${media.id}`);
    } catch (err) {
      if (err instanceof Error) setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto">
        <Link to="/" className="text-blue-600 hover:underline text-sm">
          ← Voltar
        </Link>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow mt-4"
        >
          <h1 className="text-xl font-bold mb-6">Cadastrar mídia</h1>

          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as "BOOK" | "GAME" | "MOVIE")}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="BOOK">Livro</option>
              <option value="GAME">Jogo</option>
              <option value="MOVIE">Filme</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Autor / Diretor / Desenvolvedor
            </label>
            <input
              type="text"
              value={creator}
              onChange={(e) => setCreator(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Ano</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Cadastrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateMedia;
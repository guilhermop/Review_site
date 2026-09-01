import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getMedia, type Media } from "../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Reviews</h1>
          <div className="flex gap-2">
            <Button render={<Link to="/media/new" />} nativeButton={false}>
              + Nova mídia
            </Button>
            <Button render={<Link to="/my-reviews" />} nativeButton={false} variant="secondary">
              Minhas reviews
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select
            value={typeFilter}
            onValueChange={(value) =>
              setTypeFilter(value as "ALL" | "BOOK" | "GAME" | "MOVIE")
            }
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Todos</SelectItem>
              <SelectItem value="BOOK">Livros</SelectItem>
              <SelectItem value="GAME">Jogos</SelectItem>
              <SelectItem value="MOVIE">Filmes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading && <p>Carregando...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredList.map((media) => (
            <Link key={media.id} to={`/media/${media.id}`}>
              <Card className="hover:shadow-md transition h-full">
                <CardHeader>
                  <Badge variant="outline" className="w-fit uppercase text-xs">
                    {media.type}
                  </Badge>
                  <h2 className="text-lg font-bold">{media.title}</h2>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {!loading && filteredList.length === 0 && (
          <p className="text-gray-500">Nenhuma mídia encontrada.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
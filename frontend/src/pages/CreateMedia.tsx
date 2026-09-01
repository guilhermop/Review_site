import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const typeLabels: Record<string, string> = {
  BOOK: "Livro",
  GAME: "Jogo",
  MOVIE: "Filme",
};

function CreateMedia() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState("BOOK");
  const [creator, setCreator] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:3000/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          type,
          creator,
          year: year ? Number(year) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Erro ao criar mídia");
        return;
      }

      navigate("/");
    } catch (err) {
      setError("Erro de conexão com o servidor");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 mb-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-center">Nova mídia</h1>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="space-y-1">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={type} onValueChange={(value) => value && setType(value)}>
                <SelectTrigger>
                  <SelectValue>
                    {(value: string) => typeLabels[value] ?? "Selecione"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BOOK">Livro</SelectItem>
                  <SelectItem value="GAME">Jogo</SelectItem>
                  <SelectItem value="MOVIE">Filme</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="creator">Autor / Diretor / Estúdio</Label>
              <Input
                id="creator"
                type="text"
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="year">Ano</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full">
              Criar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default CreateMedia;
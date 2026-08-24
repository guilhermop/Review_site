const API_URL = "http://localhost:3000";

export interface Media {
  id: number;
  type: "BOOK" | "GAME" | "MOVIE";
  title: string;
  creator: string | null;
  year: number | null;
  createdAt: string;
}

export interface Review {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: number;
  mediaId: number;
  user: { id: number; name: string };
}

export interface MediaWithReviews extends Media {
  reviews: Review[];
}

export async function getMedia(): Promise<Media[]> {
  const response = await fetch(`${API_URL}/media`);
  if (!response.ok) throw new Error("Erro ao buscar mídias");
  return response.json();
}

export async function getMediaById(id: string): Promise<MediaWithReviews> {
  const response = await fetch(`${API_URL}/media/${id}`);
  if (!response.ok) throw new Error("Erro ao buscar mídia");
  return response.json();
}

export async function createReview(
  mediaId: number,
  rating: number,
  comment: string,
  token: string
): Promise<Review> {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mediaId, rating, comment }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Erro ao criar review");
  return data;
}

export interface CreateMediaInput {
  type: "BOOK" | "GAME" | "MOVIE";
  title: string;
  creator?: string;
  year?: number;
}

export async function createMedia(
  data: CreateMediaInput,
  token: string
): Promise<Media> {
  const response = await fetch(`${API_URL}/media`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "Erro ao criar mídia");
  return result;
}
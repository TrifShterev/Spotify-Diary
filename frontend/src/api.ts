/** Response of `GET /api/me`. */
export interface MeResponse {
  userId: string;
  spotify: {
    id: string;
    displayName: string | null;
    email: string | null;
    country: string | null;
    product: string | null;
    imageUrl: string | null;
    profileUrl: string | null;
    followers: number | null;
  };
}

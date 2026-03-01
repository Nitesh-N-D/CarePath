export interface Disease {
  id: string;
  name: string;
  slug: string;
  body_system: string;
  category: string;
  symptoms: string[];
  causes: string;
  diagnosis: string;
  treatment: string;
  prevention: string;
  emergency_signs: string;
  sources: string[];
  created_at: string;
  highlighted_causes?: string;
  rank?: number;
}

export interface SearchResponse {
  totalResults: number;
  totalPages: number;
  currentPage: number;
  limit: number;
  results: Disease[];
}
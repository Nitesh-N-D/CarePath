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
  emergency_signs: string[];
  sources: string[];
  created_at: string;
}

export interface SearchResponse {
  totalResults: number;
  totalPages: number;
  currentPage: number;
  results: Disease[];
}

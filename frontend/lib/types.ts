export type SubRatings = {
  food: number;
  service: number;
  cleanliness: number;
  value: number;
};

export type ProfileResponse = {
  business: {
    businessId: string;
    name: string;
    category: string;
    city: string;
    logoUrl: string | null;
    createdAt: string;
  };
  overall: number;
  subRatings: SubRatings;
  visitCount: number;
  reviewCount: number;
  conversionPct: number;
  summary: {
    summary: string;
    positives: string[];
    concerns: string[];
    basedOnReviews: number;
    generatedAt: string;
  } | null;
};

export type PublicReview = {
  reviewId: string;
  authorName: string;
  ratings: SubRatings;
  overall: number;
  text: string;
  createdAt: string;
  verified: boolean;
  flagged: boolean;
  response: { text: string; respondedAt: string } | null;
};

export type ReviewsResponse = { reviews: PublicReview[] };

export type BusinessSummary = {
  businessId: string;
  name: string;
  category: string;
  city: string;
  overall: number;
  reviewCount: number;
  visitCount: number;
};

export type BusinessesResponse = { businesses: BusinessSummary[] };

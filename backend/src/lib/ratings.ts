export type Ratings = {
  food: number;
  service: number;
  cleanliness: number;
  value: number;
};

export type RatingAxis = { sum: number; n: number };

export type RatingSums = {
  food: RatingAxis;
  service: RatingAxis;
  cleanliness: RatingAxis;
  value: RatingAxis;
};

export const EMPTY_RATING_SUMS: RatingSums = {
  food: { sum: 0, n: 0 },
  service: { sum: 0, n: 0 },
  cleanliness: { sum: 0, n: 0 },
  value: { sum: 0, n: 0 },
};

export function overallOf(ratings: Ratings): number {
  const avg = (ratings.food + ratings.service + ratings.cleanliness + ratings.value) / 4;
  return Math.round(avg * 100) / 100;
}

export function axisAverage(axis: RatingAxis | undefined): number {
  if (!axis || axis.n === 0) return 0;
  return Math.round((axis.sum / axis.n) * 100) / 100;
}

export function isValidRatings(r: any): r is Ratings {
  if (!r || typeof r !== "object") return false;
  for (const key of ["food", "service", "cleanliness", "value"] as const) {
    const v = r[key];
    if (typeof v !== "number" || Number.isNaN(v) || v < 1 || v > 5) return false;
  }
  return true;
}

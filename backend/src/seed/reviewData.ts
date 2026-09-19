export type SeedReview = {
  ratings: { food: number; service: number; cleanliness: number; value: number };
  text: string;
  authorName: string;
  /** Days before "now" this review was posted. */
  daysAgo: number;
  /** Hours before the review's createdAt that this author was first seen (account age). */
  authorAgeHours: number;
  response?: string;
};

/**
 * One demo business, 15 realistic reviews. #15 is deliberately planted to
 * trip two risk signals (NEW_ACCOUNT + DUPLICATE_TEXT of #3) so the
 * Flagged badge is visible on camera without waiting on live traffic.
 */
export const SEED_REVIEWS: SeedReview[] = [
  {
    ratings: { food: 5, service: 4, cleanliness: 5, value: 5 },
    text: "The dal makhani here is the best I have had in Jaipur. Portions are generous and the thali is great value for the price. Service was quick even during the Saturday evening rush.",
    authorName: "Rohan S.",
    daysAgo: 21,
    authorAgeHours: 400,
    response: "Thank you Rohan! We're glad the dal makhani hit the spot. See you again soon.",
  },
  {
    ratings: { food: 4, service: 3, cleanliness: 4, value: 4 },
    text: "Food was excellent but service was slow at 8pm, we waited almost 20 minutes just to order. Once the food arrived it was worth it though. The paneer tikka was outstanding.",
    authorName: "Priya M.",
    daysAgo: 19,
    authorAgeHours: 2000,
  },
  {
    ratings: { food: 5, service: 5, cleanliness: 4, value: 4 },
    text: "Consistently good food and the staff remembers regular customers. Cleanliness has improved a lot since my last visit a few months ago. Would recommend the butter naan with any curry.",
    authorName: "Amit K.",
    daysAgo: 18,
    authorAgeHours: 5000,
  },
  {
    ratings: { food: 3, service: 3, cleanliness: 3, value: 3 },
    text: "Decent but nothing special. The lassi was good, food was average temperature by the time it reached our table. Cleanliness was okay, a couple of tables could use more attention.",
    authorName: "Neha T.",
    daysAgo: 16,
    authorAgeHours: 1200,
  },
  {
    ratings: { food: 5, service: 4, cleanliness: 5, value: 5 },
    text: "Took my parents here for their anniversary. The gulab jamun and kaju curry were both fantastic. Staff went out of their way to make the table feel special. Highly recommend for celebrations.",
    authorName: "Vikram J.",
    daysAgo: 15,
    authorAgeHours: 300,
  },
  {
    ratings: { food: 2, service: 3, cleanliness: 3, value: 2 },
    text: "Food was quite oily this time, not up to the usual standard. Service was polite though. Might have just been an off day, will try again before writing them off completely.",
    authorName: "Sanjana R.",
    daysAgo: 14,
    authorAgeHours: 8000,
  },
  {
    ratings: { food: 4, service: 5, cleanliness: 4, value: 4 },
    text: "Great spot for a quick lunch thali. Staff is efficient and friendly, they got us in and out in 30 minutes without ever feeling rushed. The chaas is a nice touch, complimentary and refreshing.",
    authorName: "Karan D.",
    daysAgo: 13,
    authorAgeHours: 600,
  },
  {
    ratings: { food: 5, service: 4, cleanliness: 5, value: 4 },
    text: "Cleanest kitchen I've seen in a dhaba of this size, and you can taste the difference in freshness. The malai kofta was rich without being heavy. A bit pricier than nearby options but worth it.",
    authorName: "Ritu B.",
    daysAgo: 11,
    authorAgeHours: 3000,
  },
  {
    ratings: { food: 4, service: 4, cleanliness: 4, value: 5 },
    text: "Best value thali in the area, hands down. You get four sabzis, dal, rice, roti and a sweet for a very fair price. Service is no-frills but gets the job done well.",
    authorName: "Manish P.",
    daysAgo: 9,
    authorAgeHours: 900,
  },
  {
    ratings: { food: 3, service: 2, cleanliness: 4, value: 3 },
    text: "Food quality is fine but service needs work, our waiter forgot half our order and we had to ask twice for water refills. Cleanliness of the dining area was good at least.",
    authorName: "Divya A.",
    daysAgo: 8,
    authorAgeHours: 1500,
  },
  {
    ratings: { food: 5, service: 5, cleanliness: 5, value: 4 },
    text: "Everything about this visit was excellent, from the warm welcome to the last bite of kheer. This is now our default choice for family dinners in the area. Cannot recommend it enough.",
    authorName: "Arjun N.",
    daysAgo: 6,
    authorAgeHours: 4200,
  },
  {
    ratings: { food: 4, service: 4, cleanliness: 3, value: 4 },
    text: "Solid weekday dinner option. Food came out hot and fresh, service was attentive without hovering. The floor near the entrance could use a mop but the dining area itself was clean.",
    authorName: "Simran K.",
    daysAgo: 5,
    authorAgeHours: 200,
  },
  {
    ratings: { food: 5, service: 4, cleanliness: 4, value: 5 },
    text: "The QR code review system is such a good idea, felt nice knowing every review here actually came from a real visit. Food-wise the veg thali is unbeatable for the price.",
    authorName: "Aditya V.",
    daysAgo: 3,
    authorAgeHours: 700,
  },
  {
    ratings: { food: 4, service: 5, cleanliness: 5, value: 4 },
    text: "Second time here this month, consistency is what impresses me most. The staff greeted us by name which was a nice surprise. Cleanliness in the washroom area was also noticeably good.",
    authorName: "Pooja S.",
    daysAgo: 2,
    authorAgeHours: 2600,
  },
  // Deliberately flagged: near-duplicate of review #3's text, posted by a
  // brand-new anonymous identity only a few minutes old.
  {
    ratings: { food: 5, service: 5, cleanliness: 4, value: 4 },
    text: "Consistently good food and the staff remembers regular customers. Cleanliness has improved a lot since my last visit a few months ago. Would recommend the butter naan with any curry!!",
    authorName: "Verified customer",
    daysAgo: 0,
    authorAgeHours: 0.05, // ~3 minutes old
  },
];

const AMBER = "#F3B94D";
const CORAL = "#FF7A59";
const TEAL = "#14B8A6";
const INDIGO = "#7C6FF0";

type Feature = {
  title: string;
  body: string;
  color: string;
  icon: (color: string) => React.ReactNode;
};

const FEATURES: Feature[] = [
  {
    title: "Single-use QR codes",
    body: "The code at the counter rotates every 60 seconds and is spent the instant it's scanned. A conditional database write, not app logic, guarantees exactly one redemption.",
    color: AMBER,
    icon: (c) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={c} strokeWidth={2} />
        <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={c} strokeWidth={2} />
        <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={c} strokeWidth={2} />
        <path d="M14 14h3m4 0h0M14 18h3m-3 3h7v-3" stroke={c} strokeWidth={2} strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Location verification",
    body: "If a business registers its location, a review scanned far away is quietly flagged for a moderator. Optional, never blocks a scan if declined.",
    color: TEAL,
    icon: (c) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 21s7-6.1 7-11.5A7 7 0 105 9.5C5 14.9 12 21 12 21z"
          stroke={c}
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <circle cx="12" cy="9.5" r="2.5" stroke={c} strokeWidth={2} />
      </svg>
    ),
  },
  {
    title: "Six deterministic risk signals",
    body: "New accounts, rapid posting, duplicate text, stale tokens, location mismatches, and review bursts for one business. Transparent rules, not a black-box model.",
    color: CORAL,
    icon: (c) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 3v18M5 4h11l-2.5 3.5L16 11H5"
          stroke={c}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Public review conversion",
    body: "Every Trust Profile shows what percent of verified visits actually became reviews. A business only showing its code to happy customers can't hide that ratio.",
    color: INDIGO,
    icon: (c) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 20V10M12 20V4M20 20v-7"
          stroke={c}
          strokeWidth={2}
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Humans moderate, not algorithms",
    body: "Flagged reviews go to an admin queue with their exact risk signals visible. Nothing is ever auto-hidden — a person makes the final call, every time.",
    color: AMBER,
    icon: (c) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="9" cy="8" r="3.25" stroke={c} strokeWidth={2} />
        <path d="M3.5 20c.7-3.5 3-5.5 5.5-5.5s4.8 2 5.5 5.5" stroke={c} strokeWidth={2} strokeLinecap="round" />
        <path d="M15.5 10.5l2 2 3.5-3.5" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Instant AI summaries",
    body: "Amazon Bedrock reads a business's verified reviews and surfaces the recurring positives and concerns, so visitors get the gist without scrolling through every review.",
    color: TEAL,
    icon: (c) => (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3z"
          stroke={c}
          strokeWidth={1.8}
          strokeLinejoin="round"
        />
        <path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z" stroke={c} strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function TrustFeatures() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
          How TrustReview keeps reviews honest
        </h2>
        <p className="mt-2 text-neutral-500">
          Every one of these runs today, not on a roadmap slide.
        </p>
      </div>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <div key={f.title} className="card-hover card">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: `${f.color}1F` }}
            >
              {f.icon(f.color)}
            </div>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

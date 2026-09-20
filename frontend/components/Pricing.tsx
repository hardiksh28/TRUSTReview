import Link from "next/link";

const TIERS = [
  {
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "For a single location getting started.",
    features: [
      "1 business location",
      "Rotating QR code, unlimited scans",
      "Public Trust Profile",
      "Fraud-detection risk signals",
      "Owner replies to reviews",
    ],
    cta: "Get started free",
    href: "/login",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "Contact us",
    period: "",
    tagline: "For a business that wants the full toolkit.",
    features: [
      "Everything in Free",
      "AI-generated review summaries",
      "Priority support",
      "Custom QR table-tent design",
      "Early access to new features",
    ],
    cta: "Contact us",
    href: "/contact",
    highlighted: true,
  },
  {
    name: "Multi-location",
    price: "Contact us",
    period: "",
    tagline: "For chains and franchises.",
    features: [
      "Everything in Growth",
      "Unlimited locations, one account",
      "Aggregated multi-location analytics",
      "Team access for managers",
      "Dedicated onboarding",
    ],
    cta: "Contact us",
    href: "/contact",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-5xl px-6 py-20">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Simple pricing</h2>
        <p className="mt-2 text-neutral-500">
          Start free with one location. Upgrade when you're ready to grow.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {TIERS.map((tier) => (
          <div
            key={tier.name}
            className={`card-hover card flex flex-col ${
              tier.highlighted ? "border-verified-600/60 ring-1 ring-verified-600/20" : ""
            }`}
          >
            {tier.highlighted && (
              <span className="mb-3 inline-flex w-fit items-center rounded-full bg-verified-50 px-2.5 py-1 text-xs font-semibold text-verified-700">
                Most popular
              </span>
            )}
            <h3 className="text-lg font-bold text-neutral-900">{tier.name}</h3>
            <p className="mt-1 text-sm text-neutral-500">{tier.tagline}</p>
            <div className="mt-4 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-neutral-900">{tier.price}</span>
              {tier.period && <span className="text-sm text-neutral-400">/{tier.period}</span>}
            </div>
            <ul className="mt-6 flex-1 space-y-2.5">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-verified-600">
                    <path
                      fillRule="evenodd"
                      d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42L8.5 12.09l6.79-6.8a1 1 0 011.42 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={tier.href}
              className={tier.highlighted ? "btn-primary mt-6 justify-center" : "btn-secondary mt-6 justify-center"}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

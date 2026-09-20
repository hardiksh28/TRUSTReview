const STEPS = [
  {
    n: 1,
    title: "Show the code",
    body: "A one-time QR code appears at checkout. It rotates every 60 seconds, so it's only ever live for one customer at a time.",
  },
  {
    n: 2,
    title: "Scan, then review",
    body: "One scan verifies the visit. Only then can the customer rate food, service, cleanliness and value. No visit, no review.",
  },
  {
    n: 3,
    title: "The profile updates itself",
    body: "The review is published instantly with a Verified Visit badge, permanently tied to that one redeemed code.",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-20 text-center">
      <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">Here&apos;s how it works</h2>
      <p className="mt-2 text-neutral-500">No app to install. No account for the customer.</p>

      <div className="mt-12 grid gap-10 text-left sm:grid-cols-3 sm:text-center">
        {STEPS.map((step) => (
          <div key={step.n} className="flex flex-col items-start sm:items-center">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-verified-600 text-sm font-bold text-white">
              {step.n}
            </span>
            <h3 className="mt-4 text-base font-semibold text-neutral-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-neutral-500">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

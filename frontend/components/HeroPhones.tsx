// Decorative, hand-authored "QR" pattern. Not a real scannable code.
const QR_PATTERN = [
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
  [1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0],
  [1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1],
  [1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1],
];

function DecorativeQr() {
  return (
    <div className="grid aspect-square w-full grid-cols-[repeat(13,minmax(0,1fr))] gap-[1.5px] rounded-md bg-white p-2">
      {QR_PATTERN.flatMap((row, ri) =>
        row.map((cell, ci) => (
          <div
            key={`${ri}-${ci}`}
            className={cell ? "rounded-[1px] bg-neutral-900" : "rounded-[1px] bg-white"}
          />
        ))
      )}
    </div>
  );
}

export function HeroPhones() {
  return (
    <div className="relative mx-auto flex h-[280px] w-full max-w-md items-center justify-center sm:h-[420px]">
      {/* Business phone: rotating QR */}
      <div className="absolute left-1/2 top-0 w-[170px] -translate-x-[78%] -rotate-6 rounded-[2rem] border-[6px] border-neutral-900 bg-neutral-900 shadow-xl sm:w-[210px]">
        <div className="overflow-hidden rounded-[1.6rem] bg-white">
          <div className="flex items-center justify-between px-4 pt-4">
            <span className="text-[10px] font-semibold text-neutral-400">Dashboard</span>
            <span className="h-1.5 w-1.5 rounded-full bg-verified-600" />
          </div>
          <p className="px-4 pt-1 text-xs font-bold text-neutral-900">Sharma Ji Ka Dhaba</p>
          <div className="px-6 py-4">
            <DecorativeQr />
          </div>
          <p className="pb-4 text-center text-[10px] text-neutral-400">New code every 60s</p>
        </div>
      </div>

      {/* Customer phone: verified result */}
      <div className="absolute left-1/2 top-10 w-[170px] translate-x-[8%] rotate-6 rounded-[2rem] border-[6px] border-neutral-900 bg-neutral-900 shadow-2xl sm:w-[210px] sm:top-20">
        <div className="flex flex-col items-center overflow-hidden rounded-[1.6rem] bg-verified-600 px-5 py-8 sm:py-10">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-white">
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="mt-3 text-center text-sm font-bold text-white">Visit verified</p>
          <p className="mt-1 text-center text-[10px] leading-snug text-verified-50">
            You can leave one review for this visit.
          </p>
        </div>
      </div>
    </div>
  );
}

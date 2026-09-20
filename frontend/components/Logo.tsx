const STAR_PATH =
  "M16,6 L18.65,12.36 L25.51,12.91 L20.28,17.39 L21.88,24.09 L16,20.5 L10.12,24.09 L11.72,17.39 L6.49,12.91 L13.36,12.36 Z";

export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0B6B3A" />
      <path d={STAR_PATH} fill="#ffffff" />
    </svg>
  );
}

export function Logo({
  className = "",
  markClassName = "h-7 w-7",
  textClassName = "text-lg font-bold tracking-tight text-neutral-900",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={textClassName}>TrustReview</span>
    </span>
  );
}

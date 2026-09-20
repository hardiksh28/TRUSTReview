export function Squiggle({
  color,
  className = "",
  flip = false,
}: {
  color: string;
  className?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 220 160"
      fill="none"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <path
        d="M15,110 Q35,30 60,90 T105,90 Q125,20 150,85 T205,70"
        stroke={color}
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

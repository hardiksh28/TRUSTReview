const LABELS = ["Poor", "Fair", "Okay", "Good", "Excellent"];

export function RatingSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <label className="text-sm font-medium text-neutral-700">{label}</label>
        <span className="text-sm font-semibold text-verified-700">{LABELS[value - 1]}</span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-verified-600"
      />
    </div>
  );
}

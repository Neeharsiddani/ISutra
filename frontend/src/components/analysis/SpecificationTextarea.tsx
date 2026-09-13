interface SpecificationTextareaProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const PLACEHOLDER = `Example: Outdoor LED street lighting system, 100W, weather resistant, pole mounted, IP65 rated enclosure, operating temperature range -10°C to 55°C, minimum luminous efficacy 120 lm/W, surge protection 10kV, photocell compatible, designed for municipal road lighting applications...`;

export default function SpecificationTextarea({
  value,
  onChange,
  disabled = false,
}: SpecificationTextareaProps) {
  const charCount = value.length;
  const maxChars = 5000;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="specification-input"
          className="block text-sm font-semibold text-text-primary"
        >
          Enter Specification
        </label>
        <span
          className={`text-[11px] font-medium ${
            charCount > maxChars ? 'text-error' : 'text-text-light'
          }`}
        >
          {charCount.toLocaleString()} / {maxChars.toLocaleString()}
        </span>
      </div>
      <textarea
        id="specification-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={PLACEHOLDER}
        disabled={disabled}
        rows={8}
        maxLength={maxChars}
        className="w-full px-4 py-3 bg-card border border-border rounded-lg text-sm text-text-primary placeholder:text-text-light/70 leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[160px]"
      />
    </div>
  );
}

const toneOptions = [
  {
    label: "Professional",
    value: "professional",
    description: "Clean, polished, and business-ready wording."
  },
  {
    label: "Friendly",
    value: "friendly",
    description: "Warm, approachable language with a human touch."
  },
  {
    label: "Casual",
    value: "casual",
    description: "Relaxed, conversational phrasing for everyday writing."
  }
];

function ControlsPanel({
  tone,
  creativity,
  onToneChange,
  onCreativityChange,
  disabled
}) {
  return (
    <div className="glass-panel space-y-6 p-6 shadow-glow">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-200">
          Tone
        </label>
        <select
          value={tone}
          onChange={(event) => onToneChange(event.target.value)}
          disabled={disabled}
          className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-accent-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {toneOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-xs leading-6 text-slate-400">
          {toneOptions.find((option) => option.value === tone)?.description}
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="text-sm font-medium text-slate-200">
            Creativity
          </label>
          <span className="rounded-full bg-accent-500/20 px-3 py-1 text-xs font-semibold text-accent-200">
            {creativity}
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={creativity}
          onChange={(event) => onCreativityChange(Number(event.target.value))}
          disabled={disabled}
          className="slider h-2 w-full cursor-pointer rounded-full"
        />
        <p className="text-xs leading-6 text-slate-400">
          Lower values keep phrasing closer to the source. Higher values allow
          more expressive restructuring.
        </p>
      </div>
    </div>
  );
}

export default ControlsPanel;

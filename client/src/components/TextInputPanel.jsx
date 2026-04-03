function TextInputPanel({
  value,
  onChange,
  onSubmit,
  loading,
  characterCount
}) {
  return (
    <div className="glass-panel flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl text-white">
            Source Text
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Paste AI-generated text and we will make it sound more natural.
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
          {characterCount} chars
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Enter text to humanize..."
        className="min-h-[280px] flex-1 rounded-3xl border border-white/10 bg-slate-950/70 px-5 py-4 text-sm leading-7 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent-400"
      />

      <button
        type="button"
        onClick={onSubmit}
        disabled={loading}
        className="mt-5 inline-flex items-center justify-center rounded-2xl bg-accent-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Humanizing..." : "Humanize"}
      </button>
    </div>
  );
}

export default TextInputPanel;

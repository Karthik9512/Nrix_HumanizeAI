function HistoryPanel({ history, onSelect }) {
  return (
    <div className="glass-panel p-6">
      <div className="mb-5">
        <p className="font-display text-2xl text-white">
          Recent History
        </p>
        <p className="mt-1 text-sm text-slate-400">
          Saved conversions from MongoDB.
        </p>
      </div>

      {history.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-500">
          No saved conversions yet.
        </p>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <button
              type="button"
              key={item._id}
              onClick={() => onSelect(item)}
              className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-accent-400"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-accent-200">
                  {item.tone}
                </span>
                <span className="text-xs text-slate-400">
                  Creativity {item.creativity}
                </span>
              </div>
              <p className="text-sm leading-6 text-slate-200">
                {item.originalText}
              </p>
              <p className="mt-3 text-xs leading-6 text-slate-400">
                {item.humanizedText}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoryPanel;

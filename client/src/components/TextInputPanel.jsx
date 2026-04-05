import { FileText, Type } from "lucide-react";

function TextInputPanel({ value, onChange, onSubmit, loading, characterCount }) {
  return (
    <div className="editor-pane flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between border-b border-inherit px-6 py-4">
        <div className="flex items-center gap-2">
          <FileText size={18} className="text-slate-400" />
          <h2 className="font-display text-sm font-semibold tracking-wide">
            Source Text
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium text-slate-400">
            {characterCount} chars
          </span>
        </div>
      </div>

      <div className="relative flex-1 p-6">
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste AI-generated text here to make it sound human..."
          className="h-full w-full resize-none border-none bg-transparent text-base leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200"
        />
      </div>

      <div className="border-t border-inherit bg-surface-50 px-6 py-4 dark:bg-[#11131a]">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !value.trim()}
          className="btn-primary w-full shadow-glow-cyan transition-shadow hover:shadow-glow-lg sm:w-auto sm:px-8"
        >
          {loading ? "Processing..." : "Humanize Text"}
        </button>
      </div>
    </div>
  );
}

export default TextInputPanel;

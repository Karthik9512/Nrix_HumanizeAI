import { Check, Copy, Settings2, Sparkles, Wand2 } from "lucide-react";
import Loader from "./Loader";

function OutputPanel({ output, loading, onCopy, copied, saveDisabled }) {
  return (
    <div className="editor-pane flex h-full flex-col overflow-hidden rounded-2xl border shadow-sm">
      <div className="flex items-center justify-between border-b border-inherit px-6 py-4">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-accent-500" />
          <h2 className="font-display text-sm font-semibold tracking-wide">
            Humanized Result
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={!output}
            className="btn-secondary flex items-center gap-2 px-3 py-1.5 text-xs"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>

      <div className="relative flex-1 p-6">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center opacity-50">
            <Loader />
          </div>
        ) : output ? (
          <div className="animate-fade-in text-base leading-relaxed text-slate-700 dark:text-slate-300">
            {output}
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-400 dark:text-slate-500">
            <Wand2 size={40} className="opacity-20" />
            <p className="max-w-[250px] text-center text-sm leading-relaxed">
              Click Humanize to see your rewritten text appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;

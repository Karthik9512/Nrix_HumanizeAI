import { Check, Copy, Save } from "lucide-react";
import Loader from "./Loader";

function OutputPanel({
  output,
  loading,
  onCopy,
  onSave,
  copied,
  saveDisabled
}) {
  return (
    <div className="glass-panel flex h-full flex-col p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-display text-2xl text-white">
            Humanized Output
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Your rewritten text appears here after processing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            disabled={!output}
            className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-accent-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={saveDisabled}
            className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm text-slate-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      <div className="flex min-h-[280px] flex-1 rounded-3xl border border-white/10 bg-slate-950/70 p-5">
        {loading ? (
          <Loader />
        ) : output ? (
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-100">
            {output}
          </p>
        ) : (
          <p className="text-sm leading-7 text-slate-500">
            Nothing here yet. Humanize a piece of text to see the result.
          </p>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;

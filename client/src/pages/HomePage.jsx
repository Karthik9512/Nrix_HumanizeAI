import { Moon, Sparkles, SunMedium } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ControlsPanel from "../components/ControlsPanel";
import HistoryPanel from "../components/HistoryPanel";
import OutputPanel from "../components/OutputPanel";
import TextInputPanel from "../components/TextInputPanel";
import { fetchHistory, humanizeText, saveConversion } from "../services/api";

const starterText =
  "Our innovative platform leverages advanced artificial intelligence to optimize operational efficiency, enhance communication workflows, and deliver scalable outcomes for modern teams.";

function HomePage() {
  const [inputText, setInputText] = useState(starterText);
  const [outputText, setOutputText] = useState("");
  const [tone, setTone] = useState("professional");
  const [creativity, setCreativity] = useState(6);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const characterCount = useMemo(() => inputText.length, [inputText]);

  const loadHistory = async () => {
    try {
      const data = await fetchHistory();
      setHistory(data.data || []);
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          "Could not load history from the server."
      );
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    document.body.classList.toggle("light", !isDarkMode);
  }, [isDarkMode]);

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text before humanizing.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await humanizeText({
        text: inputText,
        tone,
        creativity
      });
      setOutputText(response.data.humanizedText);
      setSuccess(response.message);
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          "Something went wrong while humanizing the text."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!outputText) {
      return;
    }

    await navigator.clipboard.writeText(outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    if (!outputText) {
      return;
    }

    try {
      const response = await saveConversion({
        originalText: inputText,
        humanizedText: outputText,
        tone,
        creativity
      });
      setSuccess(response.message);
      loadHistory();
    } catch (apiError) {
      setError(
        apiError.response?.data?.message ||
          "Could not save the conversion."
      );
    }
  };

  const handleHistorySelect = (item) => {
    setInputText(item.originalText);
    setOutputText(item.humanizedText);
    setTone(item.tone);
    setCreativity(item.creativity);
    setSuccess("Loaded a saved conversion.");
    setError("");
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="mb-10 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="glass-panel overflow-hidden p-8 shadow-glow">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent-400/30 bg-accent-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-accent-200">
                <Sparkles size={14} />
                HumanizeAI
              </div>
              <h1 className="max-w-2xl font-display text-4xl leading-tight text-white sm:text-5xl">
                Turn AI-written drafts into clear, natural, publication-ready writing.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-300">
                Rewrite robotic content with stronger flow, better readability,
                and tone control designed for creators, teams, and client-ready
                communication.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsDarkMode((value) => !value)}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-slate-200 transition hover:border-accent-400"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <SunMedium size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Sentence flow
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Reworks stiff phrasing into smoother, more natural sentence
                structure.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Tone control
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Choose between professional, friendly, and casual output with
                more visible tonal differences.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Creativity dial
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                Control how closely the rewrite follows the source versus how
                boldly it rephrases.
              </p>
            </div>
          </div>
        </div>

        <ControlsPanel
          tone={tone}
          creativity={creativity}
          onToneChange={setTone}
          onCreativityChange={setCreativity}
          disabled={loading}
        />
      </section>

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mb-6 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {success}
        </div>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <TextInputPanel
          value={inputText}
          onChange={setInputText}
          onSubmit={handleHumanize}
          loading={loading}
          characterCount={characterCount}
        />
        <OutputPanel
          output={outputText}
          loading={loading}
          onCopy={handleCopy}
          onSave={handleSave}
          copied={copied}
          saveDisabled={!outputText || loading}
        />
      </section>

      <section className="mt-6">
        <HistoryPanel history={history} onSelect={handleHistorySelect} />
      </section>
    </main>
  );
}

export default HomePage;

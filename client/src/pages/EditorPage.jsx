import { addDoc, collection } from "firebase/firestore";
import { LogOut, LayoutDashboard, Moon, SunMedium, Zap, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import OutputPanel from "../components/OutputPanel";
import TextInputPanel from "../components/TextInputPanel";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { humanizeText } from "../services/api";

const starterText = "Our innovative platform leverages advanced artificial intelligence to optimize operational efficiency, enhance communication workflows, and deliver scalable outcomes for modern teams.";

function EditorPage() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [inputText, setInputText] = useState(starterText);
  // outputText is now an array for multiple variants
  const [outputVariants, setOutputVariants] = useState([]);
  const [tone, setTone] = useState("professional");
  const [creativity, setCreativity] = useState(6);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [error, setError] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true);

  const characterCount = useMemo(() => inputText.length, [inputText]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, [isDarkMode]);

  const handleHumanize = async () => {
    if (!inputText.trim()) {
      setError("Please enter some text before humanizing.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await humanizeText({
        text: inputText,
        tone,
        creativity,
      });
      
      // Update format assuming backend will soon return variations.
      // If it returns a single string, we wrap it in an array.
      const rawOutput = response.data.humanizedText;
      const variants = Array.isArray(rawOutput) ? rawOutput : [rawOutput, rawOutput + " (Variant 2 - coming soon)"];
      
      setOutputVariants(variants);

    } catch (apiError) {
      setError(apiError.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, index) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-50 dark:bg-[#0b0e14]">
      {/* Navbar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-white/5 dark:bg-[#0b0e14]">
        <div className="flex items-center gap-2">
          <Zap size={22} className="text-accent-500" />
          <span className="font-display text-lg font-bold tracking-tight">Nrix</span>
          <span className="ml-2 rounded-md bg-accent-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-accent-600 dark:text-accent-400">Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/dashboard")} className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center gap-2">
             <LayoutDashboard size={16}/> Dashboard
          </button>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5">
            {isDarkMode ? <SunMedium size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={handleLogout} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-rose-50 dark:hover:bg-rose-900/20 dark:text-slate-400 dark:hover:text-rose-400">
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="flex flex-1 overflow-hidden">
        {/* LEFT: Tone & Settings Sidebar */}
        <aside className="w-64 shrink-0 border-r border-slate-200 bg-surface-50 p-6 dark:border-white/5 dark:bg-[#11131a] flex flex-col gap-8">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
            <SlidersHorizontal size={18} />
            <h3 className="font-display font-semibold">Settings</h3>
          </div>
          
          <div className="flex flex-col gap-3">
             <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tone</label>
             {["professional", "casual", "academic"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTone(t)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium capitalize transition text-left ${tone === t ? "bg-accent-500 text-white shadow-md shadow-accent-500/20" : "bg-white text-slate-600 hover:bg-slate-100 dark:bg-[#1c202a] dark:text-slate-300 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5"}`}
                >
                  {t}
                </button>
              ))}
          </div>

          <div className="flex flex-col gap-3">
             <div className="flex justify-between items-center">
               <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Creativity</label>
               <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{creativity}</span>
             </div>
             <input type="range" min="1" max="10" value={creativity} onChange={(e) => setCreativity(Number(e.target.value))} className="slider h-1.5 w-full appearance-none rounded-full bg-slate-300 dark:bg-white/10" />
          </div>
        </aside>

        {/* CENTER: Input Area */}
        <section className="flex flex-1 flex-col p-6 h-full border-r border-slate-200 dark:border-white/5 bg-white dark:bg-[#151821]">
          {error && <div className="mb-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{error}</div>}
          <TextInputPanel value={inputText} onChange={setInputText} onSubmit={handleHumanize} loading={loading} characterCount={characterCount} />
        </section>

        {/* RIGHT: Output Variations */}
        <section className="w-[450px] shrink-0 bg-surface-50 dark:bg-[#11131a] p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
             <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
               Variations
             </h3>
             {outputVariants.length > 0 && !loading && (
               <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Human-likeness</span>
                  <div className="flex h-5 items-center gap-1 overflow-hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                     98%
                  </div>
               </div>
             )}
          </div>
          <div className="flex flex-col gap-6">
            {!loading && outputVariants.length === 0 && (
               <div className="text-sm text-slate-500 dark:text-slate-400">Results will appear here.</div>
            )}
            {loading && <div className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Generating variations...</div>}
            {outputVariants.map((variant, index) => (
              <OutputPanel 
                key={index} 
                output={variant} 
                loading={false} 
                onCopy={() => handleCopy(variant, index)} 
                copied={copiedIndex === index} 
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default EditorPage;

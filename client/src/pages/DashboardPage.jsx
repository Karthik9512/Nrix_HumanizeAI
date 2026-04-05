import { fetchHistory } from "../services/api.js";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  const [history, setHistory] = useState([]);
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!currentUser) return;
      try {
        const result = await fetchHistory();
        setHistory(result.data || []);
      } catch (err) {
        console.error("Failed to fetch history", err);
      }
      setLoading(false);
    }
    loadHistory();
  }, [currentUser]);


  return (
    <div className="min-h-screen bg-surface-50 dark:bg-[#0b0e14] text-slate-900 dark:text-white p-8">
       <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-3">
               <LayoutDashboard size={28} className="text-accent-500" />
               <h1 className="text-3xl font-bold font-display">Your Dashboard</h1>
             </div>
             <Link to="/editor" className="btn-secondary">
               <ArrowLeft size={16} className="mr-2" /> Back to Editor
             </Link>
          </div>

          <div className="bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-white/5 p-6 shadow-sm">
             <h2 className="mb-6 text-xl font-bold">Recent Documents</h2>
             {loading ? (
               <p className="text-slate-500">Loading history...</p>
             ) : history.length === 0 ? (
               <p className="text-slate-500">No generated text yet. Head to the editor to start writing!</p>
             ) : (
               <div className="space-y-4">
                 {history.map((doc) => (
                   <div key={doc.id} className="p-4 border border-slate-200 dark:border-white/10 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="px-2 py-1 text-xs font-bold tracking-wider uppercase rounded text-accent-500 bg-accent-500/10">{doc.tone}</span>
                        <span className="text-xs text-slate-500">{doc.createdAt?.toDate().toLocaleDateString()}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="mb-1 text-xs font-bold text-slate-400">Original</p>
                          <p className="text-sm leading-relaxed line-clamp-3">{doc.inputText}</p>
                        </div>
                        <div>
                          <p className="mb-1 text-xs font-bold text-slate-400">Humanized</p>
                          <p className="text-sm leading-relaxed line-clamp-3 text-slate-700 dark:text-slate-300">{doc.outputText}</p>
                        </div>
                      </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
       </div>
    </div>
  );
}

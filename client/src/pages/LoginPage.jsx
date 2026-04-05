import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = err.message;
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
         errorMessage = "Invalid email or password. Are you sure you have an account?";
      } else if (err.code === "auth/too-many-requests") {
         errorMessage = "Too many failed attempts. Try again later.";
      }
      setError(errorMessage);
    }
    setLoading(false);
  }

  return (
    <div className="flex h-screen items-center justify-center bg-surface-50 dark:bg-[#0b0e14]">
      <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-[#151821] rounded-2xl border border-slate-200 dark:border-white/5 shadow-xl">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent-500/10 mb-4">
             <Zap size={24} className="text-accent-500" />
          </div>
          <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Log in to your account</p>
        </div>

        {error && <div className="p-3 text-sm rounded bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-white/10 dark:bg-white/5 bg-white px-4 py-2 text-slate-900 dark:text-white shadow-sm focus:border-accent-500 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-white/10 dark:bg-white/5 bg-white px-4 py-2 text-slate-900 dark:text-white shadow-sm focus:border-accent-500 focus:ring-accent-500" />
          </div>
          <button disabled={loading} type="submit" className="w-full btn-primary hover:shadow-glow-cyan transition">
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Need an account? <Link to="/signup" className="font-semibold text-accent-500 hover:text-accent-400">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Zap } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      await signup(email, password, name);
      navigate('/dashboard');
    } catch (err) {
      let errorMessage = err.message;
      if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists! Try logging in.";
      } else if (err.code === "auth/weak-password") {
        errorMessage = "Your password is too weak. Please use at least 6 characters.";
      } else if (err.code === "auth/configuration-not-found") {
        errorMessage = "Email/Password sign-ins are disabled. Please enable it in Firebase Console -> Authentication -> Sign-in Method.";
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
          <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white">Create an account</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign up for Nrix Pro</p>
        </div>

        {error && <div className="p-3 text-sm rounded bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-white/10 dark:bg-white/5 bg-white px-4 py-2 text-slate-900 dark:text-white shadow-sm focus:border-accent-500 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-white/10 dark:bg-white/5 bg-white px-4 py-2 text-slate-900 dark:text-white shadow-sm focus:border-accent-500 focus:ring-accent-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-white/10 dark:bg-white/5 bg-white px-4 py-2 text-slate-900 dark:text-white shadow-sm focus:border-accent-500 focus:ring-accent-500" />
          </div>
          <button disabled={loading} type="submit" className="w-full btn-primary hover:shadow-glow-cyan transition">
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account? <Link to="/login" className="font-semibold text-accent-500 hover:text-accent-400">Log In</Link>
        </div>
      </div>
    </div>
  );
}

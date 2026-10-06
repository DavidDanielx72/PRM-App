import { Link } from 'react-router-dom';
import { supabaseConfigured } from '../services/supabase';

export default function Welcome() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-cput-blue to-slate-900 px-6 py-20 text-white">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm font-semibold tracking-widest text-cput-gold">CPUT STUDENT MARKETPLACE</p>
        <h1 className="mt-5 max-w-3xl text-5xl font-bold md:text-7xl">The marketplace for CPUT students.</h1>
        <p className="mt-6 max-w-2xl text-lg text-blue-100">Buy textbooks, electronics and services from your campus community.</p>

        {!supabaseConfigured && (
          <div className="mt-6 max-w-xl rounded-xl border border-amber-300/40 bg-amber-400/10 p-4 text-sm text-amber-100">
            Supabase is not configured yet. Add the values from the frontend .env file to enable sign in and database features.
          </div>
        )}

        <div className="mt-8 flex gap-3">
          <Link to="/signup" className="rounded-xl bg-cput-gold px-6 py-3 font-semibold text-cput-blue">Create account</Link>
          <Link to="/login" className="rounded-xl border border-white/40 px-6 py-3 font-semibold">Sign in</Link>
        </div>
      </div>
    </main>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowRight, GraduationCap, LockKeyhole, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Sign in failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[32px] border border-white/70 bg-white/70 shadow-[0_30px_80px_rgba(9,30,56,0.12)] backdrop-blur-xl">
        <div className="grid lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative overflow-hidden bg-gradient-to-br from-[#0a3d62] via-[#0c2f4f] to-[#051d2f] p-8 text-white sm:p-10 lg:p-12">
            <div className="absolute -right-16 -top-12 h-52 w-52 rounded-full bg-[#ffb81c]/20 blur-3xl" />
            <div className="absolute -bottom-24 left-12 h-64 w-64 rounded-full bg-[#1a5fa3]/30 blur-3xl" />
            <div className="relative">
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">
                <Sparkles size={12} className="text-[#ffb81c]" />
                Secure campus marketplace
              </div>

              <div className="mb-8 flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 shadow-lg shadow-slate-950/20 ring-1 ring-white/10">
                  <GraduationCap className="h-6 w-6 text-[#ffb81c]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-blue-100/80">CPUT</p>
                  <h2 className="text-2xl font-bold">Community Store</h2>
                </div>
              </div>

              <h1 className="max-w-sm text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                Buy, sell, and connect with your campus in one place.
              </h1>

              <div className="mt-8 space-y-4 text-sm text-blue-100/90">
                {[
                  'Verified student-only marketplace',
                  'Secure buying and selling',
                  'Instant seller messaging',
                ].map((feature) => (
                  <div key={feature} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 backdrop-blur-sm">
                    <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#ffb81c]/15 text-[#ffb81c]">
                      <ShieldCheck size={16} />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white/80 p-6 sm:p-8 lg:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#0a3d62]/10 bg-[#0a3d62]/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#0a3d62]">
              <Sparkles size={12} className="text-[#0a3d62]" />
              Member login
            </div>

            <h2 className="text-3xl font-black tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Access your student or seller dashboard.</p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="group relative block">
                <span className="sr-only">Email</span>
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#0a3d62]" />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
                  type="email"
                  required
                  placeholder="student@mycput.ac.za"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="group relative block">
                <span className="sr-only">Password</span>
                <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 transition group-focus-within:text-[#0a3d62]" />
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-800 placeholder:text-slate-400 focus:border-[#0a3d62] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0a3d62]/8"
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </label>

              <button
                type="submit"
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#0a3d62] to-[#0d4a78] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#0a3d62]/20 transition hover:scale-[1.01] hover:shadow-xl hover:shadow-[#0a3d62]/25 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {busy ? 'Signing in...' : 'Sign in'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              New here?
              <Link to="/signup" className="ml-1 font-semibold text-[#0a3d62] transition hover:text-[#1a5fa3]">
                Create an account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

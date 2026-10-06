import { useState } from 'react';
import { ArrowRight, Check, GraduationCap, Mail, LockKeyhole, Store } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

export default function SignUp() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', seller: false });
  const [busy, setBusy] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try { await signUp(form.email, form.password, form.name, form.seller); toast.success('Account created. Check your email.'); navigate('/login'); }
    catch (error) { toast.error(error.message || 'Signup failed'); }
    finally { setBusy(false); }
  }

  return (
    <main className="min-h-screen bg-[#071b2c] px-4 py-6 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="relative grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-xl lg:grid-cols-[.9fr_1.1fr]">
          <div className="absolute right-5 top-5 z-10"><ThemeToggle dark /></div>
          <div className="relative hidden overflow-hidden bg-gradient-to-br from-cput-blue to-[#041521] p-10 lg:block"><div className="absolute -right-20 -top-16 h-72 w-72 rounded-full bg-cput-gold/20 blur-3xl" /><GraduationCap className="relative text-cput-gold" size={34} /><p className="relative mt-16 text-sm font-bold uppercase tracking-[0.2em] text-blue-100/70">Join the movement</p><h1 className="relative mt-3 text-5xl font-black leading-tight">Your people are already here.</h1><p className="relative mt-6 max-w-sm leading-7 text-blue-100/75">Build your campus network, discover great finds and make your next exchange feel effortless.</p><div className="relative mt-10 space-y-3">{['Post to your campus feed', 'Shop from verified students', 'Message sellers instantly'].map((item) => <div key={item} className="flex items-center gap-3 text-sm text-blue-100"><span className="grid h-7 w-7 place-items-center rounded-full bg-cput-gold/15 text-cput-gold"><Check size={14} /></span>{item}</div>)}</div></div>
          <div className="bg-[#f8fafc] p-6 text-slate-900 dark:bg-[#131e31] dark:text-slate-100 sm:p-10"><Link to="/" className="text-sm font-black text-cput-blue">Community <span className="text-cput-blue-light">Store</span></Link><div className="mt-12 max-w-md"><p className="text-xs font-black uppercase tracking-[0.2em] text-cput-blue-light">Create your profile</p><h2 className="mt-3 text-4xl font-black tracking-tight">Start with your campus.</h2><p className="mt-3 text-sm leading-6 text-slate-500">Set up your account, then add your campus in Profile to unlock local community posts.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="group relative block"><span className="sr-only">Full name</span><GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-cput-blue" size={18} /><input className="input pl-11" required placeholder="Full name" value={form.name} onChange={update('name')} /></label><label className="group relative block"><span className="sr-only">Email</span><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-cput-blue" size={18} /><input className="input pl-11" required type="email" placeholder="username@mycput.ac.za" value={form.email} onChange={update('email')} /></label><label className="group relative block"><span className="sr-only">Password</span><LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition group-focus-within:text-cput-blue" size={18} /><input className="input pl-11" required minLength="6" type="password" placeholder="Password (6+ characters)" value={form.password} onChange={update('password')} /></label><label className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition ${form.seller ? 'border-cput-blue bg-blue-tint' : 'border-slate-200 bg-white'}`}><input type="checkbox" checked={form.seller} onChange={(event) => setForm((current) => ({ ...current, seller: event.target.checked }))} className="h-4 w-4 accent-cput-blue" /><span className="grid h-9 w-9 place-items-center rounded-xl bg-cput-gold/20 text-cput-blue"><Store size={17} /></span><span><strong className="block text-sm">I want to sell too</strong><small className="text-xs text-slate-500">Create listings for your campus community.</small></span></label><button className="primary w-full gap-2 rounded-2xl py-3.5" disabled={busy}>{busy ? 'Creating account…' : 'Create account'}<ArrowRight size={17} /></button></form><p className="mt-6 text-sm text-slate-500">Already registered? <Link className="font-bold text-cput-blue hover:underline" to="/login">Sign in</Link></p></div></div>
        </div>
      </div>
    </main>
  );
}

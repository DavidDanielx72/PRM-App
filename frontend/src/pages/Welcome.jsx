import { ArrowUpRight, BookOpen, BriefcaseBusiness, Heart, MessageCircle, Sparkles, Store, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabaseConfigured } from '../services/supabase';
import ThemeToggle from '../components/ThemeToggle';

const features = [
  { icon: Store, title: 'Shop nearby', text: 'Find trusted campus listings, services and study essentials.' },
  { icon: UsersRound, title: 'Meet your community', text: 'Share updates with students across every CPUT campus.' },
  { icon: MessageCircle, title: 'Connect directly', text: 'Message sellers and make every exchange feel human.' },
];

export default function Welcome() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#071b2c] text-white">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-cput-blue-light/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-48 right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-cput-gold/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-cput-gold font-black text-cput-blue shadow-lg shadow-yellow-500/20 transition group-hover:rotate-[-5deg]">CS</span>
            <span className="text-lg font-black tracking-tight">Community <span className="text-cput-gold">Store</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle dark />
            <Link to="/login" className="rounded-full px-4 py-2.5 text-sm font-bold text-blue-100 transition hover:bg-white/10 hover:text-white">Sign in</Link>
            <Link to="/signup" className="rounded-full bg-white px-4 py-2.5 text-sm font-black text-cput-blue shadow-lg transition hover:-translate-y-0.5 hover:bg-cput-gold">Join now</Link>
          </div>
        </header>

        <section className="grid min-h-[calc(100vh-6rem)] items-center gap-14 py-16 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
          <div className="page-enter">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-100 backdrop-blur"><Sparkles size={14} className="text-cput-gold" /> CPUT student community</div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.98] tracking-[-0.04em] sm:text-7xl">Your campus life, <span className="text-cput-gold">in motion.</span></h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-blue-100/80">A marketplace and social space built for CPUT students. Buy, sell, discover and stay close to what is happening around you.</p>
            {!supabaseConfigured && <div className="mt-6 max-w-xl rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">Supabase is not configured yet. Add the frontend environment values to enable account and database features.</div>}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup" className="group inline-flex items-center gap-2 rounded-2xl bg-cput-gold px-6 py-4 font-black text-cput-blue shadow-xl shadow-yellow-500/20 transition hover:-translate-y-1">Create your account <ArrowUpRight size={18} className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></Link>
              <Link to="/login" className="inline-flex items-center rounded-2xl border border-white/20 bg-white/5 px-6 py-4 font-bold text-white backdrop-blur transition hover:bg-white/10">Explore the community</Link>
            </div>
            <div className="mt-10 flex items-center gap-5 text-sm text-blue-100/60"><span className="flex items-center gap-2"><Heart size={15} className="text-rose-300" /> Built for students</span><span className="h-1 w-1 rounded-full bg-blue-100/40" /><span className="flex items-center gap-2"><BookOpen size={15} className="text-cput-gold" /> Campus-first</span></div>
          </div>

          <div className="relative page-enter [animation-delay:120ms]">
            <div className="absolute -inset-6 rounded-[3rem] bg-cput-blue-light/20 blur-2xl" />
            <div className="relative rotate-1 rounded-[2rem] border border-white/15 bg-white/10 p-3 shadow-2xl backdrop-blur-xl transition hover:rotate-0">
              <div className="rounded-[1.5rem] bg-[#f5f8fb] p-4 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4"><div className="flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-xl bg-cput-blue text-xs font-black text-cput-gold">CS</span><span className="text-sm font-black">For you</span></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-cput-blue">D6 CPUT</span></div>
                <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cput-gold to-orange-300 font-black text-cput-blue">A</span><div><p className="text-sm font-bold">Anele M.</p><p className="text-[11px] text-slate-400">2 min ago · Campus update</p></div></div><p className="mt-4 text-sm leading-6 text-slate-600">Study group looking for two more people before tomorrow’s test 📚</p><div className="mt-4 flex gap-4 text-xs font-bold text-slate-400"><span>♡ 24</span><span>◌ 8 replies</span></div></div>
                <div className="mt-3 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-cput-blue p-4 text-white"><BriefcaseBusiness size={19} className="text-cput-gold" /><p className="mt-7 text-sm font-bold">Marketplace</p><p className="mt-1 text-xs text-blue-100">Fresh listings nearby</p></div><div className="rounded-2xl bg-cput-gold p-4 text-cput-blue"><UsersRound size={19} /><p className="mt-7 text-sm font-bold">Your campus</p><p className="mt-1 text-xs text-cput-blue/70">Stay in the loop</p></div></div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 border-t border-white/10 py-8 md:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10"><Icon size={20} className="text-cput-gold" /><h2 className="mt-5 font-black">{title}</h2><p className="mt-2 text-sm leading-6 text-blue-100/65">{text}</p></div>)}
        </section>
      </div>
    </main>
  );
}

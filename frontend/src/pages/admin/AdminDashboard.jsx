import { useEffect, useState } from 'react';
import { ArrowUpRight, Bell, Megaphone, ShieldCheck, Sparkles, Users, Store, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('id, role, banned'),
      supabase.from('listings').select('id, is_active'),
      supabase.from('announcements').select('id'),
    ]).then(([profiles, listings, announcements]) => {
      const users = profiles.data || [];
      setStats({
        users: users.length,
        sellers: users.filter((user) => user.role === 'seller').length,
        activeListings: (listings.data || []).filter((listing) => listing.is_active).length,
        announcements: (announcements.data || []).length,
        banned: users.filter((user) => user.banned).length,
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <section className="surface-blue-deep relative overflow-hidden rounded-[2rem] p-7 sm:p-10">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full bg-cput-gold/15 blur-3xl" />
          <div className="absolute -bottom-28 left-1/3 h-64 w-64 rounded-full bg-blue-400/15 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-blue-100"><ShieldCheck size={14} className="text-cput-gold" /> Administration centre</div>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Keep the community moving.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">A clear view of your marketplace, announcements and members — all in one place.</p>
            </div>
            <div className="hidden rounded-3xl border border-white/10 bg-white/10 p-5 md:block"><Activity size={34} className="text-cput-gold" /></div>
          </div>
        </section>

        {stats === null ? <LoadingSpinner /> : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Community members', value: stats.users, icon: Users, tint: 'text-cput-blue' },
                { label: 'Seller accounts', value: stats.sellers, icon: Store, tint: 'text-cput-blue-light' },
                { label: 'Live listings', value: stats.activeListings, icon: Sparkles, tint: 'text-cput-gold-dark' },
                { label: 'Announcements', value: stats.announcements, icon: Bell, tint: 'text-green-700' },
              ].map(({ label, value, icon: Icon, tint }) => <div className="surface-panel rounded-2xl p-5" key={label}><div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-tint ${tint}`}><Icon size={19} /></div><p className="text-xs font-bold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-3xl font-extrabold text-slate-800">{value}</p></div>)}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
              <div className="surface-panel rounded-[2rem] p-6 sm:p-8">
                <div className="mb-7 flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cput-blue-light">Quick actions</p><h2 className="mt-2 text-2xl font-extrabold text-slate-800">Run your store</h2></div><Megaphone className="text-cput-gold-dark" size={24} /></div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Link to="/admin/users" className="group rounded-2xl border border-cput-blue/10 bg-blue-tint/60 p-5 transition hover:-translate-y-1 hover:bg-blue-tint"><Users className="mb-8 text-cput-blue" size={21} /><div className="flex items-end justify-between"><div><h3 className="font-bold text-slate-800">Manage users</h3><p className="mt-1 text-xs text-slate-500">Review access and member status.</p></div><ArrowUpRight className="text-cput-blue transition group-hover:translate-x-1 group-hover:-translate-y-1" size={18} /></div></Link>
                  <Link to="/admin/announcements" className="group rounded-2xl border border-cput-gold/20 bg-amber-50/70 p-5 transition hover:-translate-y-1 hover:bg-amber-50"><Megaphone className="mb-8 text-cput-gold-dark" size={21} /><div className="flex items-end justify-between"><div><h3 className="font-bold text-slate-800">Post an update</h3><p className="mt-1 text-xs text-slate-500">Keep students informed.</p></div><ArrowUpRight className="text-cput-gold-dark transition group-hover:translate-x-1 group-hover:-translate-y-1" size={18} /></div></Link>
                </div>
              </div>
              <div className="surface-blue rounded-[2rem] p-6 sm:p-8"><div className="mb-7 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-cput-blue-light">Community health</p><h2 className="mt-2 text-2xl font-extrabold text-slate-800">All systems ready</h2></div><span className="h-3 w-3 rounded-full bg-green-500 shadow-[0_0_0_5px_rgba(34,197,94,.15)]" /></div><div className="space-y-5 text-sm"><div className="flex justify-between border-b border-cput-blue/10 pb-4"><span className="text-slate-500">Marketplace listings</span><strong className="text-slate-700">{stats.activeListings} live</strong></div><div className="flex justify-between border-b border-cput-blue/10 pb-4"><span className="text-slate-500">Announcements published</span><strong className="text-slate-700">{stats.announcements}</strong></div><div className="flex justify-between"><span className="text-slate-500">Restricted accounts</span><strong className={stats.banned ? 'text-red-600' : 'text-green-700'}>{stats.banned}</strong></div></div></div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

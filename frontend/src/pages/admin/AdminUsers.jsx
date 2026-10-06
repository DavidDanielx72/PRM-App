import { useEffect, useMemo, useState } from 'react';
import { Ban, CheckCircle2, MailPlus, Search, ShieldCheck, UserRound, Users, X, XCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', full_name: '' });
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) toast.error('Could not load users');
      setUsers(data || []);
    });
  }, []);

  const visibleUsers = useMemo(() => users.filter((user) => {
    const matchesSearch = `${user.full_name} ${user.email}`.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'banned' ? user.banned : user.role === filter);
    return matchesSearch && matchesFilter;
  }), [users, search, filter]);

  async function ban(user) {
    const { error } = await supabase.from('profiles').update({ banned: !user.banned }).eq('id', user.id);
    if (error) toast.error(error.message);
    else { setUsers((current) => current.map((entry) => entry.id === user.id ? { ...entry, banned: !entry.banned } : entry)); toast.success(user.banned ? 'Account access restored' : 'Account restricted'); }
  }

  async function createAdmin(event) {
    event.preventDefault();
    setCreatingAdmin(true);
    const { data, error } = await supabase.functions.invoke('create-admin', { body: adminForm });
    if (error || data?.error) toast.error(error?.message || data.error);
    else {
      toast.success('Admin invitation sent');
      setShowAdminForm(false);
      setAdminForm({ email: '', full_name: '' });
    }
    setCreatingAdmin(false);
  }

  const counts = { all: users.length, student: users.filter((user) => user.role === 'student').length, seller: users.filter((user) => user.role === 'seller').length, banned: users.filter((user) => user.banned).length };

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-cput-blue-light">Community directory</p><h1 className="mt-2 text-3xl font-extrabold text-slate-800">Manage users</h1><p className="mt-2 text-sm text-slate-500">Review members, sellers and account access.</p></div><div className="flex flex-wrap items-center gap-2"><div className="flex items-center gap-2 rounded-2xl bg-blue-tint px-4 py-3 text-sm font-bold text-cput-blue"><Users size={18} /> {users.length} accounts</div><button onClick={() => setShowAdminForm(true)} className="primary gap-2 py-3"><MailPlus size={17} /> Add admin</button></div></div>
        {showAdminForm && <div className="surface-panel mb-6 rounded-3xl p-5 sm:p-6"><div className="mb-4 flex items-start justify-between"><div><h2 className="text-xl font-extrabold text-slate-800">Invite an administrator</h2><p className="mt-1 text-sm text-slate-500">They will receive an email to create their secure password.</p></div><button onClick={() => setShowAdminForm(false)} className="rounded-xl p-2 text-slate-400 hover:bg-blue-tint hover:text-cput-blue"><X size={18} /></button></div><form onSubmit={createAdmin} className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Full name</span><input className="input" required value={adminForm.full_name} onChange={(event) => setAdminForm({ ...adminForm, full_name: event.target.value })} placeholder="New admin name" /></label><label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">Email address</span><input className="input" required type="email" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} placeholder="admin@example.com" /></label><button disabled={creatingAdmin} className="primary">{creatingAdmin ? 'Sending…' : 'Send invite'}</button></form></div>}
        <section className="mb-6 grid gap-3 sm:grid-cols-4">{[['all', 'All members', Users], ['student', 'Students', UserRound], ['seller', 'Sellers', ShieldCheck], ['banned', 'Restricted', Ban]].map(([key, label, Icon]) => <button onClick={() => setFilter(key)} key={key} className={`rounded-2xl border p-4 text-left transition ${filter === key ? 'border-cput-blue bg-blue-tint shadow-sm' : 'border-cput-blue/10 bg-white hover:bg-blue-tint/50'}`}><Icon size={17} className="mb-3 text-cput-blue" /><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-extrabold text-slate-800">{counts[key]}</p></button>)}</section>
        <section className="surface-panel overflow-hidden rounded-[2rem]"><div className="border-b border-cput-blue/10 p-4 sm:p-5"><div className="relative max-w-md"><Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input className="input pl-10" placeholder="Search by name or email…" value={search} onChange={(event) => setSearch(event.target.value)} /></div></div>{visibleUsers.length === 0 ? <div className="p-14 text-center text-sm text-slate-500">No users match your search.</div> : <div className="divide-y divide-cput-blue/10">{visibleUsers.map((user) => <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5" key={user.id}><div className="flex min-w-0 items-center gap-3"><div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl font-bold ${user.banned ? 'bg-red-50 text-red-600' : 'bg-blue-tint text-cput-blue'}`}>{user.full_name?.charAt(0)?.toUpperCase() || '?'}</div><div className="min-w-0"><p className="truncate font-bold text-slate-800">{user.full_name || 'Unnamed member'}</p><p className="truncate text-sm text-slate-500">{user.email}</p></div></div><div className="flex items-center gap-3 sm:ml-4"><span className="rounded-full bg-blue-tint px-3 py-1 text-xs font-bold capitalize text-cput-blue">{user.role}</span>{user.banned ? <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600"><XCircle size={14} /> Restricted</span> : <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700"><CheckCircle2 size={14} /> Active</span>}{user.role !== 'admin' && <button onClick={() => ban(user)} className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-bold transition ${user.banned ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}><Ban size={14} /> {user.banned ? 'Restore' : 'Restrict'}</button>}</div></div>)}</div>}</section>
      </main>
    </div>
  );
}

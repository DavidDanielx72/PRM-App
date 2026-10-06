import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock3, Edit3, Megaphone, Send, X } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function AdminAnnouncements() {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [priority, setPriority] = useState('normal');
  const [announcements, setAnnouncements] = useState([]);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => setAnnouncements(data || []));
  }, []);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    const query = editingId
      ? supabase.from('announcements').update({ title: title.trim(), body: body.trim(), priority }).eq('id', editingId).eq('admin_id', user.id).select().single()
      : supabase.from('announcements').insert({ admin_id: user.id, title: title.trim(), body: body.trim(), priority }).select().single();
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else {
      toast.success(editingId ? 'Announcement updated' : 'Announcement published');
      setAnnouncements((current) => editingId ? current.map((item) => item.id === editingId ? data : item) : [data, ...current]);
      setTitle('');
      setBody('');
      setPriority('normal');
      setEditingId(null);
    }
    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cput-blue-light">Community communications</p><h1 className="mt-2 text-3xl font-extrabold text-slate-800">Announcements</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Share important updates, campus news and marketplace guidance with every student.</p></div>
        <div className="grid gap-7 lg:grid-cols-[1fr_380px]">
          <form onSubmit={submit} className="surface-panel rounded-[2rem] p-6 sm:p-8">
            <div className="mb-7 flex items-start justify-between"><div><div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-tint text-cput-blue"><Megaphone size={21} /></div><h2 className="text-2xl font-extrabold text-slate-800">Create an announcement</h2><p className="mt-1 text-sm text-slate-500">Your message will be visible to the community.</p></div><Bell className="hidden text-cput-gold-dark sm:block" size={24} /></div>
            <div className="space-y-5"><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Headline</span><input className="input" required maxLength={120} placeholder="e.g. New marketplace guidelines" value={title} onChange={(event) => setTitle(event.target.value)} /></label><label className="block"><span className="mb-2 block text-sm font-bold text-slate-700">Message</span><textarea className="input min-h-44 resize-y" required maxLength={2000} placeholder="Write a clear update for students and sellers…" value={body} onChange={(event) => setBody(event.target.value)} /></label><div><span className="mb-2 block text-sm font-bold text-slate-700">Priority</span><div className="grid grid-cols-3 gap-2">{['low', 'normal', 'high'].map((level) => <button type="button" key={level} onClick={() => setPriority(level)} className={`rounded-xl border px-3 py-2.5 text-xs font-bold capitalize transition ${priority === level ? level === 'high' ? 'border-red-200 bg-red-50 text-red-700' : 'border-cput-blue bg-blue-tint text-cput-blue' : 'border-cput-blue/10 bg-white text-slate-400 hover:bg-blue-tint/50'}`}>{level}</button>)}</div></div></div>
            <div className="mt-8 flex gap-3"><button disabled={saving} className="primary flex-1 gap-2"><Send size={17} /> {saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish announcement'}</button>{editingId && <button type="button" onClick={() => { setEditingId(null); setTitle(''); setBody(''); setPriority('normal'); }} className="secondary px-4" title="Cancel editing"><X size={17} /></button>}</div>
          </form>
          <section><div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-slate-800">Published updates</h2><p className="mt-1 text-sm text-slate-500">{announcements.length} total</p></div><Clock3 size={19} className="text-slate-400" /></div><div className="space-y-3">{announcements.length === 0 ? <div className="surface-panel rounded-2xl p-7 text-center text-sm text-slate-500">Your published announcements will appear here.</div> : announcements.slice(0, 6).map((announcement) => <article key={announcement.id} className="surface-panel rounded-2xl p-5"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-slate-800">{announcement.title}</h3><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${announcement.priority === 'high' ? 'bg-red-50 text-red-600' : 'bg-blue-tint text-cput-blue'}`}>{announcement.priority}</span></div><p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">{announcement.body}</p><div className="mt-4 flex items-center justify-between"><p className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400"><CheckCircle2 size={13} className="text-green-600" /> {new Date(announcement.created_at).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}</p><button type="button" onClick={() => { setEditingId(announcement.id); setTitle(announcement.title); setBody(announcement.body); setPriority(announcement.priority); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="inline-flex items-center gap-1 text-xs font-bold text-cput-blue hover:text-cput-blue-dark"><Edit3 size={14} /> Edit</button></div></article>)}</div></section>
        </div>
      </main>
    </div>
  );
}

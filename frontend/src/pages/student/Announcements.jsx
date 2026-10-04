import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import Navbar from '../../components/Navbar';
import { BellRing, Megaphone, X } from 'lucide-react';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#0a3d62] to-[#1a5fa3] text-white shadow-md shadow-[#0a3d62]/20">
            <Megaphone size={20} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Updates</p>
            <h1 className="text-3xl font-black text-slate-900">Announcements</h1>
          </div>
        </div>

        <div className="grid gap-4">
          {items.map((announcement) => (
            <button
              key={announcement.id}
              type="button"
              onClick={() => setSelected(announcement)}
              className="group rounded-[28px] border border-white/70 bg-white/80 p-5 text-left shadow-[0_18px_45px_rgba(10,61,98,0.08)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(10,61,98,0.12)]"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#0a3d62]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a3d62]">
                  <BellRing size={12} />
                  {announcement.priority || 'Normal'}
                </div>
                <span className="text-xs text-slate-400">{announcement.created_at ? new Date(announcement.created_at).toLocaleDateString('en-ZA', { dateStyle: 'medium' }) : ''}</span>
              </div>

              <h2 className="text-xl font-bold text-slate-900">{announcement.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-slate-600">{announcement.body}</p>
              <span className="mt-4 inline-flex items-center text-sm font-semibold text-[#0a3d62]">
                Read more
              </span>
            </button>
          ))}
        </div>
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl rounded-[28px] border border-white/20 bg-white p-5 shadow-[0_30px_80px_rgba(15,23,42,0.24)] sm:p-6">
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
            >
              <X size={18} />
            </button>

            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#0a3d62]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#0a3d62]">
              <BellRing size={12} />
              {selected.priority || 'Normal'}
            </div>

            <h3 className="pr-10 text-2xl font-black text-slate-900">{selected.title}</h3>
            <p className="mt-3 text-xs text-slate-400">
              {selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-ZA', { dateStyle: 'full' }) : ''}
            </p>
            <div className="mt-5 max-h-[60vh] overflow-y-auto rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 whitespace-pre-wrap">
              {selected.body}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

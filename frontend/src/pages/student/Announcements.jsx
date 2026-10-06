import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import Navbar from '../../components/Navbar';
import {
  BellRing,
  Megaphone,
  X,
  Calendar,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export default function Announcements() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  const priorityStyles = {
    high: {
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
      band: 'from-rose-500 via-orange-400 to-amber-300',
      icon: 'bg-gradient-to-br from-rose-100 to-orange-100 text-rose-700',
      glow: 'shadow-rose-500/20',
    },
    low: {
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      band: 'from-emerald-500 via-teal-400 to-cyan-300',
      icon: 'bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-700',
      glow: 'shadow-emerald-500/20',
    },
    normal: {
      badge: 'bg-blue-tint text-cput-blue border-cput-blue/25',
      band: 'from-cput-blue via-cput-blue-light to-cput-gold',
      icon: 'bg-gradient-to-br from-blue-tint to-blue-tint-2 text-cput-blue',
      glow: 'shadow-cput-blue/20',
    },
  };

  useEffect(() => {
    supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems(data || []));
  }, []);

  const formatDate = (value, style = 'medium') =>
    value
      ? new Date(value).toLocaleDateString('en-ZA', { dateStyle: style })
      : '';

  return (
    <div className="relative min-h-screen overflow-hidden bg-cput-light">
      {/* ---- Background pattern layer (subtle drift) ---- */}
      <div className="ann-drift pointer-events-none absolute inset-0 opacity-[0.55]" aria-hidden="true" />
      {/* Soft blue + gold glows */}
      <div
        className="pointer-events-none absolute -top-32 -left-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(26,95,163,0.22), transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -right-24 h-80 w-80 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(255,184,28,0.18), transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative">
        <Navbar />

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          {/* ---- Hero header ---- */}
          <div className="relative mb-8 overflow-hidden rounded-[28px] border border-cput-blue/20 bg-eggshell shadow-[0_18px_50px_rgba(10,61,98,0.12)]">
            <div className="gradient-blue relative px-6 py-7">
              {/* gold hairline */}
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cput-gold/70 to-transparent" />
              {/* faint diagonal texture over the blue */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 14px)',
                }}
                aria-hidden="true"
              />

              <div className="relative flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="ann-pulse grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-white ring-2 ring-white/20 backdrop-blur-sm">
                    <Megaphone size={22} className="ann-hero-icon" />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-100/80">
                      Campus updates
                    </p>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                      Announcements
                    </h1>
                    <p className="mt-1 text-sm text-blue-100/80">
                      Everything happening around CPUT — events, alerts, notices.
                    </p>
                  </div>
                </div>

                <div className="hidden shrink-0 flex-col items-end gap-1.5 sm:flex">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur-sm">
                    <BellRing size={12} />
                    {items.length} {items.length === 1 ? 'update' : 'updates'}
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-100/70">
                    Live feed
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ---- Announcement cards ---- */}
          <div className="grid gap-4">
            {items.map((announcement, idx) => {
              const priority = (announcement.priority || 'normal').toLowerCase();
              const style = priorityStyles[priority] || priorityStyles.normal;
              const isHovered = hoveredId === announcement.id;
              const isHigh = priority === 'high';

              return (
                <button
                  key={announcement.id}
                  type="button"
                  onMouseEnter={() => setHoveredId(announcement.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => setSelected(announcement)}
                  className={`group animate-slide-up relative overflow-hidden rounded-[26px] border border-cput-blue/15 bg-eggshell p-5 text-left shadow-[0_14px_38px_rgba(10,61,98,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-cput-blue/30 hover:shadow-[0_26px_60px_rgba(10,61,98,0.18)]`}
                  style={{
                    animationDelay: `${Math.min(idx * 60, 500)}ms`,
                    animationFillMode: 'both',
                  }}
                >
                  {/* Priority accent band */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${style.band} ${
                      isHigh ? 'ann-band-pulse' : ''
                    }`}
                  />

                  {/* Card shine sweep on hover */}
                  <div className={`ann-card-sweep ${isHovered ? 'is-hovered' : ''}`} aria-hidden="true" />

                  {/* Faint dotted texture in the corner */}
                  <div
                    className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 opacity-[0.18] transition-opacity duration-300 group-hover:opacity-[0.35]"
                    style={{
                      backgroundImage:
                        'radial-gradient(rgba(10,61,98,0.5) 1px, transparent 1px)',
                      backgroundSize: '10px 10px',
                    }}
                    aria-hidden="true"
                  />

                  <div className="relative mb-3 flex items-center justify-between gap-3">
                    <div
                      className={`inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${style.badge}`}
                    >
                      <BellRing size={12} />
                      {priority}
                    </div>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                      <Calendar size={12} className="text-cput-blue/70" />
                      {formatDate(announcement.created_at)}
                    </span>
                  </div>

                  {/* Icon + title row */}
                  <div className="relative flex items-start gap-3">
                    <div
                      className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${style.icon} shadow-md ${style.glow} transition-transform duration-300 group-hover:rotate-[-4deg] group-hover:scale-105`}
                    >
                      {priority === 'high' ? (
                        <Sparkles size={18} />
                      ) : (
                        <Megaphone size={18} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-cput-blue">
                        {announcement.title}
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                        {announcement.body}
                      </p>
                    </div>
                  </div>

                  {/* Footer read link */}
                  <div className="relative mt-4 flex items-center justify-between border-t border-cput-blue/10 pt-3">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Tap to open
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#0a3d62]">
                      Read update
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </span>
                  </div>

                  {/* Gold corner accent that grows on hover */}
                  <div
                    className={`pointer-events-none absolute bottom-0 right-0 h-1 bg-gradient-to-r from-transparent to-cput-gold transition-all duration-500 ${
                      isHovered ? 'w-full' : 'w-0'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              );
            })}
          </div>

          {/* ---- Empty state ---- */}
          {items.length === 0 && (
            <div className="surface-panel relative overflow-hidden rounded-[26px] p-10 text-center">
              <div className="ann-diag-lines pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
              <div className="relative mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-blue-tint text-cput-blue">
                <Megaphone size={22} />
              </div>
              <h3 className="relative text-lg font-bold text-slate-800">
                No announcements yet
              </h3>
              <p className="relative mt-1 text-sm text-slate-500">
                Check back soon — admins will post campus updates here.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* ---- Detail modal ---- */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-md animate-fade-in">
          <div className="animate-scale-in relative w-full max-w-2xl overflow-hidden rounded-[28px] border border-cput-blue/25 bg-eggshell shadow-[0_40px_100px_rgba(15,23,42,0.35)]">
            {/* Gradient top band */}
            <div className="gradient-blue relative px-6 py-5">
              <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-cput-gold/70 to-transparent" />
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.12]"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(135deg, rgba(255,255,255,0.9) 0px, rgba(255,255,255,0.9) 1px, transparent 1px, transparent 14px)',
                }}
                aria-hidden="true"
              />

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition hover:bg-white/20"
              >
                <X size={18} />
              </button>

              <div className="relative pr-12">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white ring-1 ring-white/20">
                  <BellRing size={12} />
                  {selected.priority || 'Normal'}
                </div>
                <h3 className="text-2xl font-black text-white">
                  {selected.title}
                </h3>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-blue-100/85">
                  <Calendar size={12} />
                  {formatDate(selected.created_at, 'full')}
                </p>
              </div>
            </div>

            {/* Body */}
            <div className="relative max-h-[60vh] overflow-y-auto px-6 py-5">
              <div className="ann-diag-lines pointer-events-none absolute inset-0 opacity-70" aria-hidden="true" />
              <div className="relative whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {selected.body}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-cput-blue/15 bg-cream-soft px-6 py-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                Community Store
              </span>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[#0a3d62] to-[#1a5fa3] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#0a3d62]/25 transition hover:scale-[1.03]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
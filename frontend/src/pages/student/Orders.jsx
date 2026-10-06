import { useEffect, useState } from 'react';
import { Clock3, PackageCheck, Truck } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';

function deliveryCopy(date, currentTime) {
  if (!date) return 'Seller is preparing your order';
  const days = Math.ceil((new Date(date).getTime() - currentTime) / 86400000);
  if (days < 0) return 'Expected arrival date has passed';
  if (days === 0) return 'Expected to arrive today';
  return `Expected in ${days} ${days === 1 ? 'day' : 'days'}`;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { supabase.from('orders').select('*, listings(title)').eq('buyer_id', user.id).order('created_at', { ascending: false }).then(({ data }) => setOrders(data || [])); }, [user]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  return <div className="min-h-screen bg-cput-light"><Navbar /><main className="mx-auto max-w-3xl px-4 py-8"><h1 className="mb-2 text-3xl font-bold">Your orders</h1><p className="mb-6 text-sm text-slate-500">Follow every purchase from confirmation to arrival.</p>{orders === null ? <LoadingSpinner /> : orders.length === 0 ? <div className="rounded-2xl bg-white p-10 text-center text-slate-500">Your orders will appear here after checkout.</div> : orders.map((order) => <article className="mb-4 rounded-2xl bg-white p-5 shadow-sm" key={order.id}><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-slate-800">{order.listings?.title}</h3><p className="mt-1 text-sm text-slate-500">Total R{Number(order.total).toFixed(2)} · Qty {order.quantity}</p></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold capitalize text-cput-blue">{order.status}</span></div><div className="mt-4 flex items-center gap-3 rounded-xl bg-blue-tint/60 p-3"><div className="rounded-lg bg-white p-2 text-cput-blue">{order.status === 'delivered' ? <PackageCheck size={18} /> : order.delivery_date ? <Truck size={18} /> : <Clock3 size={18} />}</div><div><p className="text-sm font-bold text-slate-700">{deliveryCopy(order.delivery_date, now)}</p>{order.delivery_date && <p className="text-xs text-slate-500">Seller estimate: {new Date(order.delivery_date).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}</p>}</div></div></article>)}</main></div>;
}

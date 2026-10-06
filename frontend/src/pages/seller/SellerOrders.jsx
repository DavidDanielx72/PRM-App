import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Truck } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const statuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const today = new Date().toISOString().split('T')[0];

export default function SellerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    supabase.from('orders').select('*, listings(title), profiles!orders_buyer_id_fkey(full_name)').eq('seller_id', user.id).order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) toast.error('Could not load orders');
      setOrders(data || []);
    });
  }, [user]);

  async function updateOrder(order, field, value) {
    setSaving(order.id);
    const updates = field === 'delivery_date' ? { delivery_date: value ? new Date(`${value}T23:59:59`).toISOString() : null } : { status: value };
    const { error } = await supabase.from('orders').update(updates).eq('id', order.id).eq('seller_id', user.id);
    if (error) toast.error(error.message);
    else setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...updates } : item));
    setSaving(null);
  }

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8"><p className="text-xs font-bold uppercase tracking-[0.2em] text-cput-blue-light">Seller workspace</p><h1 className="mt-2 text-3xl font-extrabold text-slate-800">Incoming orders</h1><p className="mt-2 text-sm text-slate-500">Confirm purchases and give students a clear arrival estimate.</p></div>
        {orders.length === 0 ? <div className="surface-panel rounded-3xl p-12 text-center text-slate-500">No orders yet. They will appear here when students purchase your listings.</div> : <div className="space-y-4">{orders.map((order) => <article className="surface-panel rounded-2xl p-5 sm:p-6" key={order.id}><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><h2 className="font-bold text-slate-800">{order.listings?.title}</h2><span className="rounded-full bg-blue-tint px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-cput-blue">{order.status}</span></div><p className="mt-1 text-sm text-slate-500">{order.profiles?.full_name || 'Student'} · Qty {order.quantity} · R{Number(order.total).toFixed(2)}</p></div><div className="flex items-center gap-2 text-xs text-slate-400"><CalendarDays size={14} /> {new Date(order.created_at).toLocaleDateString('en-ZA')}</div></div><div className="mt-5 grid gap-3 border-t border-cput-blue/10 pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Order status</span><select disabled={saving === order.id} value={order.status} onChange={(event) => updateOrder(order, 'status', event.target.value)} className="input py-2.5 capitalize">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-400">Expected arrival</span><input disabled={saving === order.id} type="date" min={today} value={order.delivery_date ? new Date(order.delivery_date).toISOString().split('T')[0] : ''} onChange={(event) => updateOrder(order, 'delivery_date', event.target.value)} className="input py-2.5" /></label><div className="flex items-center gap-2 pb-2 text-xs font-semibold text-green-700">{order.delivery_date ? <><Truck size={16} /> Date shared</> : <><CheckCircle2 size={16} /> Add an estimate</>}</div></div></article>)}</div>}
      </main>
    </div>
  );
}

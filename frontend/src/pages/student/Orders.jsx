import { useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, PackageCheck, Truck, XCircle } from 'lucide-react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

const steps = ['pending', 'confirmed', 'shipped', 'delivered'];

function statusCopy(status) {
  return status === 'delivered' ? 'Order completed' : status === 'cancelled' ? 'Order cancelled' : status;
}

function deliveryCopy(order, currentTime) {
  if (order.status === 'delivered') return 'Your order has been delivered';
  if (order.status === 'cancelled') return 'This order was cancelled';
  if (!order.delivery_date) return 'Seller is preparing your order';
  const days = Math.ceil((new Date(order.delivery_date).getTime() - currentTime) / 86400000);
  if (days < 0) return 'Expected arrival date has passed';
  if (days === 0) return 'Expected to arrive today';
  return `Expected in ${days} ${days === 1 ? 'day' : 'days'}`;
}

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!user) return undefined;
    const loadOrders = async () => {
      const { data, error } = await supabase.from('orders').select('*, listings(title)').eq('buyer_id', user.id).order('created_at', { ascending: false });
      if (error) {
        toast.error('Could not load your orders');
        setOrders([]);
        return;
      }
      setOrders(data || []);
    };
    loadOrders();
    const channel = supabase
      .channel(`buyer-orders-${user.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `buyer_id=eq.${user.id}` }, loadOrders)
      .subscribe();
    const refreshTimer = setInterval(loadOrders, 30000);
    return () => { clearInterval(refreshTimer); supabase.removeChannel(channel); };
  }, [user]);
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(timer); }, []);
  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cput-blue-light">Shopping activity</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-800">Your orders</h1>
          <p className="mt-2 text-sm text-slate-500">Follow every purchase from confirmation to delivery.</p>
        </div>
        {orders === null ? <LoadingSpinner /> : orders.length === 0 ? (
          <div className="surface-panel rounded-3xl p-12 text-center text-slate-500">Your orders will appear here after checkout.</div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const cancelled = order.status === 'cancelled';
              const currentStep = steps.indexOf(order.status);
              return (
                <article className="surface-panel overflow-hidden rounded-3xl" key={order.id}>
                  <div className="flex flex-col justify-between gap-4 border-b border-cput-blue/10 p-5 sm:flex-row sm:items-start sm:p-6">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-tint text-cput-blue"><PackageCheck size={21} /></div>
                        <div>
                          <h2 className="font-bold text-slate-800">{order.listings?.title || 'Marketplace item'}</h2>
                          <p className="mt-1 text-xs text-slate-500">Placed {new Date(order.created_at).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}</p>
                        </div>
                      </div>
                      <p className="mt-4 text-sm text-slate-500">Quantity {order.quantity} <span className="mx-2 text-slate-300">•</span> Total <strong className="text-slate-700">R{Number(order.total).toFixed(2)}</strong></p>
                    </div>
                    <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold capitalize ${cancelled ? 'bg-red-50 text-red-700' : order.status === 'delivered' ? 'bg-green-50 text-green-700' : 'bg-blue-tint text-cput-blue'}`}>
                      {statusCopy(order.status)}
                    </span>
                  </div>
                  <div className="p-5 sm:p-6">
                    {cancelled ? (
                      <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700"><XCircle size={20} /> This order was cancelled.</div>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 gap-2">
                          {steps.map((step, index) => {
                            const complete = currentStep >= index;
                            return <div key={step} className="text-center">
                              <div className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${complete ? 'bg-cput-blue text-white' : 'bg-slate-100 text-slate-400'}`}>{complete ? <CheckCircle2 size={17} /> : <span className="text-xs font-bold">{index + 1}</span>}</div>
                              <p className={`mt-2 text-[10px] font-bold uppercase tracking-wide ${complete ? 'text-cput-blue' : 'text-slate-400'}`}>{step}</p>
                            </div>;
                          })}
                        </div>
                        <div className="relative -mt-10 mb-7 hidden h-1 translate-y-[-1px] bg-slate-100 sm:block"><div className="h-full bg-cput-blue transition-all" style={{ width: `${Math.max(0, currentStep) / 3 * 100}%` }} /></div>
                        <div className={`flex items-center gap-3 rounded-2xl p-4 ${order.status === 'delivered' ? 'bg-green-50 text-green-800' : 'bg-blue-tint/70 text-slate-700'}`}>
                          {order.status === 'delivered' ? <PackageCheck size={20} /> : order.delivery_date ? <Truck size={20} /> : <Clock3 size={20} />}
                          <div><p className="text-sm font-bold">{deliveryCopy(order, now)}</p>{order.delivery_date && <p className="mt-1 text-xs text-slate-500"><CalendarDays className="mr-1 inline" size={13} />Seller estimate: {new Date(order.delivery_date).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}</p>}</div>
                        </div>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

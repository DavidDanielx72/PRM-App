import { useEffect, useMemo, useState } from 'react';
import { ChevronRight, Edit3, Eye, EyeOff, Package, Plus, ShoppingBag, Tag, Trash2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import CategoryIcon from '../../components/CategoryIcon';
import toast from 'react-hot-toast';

export default function SellerDashboard() {
  const { user, profile } = useAuth();
  const [items, setItems] = useState(null);
  const [orders, setOrders] = useState([]);

  async function load() {
    const [{ data: listings }, { data: incoming }] = await Promise.all([
      supabase.from('listings').select('*, categories(name, icon)').eq('seller_id', user.id).order('created_at', { ascending: false }),
      supabase.from('orders').select('id, status, total').eq('seller_id', user.id),
    ]);
    setItems(listings || []);
    setOrders(incoming || []);
  }

  useEffect(() => { if (user) load(); }, [user]);

  const stats = useMemo(() => ({
    active: items?.filter((item) => item.is_active).length || 0,
    inventory: items?.reduce((sum, item) => sum + (item.stock || 0), 0) || 0,
    sales: orders.filter((order) => order.status !== 'cancelled').length,
    revenue: orders.filter((order) => order.status !== 'cancelled').reduce((sum, order) => sum + Number(order.total), 0),
  }), [items, orders]);

  async function toggleListing(item) {
    const { error } = await supabase.from('listings').update({ is_active: !item.is_active }).eq('id', item.id);
    if (error) toast.error(error.message);
    else setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, is_active: !entry.is_active } : entry));
  }

  async function deleteListing(item) {
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    const { error } = await supabase.from('listings').delete().eq('id', item.id).eq('seller_id', user.id);
    if (error) toast.error(error.message);
    else {
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      toast.success('Listing deleted');
    }
  }

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <section className="surface-blue-deep relative overflow-hidden rounded-[2rem] p-7 sm:p-10">
          <div className="absolute -right-16 -top-24 h-72 w-72 rounded-full bg-cput-gold/15 blur-3xl" />
          <div className="relative flex flex-col justify-between gap-7 sm:flex-row sm:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-cput-gold">Seller workspace</p>
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Good morning, {profile?.full_name?.split(' ')[0] || 'seller'}.</h1>
              <p className="mt-3 max-w-lg text-sm leading-6 text-blue-100">Keep your campus shop moving. Manage listings, watch your inventory and stay on top of every order.</p>
            </div>
            <Link to="/seller/add-listing" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cput-gold px-5 py-3 font-bold text-cput-blue shadow-lg transition hover:-translate-y-0.5"><Plus size={18} /> Add listing</Link>
          </div>
        </section>

        {items === null ? <LoadingSpinner /> : (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Active listings', value: stats.active, icon: Tag, tone: 'text-cput-blue' },
                { label: 'Items in stock', value: stats.inventory, icon: Package, tone: 'text-green-700' },
                { label: 'Total orders', value: stats.sales, icon: ShoppingBag, tone: 'text-cput-gold-dark' },
                { label: 'Revenue', value: `R${stats.revenue.toFixed(2)}`, icon: TrendingUp, tone: 'text-cput-blue-light' },
              ].map(({ label, value, icon: Icon, tone }) => <div key={label} className="surface-panel rounded-2xl p-5"><div className={`mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-tint ${tone}`}><Icon size={19} /></div><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-1 text-2xl font-extrabold text-slate-800">{value}</p></div>)}
            </section>

            <section className="mt-8">
              <div className="mb-4 flex items-center justify-between"><div><h2 className="text-xl font-extrabold text-slate-800">Your listings</h2><p className="mt-1 text-sm text-slate-500">A quick view of everything in your shop.</p></div><Link to="/seller/orders" className="inline-flex items-center gap-1 text-sm font-bold text-cput-blue hover:underline">View orders <ChevronRight size={16} /></Link></div>
              {items.length === 0 ? <div className="surface-panel rounded-3xl p-12 text-center"><Package className="mx-auto mb-3 text-cput-blue/50" size={36} /><h3 className="font-bold text-slate-700">Your shop is waiting</h3><p className="mt-1 text-sm text-slate-500">Create your first listing and start selling to students.</p></div> : <div className="stagger-grid grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <article key={item.id} className="surface-panel card-hover overflow-hidden rounded-2xl"><div className="flex gap-4 p-5"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-blue-tint">{item.image_url ? <img src={item.image_url} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-3xl">📦</div>}</div><div className="min-w-0 flex-1"><div className="mb-1 flex items-start justify-between gap-2"><h3 className="truncate font-bold text-slate-800">{item.title}</h3><div className="flex gap-1">{item.is_promotion && <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700">Promo</span>}<span className={`rounded-full px-2 py-1 text-[10px] font-bold ${item.is_active ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{item.is_active ? 'Live' : 'Hidden'}</span></div></div><p className="text-lg font-extrabold text-cput-blue">R{Number(item.price).toFixed(2)}</p><p className={`mt-1 text-xs font-medium ${item.stock > 0 ? 'text-slate-500' : 'text-red-600'}`}>{item.stock > 0 ? `${item.stock} available` : 'Out of stock'}</p></div></div><div className="flex items-center justify-between border-t border-cput-blue/10 px-5 py-3"><span className="inline-flex items-center gap-1 text-xs text-slate-400">              <CategoryIcon name={item.categories?.icon} size={14} />{item.categories?.name || 'Other'}</span><div className="flex items-center gap-3"><Link to={`/seller/listings/${item.id}/edit`} className="inline-flex items-center gap-1 text-xs font-bold text-cput-blue hover:text-cput-blue-dark"><Edit3 size={14} /> Edit</Link><button onClick={() => toggleListing(item)} className="inline-flex items-center gap-1 text-xs font-bold text-cput-blue hover:text-cput-blue-dark">{item.is_active ? <EyeOff size={14} /> : <Eye size={14} />}{item.is_active ? 'Hide' : 'Show'}</button><button onClick={() => deleteListing(item)} className="text-red-500 hover:text-red-700" title="Delete listing"><Trash2 size={14} /></button></div></div></article>)}</div>}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

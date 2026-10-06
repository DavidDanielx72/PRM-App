import { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

export default function Cart() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  async function load() {
    const { data } = await supabase.from('cart_items').select('*, listings(id,title,price,seller_id,stock)').eq('user_id', user.id);
    setItems(data || []);
  }
  useEffect(() => { load(); }, [user]);
  const total = items.reduce((sum, item) => sum + Number(item.listings.price) * item.quantity, 0);
  async function checkout() {
    const { error } = await supabase.from('orders').insert(items.map((item) => ({ buyer_id: user.id, seller_id: item.listings.seller_id, listing_id: item.listings.id, quantity: item.quantity, total: Number(item.listings.price) * item.quantity, status: 'pending' })));
    if (error) toast.error(error.message.includes('stock') ? 'One of the items is no longer available in that quantity.' : error.message);
    else { await supabase.from('cart_items').delete().eq('user_id', user.id); toast.success('Purchase completed'); load(); }
  }
  return <div className="min-h-screen bg-cput-light"><Navbar cartCount={items.length} /><main className="mx-auto max-w-3xl px-4 py-8"><h1 className="mb-6 text-3xl font-bold">Your cart</h1>{items.map((item) => <div className="mb-3 flex justify-between rounded-xl bg-white p-4 shadow" key={item.id}><span>{item.listings.title} <span className="text-sm text-slate-500">×{item.quantity} · {item.listings.stock} in stock</span></span><strong>R{Number(item.listings.price * item.quantity).toFixed(2)}</strong></div>)}<div className="mt-5 rounded-xl bg-white p-5"><p className="flex justify-between font-bold"><span>Total</span><span>R{total.toFixed(2)}</span></p><button onClick={checkout} disabled={!items.length} className="primary mt-4 w-full">Purchase (Demo)</button></div></main></div>;
}

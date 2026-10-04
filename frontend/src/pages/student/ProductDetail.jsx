import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Tag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const nav = useNavigate();
  const [listing, setListing] = useState(null);
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('listings')
        .select('*, categories(name, icon), profiles!listings_seller_id_fkey(id, full_name, avatar_url, bio)')
        .eq('id', id)
        .maybeSingle();

      if (error || !data) {
        toast.error('Product not found');
        nav('/student');
        return;
      }

      setListing(data);
      setSeller(data.profiles);
      setLoading(false);
    })();
  }, [id, nav]);

  const addToCart = async () => {
    if (!user || !listing) return;
    setBusy(true);

    const { error } = await supabase.from('cart_items').insert({
      user_id: user.id,
      listing_id: listing.id,
      quantity: 1,
    });

    if (error) toast.error(error.code === '23505' ? 'Already in cart' : 'Could not add');
    else toast.success('Added to cart ✓');

    setBusy(false);
  };

  const startChat = () => {
    if (!seller || !user) return;
    if (seller.id === user.id) return toast.error("You can't message yourself");
    nav(`/messages?to=${seller.id}&listing=${listing.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cput-light">
        <Navbar />
        <LoadingSpinner full />
      </div>
    );
  }

  const isOwn = seller?.id === user?.id;

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-cput-blue mb-5 px-3 py-1.5 rounded-lg hover:bg-white transition-all"
        >
          <ArrowLeft size={16} /> Back to marketplace
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm animate-fade-in">
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-blue-50/40 relative">
              {listing.image_url ? (
                <img src={listing.image_url} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 text-8xl">📦</div>
              )}

              {listing.is_service && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-cput-gold to-cput-gold-dark text-cput-blue text-xs font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-lg">
                  Service
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-slide-up">
              {listing.categories && (
                <Link
                  to="/student"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-cput-blue uppercase tracking-wider mb-2 hover:underline"
                >
                  <Tag size={11} strokeWidth={3} />
                  {listing.categories.icon} {listing.categories.name}
                </Link>
              )}

              <h1 className="text-2xl font-extrabold text-slate-800 leading-tight mb-3">{listing.title}</h1>

              <div className="flex items-baseline gap-2 pb-4 mb-4 border-b border-slate-100">
                <span className="text-4xl font-extrabold text-cput-blue tracking-tight">
                  R{parseFloat(listing.price).toFixed(2)}
                </span>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Available
                </span>
              </div>

              <div className="space-y-2.5 mb-5 text-sm">
                <div className="flex items-center gap-2 text-slate-500">
                  <Calendar size={15} className="text-cput-blue/60" />
                  Listed {new Date(listing.created_at).toLocaleDateString('en-ZA', { dateStyle: 'medium' })}
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <Truck size={15} className="text-cput-blue/60" />
                  Free campus pickup
                </div>
                <div className="flex items-center gap-2 text-slate-500">
                  <RotateCcw size={15} className="text-cput-blue/60" />
                  7-day return window
                </div>
              </div>

              {!isOwn ? (
                <button
                  onClick={addToCart}
                  disabled={busy}
                  className="group w-full bg-gradient-to-br from-cput-blue to-cput-blue-dark text-white font-bold py-3.5 rounded-2xl hover:shadow-xl hover:shadow-blue-900/25 transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <ShoppingCart size={18} className="group-hover:scale-110 transition-transform" />
                  {busy ? 'Adding…' : 'Add to Cart'}
                </button>
              ) : (
                <div className="text-center text-sm font-medium text-slate-400 py-3 bg-slate-50 rounded-2xl">
                  This is your listing
                </div>
              )}
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-slide-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Sold by</p>
              <div className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full gradient-blue flex items-center justify-center text-white font-bold shadow-md">
                    {seller?.full_name?.charAt(0) || '?'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800 truncate">{seller?.full_name}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <ShieldCheck size={11} className="text-green-500" /> Verified seller
                  </p>
                </div>
              </div>

              {seller?.bio && (
                <p className="text-xs text-slate-500 italic mb-4 pb-4 border-b border-slate-100">
                  “{seller.bio}”
                </p>
              )}

              {!isOwn && (
                <button
                  onClick={startChat}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-cput-blue bg-blue-50 hover:bg-gradient-to-br hover:from-cput-blue hover:to-cput-blue-dark hover:text-white px-4 py-3 rounded-xl transition-all duration-200"
                >
                  <MessageSquare size={16} /> Message Seller
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm animate-slide-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">Description</p>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {listing.description || 'No description provided.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProductCard from '../../components/ProductCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Search, X, TrendingUp, Sparkles, Package } from 'lucide-react';

export default function StudentHome() {
  const { user, profile } = useAuth();
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select('*, categories(name, icon)')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (cat) query = query.eq('category_id', cat);
      if (search.trim()) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

      const { data, error } = await query;
      if (error) toast.error('Could not load listings');
      else setListings(data || []);
      setLoading(false);
    };

    const timer = setTimeout(fetch, 250);
    return () => clearTimeout(timer);
  }, [search, cat]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setCartCount(count || 0));
  }, [user]);

  const addToCart = async (listing) => {
    if (!user) return;

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .maybeSingle();

    if (existing) return toast.error('Already in your cart');

    const { error } = await supabase.from('cart_items').insert({
      user_id: user.id,
      listing_id: listing.id,
      quantity: 1,
    });

    if (error) return toast.error('Could not add');
    setCartCount((count) => count + 1);
    toast.success('Added to cart ✓');
  };

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar cartCount={cartCount} />

      <div className="relative overflow-hidden gradient-blue text-white">
        <div className="absolute inset-0 opacity-25">
          <div className="absolute -top-32 -right-32 w-[28rem] h-[28rem] bg-cput-gold rounded-full blur-[120px] animate-float" />
          <div className="absolute -bottom-40 -left-32 w-[32rem] h-[32rem] bg-blue-500 rounded-full blur-[130px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-full text-xs font-medium mb-4 animate-fade-in">
              <Sparkles size={12} className="text-cput-gold" />
              <span>Welcome back, {firstName}</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight mb-3 animate-slide-up">
              Good finds, <span className="text-cput-gold">close by</span>.
            </h1>
            <p className="text-blue-100/90 text-base md:text-lg leading-relaxed animate-slide-up" style={{ animationDelay: '60ms', animationFillMode: 'both' }}>
              Search textbooks, electronics, services and more from fellow CPUT students.
            </p>

            <div className="relative mt-7 max-w-xl animate-slide-up" style={{ animationDelay: '120ms', animationFillMode: 'both' }}>
              <div className="relative group">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cput-blue transition-colors" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search textbooks, laptops, services…"
                  className="w-full pl-12 pr-12 py-4 bg-white text-slate-800 rounded-2xl shadow-2xl shadow-blue-950/30 focus:ring-4 focus:ring-cput-gold/30 outline-none text-sm font-medium placeholder:text-slate-400 transition-all"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-8 bg-cput-light rounded-t-[2rem]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-10">
        <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
          <button
            onClick={() => setCat(null)}
            className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
              !cat
                ? 'bg-gradient-to-br from-cput-blue to-cput-blue-dark text-white shadow-md shadow-blue-900/20'
                : 'bg-cput-surface text-slate-600 hover:bg-cput-surface-blue border border-cput-blue/10 hover:border-cput-blue/30'
            }`}
          >
            <TrendingUp size={14} /> All Items
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setCat(category.id)}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 ${
                cat === category.id
                  ? 'bg-gradient-to-br from-cput-blue to-cput-blue-dark text-white shadow-md shadow-blue-900/20'
                  : 'bg-cput-surface text-slate-600 hover:bg-cput-surface-blue border border-cput-blue/10 hover:border-cput-blue/30'
              }`}
            >
              <span className="text-base">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {!loading && listings.length > 0 && (
          <p className="text-xs font-medium text-slate-400 mb-4 px-1">
            {listings.length} {listings.length === 1 ? 'item' : 'items'}
            {search && <span> matching "<span className="text-slate-600">{search}</span>"</span>}
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="bg-cput-surface rounded-2xl overflow-hidden border border-cput-blue/10">
                <div className="h-44 skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-3 skeleton rounded w-1/3" />
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-6 skeleton rounded w-1/2 mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20 bg-cput-surface rounded-3xl border border-cput-blue/10 shadow-card animate-scale-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <Package size={32} className="text-cput-blue/60" />
            </div>
            <h3 className="font-bold text-slate-700 text-lg">No items found</h3>
            <p className="text-sm text-slate-400 mt-1.5">Try a different search or category</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {listings.map((listing, index) => (
              <ProductCard key={listing.id} listing={listing} onAddToCart={addToCart} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

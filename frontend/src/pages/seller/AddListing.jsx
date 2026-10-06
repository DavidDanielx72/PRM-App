import { useEffect, useState } from 'react';
import { ArrowLeft, Check, Image, Package, Tag, Truck } from 'lucide-react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import toast from 'react-hot-toast';

const initialForm = {
  title: '',
  description: '',
  price: '',
  stock: '1',
  category_id: '',
  image_url: '',
  is_service: false,
  is_promotion: false,
};

export default function AddListing() {
  const { user } = useAuth();
  const nav = useNavigate();
  const { listingId } = useParams();
  const isEdit = Boolean(listingId);
  const [form, setForm] = useState(initialForm);
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('categories').select('*').order('name').then(({ data }) => setCategories(data || []));
    if (listingId) {
      supabase.from('listings').select('*').eq('id', listingId).eq('seller_id', user.id).maybeSingle().then(({ data, error }) => {
        if (error || !data) {
          toast.error('Listing not found');
          nav('/seller');
          return;
        }
        setForm({
          title: data.title || '',
          description: data.description || '',
          price: String(data.price ?? ''),
          stock: String(data.stock ?? 0),
          category_id: String(data.category_id ?? ''),
          image_url: data.image_url || '',
          is_service: Boolean(data.is_service),
          is_promotion: Boolean(data.is_promotion),
        });
      });
    }
  }, [listingId, user, nav]);

  const updateField = (field) => (event) => {
    const value = field === 'is_service' ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };

  async function submit(event) {
    event.preventDefault();
    const imageUrl = form.image_url.trim();
    if (imageUrl) {
      try {
        new URL(imageUrl);
      } catch {
        toast.error('Enter a valid image URL');
        return;
      }
    }

    setSaving(true);
    const listingPayload = {
      seller_id: user.id,
      title: form.title.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      stock: Number(form.stock),
      category_id: Number(form.category_id),
      image_url: imageUrl || null,
      is_service: form.is_service,
      is_promotion: form.is_promotion,
    };
    const { error } = isEdit
      ? await supabase.from('listings').update(listingPayload).eq('id', listingId).eq('seller_id', user.id)
      : await supabase.from('listings').insert(listingPayload);

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }
    toast.success(isEdit ? 'Listing updated' : 'Listing published');
    nav('/seller');
  }

  return (
    <div className="min-h-screen bg-cput-light">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
        <Link to="/seller" className="mb-7 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-cput-blue">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>

        <div className="grid gap-7 lg:grid-cols-[1fr_360px]">
          <form onSubmit={submit} className="surface-panel rounded-[2rem] p-6 sm:p-9">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-cput-blue-light">Seller studio</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">{isEdit ? 'Edit your listing' : 'Add a new listing'}</h1>
                <p className="mt-2 text-sm text-slate-500">Give your item a clear home in the CPUT marketplace.</p>
              </div>
              <div className="hidden rounded-2xl bg-blue-tint p-3 text-cput-blue sm:block"><Package size={22} /></div>
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">What are you selling?</span>
                <input className="input" required maxLength={100} placeholder="e.g. Calculus textbook, desk lamp" value={form.title} onChange={updateField('title')} />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Tag size={15} className="text-cput-blue-light" /> Category</span>
                  <select className="input" required value={form.category_id} onChange={updateField('category_id')}>
                    <option value="">Choose a category</option>
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.icon} {category.name}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-bold text-slate-700">Price (ZAR)</span>
                  <input className="input" required type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={updateField('price')} />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-bold text-slate-700">Description <span className="font-normal text-slate-400">· optional</span></span>
                <textarea className="input min-h-32 resize-y" maxLength={1000} placeholder="Share condition, size, collection details or anything buyers should know." value={form.description} onChange={updateField('description')} />
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Package size={15} className="text-cput-blue-light" /> Available quantity</span>
                  <input className="input" required type="number" min={isEdit ? '0' : '1'} step="1" value={form.stock} onChange={updateField('stock')} />
                  <span className="mt-1.5 block text-xs text-slate-400">Inventory drops automatically after each purchase.</span>
                </label>
                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-700"><Image size={15} className="text-cput-blue-light" /> Image URL <span className="font-normal text-slate-400">· optional</span></span>
                  <input className="input" type="url" placeholder="https://..." value={form.image_url} onChange={updateField('image_url')} />
                </label>
              </div>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-cput-gold/25 bg-amber-50/70 p-4">
                <input type="checkbox" className="h-4 w-4 accent-cput-gold-dark" checked={form.is_promotion} onChange={updateField('is_promotion')} />
                <span><strong className="block text-sm text-slate-700">Mark as promotion</strong><span className="text-xs text-slate-500">Highlight this listing with a promotion badge.</span></span>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-cput-blue/10 bg-blue-tint/50 p-4">
                <input type="checkbox" className="h-4 w-4 accent-cput-blue" checked={form.is_service} onChange={updateField('is_service')} />
                <span><strong className="block text-sm text-slate-700">This is a service</strong><span className="text-xs text-slate-500">Show a service badge to students.</span></span>
              </label>
            </div>

            <button disabled={saving} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-cput-blue to-cput-blue-dark py-3.5 font-bold text-white shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 disabled:opacity-60">
              <Check size={18} /> {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Publish listing'}
            </button>
          </form>

          <aside className="space-y-5">
            <div className="surface-blue-deep rounded-[2rem] p-7">
              <Truck className="mb-5 text-cput-gold" size={26} />
              <h2 className="text-xl font-bold">A great listing gets noticed</h2>
              <p className="mt-3 text-sm leading-6 text-blue-100">Use a specific title, choose the closest category and be honest about condition. Buyers can then find and trust your item faster.</p>
            </div>
            <div className="surface-panel rounded-[2rem] p-6">
              <h3 className="font-bold text-slate-800">Before you publish</h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-500">
                {['Select the right category', 'Set the total quantity you have', 'Add a clear, accurate description'].map((tip) => <li key={tip} className="flex items-center gap-2"><Check size={15} className="text-green-600" /> {tip}</li>)}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

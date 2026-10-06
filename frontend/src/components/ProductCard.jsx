import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Wrench } from 'lucide-react';

export default function ProductCard({ listing, onAddToCart, index = 0 }) {
  const { id, title, price, image_url, is_service, is_promotion, categories, stock } = listing;

  return (
    <div
      className="social-card group relative overflow-hidden rounded-[1.75rem] animate-slide-up"
      style={{
        animationDelay: `${Math.min(index * 40, 400)}ms`,
        animationFillMode: 'both',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cput-blue via-cput-blue-light to-cput-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <Link to={`/product/${id}`} className="block">
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-tint via-eggshell to-amber-50 dark:from-[#172b45] dark:via-[#131e31] dark:to-[#283044]">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(26,95,163,0.18),transparent_35%),linear-gradient(135deg,#eaf1f8,#fdfaf3_55%,#fff3d6)]">
              <div className="grid h-20 w-20 place-items-center rounded-[28px] border border-white/80 bg-white/60 text-5xl shadow-lg shadow-cput-blue/10 transition-transform duration-500 group-hover:rotate-3 group-hover:scale-110 dark:border-white/10 dark:bg-white/10">
                📦
              </div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {is_service && (
            <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-cput-gold to-cput-gold-dark text-cput-blue text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-500/20">
              <Wrench size={10} strokeWidth={3} />
              Service
            </span>
          )}
          {is_promotion && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-cput-gold px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-cput-blue shadow-lg">
              Promotion
            </span>
          )}
        </div>
      </Link>

      <div className="p-5">
        <p className="mb-1 inline-flex rounded-full bg-blue-tint px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cput-blue">
          {categories?.name || 'Other'}
        </p>

        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-slate-800 text-[15px] leading-snug line-clamp-2 min-h-[42px] group-hover:text-cput-blue transition-colors">
            {title}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between border-t border-cput-blue/15 pt-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
              Price
            </span>
            <span className="font-extrabold text-cput-blue text-lg leading-none tracking-tight">
              R{parseFloat(price).toFixed(2)}
            </span>
          </div>

          <span className={`mr-2 text-[10px] font-bold ${stock > 0 ? 'text-slate-400' : 'text-red-500'}`}>{stock > 0 ? `${stock} left` : 'Sold out'}</span>
          {onAddToCart && stock > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(listing);
              }}
              className="group/btn relative p-2.5 rounded-xl bg-blue-tint text-cput-blue hover:bg-gradient-to-br hover:from-cput-blue hover:to-cput-blue-dark hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-900/25 active:scale-95"
              title="Add to cart"
            >
              <ShoppingCart size={15} strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
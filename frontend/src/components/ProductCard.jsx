import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Wrench } from 'lucide-react';

export default function ProductCard({ listing, onAddToCart, index = 0 }) {
  const { id, title, price, image_url, is_service, categories } = listing;

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 card-hover animate-slide-up"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms`, animationFillMode: 'both' }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-cput-blue via-cput-blue-light to-cput-gold opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <Link to={`/product/${id}`} className="block">
        <div className="relative h-44 bg-slate-50 overflow-hidden">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.08] transition-transform duration-500 ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
              <span className="text-5xl opacity-40 group-hover:scale-110 transition-transform duration-500">📦</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {is_service && (
            <span className="absolute top-2.5 left-2.5 bg-gradient-to-r from-cput-gold to-cput-gold-dark text-cput-blue text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-yellow-500/20">
              <Wrench size={10} strokeWidth={3} /> Service
            </span>
          )}
        </div>
      </Link>

      <div className="p-4">
        <p className="text-[11px] font-semibold text-cput-blue/70 uppercase tracking-wide mb-1">
          {categories?.name || 'Other'}
        </p>
        <Link to={`/product/${id}`}>
          <h3 className="font-semibold text-slate-800 text-[15px] leading-snug line-clamp-2 min-h-[42px] group-hover:text-cput-blue transition-colors">
            {title}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Price</span>
            <span className="font-extrabold text-cput-blue text-lg leading-none">
              R{parseFloat(price).toFixed(2)}
            </span>
          </div>

          {onAddToCart && (
            <button
              onClick={(e) => { e.preventDefault(); onAddToCart(listing); }}
              className="group/btn relative p-2.5 rounded-xl bg-blue-50 text-cput-blue hover:bg-gradient-to-br hover:from-cput-blue hover:to-cput-blue-dark hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-900/25 active:scale-95"
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

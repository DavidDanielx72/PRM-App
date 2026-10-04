import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  MessageSquare,
  Home,
  Megaphone,
  User,
  LogOut,
  Menu,
  X,
  Package,
  Store,
  Search,
  Sparkles,
} from 'lucide-react';

export default function Navbar({ cartCount = 0 }) {
  const { profile, signOut, isSeller, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const links = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard', icon: Home },
        { to: '/admin/users', label: 'Users', icon: User },
        { to: '/admin/announcements', label: 'Announcements', icon: Megaphone },
        { to: '/messages', label: 'Messages', icon: MessageSquare },
        { to: '/profile', label: 'Profile', icon: User },
      ]
    : isSeller
    ? [
        { to: '/seller', label: 'Dashboard', icon: Store },
        { to: '/seller/orders', label: 'Orders', icon: Package },
        { to: '/seller/add-listing', label: 'Add Listing', icon: Sparkles },
        { to: '/student', label: 'Browse', icon: Search },
        { to: '/messages', label: 'Messages', icon: MessageSquare },
        { to: '/profile', label: 'Profile', icon: User },
      ]
    : [
        { to: '/student', label: 'Home', icon: Home },
        { to: '/announcements', label: 'News', icon: Megaphone },
        { to: '/orders', label: 'Orders', icon: Package },
        { to: '/messages', label: 'Messages', icon: MessageSquare },
        { to: '/profile', label: 'Profile', icon: User },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(10,61,98,0.08)] border-b border-slate-100'
          : 'bg-white/70 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <Link
            to={isAdmin ? '/admin' : isSeller ? '/seller' : '/student'}
            className="flex items-center gap-2.5 group"
          >
            <div className="relative w-9 h-9 rounded-xl gradient-blue flex items-center justify-center shadow-lg shadow-blue-900/20 group-hover:scale-105 transition-transform">
              <span className="text-cput-gold font-extrabold text-sm tracking-tight">CS</span>
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </div>
            <span className="font-bold text-slate-800 hidden sm:block tracking-tight">
              Community <span className="text-cput-blue">Store</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-br from-cput-blue to-cput-blue-dark text-white shadow-md shadow-blue-900/20'
                      : 'text-slate-500 hover:text-cput-blue hover:bg-slate-50'
                  }`}
                >
                  <link.icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {!isSeller && !isAdmin && (
              <Link
                to="/cart"
                className="relative p-2.5 ml-1 text-slate-500 hover:text-cput-blue hover:bg-slate-50 rounded-xl transition-colors"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <div className="w-px h-6 bg-slate-200 mx-1.5" />

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="border-t border-slate-100 bg-white/95 backdrop-blur-lg px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive(link.to)
                  ? 'bg-gradient-to-br from-cput-blue to-cput-blue-dark text-white'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={18} /> Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}

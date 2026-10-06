import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabase';
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
  UsersRound,
  Moon,
  Sun,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar({ cartCount = 0 }) {
  const { user, signOut, isSeller, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || !supabase) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      const { count, error } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('is_read', false);

      if (!error) setUnreadCount(count || 0);
    };

    loadUnreadCount();

    const channel = supabase
      .channel(`unread-messages-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages' },
        loadUnreadCount
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

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
        { to: '/community', label: 'Community', icon: UsersRound },
        { to: '/messages', label: 'Messages', icon: MessageSquare },
        { to: '/profile', label: 'Profile', icon: User },
      ]
    : isSeller
    ? [
        { to: '/seller', label: 'Dashboard', icon: Store },
        { to: '/seller/orders', label: 'Orders', icon: Package },
        { to: '/seller/add-listing', label: 'Add Listing', icon: Sparkles },
        { to: '/student', label: 'Browse', icon: Search },
        { to: '/announcements', label: 'Announcements', icon: Megaphone },
        { to: '/community', label: 'Community', icon: UsersRound },
        { to: '/messages', label: 'Messages', icon: MessageSquare },
        { to: '/profile', label: 'Profile', icon: User },
      ]
    : [
        { to: '/student', label: 'Home', icon: Home },
      { to: '/announcements', label: 'Announcements', icon: Megaphone },
      { to: '/community', label: 'Community', icon: UsersRound },
        { to: '/orders', label: 'Orders', icon: Package },
        { to: '/messages', label: 'Messages', icon: MessageSquare },
        { to: '/profile', label: 'Profile', icon: User },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 dark:bg-[#0f1a2b]/90 dark:border-white/10 ${
        scrolled
          ? 'bg-eggshell/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(10,61,98,0.10)] border-b border-cput-blue/10'
          : 'bg-eggshell/70 backdrop-blur-md border-b border-transparent'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-[4.5rem] items-center justify-between">
          <Link
            to={isAdmin ? '/admin' : isSeller ? '/seller' : '/student'}
            className="group flex items-center gap-3"
          >
            <div className="glow-ring relative grid h-10 w-10 place-items-center rounded-2xl gradient-blue transition-transform group-hover:rotate-[-4deg] group-hover:scale-105">
              <span className="text-cput-gold font-extrabold text-sm tracking-tight">
                CS
              </span>
              <div className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </div>
            <span className="hidden font-black tracking-tight text-slate-900 sm:block">
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
                  className={`relative flex items-center gap-1.5 rounded-2xl px-3.5 py-2.5 text-[13px] font-bold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-br from-cput-blue to-cput-blue-dark text-white shadow-md shadow-blue-900/20'
                      : 'text-slate-600 hover:text-cput-blue hover:bg-blue-tint/60'
                  }`}
                >
                  <link.icon size={16} />
                  <span>{link.label}</span>
                  {link.to === '/messages' && unreadCount > 0 && (
                    <span className="ml-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}

            {!isSeller && !isAdmin && (
              <Link
                to="/cart"
                className="relative p-2.5 ml-1 text-slate-600 hover:text-cput-blue hover:bg-blue-tint/60 rounded-xl transition-colors"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-gradient-to-br from-red-500 to-red-600 text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-md ring-2 ring-white animate-scale-in">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            <div className="w-px h-6 bg-cput-blue/15 mx-1.5" />

            <button
              onClick={toggleTheme}
              className="grid h-10 w-10 place-items-center rounded-2xl text-slate-500 transition hover:bg-blue-tint hover:text-cput-blue"
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-blue-tint/60 transition-colors"
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
        <div className="border-t border-cput-blue/10 bg-eggshell/95 backdrop-blur-lg px-4 py-3 space-y-1 dark:border-white/10 dark:bg-[#0f1a2b]/95">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-colors ${
                isActive(link.to)
                  ? 'bg-gradient-to-br from-cput-blue to-cput-blue-dark text-white'
                  : 'text-slate-700 hover:bg-blue-tint/60 dark:text-slate-200'
              }`}
            >
              <link.icon size={18} />
              {link.label}
              {link.to === '/messages' && unreadCount > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
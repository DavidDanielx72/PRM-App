// Global authentication context
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../services/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    if (!supabase) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) console.warn('Profile fetch error:', error.message);
    return data;
  };

  useEffect(() => {
    let mounted = true;

    if (!supabaseConfigured || !supabase) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    // 1) Initial session check — this also sets loading to false
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          if (mounted) setProfile(prof);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();

    // 2) Listen for future auth changes
    //    IMPORTANT: we IGNORE 'INITIAL_SESSION' because we already
    //    handle that above — otherwise the callback fires twice
    //    and can trigger re-render loops.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'INITIAL_SESSION') return;

        if (session?.user) {
          setUser(session.user);
          const prof = await fetchProfile(session.user.id);
          if (mounted) setProfile(prof);
        } else {
          setUser(null);
          setProfile(null);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the frontend .env file.');
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  };

  const signUp = async (email, password, fullName, isSeller) => {
    if (!supabase) {
      throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the frontend .env file.');
    }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, is_seller: isSeller } },
    });
    if (error) throw error;

    // If they chose to be a seller, promote the profile once the
    // trigger has finished creating it (runs on next tick).
    if (isSeller && data.user) {
      setTimeout(async () => {
        await supabase
          .from('profiles')
          .update({ role: 'seller', is_seller: true })
          .eq('id', data.user.id);
      }, 1500);
    }
    return data;
  };

  const signOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (!user || !supabase) return;
    const prof = await fetchProfile(user.id);
    setProfile(prof);
  };

  const isStudent = profile?.role === 'student';
  const isSeller = profile?.role === 'seller' || profile?.is_seller === true;
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        isStudent,
        isSeller,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
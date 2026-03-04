// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Pull display name + avatar out of Supabase/Google user metadata
const extractProfile = (user) => {
  if (!user) return { fullName: null, avatarUrl: null };
  const meta = user.user_metadata || {};
  return {
    // Google sends 'full_name' or 'name'; email/password users may have neither
    fullName: meta.full_name || meta.name || user.email?.split('@')[0] || 'User',
    // Google sends 'avatar_url' or 'picture'
    avatarUrl: meta.avatar_url || meta.picture || null,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = (session) => {
    const sessionUser = session?.user ?? null;
    setUser(sessionUser);
    const { fullName, avatarUrl } = extractProfile(sessionUser);
    setFullName(fullName);
    setAvatarUrl(avatarUrl);
  };

  useEffect(() => {
    // 1. Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(session);
      setLoading(false);
    });

    // 2. Listen for changes (login, logout, token refresh, OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = (email, password) => supabase.auth.signUp({ email, password });
  const signIn = (email, password) => supabase.auth.signInWithPassword({ email, password });
  const signOut = () => supabase.auth.signOut();

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });
    return { data, error };
  };

  return (
    <AuthContext.Provider value={{ user, fullName, avatarUrl, signUp, signIn, signOut, signInWithGoogle, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

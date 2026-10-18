// Frontend/src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

const isValidUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  if (url.includes('your_supabase') || url.includes('placeholder')) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

if (isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('your_supabase')) {
  try {
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn('[TalentFit] Failed to initialize Supabase client:', err.message);
  }
}

if (!client) {
  console.warn(
    '[TalentFit] Supabase credentials missing, invalid, or placeholder. ' +
    'Running in safe local fallback mode (Authentication & Cloud History disabled).'
  );
  // Responsive in-memory session for seamless local development
  let currentSession = null;
  const listeners = new Set();

  const notify = (event, session) => {
    listeners.forEach((cb) => {
      try { cb(event, session); } catch {}
    });
  };

  client = {
    auth: {
      getSession: async () => ({ data: { session: currentSession } }),
      onAuthStateChange: (callback) => {
        listeners.add(callback);
        return {
          data: {
            subscription: {
              unsubscribe: () => listeners.delete(callback),
            },
          },
        };
      },
      signInWithPassword: async ({ email, password }) => {
        const demoUser = {
          id: 'demo-local-recruiter-id',
          email: email || 'recruiter@talentfit.ai',
          user_metadata: { full_name: 'Demo Recruiter' },
        };
        currentSession = { user: demoUser, access_token: 'mock-local-token' };
        notify('SIGNED_IN', currentSession);
        return { data: { user: demoUser, session: currentSession }, error: null };
      },
      signUp: async ({ email, password }) => {
        const demoUser = {
          id: 'demo-local-recruiter-id',
          email: email || 'recruiter@talentfit.ai',
          user_metadata: { full_name: 'Demo Recruiter' },
        };
        currentSession = { user: demoUser, access_token: 'mock-local-token' };
        notify('SIGNED_IN', currentSession);
        return { data: { user: demoUser, session: currentSession }, error: null };
      },
      signInWithOAuth: async () => {
        const demoUser = {
          id: 'demo-google-recruiter-id',
          email: 'google.recruiter@example.com',
          user_metadata: { full_name: 'Google Recruiter', avatar_url: '/google-icon.svg' },
        };
        currentSession = { user: demoUser, access_token: 'mock-local-token' };
        notify('SIGNED_IN', currentSession);
        return { data: { user: demoUser, session: currentSession }, error: null };
      },
      signOut: async () => {
        currentSession = null;
        notify('SIGNED_OUT', null);
        return { error: null };
      },
    },
    from: () => ({
      select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [], error: null }) }) }),
      insert: () => ({ select: () => Promise.resolve({ data: [], error: null }) }),
      delete: () => ({ eq: () => Promise.resolve({ data: [], error: null }) }),
    }),
  };
}

export const supabase = client;
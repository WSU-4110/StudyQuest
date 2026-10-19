import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const REMEMBER_KEY = "studyquest-remember-me";

// "Keep me logged in": persist the session in localStorage, otherwise in sessionStorage
// so it is cleared when the browser tab closes. Account study sets only load while signed in,
// so leaving this unchecked makes sets look "gone" after you close the site.
export function setRememberMe(remember) {
    localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
}

function activeStorage() {
    // Default (unset) → localStorage so closing the tab keeps the account session.
    return localStorage.getItem(REMEMBER_KEY) === "false" ? sessionStorage : localStorage;
}

const authStorage = {
    getItem: (key) => activeStorage().getItem(key),
    setItem: (key, value) => activeStorage().setItem(key, value),
    removeItem: (key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    },
};

export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
              storage: authStorage,
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
          },
      })
    : null;

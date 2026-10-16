import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and fill them in.");
}

const REMEMBER_KEY = "studyquest-remember-me";

// "Keep me logged in": persist the session in localStorage, otherwise in sessionStorage
// so it is cleared when the browser tab closes.
export function setRememberMe(remember) {
    localStorage.setItem(REMEMBER_KEY, remember ? "true" : "false");
}

function activeStorage() {
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

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: authStorage,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

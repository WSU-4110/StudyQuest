import { supabase, setRememberMe } from "../lib/supabaseClient.js";

class AuthFacade {
  async signIn(email, password, rememberMe = true) {
    setRememberMe(rememberMe);
    return await supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  async signUp(email, password, displayName) {
    setRememberMe(true);
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: window.location.origin,
      },
    });
  }

  async signInWithGoogle() {
    setRememberMe(true);
    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
  }

  async resetPassword(email) {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
  }

  async signOut() {
    return await supabase.auth.signOut();
  }

  async getSession() {
    return await supabase.auth.getSession();
  }

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authFacade = new AuthFacade();

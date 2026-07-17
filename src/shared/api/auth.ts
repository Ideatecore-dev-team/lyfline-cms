import { supabase } from "../../supabaseClient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'editor';
  createdAt: string;
}

interface SupabaseUserRecord {
  id?: string;
  username?: string;
  email?: string;
  password_hash?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: User }> => {
    // 1. Authenticate with Supabase Auth (sets the session and token automatically)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.error("Auth error:", authError.message);
      throw new Error(
        authError.message === "Invalid login credentials"
          ? "Invalid email or password."
          : authError.message
      );
    }

    if (!authData.user) {
      throw new Error("Invalid email or password.");
    }

    // 2. Query the custom 'users' database table directly for user details (role, username)
    // This runs as the authenticated user, which is allowed by our upcoming RLS policy.
    const { data, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (profileError) {
      console.error("Database query error:", profileError.message);
      throw new Error("Database connection error. Please try again.");
    }

    if (!data) {
      throw new Error("User profile not found in database. Please contact administrator.");
    }

    const profileData = data as SupabaseUserRecord;

    // 3. Map database role to CMS role ('super_admin' | 'admin' | 'editor')
    let cmsRole: 'super_admin' | 'admin' | 'editor' = 'editor';
    if (profileData.role === 'super_admin') {
      cmsRole = 'super_admin';
    } else if (profileData.role === 'admin') {
      cmsRole = 'admin';
    } else if (profileData.role === 'editor') {
      cmsRole = 'editor';
    } else if (profileData.role === 'user') {
      cmsRole = 'editor'; // Map user to editor role
    }

    // 4. Construct user profile matching application model
    const userProfile: User = {
      id: profileData.id || authData.user.id,
      name: profileData.username || email.split('@')[0],
      email: profileData.email || email,
      role: cmsRole,
      createdAt: profileData.created_at || new Date().toISOString(),
    };

    // 5. Save simulated session to localStorage for routing compatibility
    const token = authData.session?.access_token || `custom-session-token-${profileData.id}`;
    localStorage.setItem('lyfline_token', token);
    localStorage.setItem('lyfline_current_user', JSON.stringify(userProfile));

    return { token, user: userProfile };
  },

  logout: async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.removeItem('lyfline_token');
    localStorage.removeItem('lyfline_current_user');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('lyfline_current_user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

/**
 * Supabase Auth Service for Web
 *
 * Web-compatible auth service that integrates with SILIRUAL backend.
 * Wraps Supabase Phone OTP auth and falls back to demo mode.
 */

import { getSupabaseClient, isSupabaseConfigured } from './client';

type UserRole = 'elder' | 'family' | 'caregiver';

interface User {
  id: string;
  phone?: string;
  email?: string;
  displayName: string;
  roles: UserRole[];
  activeRole: UserRole;
  preferredLocale: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Demo auth fallback for when Supabase is not configured
 */
const demoAuth = {
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    // Simulate OTP sending
    await new Promise(resolve => setTimeout(resolve, 500));
    return { success: true, message: 'Demo: Verification code sent. Use 123456.' };
  },

  async verifyOTP(phone: string, code: string, role: UserRole): Promise<{ success: boolean; user?: User; error?: string }> {
    if (code !== '123456') {
      return { success: false, error: 'Invalid code. Use 123456 for demo.' };
    }

    const user: User = {
      id: 'demo-user-id',
      phone,
      displayName: 'Demo User',
      roles: [role],
      activeRole: role,
      preferredLocale: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store demo user in localStorage
    localStorage.setItem('silirual-demo-user', JSON.stringify(user));

    return { success: true, user };
  },

  async continueAsGuest(role: UserRole): Promise<User> {
    const user: User = {
      id: 'guest-user-id',
      displayName: 'Guest',
      roles: [role],
      activeRole: role,
      preferredLocale: 'en',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('silirual-demo-user', JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('silirual-demo-user');
  },

  async getSession(): Promise<User | null> {
    const stored = localStorage.getItem('silirual-demo-user');
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  },
};

export const supabaseAuth = {
  /**
   * Send OTP to phone number
   */
  async sendOTP(phone: string): Promise<{ success: boolean; message: string }> {
    if (!isSupabaseConfigured()) {
      return demoAuth.sendOTP(phone);
    }

    const client = getSupabaseClient()!;
    const { error } = await client.auth.signInWithOtp({ phone });

    if (error) {
      return { success: false, message: error.message };
    }

    return { success: true, message: 'Verification code sent.' };
  },

  /**
   * Verify OTP code
   */
  async verifyOTP(
    phone: string,
    code: string,
    role: UserRole = 'elder',
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!isSupabaseConfigured()) {
      return demoAuth.verifyOTP(phone, code, role);
    }

    const client = getSupabaseClient()!;
    const { data, error } = await client.auth.verifyOtp({
      phone,
      token: code,
      type: 'sms',
    });

    if (error || !data.user) {
      return { success: false, error: error?.message ?? 'Verification failed.' };
    }

    // Update user role in profile
    const { error: profileError } = await client.from('profiles').update({ active_role: role }).eq('id', data.user.id);
    if (profileError) return { success: false, error: profileError.message };

    // Map Supabase user to our User type
    const user: User = {
      id: data.user.id,
      phone: data.user.phone ?? phone,
      email: data.user.email,
      displayName: '',
      roles: [role],
      activeRole: role,
      preferredLocale: 'en',
      createdAt: data.user.created_at ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { success: true, user };
  },

  /**
   * Continue as guest (local-only, same as demo)
   */
  async continueAsGuest(role: UserRole): Promise<User> {
    return demoAuth.continueAsGuest(role);
  },

  /**
   * Get current session
   */
  async getSession(): Promise<User | null> {
    if (!isSupabaseConfigured()) {
      return demoAuth.getSession();
    }

    const client = getSupabaseClient()!;
    const { data } = await client.auth.getSession();

    if (!data.session?.user) return null;

    const u = data.session.user;
    const { data: profile } = await client.from('profiles').select('display_name,preferred_locale,active_role').eq('id', u.id).maybeSingle();
    const role = (profile?.active_role ?? 'elder') as UserRole;

    return {
      id: u.id,
      phone: u.phone,
      email: u.email,
      displayName: profile?.display_name ?? '',
      roles: [role],
      activeRole: role,
      preferredLocale: profile?.preferred_locale ?? 'en',
      createdAt: u.created_at ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Logout
   */
  async logout(): Promise<void> {
    if (isSupabaseConfigured()) {
      const client = getSupabaseClient()!;
      await client.auth.signOut();
    }
    await demoAuth.logout();
  },
};
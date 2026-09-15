/**
 * Supabase Client for Web
 *
 * Web-compatible Supabase client that integrates with the SILIRUAL backend.
 * Falls back to demo mode if credentials are not configured.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase: SupabaseClient | null = null;

/**
 * Check if Supabase credentials are configured
 */
export function isSupabaseConfigured(): boolean {
  return !!(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_URL.includes('supabase'));
}

/**
 * Get the Supabase client instance.
 * Returns null if credentials are not configured (demo mode).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storage: localStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }

  return supabase;
}

/**
 * Get the current authenticated user ID, or null
 */
export async function getCurrentUserId(): Promise<string | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data } = await client.auth.getUser();
  return data.user?.id ?? null;
}
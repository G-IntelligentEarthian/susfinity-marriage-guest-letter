import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GuestNote } from './types';

// Read environmental variables
// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseUrl && supabaseAnonKey) {
    if (!supabaseClient) {
      try {
        supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
        console.log('✔ Supabase connected successfully.');
      } catch (err) {
        console.error('⚠ Failed to initialize Supabase client:', err);
      }
    }
    return supabaseClient;
  }
  return null;
}

// Safe fallback helper for sandboxed contexts where crypto.randomUUID is absent
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Low-overhead persistent localStorage manager for zero-config offline runs
const LOCAL_STORAGE_KEY = 'susfinity_guest_letters';

export const localDb = {
  getNotes(): GuestNote[] {
    try {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Error fetching from localStorage:', e);
      return [];
    }
  },

  insertNote(note: GuestNote): void {
    try {
      const current = this.getNotes();
      const updated = [
        ...current,
        {
          ...note,
          id: note.id || generateUUID(),
          created_at: note.created_at || new Date().toISOString(),
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }
};

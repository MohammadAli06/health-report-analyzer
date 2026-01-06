import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Create a mock client if credentials are not configured
const isMockMode = !supabaseUrl || !supabaseAnonKey ||
    supabaseUrl === 'your_supabase_project_url';

export const supabase = isMockMode
    ? createMockClient()
    : createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
            // Persist session in localStorage
            persistSession: true,
            // Auto-refresh tokens before expiry
            autoRefreshToken: true,
            // Detect session from URL (for OAuth redirects)
            detectSessionInUrl: true,
            // Storage for session persistence
            storage: typeof window !== 'undefined' ? window.localStorage : undefined,
            // Key for localStorage
            storageKey: 'medinsight-auth',
            // Flow type for PKCE
            flowType: 'pkce',
        },
    });

// Mock client for demo when Supabase is not configured
function createMockClient() {
    console.warn('Supabase not configured. Running in demo mode.');

    return {
        auth: {
            getSession: async () => ({ data: { session: null }, error: null }),
            onAuthStateChange: (callback: any) => ({
                data: { subscription: { unsubscribe: () => { } } }
            }),
            signUp: async () => ({ data: null, error: { message: 'Configure Supabase for auth' } }),
            signInWithPassword: async () => ({ data: null, error: { message: 'Configure Supabase for auth' } }),
            signInWithOAuth: async () => ({ data: null, error: { message: 'Configure Supabase for auth' } }),
            signOut: async () => ({ error: null }),
        },
        from: (table: string) => ({
            select: () => ({
                eq: () => ({
                    single: async () => ({ data: null, error: null }),
                    gte: () => ({ order: () => ({ execute: async () => ({ data: [], error: null }) }) }),
                    order: () => ({ data: [], error: null }),
                }),
                order: () => ({ data: [], error: null }),
            }),
            insert: () => ({ data: null, error: null }),
            update: () => ({ eq: () => ({ data: null, error: null }) }),
            delete: () => ({ eq: () => ({ data: null, error: null }) }),
        }),
        storage: {
            from: () => ({
                upload: async () => ({ data: null, error: null }),
                getPublicUrl: () => ({ data: { publicUrl: '' } }),
            }),
        },
    } as any;
}

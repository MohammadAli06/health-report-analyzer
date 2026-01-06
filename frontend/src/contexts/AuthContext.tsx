'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface UserProfile {
    id: string;
    user_id: string;
    email?: string;
    full_name?: string;
    date_of_birth?: string;
    gender?: string;
    height_cm?: number;
    weight_kg?: number;
    blood_type?: string;
    smoking_status?: string;
    activity_level?: string;
    known_conditions?: string[];
    allergies?: string[];
    medications?: string[];
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signInWithGoogle: () => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: Error | null }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    // Ensure profile exists in SQLite - create if not found
    const ensureProfile = async (userId: string, email?: string, fullName?: string) => {
        try {
            // First try to fetch existing profile
            const response = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`);
            const data = await response.json();

            if (data.profile) {
                return data.profile as UserProfile;
            }

            // Profile doesn't exist - create it
            console.log('Creating profile in SQLite for user:', userId);
            const createResponse = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email || '',
                    full_name: fullName || ''
                })
            });

            if (createResponse.ok) {
                const createData = await createResponse.json();
                console.log('✓ Profile created in SQLite');
                // Fetch the full profile
                const refetch = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`);
                const refetchData = await refetch.json();
                return refetchData.profile as UserProfile;
            }

            return null;
        } catch (err) {
            console.log('Profile ensure failed:', err);
            return null;
        }
    };

    useEffect(() => {
        // Get initial session
        supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: any } }) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Ensure profile exists in SQLite
                const profile = await ensureProfile(
                    session.user.id,
                    session.user.email,
                    session.user.user_metadata?.full_name
                );
                setProfile(profile);
            }

            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
            setSession(session);
            setUser(session?.user ?? null);

            if (session?.user) {
                // Ensure profile exists in SQLite on every auth change
                const profile = await ensureProfile(
                    session.user.id,
                    session.user.email,
                    session.user.user_metadata?.full_name
                );
                setProfile(profile);
            } else {
                setProfile(null);
            }

            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, fullName: string) => {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            // Profile will be created automatically via ensureProfile on auth state change
            return { error };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            return { error };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            return { error };
        } catch (err) {
            return { error: err as Error };
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setProfile(null);
        setSession(null);
    };

    // Update profile via backend API
    const updateProfile = async (updates: Partial<UserProfile>) => {
        if (!user) return { error: new Error('Not authenticated') };

        try {
            console.log('Updating profile:', updates);

            // Convert arrays to comma-separated strings for backend
            const payload: any = { ...updates };
            if (Array.isArray(payload.known_conditions)) {
                payload.known_conditions = payload.known_conditions.join(', ');
            }
            if (Array.isArray(payload.allergies)) {
                payload.allergies = payload.allergies.join(', ');
            }
            if (Array.isArray(payload.medications)) {
                payload.medications = payload.medications.join(', ');
            }

            const response = await fetch(`${API_BASE_URL}/api/users/profile/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('Profile update response:', response.status);

            if (response.ok) {
                // Update local state
                setProfile(prev => prev ? { ...prev, ...updates } : null);
                console.log('✓ Profile updated successfully');
                return { error: null };
            } else {
                const data = await response.json();
                console.error('Profile update failed:', data);
                return { error: new Error(data.detail || 'Failed to update profile') };
            }
        } catch (err) {
            console.error('Profile update error:', err);
            return { error: err as Error };
        }
    };

    const refreshProfile = async () => {
        if (user) {
            const profile = await ensureProfile(user.id, user.email);
            setProfile(profile);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                session,
                loading,
                signUp,
                signIn,
                signInWithGoogle,
                signOut,
                updateProfile,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

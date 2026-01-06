'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
    const router = useRouter();

    useEffect(() => {
        supabase.auth.onAuthStateChange((event: any, session: any) => {
            if (event === 'SIGNED_IN' && session) {
                router.push('/dashboard');
            }
        });
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-zinc-400">Completing sign in...</p>
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    User, Calendar, Ruler, Weight, Droplets, Heart,
    Activity, Pill, AlertCircle, Save, Loader2, ArrowLeft,
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function ProfilePage() {
    const { user, profile, updateProfile, loading: authLoading } = useAuth();
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        date_of_birth: '',
        gender: '',
        height_cm: '',
        weight_kg: '',
        blood_type: '',
        smoking_status: '',
        activity_level: '',
        known_conditions: '',
        allergies: '',
        medications: '',
    });

    useEffect(() => {
        if (profile) {
            setFormData({
                full_name: profile.full_name || '',
                date_of_birth: profile.date_of_birth || '',
                gender: profile.gender || '',
                height_cm: profile.height_cm?.toString() || '',
                weight_kg: profile.weight_kg?.toString() || '',
                blood_type: profile.blood_type || '',
                smoking_status: profile.smoking_status || '',
                activity_level: profile.activity_level || '',
                known_conditions: Array.isArray(profile.known_conditions)
                    ? profile.known_conditions.join(', ')
                    : profile.known_conditions || '',
                allergies: Array.isArray(profile.allergies)
                    ? profile.allergies.join(', ')
                    : profile.allergies || '',
                medications: Array.isArray(profile.medications)
                    ? profile.medications.join(', ')
                    : profile.medications || '',
            });
        }
    }, [profile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaved(false);

        const updates = {
            full_name: formData.full_name,
            date_of_birth: formData.date_of_birth || undefined,
            gender: formData.gender || undefined,
            height_cm: formData.height_cm ? parseFloat(formData.height_cm) : undefined,
            weight_kg: formData.weight_kg ? parseFloat(formData.weight_kg) : undefined,
            blood_type: formData.blood_type || undefined,
            smoking_status: formData.smoking_status || undefined,
            activity_level: formData.activity_level || undefined,
            known_conditions: formData.known_conditions
                ? formData.known_conditions.split(',').map(s => s.trim()).filter(Boolean)
                : [],
            allergies: formData.allergies
                ? formData.allergies.split(',').map(s => s.trim()).filter(Boolean)
                : [],
            medications: formData.medications
                ? formData.medications.split(',').map(s => s.trim()).filter(Boolean)
                : [],
        };

        await updateProfile(updates);
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-zinc-400 mb-4">Please sign in to view your profile</p>
                    <Link href="/auth" className="gradient-btn">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-28 pb-12">
                <div className="container-custom max-w-3xl">
                    {/* Back Button */}
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Dashboard
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-8"
                    >
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white">
                                {formData.full_name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Health Profile</h1>
                                <p className="text-zinc-400">{user.email}</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-indigo-400" />
                                    Basic Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.full_name}
                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.date_of_birth}
                                            onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                            style={{ colorScheme: 'dark' }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                            <option value="prefer_not_to_say">Prefer not to say</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Blood Type</label>
                                        <select
                                            value={formData.blood_type}
                                            onChange={(e) => setFormData({ ...formData, blood_type: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Physical Stats */}
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Ruler className="w-5 h-5 text-indigo-400" />
                                    Physical Stats
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Height (cm)</label>
                                        <input
                                            type="number"
                                            value={formData.height_cm}
                                            onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                                            placeholder="e.g., 175"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Weight (kg)</label>
                                        <input
                                            type="number"
                                            value={formData.weight_kg}
                                            onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                                            placeholder="e.g., 70"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Lifestyle */}
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-indigo-400" />
                                    Lifestyle
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Smoking Status</label>
                                        <select
                                            value={formData.smoking_status}
                                            onChange={(e) => setFormData({ ...formData, smoking_status: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="never">Never smoked</option>
                                            <option value="former">Former smoker</option>
                                            <option value="current">Current smoker</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Activity Level</label>
                                        <select
                                            value={formData.activity_level}
                                            onChange={(e) => setFormData({ ...formData, activity_level: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        >
                                            <option value="">Select...</option>
                                            <option value="sedentary">Sedentary</option>
                                            <option value="light">Lightly Active</option>
                                            <option value="moderate">Moderately Active</option>
                                            <option value="active">Active</option>
                                            <option value="very_active">Very Active</option>
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* Medical History */}
                            <section>
                                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                    <Heart className="w-5 h-5 text-indigo-400" />
                                    Medical History
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">
                                            Known Conditions (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.known_conditions}
                                            onChange={(e) => setFormData({ ...formData, known_conditions: e.target.value })}
                                            placeholder="e.g., Diabetes, Hypertension"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">
                                            Allergies (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.allergies}
                                            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                            placeholder="e.g., Penicillin, Peanuts"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">
                                            Current Medications (comma-separated)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.medications}
                                            onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                            placeholder="e.g., Metformin, Aspirin"
                                            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* AI Context Note */}
                            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                                <p className="text-sm text-indigo-300 flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    Your health profile helps AI provide personalized explanations based on your age, gender, and conditions.
                                </p>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full gradient-btn py-3 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : saved ? (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        Saved!
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Save Profile
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

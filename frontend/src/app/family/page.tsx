'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Plus, Edit2, Trash2, User, Loader2,
    ArrowLeft, Check, X, Mail, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface FamilyMember {
    id: string;
    name: string;
    relationship: string;
    date_of_birth?: string;
    gender?: string;
    email?: string;
    is_default: boolean;
}

export default function FamilyPage() {
    const { user, loading: authLoading } = useAuth();
    const [members, setMembers] = useState<FamilyMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        relationship: 'self',
        date_of_birth: '',
        gender: '',
        email: '',
    });

    useEffect(() => {
        if (user) fetchMembers();
    }, [user]);

    const fetchMembers = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/family/${user.id}`);
            if (response.ok) {
                const data = await response.json();
                setMembers(data.members || []);
            }
        } catch (err) {
            console.error('Error fetching family members:', err);
        } finally {
            setLoading(false);
        }
    };

    const validateEmail = async (email: string): Promise<boolean> => {
        if (!email) return true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/validate-email/${email}`);
            const data = await response.json();

            if (!data.exists) {
                setEmailError('This email is not registered. Ask them to create an account first.');
                return false;
            }

            setEmailError(null);
            return true;
        } catch (err) {
            setEmailError('Could not verify email.');
            return false;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !formData.name.trim()) return;

        if (formData.email) {
            const isValidEmail = await validateEmail(formData.email);
            if (!isValidEmail) return;
        }

        setSaving(true);

        try {
            let response;

            if (editingId) {
                response = await fetch(`${API_BASE_URL}/api/users/family/member/${editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch(`${API_BASE_URL}/api/users/family/${user.id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...formData,
                        is_default: members.length === 0
                    })
                });
            }

            if (response.ok) {
                await fetchMembers();
                resetForm();
            }
        } catch (err) {
            console.error('Error saving member:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this family member?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/api/users/family/member/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                await fetchMembers();
            }
        } catch (err) {
            console.error('Error deleting member:', err);
        }
    };

    const handleSetDefault = async (id: string) => {
        if (!user) return;
        // For now, just update locally - backend would handle this
        setMembers(prev => prev.map(m => ({ ...m, is_default: m.id === id })));
    };

    const resetForm = () => {
        setFormData({ name: '', relationship: 'self', date_of_birth: '', gender: '', email: '' });
        setShowForm(false);
        setEditingId(null);
        setEmailError(null);
    };

    const startEdit = (member: FamilyMember) => {
        setFormData({
            name: member.name,
            relationship: member.relationship,
            date_of_birth: member.date_of_birth || '',
            gender: member.gender || '',
            email: member.email || '',
        });
        setEditingId(member.id);
        setShowForm(true);
        setEmailError(null);
    };

    if (authLoading || loading) {
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
                    <p className="text-zinc-400 mb-4">Please sign in to manage family members</p>
                    <Link href="/auth" className="gradient-btn">Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-28 pb-12">
                <div className="container-custom max-w-3xl">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                        <Link href="/dashboard" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors w-fit">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">Family Members</h1>
                            <p className="text-zinc-400 text-sm">Manage health profiles for your family</p>
                        </div>
                        {!showForm && (
                            <button
                                onClick={() => setShowForm(true)}
                                className="gradient-btn flex items-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Add Member
                            </button>
                        )}
                    </div>

                    {/* Add/Edit Form */}
                    <AnimatePresence>
                        {showForm && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="glass-card p-6 mb-6"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">
                                    {editingId ? 'Edit Member' : 'Add Family Member'}
                                </h2>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">Name *</label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">Relationship</label>
                                            <select
                                                value={formData.relationship}
                                                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                            >
                                                <option value="self">Self</option>
                                                <option value="spouse">Spouse</option>
                                                <option value="child">Child</option>
                                                <option value="parent">Parent</option>
                                                <option value="sibling">Sibling</option>
                                                <option value="other">Other</option>
                                            </select>
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
                                            </select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm text-zinc-400 mb-2">
                                                <Mail className="w-4 h-4 inline mr-1" />
                                                Link to Account (Optional)
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => {
                                                    setFormData({ ...formData, email: e.target.value });
                                                    setEmailError(null);
                                                }}
                                                placeholder="Enter their registered email"
                                                className={`w-full px-4 py-3 rounded-xl bg-white/5 border text-white focus:outline-none ${emailError ? 'border-red-500' : 'border-white/10 focus:border-indigo-500'
                                                    }`}
                                            />
                                            {emailError && (
                                                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {emailError}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            type="submit"
                                            disabled={saving || !!emailError}
                                            className="gradient-btn flex items-center gap-2"
                                        >
                                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                            {editingId ? 'Update' : 'Add'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={resetForm}
                                            className="px-4 py-2 rounded-xl bg-white/5 text-zinc-300 hover:bg-white/10 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Members List */}
                    {members.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <Users className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">No Family Members</h2>
                            <p className="text-zinc-400 mb-6">Add family members to track health reports.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {members.map((member) => (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                                        {member.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h3 className="text-white font-semibold">{member.name}</h3>
                                            {member.is_default && (
                                                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-zinc-400 text-sm capitalize">{member.relationship}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!member.is_default && (
                                            <button
                                                onClick={() => handleSetDefault(member.id)}
                                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                                title="Set as default"
                                            >
                                                <User className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => startEdit(member)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(member.id)}
                                            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Calendar, AlertTriangle, RefreshCw, Stethoscope, Check, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Reminder {
    id: string;
    test_name: string;
    reminder_type: string;
    message: string;
    due_date: string;
    is_read: boolean;
    created_at: string;
}

export default function SmartAlerts() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) fetchReminders();
    }, [user]);

    const fetchReminders = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('reminders')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_dismissed', false)
                .order('due_date', { ascending: true });

            if (!error && data) {
                setReminders(data);
            }
        } catch (err) {
            console.error('Error fetching reminders:', err);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await supabase
                .from('reminders')
                .update({ is_read: true })
                .eq('id', id);

            setReminders(prev => prev.map(r =>
                r.id === id ? { ...r, is_read: true } : r
            ));
        } catch (err) {
            console.error('Error marking as read:', err);
        }
    };

    const dismiss = async (id: string) => {
        try {
            await supabase
                .from('reminders')
                .update({ is_dismissed: true })
                .eq('id', id);

            setReminders(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            console.error('Error dismissing:', err);
        }
    };

    const unreadCount = reminders.filter(r => !r.is_read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'retest': return <RefreshCw className="w-4 h-4" />;
            case 'consultation': return <Stethoscope className="w-4 h-4" />;
            default: return <AlertTriangle className="w-4 h-4" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'retest': return 'text-amber-400 bg-amber-500/20';
            case 'consultation': return 'text-red-400 bg-red-500/20';
            default: return 'text-blue-400 bg-blue-500/20';
        }
    };

    if (!user) return null;

    return (
        <div className="relative">
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
                <Bell className="w-5 h-5 text-zinc-400" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 glass-card rounded-xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="text-white font-semibold">Alerts & Reminders</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-white/10 rounded transition-colors"
                                >
                                    <X className="w-4 h-4 text-zinc-400" />
                                </button>
                            </div>

                            <div className="max-h-80 overflow-y-auto">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                                    </div>
                                ) : reminders.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                                        <p className="text-zinc-400 text-sm">No reminders</p>
                                    </div>
                                ) : (
                                    reminders.map((reminder) => (
                                        <motion.div
                                            key={reminder.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`p-4 border-b border-white/5 hover:bg-white/5 ${!reminder.is_read ? 'bg-indigo-500/5' : ''
                                                }`}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getColor(reminder.reminder_type)}`}>
                                                    {getIcon(reminder.reminder_type)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm">{reminder.message}</p>
                                                    {reminder.test_name && (
                                                        <p className="text-zinc-500 text-xs mt-1">{reminder.test_name}</p>
                                                    )}
                                                    {reminder.due_date && (
                                                        <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                                                            <Calendar className="w-3 h-3" />
                                                            {new Date(reminder.due_date).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    {!reminder.is_read && (
                                                        <button
                                                            onClick={() => markAsRead(reminder.id)}
                                                            className="p-1 hover:bg-white/10 rounded transition-colors"
                                                            title="Mark as read"
                                                        >
                                                            <Check className="w-4 h-4 text-zinc-400" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => dismiss(reminder.id)}
                                                        className="p-1 hover:bg-white/10 rounded transition-colors"
                                                        title="Dismiss"
                                                    >
                                                        <X className="w-4 h-4 text-zinc-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

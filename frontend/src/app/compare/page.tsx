'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Minus,
    Calendar, Loader2, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { getUserReports, getTestResults } from '@/lib/api';

interface Report {
    id: string;
    created_at: string;
    file_name: string;
    health_score: number;
    patient_name?: string;
}

interface TestResult {
    test_name: string;
    observed_value: string;
    unit: string;
    status: string;
    severity: string;
}

interface ComparisonResult {
    test_name: string;
    unit: string;
    before: { value: string; status: string };
    after: { value: string; status: string };
    change: 'improved' | 'worsened' | 'stable' | 'new';
    percentChange: number;
}

export default function ComparePage() {
    const { user, loading: authLoading } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [comparing, setComparing] = useState(false);
    const [selectedBefore, setSelectedBefore] = useState<string>('');
    const [selectedAfter, setSelectedAfter] = useState<string>('');
    const [comparison, setComparison] = useState<ComparisonResult[]>([]);

    useEffect(() => {
        if (user) fetchReports();
    }, [user]);

    const fetchReports = async () => {
        if (!user) return;
        setLoading(true);

        try {
            const data = await getUserReports(user.id);
            if (data && data.length > 0) {
                setReports(data);
                if (data.length >= 2) {
                    setSelectedAfter(data[0].id);
                    setSelectedBefore(data[1].id);
                }
            }
        } catch (err) {
            console.error('Error fetching reports:', err);
        } finally {
            setLoading(false);
        }
    };

    const compareReports = async () => {
        if (!selectedBefore || !selectedAfter) return;
        setComparing(true);

        try {
            // Fetch test results for both reports from API
            const [beforeTests, afterTests] = await Promise.all([
                getTestResults(selectedBefore),
                getTestResults(selectedAfter),
            ]);

            // Create comparison
            const comparisonMap = new Map<string, ComparisonResult>();

            // Add before tests
            beforeTests.forEach((test: TestResult) => {
                comparisonMap.set(test.test_name, {
                    test_name: test.test_name,
                    unit: test.unit,
                    before: { value: test.observed_value, status: test.status },
                    after: { value: '-', status: '' },
                    change: 'stable',
                    percentChange: 0,
                });
            });

            // Add/update after tests
            afterTests.forEach((test: TestResult) => {
                const existing = comparisonMap.get(test.test_name);
                if (existing) {
                    existing.after = { value: test.observed_value, status: test.status };

                    // Calculate percent change
                    const beforeVal = parseFloat(existing.before.value);
                    const afterVal = parseFloat(test.observed_value);

                    if (!isNaN(beforeVal) && !isNaN(afterVal) && beforeVal !== 0) {
                        existing.percentChange = ((afterVal - beforeVal) / beforeVal) * 100;

                        // Determine if improved or worsened (simplified: assume lower is better for abnormal)
                        if (Math.abs(existing.percentChange) < 5) {
                            existing.change = 'stable';
                        } else if (test.status === 'NORMAL' && existing.before.status !== 'NORMAL') {
                            existing.change = 'improved';
                        } else if (test.status !== 'NORMAL' && existing.before.status === 'NORMAL') {
                            existing.change = 'worsened';
                        } else if (existing.percentChange < 0 && existing.before.status !== 'NORMAL') {
                            existing.change = 'improved';
                        } else if (existing.percentChange > 0 && existing.before.status !== 'NORMAL') {
                            existing.change = 'worsened';
                        }
                    }
                } else {
                    comparisonMap.set(test.test_name, {
                        test_name: test.test_name,
                        unit: test.unit,
                        before: { value: '-', status: '' },
                        after: { value: test.observed_value, status: test.status },
                        change: 'new',
                        percentChange: 0,
                    });
                }
            });

            setComparison(Array.from(comparisonMap.values()));
        } catch (err) {
            console.error('Comparison error:', err);
        } finally {
            setComparing(false);
        }
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
                    <p className="text-zinc-400 mb-4">Please sign in to compare reports</p>
                    <Link href="/auth" className="gradient-btn">Sign In</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1 pt-28 pb-12">
                <div className="container-custom">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
                        <Link href="/dashboard" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors w-fit">
                            <ArrowLeft className="w-5 h-5 text-zinc-400" />
                        </Link>
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-white">Compare Reports</h1>
                            <p className="text-zinc-400 text-sm">
                                Select from your {reports.length} uploaded reports to compare changes over time
                            </p>
                        </div>
                    </div>

                    {reports.length < 2 ? (
                        <div className="glass-card p-8 sm:p-12 text-center">
                            <BarChart3 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">Need More Reports</h2>
                            <p className="text-zinc-400 mb-6">
                                You have {reports.length} report{reports.length !== 1 ? 's' : ''}.
                                Upload at least 2 reports to compare them.
                            </p>
                            <Link href="/dashboard" className="gradient-btn">Upload Report</Link>
                        </div>
                    ) : (
                        <>
                            {/* Report Selection */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="glass-card p-6">
                                    <label className="block text-zinc-400 text-sm mb-3">Before (Older Report)</label>
                                    <select
                                        value={selectedBefore}
                                        onChange={(e) => setSelectedBefore(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        {reports.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {new Date(r.created_at).toLocaleDateString()} - {r.file_name || 'Report'}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="glass-card p-6">
                                    <label className="block text-zinc-400 text-sm mb-3">After (Newer Report)</label>
                                    <select
                                        value={selectedAfter}
                                        onChange={(e) => setSelectedAfter(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:border-indigo-500 focus:outline-none"
                                    >
                                        {reports.map((r) => (
                                            <option key={r.id} value={r.id}>
                                                {new Date(r.created_at).toLocaleDateString()} - {r.file_name || 'Report'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="text-center mb-8">
                                <button
                                    onClick={compareReports}
                                    disabled={comparing || !selectedBefore || !selectedAfter}
                                    className="gradient-btn inline-flex items-center gap-2"
                                >
                                    {comparing ? <Loader2 className="w-5 h-5 animate-spin" /> : <BarChart3 className="w-5 h-5" />}
                                    Compare Reports
                                </button>
                            </div>

                            {/* Comparison Results */}
                            {comparison.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card overflow-hidden"
                                >
                                    <div className="p-4 border-b border-white/10">
                                        <h2 className="text-lg font-semibold text-white">Comparison Results</h2>
                                    </div>

                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="text-left p-4 text-zinc-400 font-medium">Test</th>
                                                    <th className="text-center p-4 text-zinc-400 font-medium">Before</th>
                                                    <th className="text-center p-4 text-zinc-400 font-medium">After</th>
                                                    <th className="text-center p-4 text-zinc-400 font-medium">Change</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {comparison.map((item, i) => (
                                                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                                                        <td className="p-4 text-white font-medium">{item.test_name}</td>
                                                        <td className="p-4 text-center">
                                                            <span className={`${getStatusColor(item.before.status)}`}>
                                                                {item.before.value} {item.unit}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <span className={`${getStatusColor(item.after.status)}`}>
                                                                {item.after.value} {item.unit}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <ChangeIndicator change={item.change} percent={item.percentChange} />
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

function getStatusColor(status: string): string {
    switch (status) {
        case 'NORMAL': return 'text-emerald-400';
        case 'LOW': case 'HIGH': return 'text-amber-400';
        default: return 'text-zinc-400';
    }
}

function ChangeIndicator({ change, percent }: { change: string; percent: number }) {
    const config = {
        improved: { icon: ArrowDown, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Improved' },
        worsened: { icon: ArrowUp, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Worsened' },
        stable: { icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-500/20', label: 'Stable' },
        new: { icon: ArrowRight, color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'New' },
    }[change] || { icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-500/20', label: '' };

    const Icon = config.icon;

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${config.bg} ${config.color}`}>
            <Icon className="w-4 h-4" />
            {percent !== 0 && change !== 'new' && `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`}
        </span>
    );
}

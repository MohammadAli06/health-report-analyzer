'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Minus, Calendar, Filter,
    ArrowLeft, Loader2, ChevronDown, Activity
} from 'lucide-react';
import Link from 'next/link';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Legend
} from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface HistoricalTest {
    date: string;
    value: number;
    status: string;
}

interface TestHistory {
    test_name: string;
    unit: string;
    data: HistoricalTest[];
    trend: 'improving' | 'stable' | 'worsening';
    current: number;
    previous: number;
}

export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(true);
    const [testHistories, setTestHistories] = useState<TestHistory[]>([]);
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    const [timeRange, setTimeRange] = useState<'3m' | '6m' | '1y' | 'all'>('6m');

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user, timeRange]);

    const fetchHistory = async () => {
        if (!user) return;
        setLoading(true);

        try {
            // Fetch from backend API
            const response = await fetch(`${API_BASE_URL}/api/reports/user/${user.id}/history`);

            if (!response.ok) {
                throw new Error('Failed to fetch history');
            }

            const data = await response.json();
            const reports = data.reports || [];

            // Calculate date range
            const now = new Date();
            let startDate = new Date();
            switch (timeRange) {
                case '3m': startDate.setMonth(now.getMonth() - 3); break;
                case '6m': startDate.setMonth(now.getMonth() - 6); break;
                case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
                default: startDate = new Date('2000-01-01');
            }

            // Filter by date
            const filteredReports = reports.filter((r: any) =>
                new Date(r.created_at) >= startDate
            );

            // Group by test name and build history
            const testMap = new Map<string, TestHistory>();

            filteredReports.forEach((report: any) => {
                const date = new Date(report.created_at).toLocaleDateString();

                report.test_results?.forEach((result: any) => {
                    const value = parseFloat(result.observed_value);
                    if (isNaN(value)) return;

                    if (!testMap.has(result.test_name)) {
                        testMap.set(result.test_name, {
                            test_name: result.test_name,
                            unit: result.unit || '',
                            data: [],
                            trend: 'stable',
                            current: 0,
                            previous: 0,
                        });
                    }

                    const history = testMap.get(result.test_name)!;
                    history.data.push({
                        date,
                        value,
                        status: result.status,
                    });
                });
            });

            // Calculate trends
            testMap.forEach((history) => {
                if (history.data.length >= 2) {
                    history.current = history.data[history.data.length - 1].value;
                    history.previous = history.data[history.data.length - 2].value;

                    const change = history.current - history.previous;
                    const percentChange = (change / history.previous) * 100;

                    // Determine if improving (depends on test - simplify: assume higher is worse)
                    if (Math.abs(percentChange) < 5) {
                        history.trend = 'stable';
                    } else if (percentChange < 0) {
                        history.trend = 'improving';
                    } else {
                        history.trend = 'worsening';
                    }
                }
            });

            setTestHistories(Array.from(testMap.values()).filter(h => h.data.length >= 1));

            if (testMap.size > 0 && !selectedTest) {
                setSelectedTest(Array.from(testMap.keys())[0]);
            }
        } catch (err) {
            console.error('Error fetching history:', err);
        } finally {
            setLoading(false);
        }
    };

    const selectedHistory = selectedTest
        ? testHistories.find(h => h.test_name === selectedTest)
        : null;

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
                    <p className="text-zinc-400 mb-4">Please sign in to view your history</p>
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
                <div className="container-custom">
                    {/* Back Button & Title */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard"
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-zinc-400" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Health History</h1>
                                <p className="text-zinc-400 text-sm">Track your test results over time</p>
                            </div>
                        </div>

                        {/* Time Range Filter */}
                        <div className="flex items-center gap-2">
                            {(['3m', '6m', '1y', 'all'] as const).map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-white/5 text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {range === 'all' ? 'All Time' : range.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                        </div>
                    ) : testHistories.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-12 text-center"
                        >
                            <Activity className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-white mb-2">No History Yet</h2>
                            <p className="text-zinc-400 mb-6">
                                Upload multiple reports over time to track your health trends.
                            </p>
                            <Link href="/dashboard" className="gradient-btn">
                                Upload Report
                            </Link>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Test List */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-4"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">Tests</h2>
                                <div className="space-y-2">
                                    {testHistories.map((history) => (
                                        <button
                                            key={history.test_name}
                                            onClick={() => setSelectedTest(history.test_name)}
                                            className={`w-full p-3 rounded-xl text-left transition-colors ${selectedTest === history.test_name
                                                ? 'bg-indigo-500/20 border border-indigo-500/30'
                                                : 'bg-white/5 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-white font-medium">{history.test_name}</span>
                                                <TrendIndicator trend={history.trend} />
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-sm text-zinc-400">
                                                <span>{history.current} {history.unit}</span>
                                                <span>•</span>
                                                <span>{history.data.length} records</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="lg:col-span-2 glass-card p-6"
                            >
                                {selectedHistory ? (
                                    <>
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h2 className="text-xl font-semibold text-white">
                                                    {selectedHistory.test_name}
                                                </h2>
                                                <p className="text-zinc-400 text-sm">
                                                    {selectedHistory.data.length} measurements
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <TrendIndicator trend={selectedHistory.trend} showLabel />
                                            </div>
                                        </div>

                                        <div className="h-80">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={selectedHistory.data}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                                    <XAxis
                                                        dataKey="date"
                                                        stroke="#9CA3AF"
                                                        fontSize={12}
                                                    />
                                                    <YAxis
                                                        stroke="#9CA3AF"
                                                        fontSize={12}
                                                        domain={['dataMin - 10', 'dataMax + 10']}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: '#1F2937',
                                                            border: '1px solid #374151',
                                                            borderRadius: '8px',
                                                        }}
                                                        labelStyle={{ color: '#fff' }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="value"
                                                        stroke="#6366F1"
                                                        strokeWidth={3}
                                                        dot={{ fill: '#6366F1', strokeWidth: 2 }}
                                                        activeDot={{ r: 8 }}
                                                    />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>

                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 mt-6">
                                            <div className="p-4 rounded-xl bg-white/5">
                                                <p className="text-zinc-400 text-sm">Current</p>
                                                <p className="text-2xl font-bold text-white">
                                                    {selectedHistory.current}
                                                    <span className="text-sm text-zinc-400 ml-1">{selectedHistory.unit}</span>
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5">
                                                <p className="text-zinc-400 text-sm">Previous</p>
                                                <p className="text-2xl font-bold text-white">
                                                    {selectedHistory.previous || '-'}
                                                    <span className="text-sm text-zinc-400 ml-1">{selectedHistory.unit}</span>
                                                </p>
                                            </div>
                                            <div className="p-4 rounded-xl bg-white/5">
                                                <p className="text-zinc-400 text-sm">Change</p>
                                                <p className={`text-2xl font-bold ${selectedHistory.trend === 'improving' ? 'text-emerald-400' :
                                                    selectedHistory.trend === 'worsening' ? 'text-red-400' :
                                                        'text-zinc-400'
                                                    }`}>
                                                    {selectedHistory.previous ? (
                                                        ((selectedHistory.current - selectedHistory.previous) / selectedHistory.previous * 100).toFixed(1)
                                                    ) : '-'}%
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-80 text-zinc-500">
                                        Select a test to view its history
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}

function TrendIndicator({ trend, showLabel = false }: { trend: string; showLabel?: boolean }) {
    const config = {
        improving: { icon: TrendingDown, color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Improving' },
        stable: { icon: Minus, color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Stable' },
        worsening: { icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Worsening' },
    }[trend] || { icon: Minus, color: 'text-zinc-400', bg: 'bg-zinc-500/20', label: 'Unknown' };

    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${config.bg}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
            {showLabel && <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>}
        </div>
    );
}

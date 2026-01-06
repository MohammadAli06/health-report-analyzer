'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import type { TestResult } from '@/lib/api';

interface HealthScoreGaugeProps {
    score: number;
    tests: TestResult[];
}

export default function HealthScoreGauge({ score, tests }: HealthScoreGaugeProps) {
    const stats = useMemo(() => {
        const normal = tests.filter((t) => t.status === 'NORMAL').length;
        const abnormal = tests.filter((t) =>
            ['LOW', 'HIGH'].includes(t.status || '')
        ).length;
        const critical = tests.filter((t) => t.severity === 'red').length;
        const unknown = tests.filter((t) => t.status === 'UNKNOWN').length;

        return { normal, abnormal, critical, unknown, total: tests.length };
    }, [tests]);

    const getScoreColor = () => {
        if (score >= 80) return { stroke: '#10b981', label: 'Excellent', bg: 'from-emerald-500/20' };
        if (score >= 60) return { stroke: '#f59e0b', label: 'Good', bg: 'from-amber-500/20' };
        if (score >= 40) return { stroke: '#f97316', label: 'Fair', bg: 'from-orange-500/20' };
        return { stroke: '#ef4444', label: 'Needs Attention', bg: 'from-red-500/20' };
    };

    const scoreConfig = getScoreColor();

    // SVG circle calculations
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={`glass-card p-6 bg-gradient-to-br ${scoreConfig.bg} to-transparent`}
        >
            <div className="flex items-center gap-2 mb-6">
                <Activity className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">Health Score</h2>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Gauge */}
                <div className="relative">
                    <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                        {/* Background circle */}
                        <circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="12"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="100"
                            cy="100"
                            r={radius}
                            fill="none"
                            stroke={scoreConfig.stroke}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            style={{
                                filter: `drop-shadow(0 0 10px ${scoreConfig.stroke})`,
                            }}
                        />
                    </svg>
                    {/* Score text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.5 }}
                            className="text-5xl font-bold text-white"
                        >
                            {score}
                        </motion.span>
                        <span className="text-sm text-zinc-400">out of 100</span>
                        <span
                            className="text-sm font-medium mt-1"
                            style={{ color: scoreConfig.stroke }}
                        >
                            {scoreConfig.label}
                        </span>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <StatCard
                        icon={CheckCircle}
                        label="Normal"
                        value={stats.normal}
                        total={stats.total}
                        color="#10b981"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Abnormal"
                        value={stats.abnormal}
                        total={stats.total}
                        color="#f59e0b"
                    />
                    <StatCard
                        icon={AlertTriangle}
                        label="Critical"
                        value={stats.critical}
                        total={stats.total}
                        color="#ef4444"
                    />
                    <StatCard
                        icon={HelpCircle}
                        label="Unknown"
                        value={stats.unknown}
                        total={stats.total}
                        color="#6b7280"
                    />
                </div>
            </div>
        </motion.div>
    );
}

interface StatCardProps {
    icon: React.ElementType;
    label: string;
    value: number;
    total: number;
    color: string;
}

function StatCard({ icon: Icon, label, value, total, color }: StatCardProps) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="w-4 h-4" style={{ color }} />
                <span className="text-sm text-zinc-400">{label}</span>
            </div>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{value}</span>
                <span className="text-xs text-zinc-500">({percentage}%)</span>
            </div>
            {/* Mini progress bar */}
            <div className="mt-2 h-1 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    );
}

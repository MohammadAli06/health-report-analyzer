'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronDown,
    ChevronUp,
    AlertTriangle,
    CheckCircle,
    HelpCircle,
    AlertCircle,
} from 'lucide-react';
import type { TestResult } from '@/lib/api';

interface TestResultCardProps {
    test: TestResult;
    index?: number;
}

export default function TestResultCard({ test, index = 0 }: TestResultCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getStatusConfig = () => {
        switch (test.status) {
            case 'NORMAL':
                return {
                    icon: CheckCircle,
                    badgeClass: 'status-normal',
                    label: 'Normal',
                    bgGlow: 'rgba(16, 185, 129, 0.1)',
                };
            case 'LOW':
                return {
                    icon: AlertTriangle,
                    badgeClass: test.severity === 'red' ? 'status-critical' : 'status-warning',
                    label: 'Low',
                    bgGlow:
                        test.severity === 'red'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                };
            case 'HIGH':
                return {
                    icon: AlertCircle,
                    badgeClass: test.severity === 'red' ? 'status-critical' : 'status-warning',
                    label: 'High',
                    bgGlow:
                        test.severity === 'red'
                            ? 'rgba(239, 68, 68, 0.1)'
                            : 'rgba(245, 158, 11, 0.1)',
                };
            default:
                return {
                    icon: HelpCircle,
                    badgeClass: 'status-unknown',
                    label: 'Unknown',
                    bgGlow: 'rgba(107, 114, 128, 0.1)',
                };
        }
    };

    const config = getStatusConfig();
    const StatusIcon = config.icon;

    const formatReferenceRange = () => {
        if (!test.reference_range) return 'N/A';
        const { min, max } = test.reference_range;
        if (min !== null && max !== null) return `${min} - ${max}`;
        if (min !== null) return `≥ ${min}`;
        if (max !== null) return `≤ ${max}`;
        return 'N/A';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="glass-card overflow-hidden"
            style={{ background: config.bgGlow }}
        >
            {/* Main Card Content */}
            <div
                className="p-5 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between gap-4">
                    {/* Left: Test Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <StatusIcon
                                className={`w-5 h-5 flex-shrink-0 ${test.status === 'NORMAL'
                                        ? 'text-emerald-400'
                                        : test.severity === 'red'
                                            ? 'text-red-400'
                                            : test.status === 'UNKNOWN'
                                                ? 'text-zinc-400'
                                                : 'text-amber-400'
                                    }`}
                            />
                            <h3 className="text-base font-semibold text-white truncate">
                                {test.test_name}
                            </h3>
                        </div>
                        <div className="flex items-baseline gap-2 ml-8">
                            <span className="text-2xl font-bold text-white">
                                {test.observed_value}
                            </span>
                            {test.unit && (
                                <span className="text-sm text-zinc-400">{test.unit}</span>
                            )}
                        </div>
                    </div>

                    {/* Right: Status Badge & Reference */}
                    <div className="flex flex-col items-end gap-2">
                        <span className={`status-badge ${config.badgeClass}`}>
                            {config.label}
                        </span>
                        <div className="text-xs text-zinc-500">
                            Ref: {formatReferenceRange()} {test.unit || ''}
                        </div>
                    </div>

                    {/* Expand Arrow */}
                    <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-zinc-400"
                    >
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>

                {/* Alert Message (if critical) */}
                {test.alert_message && test.severity === 'red' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-3 ml-8 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                    >
                        <p className="text-sm text-red-300 flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            {test.alert_message}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && test.explanation && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-5 pt-0 border-t border-white/5">
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4" />
                                    What does this mean?
                                </h4>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {test.explanation}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';
import { BarChart3, PieChartIcon } from 'lucide-react';
import type { TestResult } from '@/lib/api';

interface ResultsChartsProps {
    tests: TestResult[];
}

export default function ResultsCharts({ tests }: ResultsChartsProps) {
    // Calculate status distribution
    const statusData = [
        {
            name: 'Normal',
            value: tests.filter((t) => t.status === 'NORMAL').length,
            color: '#10b981',
        },
        {
            name: 'Low',
            value: tests.filter((t) => t.status === 'LOW').length,
            color: '#f59e0b',
        },
        {
            name: 'High',
            value: tests.filter((t) => t.status === 'HIGH').length,
            color: '#ef4444',
        },
        {
            name: 'Unknown',
            value: tests.filter((t) => t.status === 'UNKNOWN').length,
            color: '#6b7280',
        },
    ].filter((d) => d.value > 0);

    // Calculate severity distribution
    const severityData = [
        {
            name: 'Healthy',
            value: tests.filter((t) => t.severity === 'green').length,
            color: '#10b981',
        },
        {
            name: 'Borderline',
            value: tests.filter((t) => t.severity === 'yellow').length,
            color: '#f59e0b',
        },
        {
            name: 'Critical',
            value: tests.filter((t) => t.severity === 'red').length,
            color: '#ef4444',
        },
        {
            name: 'Unknown',
            value: tests.filter((t) => t.severity === 'gray').length,
            color: '#6b7280',
        },
    ].filter((d) => d.value > 0);

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
                    <p className="text-white font-medium">{payload[0].name || label}</p>
                    <p className="text-zinc-400 text-sm">
                        Count: <span className="text-white">{payload[0].value}</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Distribution - Pie Chart */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="glass-card p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <PieChartIcon className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Status Distribution</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                dataKey="value"
                                animationBegin={200}
                                animationDuration={1000}
                            >
                                {statusData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        stroke="transparent"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                formatter={(value) => (
                                    <span className="text-zinc-300 text-sm">{value}</span>
                                )}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Severity Distribution - Bar Chart */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card p-6"
            >
                <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <h3 className="text-lg font-semibold text-white">Severity Breakdown</h3>
                </div>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={severityData} layout="vertical">
                            <CartesianGrid
                                strokeDasharray="3 3"
                                stroke="rgba(255,255,255,0.1)"
                                horizontal={false}
                            />
                            <XAxis
                                type="number"
                                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                width={80}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="value"
                                radius={[0, 8, 8, 0]}
                                animationDuration={1000}
                                animationBegin={400}
                            >
                                {severityData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
}

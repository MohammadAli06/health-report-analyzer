'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileText, X, Loader2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadZoneProps {
    onFileSelect: (file: File, reportDate: string) => void;
    isUploading?: boolean;
    acceptedTypes?: string[];
}

export default function UploadZone({
    onFileSelect,
    isUploading = false,
    acceptedTypes = ['.pdf', '.png', '.jpg', '.jpeg', '.webp'],
}: UploadZoneProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [reportDate, setReportDate] = useState(() => {
        // Default to today's date in YYYY-MM-DD format
        return new Date().toISOString().split('T')[0];
    });

    const validateFile = (file: File): boolean => {
        const validTypes = [
            'application/pdf',
            'image/png',
            'image/jpeg',
            'image/jpg',
            'image/webp',
        ];

        if (!validTypes.includes(file.type)) {
            setError('Please upload a PDF or image file (PNG, JPG, WEBP)');
            return false;
        }

        // Max 10MB
        if (file.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return false;
        }

        setError(null);
        return true;
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);

            const file = e.dataTransfer.files[0];
            if (file && validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file, reportDate);
            }
        },
        [onFileSelect, reportDate]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file && validateFile(file)) {
                setSelectedFile(file);
                onFileSelect(file, reportDate);
            }
        },
        [onFileSelect, reportDate]
    );

    const clearFile = () => {
        setSelectedFile(null);
        setError(null);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            {/* Date Picker */}
            <div className="mb-4 flex items-center justify-center gap-3">
                <label className="flex items-center gap-2 text-zinc-400 text-sm">
                    <Calendar className="w-4 h-4" />
                    Report Date:
                </label>
                <input
                    type="date"
                    value={reportDate}
                    onChange={(e) => setReportDate(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-zinc-800 border border-white/10 text-white focus:border-indigo-500 focus:outline-none text-sm"
                    style={{ colorScheme: 'dark' }}
                    disabled={isUploading}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`upload-zone relative ${isDragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept={acceptedTypes.join(',')}
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                />

                <AnimatePresence mode="wait">
                    {isUploading ? (
                        <motion.div
                            key="uploading"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="relative">
                                <Loader2 className="w-16 h-16 text-indigo-500 animate-spin" />
                                <div className="absolute inset-0 rounded-full animate-pulse-glow" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-white">
                                    Analyzing your report...
                                </p>
                                <p className="text-sm text-zinc-400 mt-1">
                                    AI is extracting and interpreting your medical data
                                </p>
                            </div>
                        </motion.div>
                    ) : selectedFile ? (
                        <motion.div
                            key="selected"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-white">
                                    {selectedFile.name}
                                </p>
                                <p className="text-sm text-zinc-400 mt-1">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </p>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    clearFile();
                                }}
                                className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors z-20"
                            >
                                <X className="w-4 h-4 text-zinc-400" />
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <motion.div
                                animate={{ y: [0, -8, 0] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center border border-indigo-500/30"
                            >
                                <Upload className="w-10 h-10 text-indigo-400" />
                            </motion.div>
                            <div className="text-center">
                                <p className="text-lg font-semibold text-white">
                                    Drop your medical report here
                                </p>
                                <p className="text-sm text-zinc-400 mt-1">
                                    or click to browse your files
                                </p>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                {['PDF', 'PNG', 'JPG', 'WEBP'].map((format) => (
                                    <span
                                        key={format}
                                        className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400"
                                    >
                                        {format}
                                    </span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center text-red-400 text-sm mt-4"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}

'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-white/5 bg-black/20">
            <div className="container-custom py-12">
                {/* Medical Disclaimer */}
                <div className="glass-card p-6 mb-8 border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-start gap-4">
                        <AlertTriangle className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-amber-300 font-semibold mb-2">Medical Disclaimer</h4>
                            <p className="text-sm text-amber-200/70 leading-relaxed">
                                This platform does not provide medical diagnosis. The information provided
                                is for educational purposes only and should not be considered medical
                                advice. Always consult a qualified healthcare professional for proper
                                diagnosis and treatment. The AI analysis is meant to help you understand
                                your results better, not to replace professional medical guidance.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    <div className="md:col-span-2">
                        <h3 className="text-xl font-bold text-white mb-4">MedInsight AI</h3>
                        <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                            Empowering patients with clear, understandable health insights.
                            Upload your medical reports and get AI-powered analysis in simple,
                            patient-friendly language.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                    Dashboard
                                </a>
                            </li>
                            <li>
                                <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                    Features
                                </a>
                            </li>
                            <li>
                                <a href="#how-it-works" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                    How It Works
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                    Terms of Service
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">
                                    HIPAA Compliance
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="pt-8 border-t border-white/5 text-center">
                    <p className="text-sm text-zinc-500">
                        © {new Date().getFullYear()} MedInsight AI. Built for hackathon demonstration purposes.
                    </p>
                </div>
            </div>
        </footer>
    );
}

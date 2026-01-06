'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, Menu, X, User, LogOut, History, Settings, ChevronDown, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import SmartAlerts from './SmartAlerts';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
    const { user, profile, signOut } = useAuth();

    const handleSignOut = async () => {
        await signOut();
        setIsUserMenuOpen(false);
    };

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50"
        >
            <div className="glass-card mx-4 mt-4 rounded-2xl border border-white/10">
                <div className="container-custom">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Stethoscope className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <span className="text-lg font-bold text-white">MedInsight</span>
                                <span className="text-xs text-indigo-400 block -mt-1">AI Analysis</span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            <NavLink href="/">Home</NavLink>
                            <NavLink href="/dashboard">Dashboard</NavLink>
                            {user && (
                                <>
                                    <NavLink href="/history">History</NavLink>
                                    <NavLink href="/compare">Compare</NavLink>
                                    <NavLink href="/family">Family</NavLink>
                                </>
                            )}
                        </nav>

                        {/* Right Side */}
                        <div className="hidden md:flex items-center gap-4">
                            {user && <SmartAlerts />}
                            {user ? (
                                /* User Menu */
                                <div className="relative">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                                            {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <span className="text-white text-sm max-w-[120px] truncate">
                                            {profile?.full_name || user.email}
                                        </span>
                                        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {isUserMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute right-0 mt-2 w-56 glass-card p-2 rounded-xl border border-white/10"
                                            >
                                                <div className="px-3 py-2 border-b border-white/10 mb-2">
                                                    <p className="text-white font-medium truncate">{profile?.full_name || 'User'}</p>
                                                    <p className="text-zinc-400 text-sm truncate">{user.email}</p>
                                                </div>
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
                                                >
                                                    <User className="w-4 h-4" />
                                                    Health Profile
                                                </Link>
                                                <Link
                                                    href="/history"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 text-zinc-300 hover:text-white transition-colors"
                                                >
                                                    <History className="w-4 h-4" />
                                                    Health History
                                                </Link>
                                                <button
                                                    onClick={handleSignOut}
                                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                                                >
                                                    <LogOut className="w-4 h-4" />
                                                    Sign Out
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ) : (
                                /* Auth Buttons */
                                <>
                                    <Link
                                        href="/auth"
                                        className="text-sm text-zinc-300 hover:text-white transition-colors"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        href="/auth"
                                        className="gradient-btn text-sm py-2.5 px-5"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 text-zinc-400 hover:text-white transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/10"
                        >
                            <div className="container-custom py-4 flex flex-col gap-4">
                                <MobileNavLink href="/" onClick={() => setIsMenuOpen(false)}>
                                    Home
                                </MobileNavLink>
                                <MobileNavLink href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                                    Dashboard
                                </MobileNavLink>
                                {user ? (
                                    <>
                                        <MobileNavLink href="/history" onClick={() => setIsMenuOpen(false)}>
                                            History
                                        </MobileNavLink>
                                        <MobileNavLink href="/compare" onClick={() => setIsMenuOpen(false)}>
                                            Compare
                                        </MobileNavLink>
                                        <MobileNavLink href="/family" onClick={() => setIsMenuOpen(false)}>
                                            Family
                                        </MobileNavLink>
                                        <MobileNavLink href="/profile" onClick={() => setIsMenuOpen(false)}>
                                            Profile
                                        </MobileNavLink>
                                        <button
                                            onClick={() => { handleSignOut(); setIsMenuOpen(false); }}
                                            className="text-left text-red-400 py-2"
                                        >
                                            Sign Out
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/auth"
                                        className="gradient-btn text-center text-sm py-2.5 mt-2"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign In / Sign Up
                                    </Link>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.header>
    );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <Link
            href={href}
            className="text-sm text-zinc-400 hover:text-white transition-colors relative group"
        >
            {children}
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 group-hover:w-full transition-all duration-300" />
        </Link>
    );
}

function MobileNavLink({
    href,
    children,
    onClick,
}: {
    href: string;
    children: React.ReactNode;
    onClick: () => void;
}) {
    return (
        <Link
            href={href}
            className="text-zinc-300 hover:text-white transition-colors py-2"
            onClick={onClick}
        >
            {children}
        </Link>
    );
}

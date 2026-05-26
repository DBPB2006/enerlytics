import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldAlert, Zap, Compass, Wind, Sun } from 'lucide-react';
import api from '../utils/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlError = searchParams.get('error');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/login', { email, password });
            const data = response.data;

            if (data.mfa_setup_required) {
                navigate(`/mfa/setup?user_id=${data.user_id}`);
            } else if (data.mfa_required) {
                navigate(`/mfa/verify?user_id=${data.user_id}`);
            } else if (data.token && data.user) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.dispatchEvent(new Event('auth-change'));
                navigate('/');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Authentication failed. Please verify credentials.',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSSO = () => {
        window.location.href =
            'http://localhost:8000/api/auth/google/redirect?mode=login';
    };

    const displayError = error || urlError;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-7xl select-none flex-col overflow-hidden px-6 md:px-12 lg:flex-row"
        >
            {/* 1. Left Illustrative Pane */}
            <div className="relative hidden flex-col justify-center pr-12 lg:flex lg:w-[45%]">
                <div className="relative z-10 space-y-4">
                    <div className="inline-block bg-[#dfed2b] px-3 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black">
                        AUTHENTICATION PROTOCOL
                    </div>
                    <h1 className="font-['Montserrat'] text-6xl font-black uppercase leading-none tracking-tighter">
                        WELCOME BACK
                    </h1>
                    <p className="mt-4 max-w-sm font-['Inter'] text-sm font-semibold leading-relaxed text-black/70">
                        Sign in to access your energy tracking dashboard, view
                        community projects, and manage resources.
                    </p>
                </div>

                <div className="mt-12 flex gap-4 font-['Montserrat']">
                    <div className="eco-nexus-glass-card flex items-center gap-3 p-4">
                        <Sun className="h-5 w-5 text-black" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            Solar Power
                        </span>
                    </div>
                    <div className="eco-nexus-glass-card flex items-center gap-3 p-4">
                        <Wind className="h-5 w-5 text-black" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            Wind Kinetic
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-10 font-['Montserrat'] text-[10px] uppercase tracking-widest text-black/40">
                    // SECURE CONNECTION ESTABLISHED
                </div>
            </div>

            {/* 2. Right Interactive Form Pane */}
            <div className="relative flex flex-1 items-center justify-center">
                <div className="relative z-10 w-full max-w-md">
                    <div className="eco-nexus-glass-card relative overflow-hidden p-8 shadow-2xl md:p-12">
                        <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                            SECURE PORTAL
                        </div>

                        <h2 className="mb-8 mt-2 font-['Montserrat'] text-4xl font-black uppercase">
                            Sign In
                        </h2>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {displayError && (
                                <div className="flex items-center gap-3 bg-black p-4 font-['Montserrat'] text-[10px] font-bold uppercase text-[#dfed2b]">
                                    <ShieldAlert className="h-4 w-4 shrink-0" />
                                    <span>{displayError}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                                    <input
                                        type="email"
                                        required
                                        placeholder="email@example.com"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        className="w-full border border-black/10 bg-white/40 px-4 py-4 pl-12 font-['Montserrat'] text-sm font-bold text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        className="w-full border border-black/10 bg-white/40 px-4 py-4 pl-12 font-['Montserrat'] text-sm font-bold text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 bg-black py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                            >
                                {loading ? 'SIGNING IN...' : 'SIGN IN'}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-black/10"></div>
                            </div>
                            <div className="relative flex justify-center font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest">
                                <span className="bg-[#E1EBED] px-4 text-black/40">
                                    OR SIGN IN WITH
                                </span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSSO}
                            className="flex w-full items-center justify-center gap-2 border border-black/10 bg-white/40 py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-white/60"
                        >
                            <svg
                                className="h-4 w-4 fill-current text-black"
                                viewBox="0 0 24 24"
                            >
                                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.706 0 3.257.614 4.47 1.637l2.427-2.428C17.47 1.704 15.018 1 12.24 1c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.786 0 9.61-4.068 9.61-9.782 0-.66-.06-1.296-.17-1.933H12.24z" />
                            </svg>
                            Sign In with Google
                        </button>

                        <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
                            <p className="font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                New User?{' '}
                                <Link
                                    to="/signup"
                                    className="px-1 font-black text-black underline transition-colors hover:bg-black hover:text-[#dfed2b]"
                                >
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

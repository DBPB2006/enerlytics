import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldAlert, User, ShieldCheck, Zap } from 'lucide-react';
import api from '../../utils/api';
import { loginSuccess } from '../../redux/authSlice';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('citizen');
    const [mfaOptIn, setMfaOptIn] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const validateForm = () => {
        let isValid = true;
        const errors = { name: '', email: '', password: '' };

        // Name validation
        if (!name.trim()) {
            errors.name = 'Full name is required.';
            isValid = false;
        } else if (name.trim().length < 3) {
            errors.name = 'Name must be at least 3 characters.';
            isValid = false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) {
            errors.email = 'Email address is required.';
            isValid = false;
        } else if (!emailRegex.test(email)) {
            errors.email = 'Please enter a valid email address.';
            isValid = false;
        }

        // Password validation
        if (!password) {
            errors.password = 'Password is required.';
            isValid = false;
        } else if (password.length < 6) {
            errors.password = 'Password must be at least 6 characters.';
            isValid = false;
        }

        setFieldErrors(errors);
        return isValid;
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/register', {
                name,
                email,
                password,
                role,
                mfa_opt_in: mfaOptIn,
            });
            const data = response.data;

            if (data.mfa_setup_required) {
                navigate(`/mfa/setup?user_id=${data.user_id}`);
            } else if (data.token && data.user) {
                dispatch(loginSuccess({ token: data.token, user: data.user }));
                navigate('/');
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Registration failed. Please validate fields.',
            );
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSSO = () => {
        window.location.href = `http://localhost:8000/api/auth/google/redirect?mode=register&mfa_opt_in=${mfaOptIn ? 1 : 0}`;
    };

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
                        REGISTRATION
                    </div>
                    <h1 className="font-['Montserrat'] text-6xl font-black uppercase leading-none tracking-tighter">
                        CREATE ACCOUNT
                    </h1>
                    <p className="mt-4 max-w-sm font-['Inter'] text-sm font-semibold leading-relaxed text-black/70">
                        Register to track renewable energy resources, view
                        community projects, and manage sustainability metrics.
                    </p>
                </div>

                <div className="mt-12 flex gap-4 font-['Montserrat']">
                    <div className="eco-nexus-glass-card flex items-center gap-3 p-4">
                        <Zap className="h-5 w-5 text-black" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            Grid Mapping
                        </span>
                    </div>
                    <div className="eco-nexus-glass-card flex items-center gap-3 p-4">
                        <ShieldCheck className="h-5 w-5 text-black" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                            Clean Energy
                        </span>
                    </div>
                </div>

                <div className="absolute bottom-10 font-['Montserrat'] text-[10px] uppercase tracking-widest text-black/40">
                    // SECURE PORTAL
                </div>
            </div>

            {/* 2. Right Interactive Form Pane */}
            <div className="relative flex flex-1 items-center justify-center py-12">
                <div className="relative z-10 w-full max-w-md">
                    <div className="eco-nexus-glass-card relative overflow-hidden p-8 shadow-2xl md:p-12">
                        <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                            CREATE ACCOUNT
                        </div>

                        <h2 className="mb-8 mt-2 font-['Montserrat'] text-4xl font-black uppercase">
                            Sign Up
                        </h2>

                        <form onSubmit={handleSignup} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-3 bg-black p-4 font-['Montserrat'] text-[10px] font-bold uppercase text-[#dfed2b]">
                                    <ShieldAlert className="h-4 w-4 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => {
                                            setName(e.target.value);
                                            if (fieldErrors.name) {
                                                setFieldErrors(prev => ({ ...prev, name: '' }));
                                            }
                                        }}
                                        className={`w-full border bg-white/40 px-4 py-4 pl-12 font-['Montserrat'] text-sm font-bold text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.name ? 'border-red-500' : 'border-black/10'}`}
                                    />
                                </div>
                                {fieldErrors.name && (
                                    <span className="block font-['Montserrat'] text-[9px] font-bold uppercase tracking-widest text-red-500">
                                        {fieldErrors.name}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    Email Address
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                                    <input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (fieldErrors.email) {
                                                setFieldErrors(prev => ({ ...prev, email: '' }));
                                            }
                                        }}
                                        className={`w-full border bg-white/40 px-4 py-4 pl-12 font-['Montserrat'] text-sm font-bold text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.email ? 'border-red-500' : 'border-black/10'}`}
                                    />
                                </div>
                                {fieldErrors.email && (
                                    <span className="block font-['Montserrat'] text-[9px] font-bold uppercase tracking-widest text-red-500">
                                        {fieldErrors.email}
                                    </span>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    Account Role
                                </label>
                                <div className="relative">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full select-none border border-black/10 bg-white/40 px-4 py-4 font-['Montserrat'] text-sm font-bold text-black transition-colors focus:bg-white/60 focus:outline-none"
                                    >
                                        <option value="citizen">Citizen</option>
                                        <option value="energy_provider">
                                            Energy Provider
                                        </option>
                                        <option value="community_leader">
                                            Community Leader
                                        </option>
                                    </select>
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
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (fieldErrors.password) {
                                                setFieldErrors(prev => ({ ...prev, password: '' }));
                                            }
                                        }}
                                        className={`w-full border bg-white/40 px-4 py-4 pl-12 font-['Montserrat'] text-sm font-bold text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.password ? 'border-red-500' : 'border-black/10'}`}
                                    />
                                </div>
                                {fieldErrors.password && (
                                    <span className="block font-['Montserrat'] text-[9px] font-bold uppercase tracking-widest text-red-500">
                                        {fieldErrors.password}
                                    </span>
                                )}
                            </div>

                            <div className="flex cursor-pointer items-center gap-4 border border-black/10 bg-white/40 p-4 transition-colors hover:bg-white/60">
                                <input
                                    id="mfa"
                                    type="checkbox"
                                    checked={mfaOptIn}
                                    onChange={(e) => setMfaOptIn(e.target.checked)}
                                    className="h-4 w-4 shrink-0 cursor-pointer accent-black"
                                />
                                <label
                                    htmlFor="mfa"
                                    className="flex cursor-pointer select-none items-center gap-2 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black"
                                >
                                    <ShieldCheck className="h-4 w-4 shrink-0" />
                                    Enable Multi-Factor Authentication (MFA)
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full items-center justify-center gap-2 bg-black py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black disabled:opacity-50"
                            >
                                {loading ? 'SIGNING UP...' : 'SIGN UP'}
                            </button>
                        </form>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-black/10"></div>
                            </div>
                            <div className="relative flex justify-center font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest">
                                <span className="bg-[#E1EBED] px-4 text-black/40">
                                    OR SIGN UP WITH
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
                            Sign Up with Google
                        </button>

                        <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
                            <p className="font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                Already have an account?{' '}
                                <Link
                                    to="/login"
                                    className="px-1 font-black text-black underline transition-colors hover:bg-black hover:text-[#dfed2b]"
                                >
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    LogOut,
    ShieldAlert,
    Key,
    HardDrive,
    Terminal,
    Award,
    Zap,
    AwardIcon,
    Compass,
    Sparkles,
    UserCheck,
} from 'lucide-react';
import api from '../utils/api';

export default function Profile() {
    const navigate = useNavigate();
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const token = localStorage.getItem('token');

    const handleDisconnect = async () => {
        try {
            await api.post('/logout');
        } catch (e) {
            console.error('Logout failed', e);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.dispatchEvent(new Event('auth-change'));
            navigate('/login');
        }
    };

    if (!user) {
        return (
            <div className="relative z-10 flex min-h-[calc(100vh-68px)] w-full items-center justify-center p-4">
                <div className="eco-nexus-glass-card relative w-full max-w-md overflow-hidden p-8 shadow-2xl">
                    <div className="absolute right-0 top-0 bg-red-500 px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                        WARNING
                    </div>
                    <div className="mt-4 flex flex-col items-center space-y-6 text-center">
                        <ShieldAlert className="h-12 w-12 text-red-500" />
                        <p className="font-['Montserrat'] text-sm font-bold uppercase tracking-widest text-black">
                            No authenticated operator session detected. Please
                            sign in to continue.
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="flex w-full items-center justify-center gap-2 bg-black py-3 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                        >
                            SIGN IN
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const registrationDate = user.created_at
        ? new Date(user.created_at).toLocaleDateString()
        : '2026-04-20';

    const sustainabilityBadges = [
        {
            title: 'Solar Pioneer',
            desc: 'First 10 MW mapped',
            emoji: '☀️',
            color: '#dfed2b',
            text: 'text-black',
        },
        {
            title: 'Wind Kineticist',
            desc: 'Turbine assembly lead',
            emoji: '💨',
            color: '#A2E3E3',
            text: 'text-black',
        },
        {
            title: 'Hydro Guardian',
            desc: 'Gravity stream validated',
            emoji: '🌊',
            color: '#9FD3FF',
            text: 'text-black',
        },
        {
            title: 'Coop Leader',
            desc: 'Active cooperatives',
            emoji: '🌱',
            color: '#C3EAA6',
            text: 'text-black',
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-[calc(100vh-68px)] w-full select-none overflow-hidden pb-20 pt-8"
        >
            <div className="relative z-10 mx-auto max-w-6xl px-6 md:px-12">
                <div className="mb-10 space-y-2">
                    <div className="inline-flex items-center gap-2 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b]">
                        <UserCheck className="h-3 w-3" /> USER PROFILE
                    </div>
                    <h1 className="font-['Montserrat'] text-5xl font-black uppercase leading-none tracking-tighter text-black md:text-6xl">
                        User Dashboard
                    </h1>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    <div className="space-y-8 lg:col-span-2">
                        <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                PROFILE
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // USER INFORMATION
                            </span>
                            <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                ACCOUNT DETAILS
                            </h2>

                            <div className="space-y-8">
                                <div className="flex items-center gap-6 border-b border-black/10 pb-6">
                                    <div className="flex h-20 w-20 items-center justify-center bg-black font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-[#dfed2b] shadow-md">
                                        {user.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <h2 className="font-['Montserrat'] text-4xl font-black uppercase leading-none tracking-tighter text-black">
                                            {user.name}
                                        </h2>
                                        <span className="mt-2 block font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60">
                                            {user.email}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black">
                                        <span className="flex items-center gap-2">
                                            <Award className="h-4 w-4" />{' '}
                                            Participation Status
                                        </span>
                                        <span>
                                            {user.is_validated
                                                ? 'Validated Member'
                                                : 'Pending Verification'}
                                        </span>
                                    </div>
                                    <div className="relative h-6 w-full overflow-hidden border border-black/10 bg-white/40">
                                        <div
                                            className="h-full bg-[#dfed2b]"
                                            style={{
                                                width: user.is_validated
                                                    ? '100%'
                                                    : '50%',
                                            }}
                                        />
                                        <div className="pointer-events-none absolute inset-0 border border-black/20" />
                                    </div>
                                    <p className="mt-2 flex items-center gap-2 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                        <Zap className="h-3 w-3" /> Renewable
                                        tracking active
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 pt-4 font-['Montserrat'] text-xs font-bold uppercase sm:grid-cols-2">
                                    <div className="hover-glow-solar group relative cursor-pointer overflow-hidden border border-black/10 bg-white/40 p-5 transition-all duration-300 hover:scale-[1.03] hover:bg-white">
                                        <div className="absolute inset-0 z-0 -translate-x-full bg-[#dfed2b]/5 transition-transform duration-300 group-hover:translate-x-0" />
                                        <div className="relative z-10">
                                            <span className="mb-1 block text-[10px] tracking-widest text-black/60">
                                                Account Role
                                            </span>
                                            <span className="font-black text-black">
                                                {user.role?.replace('_', ' ') ||
                                                    'Citizen'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hover-glow-solar group relative cursor-pointer overflow-hidden border border-black/10 bg-white/40 p-5 transition-all duration-300 hover:scale-[1.03] hover:bg-white">
                                        <div className="absolute inset-0 z-0 -translate-x-full bg-[#dfed2b]/5 transition-transform duration-300 group-hover:translate-x-0" />
                                        <div className="relative z-10">
                                            <span className="mb-1 block text-[10px] tracking-widest text-black/60">
                                                MFA Protection
                                            </span>
                                            <span
                                                className={`font-black ${user.mfa_required ? 'text-black' : 'text-red-500'}`}
                                            >
                                                {user.mfa_required
                                                    ? 'MFA ENABLED'
                                                    : 'MFA DISABLED'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hover-glow-solar group relative cursor-pointer overflow-hidden border border-black/10 bg-white/40 p-5 transition-all duration-300 hover:scale-[1.03] hover:bg-white">
                                        <div className="absolute inset-0 z-0 -translate-x-full bg-[#dfed2b]/5 transition-transform duration-300 group-hover:translate-x-0" />
                                        <div className="relative z-10">
                                            <span className="mb-1 block text-[10px] tracking-widest text-black/60">
                                                Validation ID
                                            </span>
                                            <span className="font-black text-black">
                                                {user.unique_id || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="hover-glow-solar group relative cursor-pointer overflow-hidden border border-black/10 bg-white/40 p-5 transition-all duration-300 hover:scale-[1.03] hover:bg-white">
                                        <div className="absolute inset-0 z-0 -translate-x-full bg-[#dfed2b]/5 transition-transform duration-300 group-hover:translate-x-0" />
                                        <div className="relative z-10">
                                            <span className="mb-1 block text-[10px] tracking-widest text-black/60">
                                                Registration Date
                                            </span>
                                            <span className="font-black text-black">
                                                {registrationDate}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                AWARDS
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // SUSTAINABILITY MILESTONES
                            </span>
                            <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                EARNED BADGES
                            </h2>

                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                                {sustainabilityBadges.map((badge, idx) => {
                                    const glowClasses = [
                                        'hover-glow-solar',
                                        'hover-glow-wind',
                                        'hover-glow-hydro',
                                        'hover-glow-biomass',
                                    ];
                                    return (
                                        <div
                                            key={idx}
                                            className={`hover-grayscale-reveal flex cursor-pointer flex-col items-center justify-between p-5 text-center shadow-md transition-all duration-500 hover:scale-105 hover:shadow-xl ${glowClasses[idx]} group`}
                                            style={{
                                                backgroundColor: badge.color,
                                            }}
                                        >
                                            <div className="mb-4 flex h-12 w-12 items-center justify-center bg-white/60 text-2xl shadow-sm transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110">
                                                {badge.emoji}
                                            </div>
                                            <div className="space-y-1">
                                                <h4
                                                    className={`font-['Montserrat'] text-sm font-black uppercase leading-tight ${badge.text}`}
                                                >
                                                    {badge.title}
                                                </h4>
                                                <p
                                                    className={`font-['Montserrat'] text-[9px] font-bold uppercase leading-tight tracking-widest opacity-80 ${badge.text}`}
                                                >
                                                    {badge.desc}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                LOGS
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // RECENT ACCOUNT OPERATIONS
                            </span>
                            <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                ACTIVITY LOG
                            </h2>

                            <div className="space-y-4 font-['Montserrat'] text-xs">
                                <div className="hover-rotate-icon group relative flex cursor-pointer items-start gap-4 overflow-hidden border-l-4 border-black bg-white/40 py-4 pl-5 transition-all duration-300 hover:scale-[1.02] hover:bg-white">
                                    <div className="absolute inset-0 z-0 -translate-x-full bg-[#dfed2b]/5 transition-transform duration-300 group-hover:translate-x-0" />
                                    <Terminal className="relative z-10 mt-0.5 h-5 w-5 shrink-0 text-black transition-transform duration-500" />
                                    <div className="relative z-10">
                                        <div className="mb-1 font-black uppercase tracking-widest text-black">
                                            Resource Mapped
                                        </div>
                                        <span className="block text-[10px] font-bold uppercase tracking-widest text-black/60">
                                            Status: Active
                                        </span>
                                    </div>
                                </div>

                                <div className="hover-rotate-icon group relative flex cursor-pointer items-start gap-4 overflow-hidden border-l-4 border-black bg-white/40 py-4 pl-5 transition-all duration-300 hover:scale-[1.02] hover:bg-white">
                                    <div className="absolute inset-0 z-0 -translate-x-full bg-[#dfed2b]/5 transition-transform duration-300 group-hover:translate-x-0" />
                                    <Terminal className="relative z-10 mt-0.5 h-5 w-5 shrink-0 text-black transition-transform duration-500" />
                                    <div className="relative z-10">
                                        <div className="mb-1 font-black uppercase tracking-widest text-black">
                                            Community Group Joined
                                        </div>
                                        <span className="block text-[10px] font-bold uppercase tracking-widest text-black/60">
                                            Status: Active
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="eco-nexus-glass-card relative overflow-hidden bg-red-500/10 p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-red-500">
                                SESSION
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                // SESSION MANAGEMENT
                            </span>
                            <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                LOGOUT
                            </h2>

                            <div className="space-y-4 font-['Montserrat'] text-xs font-bold uppercase text-black">
                                <div className="pt-2">
                                    <button
                                        onClick={handleDisconnect}
                                        className="flex w-full items-center justify-center gap-2 bg-red-500 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-black"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        LOG OUT
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex h-10 w-full select-none items-center justify-center border border-black/10 bg-black/5 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                            ||||| SECURE SESSION |||||
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Cpu,
    AlertTriangle,
    MapPin,
    Check,
    X,
    LogOut,
    ShieldAlert,
    Sparkles,
    Activity,
    FileText,
} from 'lucide-react';
import api from '../utils/api';
import confetti from 'canvas-confetti';

export default function GroupDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [group, setGroup] = useState(null);
    const [resources, setResources] = useState([]);
    const [requests, setRequests] = useState([]);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchGroupDetails = async () => {
        try {
            setError('');
            const groupRes = await api.get(`/groups/${id}`);
            setGroup(groupRes.data);

            // Check if user belongs to the group but hasn't enabled MFA
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (!user.mfa_enabled) {
                alert(
                    'Multi-Factor Authentication (MFA) setup is mandatory for community members. Redirecting to setup...',
                );
                navigate('/mfa/setup');
                return;
            }

            const resourcesRes = await api.get(`/groups/${id}/resources`);
            setResources(resourcesRes.data);

            const userRole = groupRes.data.users?.[0]?.pivot?.role;
            if (
                userRole === 'owner' ||
                userRole === 'admin' ||
                userRole === 'member'
            ) {
                const membersRes = await api.get(`/groups/${id}/members`);
                setMembers(membersRes.data);
            }
            if (userRole === 'owner' || userRole === 'admin') {
                const reqRes = await api.get(`/groups/${id}/requests`);
                setRequests(reqRes.data);
            }
        } catch (err) {
            setError(
                err.response?.data?.error || 'Failed to load group details.',
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroupDetails();
    }, [id]);

    const handleApprove = async (userId) => {
        try {
            await api.post(`/groups/${id}/approve/${userId}`);
            confetti({
                particleCount: 50,
                spread: 40,
                colors: ['#dfed2b', '#ffffff'],
            });
            fetchGroupDetails();
        } catch (err) {
            alert('Failed to approve membership request.');
        }
    };

    const handleReject = async (userId) => {
        try {
            await api.post(`/groups/${id}/reject/${userId}`);
            fetchGroupDetails();
        } catch (err) {
            alert('Failed to reject membership request.');
        }
    };

    const handleLeaveGroup = async () => {
        if (!window.confirm('Leave this group?')) return;
        try {
            await api.post(`/groups/${id}/leave`);
            navigate('/groups');
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to leave group.');
        }
    };

    const handlePromote = async (userId) => {
        try {
            await api.post(`/groups/${id}/promote/${userId}`);
            fetchGroupDetails();
        } catch (err) {
            alert('Failed to promote user.');
        }
    };

    const handleDemote = async (userId) => {
        try {
            await api.post(`/groups/${id}/demote/${userId}`);
            fetchGroupDetails();
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to demote user.');
        }
    };

    if (loading) {
        return (
            <div className="relative z-10 flex min-h-[calc(100vh-68px)] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2Icon className="h-10 w-10 animate-spin text-black" />
                    <p className="animate-pulse font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60">
                        Retrieving group details...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !group) {
        return (
            <div className="relative z-10 flex min-h-[calc(100vh-68px)] w-full items-center justify-center p-4">
                <div className="eco-nexus-glass-card relative w-full max-w-md overflow-hidden p-8 shadow-2xl">
                    <div className="absolute right-0 top-0 bg-red-500 px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                        DENIED
                    </div>
                    <div className="mt-4 flex flex-col items-center space-y-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500" />
                        <p className="font-['Montserrat'] text-sm font-bold text-black">
                            {error.toUpperCase() ||
                                'GROUP DETAILS ARE CURRENTLY UNREACHABLE.'}
                        </p>
                        <Link
                            to="/groups"
                            className="flex w-full items-center justify-center gap-2 bg-black py-3 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to directory
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentUserRole = group.users?.[0]?.pivot?.role || 'member';
    const isAdminOrOwner =
        currentUserRole === 'owner' || currentUserRole === 'admin';
    const isOwner = currentUserRole === 'owner';

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-[calc(100vh-68px)] w-full select-none overflow-hidden pb-20 pt-8"
        >
            <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
                <Link
                    to="/groups"
                    className="group mb-6 inline-flex items-center gap-1.5 font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60 transition-colors hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Back to Directory
                </Link>

                {/* Header Panel */}
                <div className="eco-nexus-glass-card relative mb-8 overflow-hidden bg-white/60 p-6 shadow-xl md:p-8">
                    <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                        GROUP-{group.id}
                    </div>
                    <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                        // GROUP DETAILS
                    </span>
                    <h1 className="mb-6 font-['Montserrat'] text-5xl font-black uppercase tracking-tighter text-black">
                        {group.name}
                    </h1>

                    <div className="flex flex-col justify-between gap-6 border-t border-black/10 pt-6 md:flex-row md:items-end">
                        <div>
                            <span className="font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                GROUP LOCATION
                            </span>
                            {group.location && (
                                <p className="mt-2 flex items-center gap-2 font-['Montserrat'] text-sm font-black text-black">
                                    <MapPin className="h-4 w-4 text-black/60" />
                                    {group.location.toUpperCase()}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 self-start font-['Montserrat'] text-xs md:self-auto">
                            <div className="flex border border-black/20 bg-white shadow-md">
                                <span className="border-r border-black/20 bg-[#dfed2b] px-4 py-2 font-black uppercase tracking-widest text-black">
                                    ROLE: {currentUserRole}
                                </span>
                                {currentUserRole !== 'owner' && (
                                    <button
                                        onClick={handleLeaveGroup}
                                        className="flex cursor-pointer items-center gap-2 px-4 py-2 font-black uppercase tracking-widest text-red-500 transition-colors hover:bg-red-500 hover:text-white"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        DISCONNECT
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Layout */}
                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                    {/* Main Resources List */}
                    <div className="space-y-8 lg:col-span-2">
                        <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                ACTIVE-RESOURCES
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // REGISTERED ENERGY PRODUCTION RESOURCES
                            </span>
                            <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                GROUP RESOURCES
                            </h2>

                            {resources.length === 0 ? (
                                <div className="border border-dashed border-black/20 bg-white/40 py-16 text-center font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                    No energy assets registered under this group
                                    yet.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {resources.map((res, idx) => (
                                        <motion.div
                                            initial={{
                                                opacity: 0,
                                                scale: 0.95,
                                            }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            key={res.id}
                                            className="flex flex-col justify-between border border-black/10 bg-white/40 p-5 transition-colors hover:bg-white/60"
                                        >
                                            <div>
                                                <div className="mb-4 flex items-start justify-between">
                                                    <h4 className="truncate pr-4 font-['Montserrat'] text-xl font-black uppercase leading-tight text-black">
                                                        {res.title}
                                                    </h4>
                                                    <span
                                                        className={`mt-1.5 h-2 w-2 shrink-0 ${
                                                            res.status ===
                                                            'active'
                                                                ? 'border border-black bg-[#C3EAA6]'
                                                                : res.status ===
                                                                    'maintenance'
                                                                  ? 'border border-black bg-[#FFF066]'
                                                                  : 'border border-black bg-red-500'
                                                        }`}
                                                    />
                                                </div>

                                                <div className="mb-6 grid grid-cols-2 gap-4 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                                    <div>
                                                        <span className="mb-1 block">
                                                            TYPE
                                                        </span>
                                                        <span className="font-black text-black">
                                                            {res.type}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="mb-1 block">
                                                            CAPACITY
                                                        </span>
                                                        <span className="font-black text-black">
                                                            {res.capacity} MW
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <Link
                                                to={`/resources/${res.id}`}
                                                className="flex w-full items-center justify-center gap-2 bg-black py-3 text-center font-['Montserrat'] text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                                            >
                                                DEEP DIVE DETAILS{' '}
                                                <Activity className="h-4 w-4" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                INFO-02
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // MISSION STATEMENT
                            </span>
                            <h2 className="mb-4 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                GROUP OVERVIEW
                            </h2>
                            <div className="relative border border-black/10 bg-white/40 p-5">
                                <FileText className="absolute right-4 top-4 h-5 w-5 text-black/20" />
                                <p className="pr-8 font-['Montserrat'] text-xs font-bold italic leading-relaxed text-black">
                                    "
                                    {group.description ||
                                        'No mission description logged for this community group.'}
                                    "
                                </p>
                            </div>
                        </div>

                        {isAdminOrOwner && (
                            <div className="eco-nexus-glass-card relative overflow-hidden bg-[#dfed2b]/20 p-6 shadow-xl md:p-8">
                                <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b]">
                                    INBOX
                                </div>
                                <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    // MEMBERSHIP REQUESTS INBOX
                                </span>
                                <h2 className="outline-text mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                    PENDING REQUESTS
                                </h2>

                                {requests.length === 0 ? (
                                    <div className="border border-dashed border-black/20 bg-white/40 py-8 text-center font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                        NO PENDING MEMBERSHIP REQUESTS.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {requests.map((r, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{
                                                    delay: idx * 0.05,
                                                }}
                                                key={r.id}
                                                className="space-y-4 border border-black/10 bg-white/60 p-5 font-['Montserrat'] text-xs font-bold"
                                            >
                                                <div className="flex flex-col gap-2">
                                                    <span className="truncate text-sm font-black uppercase text-black">
                                                        {r.name}
                                                    </span>
                                                    <span className="text-[10px] uppercase tracking-widest text-black/60">
                                                        {r.email}
                                                    </span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() =>
                                                            handleApprove(r.id)
                                                        }
                                                        className="flex flex-1 items-center justify-center gap-2 bg-black py-3 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                                                    >
                                                        <Check className="h-4 w-4" />{' '}
                                                        APPROVE
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleReject(r.id)
                                                        }
                                                        className="flex flex-1 items-center justify-center gap-2 border border-black/20 bg-white py-3 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-red-500 hover:text-white"
                                                    >
                                                        <X className="h-4 w-4" />{' '}
                                                        REJECT
                                                    </button>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                MEMBERS
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // NETWORK REGISTRY
                            </span>
                            <h2 className="outline-text mb-4 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                GROUP MEMBERS
                            </h2>

                            <div className="space-y-3">
                                {members.map((m, idx) => (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={m.id}
                                        className="flex flex-col justify-between gap-4 border border-black/10 bg-white/40 p-4 font-['Montserrat'] text-xs font-bold sm:flex-row sm:items-center"
                                    >
                                        <div>
                                            <span className="block text-sm font-black uppercase text-black">
                                                {m.name}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-widest text-black/60">
                                                {m.pivot.role}
                                            </span>
                                        </div>
                                        {isOwner &&
                                            m.pivot.role !== 'owner' && (
                                                <div className="flex gap-2">
                                                    {m.pivot.role ===
                                                    'member' ? (
                                                        <button
                                                            onClick={() =>
                                                                handlePromote(
                                                                    m.id,
                                                                )
                                                            }
                                                            className="bg-black px-4 py-2 text-[9px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                                                        >
                                                            PROMOTE
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                handleDemote(
                                                                    m.id,
                                                                )
                                                            }
                                                            className="border border-black/20 bg-white px-4 py-2 text-[9px] font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
                                                        >
                                                            DEMOTE
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                    </motion.div>
                                ))}
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

function Loader2Icon({ className }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    );
}

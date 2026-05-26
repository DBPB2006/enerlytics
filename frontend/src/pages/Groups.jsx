import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    MapPin,
    Loader2,
    ShieldAlert,
    Users,
    ArrowRight,
    Sparkles,
    X,
    Compass,
    Globe,
} from 'lucide-react';
import api from '../utils/api';
import confetti from 'canvas-confetti';

export default function Groups() {
    const navigate = useNavigate();
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [discoverGroups, setDiscoverGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [modalOpen, setModalOpen] = useState(false);

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [modalError, setModalError] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const fetchGroups = async () => {
        try {
            setError('');
            const [joinedRes, discoverRes] = await Promise.all([
                api.get('/groups'),
                api.get('/groups/discover'),
            ]);
            setJoinedGroups(joinedRes.data);
            setDiscoverGroups(discoverRes.data);

            // Check if user belongs to any group but hasn't enabled MFA
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (joinedRes.data.length > 0 && !user.mfa_enabled) {
                alert(
                    'Multi-Factor Authentication (MFA) setup is mandatory for community members. Redirecting to setup...',
                );
                navigate('/mfa/setup');
                return;
            }
        } catch (err) {
            setError('Failed to fetch community cooperatives directory.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleJoinRequest = async (groupId) => {
        try {
            const response = await api.post(`/groups/${groupId}/join`);
            if (response.data.message) {
                confetti({
                    particleCount: 80,
                    spread: 60,
                    origin: { y: 0.8 },
                    colors: ['#dfed2b', '#ffffff', '#000000'],
                });
                fetchGroups();
            }
        } catch (err) {
            if (err.response?.data?.error === 'MFA_REQUIRED') {
                alert(err.response.data.message);
                navigate('/mfa/setup');
            } else {
                alert(
                    err.response?.data?.error ||
                        'Failed to submit membership request.',
                );
            }
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        setModalError('');
        setModalLoading(true);

        try {
            const response = await api.post('/groups', {
                name,
                description,
                location,
            });
            if (response.status === 201 || response.status === 200) {
                confetti({
                    particleCount: 150,
                    spread: 80,
                    colors: ['#dfed2b', '#ffffff', '#000000'],
                });
                setName('');
                setDescription('');
                setLocation('');
                setModalOpen(false);
                fetchGroups();
            }
        } catch (err) {
            if (err.response?.data?.error === 'MFA_REQUIRED') {
                setModalOpen(false);
                alert(err.response.data.message);
                navigate('/mfa/setup');
            } else {
                setModalError(
                    err.response?.data?.message ||
                        'Failed to initialize community.',
                );
            }
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 min-h-[calc(100vh-68px)] w-full select-none overflow-hidden pb-20 pt-10"
        >
            <div className="relative z-10 mx-auto max-w-7xl px-6 md:px-12">
                <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b]">
                            <Globe className="h-3 w-3" /> REGIONAL ENERGY GROUPS
                        </div>
                        <h1 className="font-['Montserrat'] text-5xl font-black uppercase leading-none tracking-tighter text-black md:text-6xl">
                            Community Groups
                        </h1>
                        <p className="max-w-xl font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60">
                            Connect with local community energy groups, track
                            shared resources, and collaborate on sustainability.
                        </p>
                    </div>

                    <button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center justify-center gap-2 self-start border border-black/10 bg-[#dfed2b] px-6 py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white sm:self-auto"
                    >
                        <Plus className="h-4 w-4" />
                        Create Group
                    </button>
                </div>

                {error && (
                    <div className="mb-8 flex items-center gap-3 bg-black p-4 font-['Montserrat'] text-[10px] font-bold uppercase text-[#dfed2b]">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center gap-4 py-28">
                        <Loader2 className="h-10 w-10 animate-spin text-black" />
                        <span className="animate-pulse font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60">
                            Loading community groups...
                        </span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2">
                        {/* 1. Joined Groups */}
                        <div className="space-y-6">
                            <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                                <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                    MY GROUPS
                                </div>
                                <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                    // YOUR MEMBERSHIPS
                                </span>
                                <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                    YOUR GROUPS
                                </h2>

                                {joinedGroups.length === 0 ? (
                                    <div className="border border-dashed border-black/20 bg-white/40 py-16 text-center font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                        No active group memberships.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {joinedGroups.map((g, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: idx * 0.05,
                                                }}
                                                whileHover={{
                                                    x: -6,
                                                    scale: 1.01,
                                                }}
                                                key={g.id}
                                                className="hover-glow-solar hover-slide-chevron group relative cursor-pointer overflow-hidden border border-black/10 bg-white/40 p-6 shadow-md transition-all duration-300"
                                            >
                                                {/* Slide-in vibrant background overlay */}
                                                <div className="absolute inset-0 z-0 -translate-x-full bg-[#dfed2b]/15 transition-transform duration-500 ease-out group-hover:translate-x-0" />

                                                <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between">
                                                    <div className="mb-4 flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-['Montserrat'] text-2xl font-black uppercase tracking-tighter text-black transition-colors group-hover:text-black">
                                                                {g.name}
                                                            </h3>
                                                            {g.location && (
                                                                <span className="mt-2 flex items-center gap-2 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60 transition-colors group-hover:text-black/80">
                                                                    <MapPin className="h-3 w-3" />{' '}
                                                                    {g.location}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="border border-black/10 bg-[#dfed2b] px-3 py-1 font-['Montserrat'] text-[9px] font-black uppercase tracking-widest text-black">
                                                            ACTIVE
                                                        </span>
                                                    </div>
                                                    {g.description && (
                                                        <p className="mb-6 font-['Montserrat'] text-xs font-bold uppercase leading-relaxed text-black/60 transition-colors group-hover:text-black/80">
                                                            {g.description}
                                                        </p>
                                                    )}
                                                    <div className="pointer-events-auto relative z-20">
                                                        <Link
                                                            to={`/groups/${g.id}`}
                                                            className="flex w-full items-center justify-center gap-2 bg-black py-3 text-center font-['Montserrat'] text-[10px] font-black uppercase tracking-widest text-white transition-all duration-300 hover:bg-[#dfed2b] hover:text-black"
                                                        >
                                                            <Compass className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />{' '}
                                                            VIEW GROUP DETAILS
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. Discover Groups */}
                        <div className="space-y-6">
                            <div className="eco-nexus-glass-card relative overflow-hidden bg-[#dfed2b]/20 p-6 shadow-xl md:p-8">
                                <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b]">
                                    DISCOVER
                                </div>
                                <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    // PUBLIC DIRECTORY
                                </span>
                                <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                    DISCOVER GROUPS
                                </h2>

                                {discoverGroups.length === 0 ? (
                                    <div className="border border-dashed border-black/20 bg-white/40 py-16 text-center font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                        No other groups available in this
                                        region.
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {discoverGroups.map((g, idx) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{
                                                    delay: idx * 0.05,
                                                }}
                                                whileHover={{
                                                    x: 6,
                                                    scale: 1.01,
                                                }}
                                                key={g.id}
                                                className="hover-glow-wind hover-slide-chevron group relative cursor-pointer overflow-hidden border border-black/10 bg-white/40 p-6 shadow-md transition-all duration-300"
                                            >
                                                {/* Slide-in vibrant background overlay */}
                                                <div className="absolute inset-0 z-0 translate-x-full bg-[#A2E3E3]/15 transition-transform duration-500 ease-out group-hover:translate-x-0" />

                                                <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between">
                                                    <div className="mb-4">
                                                        <h3 className="font-['Montserrat'] text-2xl font-black uppercase tracking-tighter text-black transition-colors group-hover:text-black">
                                                            {g.name}
                                                        </h3>
                                                        {g.location && (
                                                            <span className="mt-2 flex items-center gap-2 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60 transition-colors group-hover:text-black/80">
                                                                <MapPin className="h-3 w-3" />{' '}
                                                                {g.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {g.description && (
                                                        <p className="mb-6 font-['Montserrat'] text-xs font-bold uppercase leading-relaxed text-black/60 transition-colors group-hover:text-black/80">
                                                            {g.description}
                                                        </p>
                                                    )}

                                                    <div className="pointer-events-auto relative z-20">
                                                        <button
                                                            onClick={() =>
                                                                handleJoinRequest(
                                                                    g.id,
                                                                )
                                                            }
                                                            className="flex w-full items-center justify-center gap-2 border border-black/20 bg-white py-3 text-center font-['Montserrat'] text-[10px] font-black uppercase tracking-widest text-black transition-all duration-300 hover:bg-black hover:text-white"
                                                        >
                                                            <Users className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />{' '}
                                                            REQUEST MEMBERSHIP
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal: Initialize Group */}
                <AnimatePresence>
                    {modalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="relative z-10 w-full max-w-md"
                            >
                                <div className="eco-nexus-glass-card relative overflow-hidden bg-white p-6 shadow-2xl md:p-8">
                                    <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b]">
                                        CREATE
                                    </div>

                                    <button
                                        onClick={() => setModalOpen(false)}
                                        className="absolute right-4 top-4 text-black/40 transition-colors hover:text-black"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>

                                    <span className="mb-2 mt-4 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                        // GROUP DETAILS
                                    </span>
                                    <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                        CREATE NEW GROUP
                                    </h2>

                                    <form
                                        onSubmit={handleCreateGroup}
                                        className="space-y-6"
                                    >
                                        {modalError && (
                                            <div className="flex items-center gap-3 bg-red-500 p-4 font-['Montserrat'] text-[10px] font-bold uppercase text-white">
                                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                                <span>{modalError}</span>
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                                GROUP NAME
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Eastside Community Solar"
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                className="w-full border border-black/10 bg-black/5 px-4 py-3 font-['Montserrat'] text-sm font-bold text-black transition-colors focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                                LOCATION / REGION
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Portland, OR"
                                                value={location}
                                                onChange={(e) =>
                                                    setLocation(e.target.value)
                                                }
                                                className="w-full border border-black/10 bg-black/5 px-4 py-3 font-['Montserrat'] text-sm font-bold text-black transition-colors focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                                DESCRIPTION / MISSION
                                            </label>
                                            <textarea
                                                rows="3"
                                                required
                                                placeholder="Describe the purpose of this group..."
                                                value={description}
                                                onChange={(e) =>
                                                    setDescription(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-black/10 bg-black/5 px-4 py-3 font-['Montserrat'] text-sm font-bold text-black transition-colors focus:bg-white focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex justify-end gap-4 border-t border-black/10 pt-4">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setModalOpen(false)
                                                }
                                                className="font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60 hover:text-black"
                                            >
                                                CANCEL
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={modalLoading}
                                                className="bg-black px-6 py-3 font-['Montserrat'] text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                                            >
                                                {modalLoading
                                                    ? 'CREATING...'
                                                    : 'CREATE'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

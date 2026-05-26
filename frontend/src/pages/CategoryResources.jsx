import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Cpu,
    AlertTriangle,
    MapPin,
    Activity,
    Sun,
    Wind,
    Droplet,
    Flame,
    Globe,
    Search,
    BookOpen,
    Download,
    HelpCircle,
    CheckSquare,
} from 'lucide-react';
import api from '../utils/api';

const CATEGORY_DOCS = {
    solar: [
        {
            title: 'Hyperlocal Solar Angling Manual',
            size: '2.4 MB',
            type: 'PDF Guide',
            desc: 'Detailed mathematical lookup sheet for optimizing solar tilt angles by seasonal solar coordinates.',
        },
        {
            title: 'Cooperative Solar Installation Checklist',
            size: '1.2 MB',
            type: 'Checklist',
            desc: 'Step-by-step assembly playbook for neighborhood rooftop cooperative panel mounts.',
        },
        {
            title: 'Photovoltaic Inverter Safety Code',
            size: '3.1 MB',
            type: 'Technical Spec',
            desc: 'Federated standards for linking community PV storage arrays to regional grid feeds.',
        },
    ],
    wind: [
        {
            title: 'Kinetic Turbine Foundation Guide',
            size: '4.8 MB',
            type: 'PDF Guide',
            desc: 'Geological criteria and concrete pouring checklists for community kinetic wind turbine installations.',
        },
        {
            title: 'Blade Aerodynamics Maintenance Sheet',
            size: '850 KB',
            type: 'Checklist',
            desc: 'Recommended inspection schedules, lubrication grades, and rotor blade cleaning methodologies.',
        },
        {
            title: 'Decentralized Wind Governor Tuning',
            size: '1.7 MB',
            type: 'Technical Spec',
            desc: 'Configuring automated power brakes and load dumps to handle seasonal gale surges safely.',
        },
    ],
    hydro: [
        {
            title: 'Gravity Stream Micro-Turbine Playbook',
            size: '3.5 MB',
            type: 'PDF Guide',
            desc: 'Sizing guidelines for gravity-fed streams and regional run-of-river flow installations.',
        },
        {
            title: 'Fish Bypass Ecological Standards',
            size: '1.4 MB',
            type: 'Checklist',
            desc: 'Ensuring stream node setups preserve fish migrations and avoid oxygen depletion spots.',
        },
        {
            title: 'Hydraulic Head Height Calculus Sheet',
            size: '2.0 MB',
            type: 'Technical Spec',
            desc: 'Simple spreadsheet templates for converting flow volumes and gravity drops directly into load projections.',
        },
    ],
    biomass: [
        {
            title: 'Co-product Gasification Best Practices',
            size: '2.8 MB',
            type: 'PDF Guide',
            desc: 'Optimizing material moisture indices to maintain safe high-temperature synthetic gas yields.',
        },
        {
            title: 'Anaerobic Digestion Log Sheets',
            size: '900 KB',
            type: 'Checklist',
            desc: 'Daily monitoring tables for tracking pH, temperature, and methane purity logs.',
        },
    ],
    geothermal: [
        {
            title: 'Subterranean Well Pressure Audits',
            size: '5.2 MB',
            type: 'PDF Guide',
            desc: 'Subsurface temperature logs, flow volume tracking, and core valve maintenance guides.',
        },
    ],
};

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
};

export default function CategoryResources() {
    const { type } = useParams();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('nodes');

    useEffect(() => {
        const fetchCategoryResources = async () => {
            try {
                setError('');
                const response = await api.get(`/resources?type=${type}`);
                setResources(response.data);
            } catch (err) {
                setResources([]);
                setError('Failed to fetch node stations from the database.');
            } finally {
                setLoading(false);
            }
        };
        fetchCategoryResources();
    }, [type]);

    const getCategoryMeta = () => {
        const energyType = type?.toLowerCase();
        switch (energyType) {
            case 'solar':
                return {
                    title: 'Solar Generation',
                    icon: Sun,
                    color: '#dfed2b',
                    bgClass: 'bg-[#FFF9C4]',
                    desc: 'Direct conversion solar energy harvesting units. These arrays capture direct electromagnetic radiation from coordinates mapping close to the equator. Load yields are calculated relative to panel coverage efficiency factors.',
                };
            case 'wind':
                return {
                    title: 'Wind Turbines',
                    icon: Wind,
                    color: '#dfed2b',
                    bgClass: 'bg-[#E0F7F7]',
                    desc: 'Kinetic wind capture turbines operated by community cooperatives. Outputs correlate with rotor swept dimensions and weather speed vectors. High variations are recorded due to altitude wind velocities.',
                };
            case 'hydro':
                return {
                    title: 'Hydroelectric Plants',
                    icon: Droplet,
                    color: '#dfed2b',
                    bgClass: 'bg-[#E1F0FF]',
                    desc: 'Run-of-the-river flow assemblies utilizing gravitational velocity head drops. Yield is calculated by water density weight multiplied by cubic flow rate and gravity acceleration coefficients.',
                };
            case 'biomass':
                return {
                    title: 'Biomass Gasifiers',
                    icon: Flame,
                    color: '#dfed2b',
                    bgClass: 'bg-[#F1FAD8]',
                    desc: 'Synthetic gasification structures utilizing regional organic byproducts. These assets convert material loads into robust, closed-loop cooperative loads.',
                };
            case 'geothermal':
                return {
                    title: 'Geothermal Heat Core',
                    icon: Globe,
                    color: '#dfed2b',
                    bgClass: 'bg-[#FFEBE1]',
                    desc: 'subterranean heat baseload nodes extracting steady pressure profiles from volcanic heat grids.',
                };
            default:
                return {
                    title: 'Energy Resources',
                    icon: Cpu,
                    color: '#dfed2b',
                    bgClass: 'bg-white',
                    desc: 'Federated renewable resource node profiles.',
                };
        }
    };

    const meta = getCategoryMeta();
    const Icon = meta.icon;
    const docsList = CATEGORY_DOCS[type?.toLowerCase()] || [];

    const filteredResources = resources.filter((res) => {
        const matchesSearch =
            res.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.location_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all' || res.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalCapacity = resources.reduce(
        (acc, r) => acc + (parseFloat(r.capacity) || 0),
        0,
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative w-full select-none pb-20 pt-6"
        >
            <div className="relative z-10 mx-auto max-w-7xl px-4 md:px-12">
                {/* Back Link */}
                <Link
                    to="/categories"
                    className="group mb-8 inline-flex items-center gap-2 border border-black/10 px-4 py-2 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60 backdrop-blur-md transition-colors hover:bg-white/40 hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{' '}
                    BACK TO SYSTEMS
                </Link>

                {/* Sub-hero Profile Header */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    className="mb-12"
                >
                    <div className="eco-nexus-glass-card relative flex flex-col items-stretch justify-between gap-12 overflow-hidden p-8 shadow-2xl md:p-12 lg:flex-row">
                        <div
                            className={`absolute right-0 top-0 h-64 w-64 ${meta.bgClass} pointer-events-none -mr-20 -mt-20 rounded-full opacity-50 blur-3xl`}
                        ></div>
                        <div className="relative z-10 max-w-3xl">
                            <div className="mb-6 flex items-center gap-4">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-black p-3 text-[#dfed2b] shadow-xl"
                                >
                                    <Icon className="h-8 w-8" />
                                </motion.div>
                                <h1 className="m-0 font-['Montserrat'] text-5xl font-black uppercase leading-none tracking-tighter text-black md:text-6xl">
                                    {meta.title}{' '}
                                    <span className="text-black/40">
                                        REGISTRY
                                    </span>
                                </h1>
                            </div>
                            <p className="font-['Inter'] text-sm leading-relaxed text-black/70">
                                {meta.desc}
                            </p>
                        </div>

                        {/* Aggregated values */}
                        <div className="relative z-10 flex min-w-[200px] shrink-0 flex-row justify-between gap-8 border-t border-black/10 pt-8 lg:flex-col lg:justify-center lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                            <div>
                                <span className="mb-1 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                    AGGREGATED NODES
                                </span>
                                <span className="font-['Montserrat'] text-4xl font-black leading-none tracking-tighter text-black">
                                    {resources.length}
                                </span>
                            </div>
                            <div>
                                <span className="mb-1 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                    AGGREGATED CAPACITY
                                </span>
                                <span className="font-['Montserrat'] text-4xl font-black leading-none tracking-tighter text-black">
                                    {totalCapacity.toFixed(1)}{' '}
                                    <span className="text-xl text-black/40">
                                        MW
                                    </span>
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Tab navigation with gliding underline */}
                <div className="relative mb-8 flex gap-4 font-['Montserrat'] text-xs font-bold">
                    {['nodes', 'docs'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`relative border border-black/10 px-6 py-3 uppercase tracking-widest transition-colors ${
                                activeTab === tab
                                    ? 'bg-black text-[#dfed2b]'
                                    : 'bg-white/40 text-black/60 hover:bg-white/80 hover:text-black'
                            }`}
                        >
                            {tab === 'nodes' && 'NODE STATIONS'}
                            {tab === 'docs' && 'PLAYBOOKS & GUIDES'}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="tab-underline"
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-[#dfed2b]"
                                    transition={{
                                        type: 'spring',
                                        stiffness: 300,
                                        damping: 30,
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                <AnimatePresence mode="wait">
                    {activeTab === 'nodes' ? (
                        <motion.div
                            key="nodes"
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, y: -10 }}
                            variants={containerVariants}
                            className="space-y-8"
                        >
                            {/* Search and Filters */}
                            <motion.div
                                variants={itemVariants}
                                className="eco-nexus-glass-card flex flex-col items-center justify-between gap-6 p-4 shadow-xl md:flex-row md:p-6"
                            >
                                {/* Search input */}
                                <div className="relative flex w-full items-center md:max-w-md">
                                    <Search className="absolute left-4 h-5 w-5 text-black/40" />
                                    <input
                                        type="text"
                                        placeholder="Search node stations..."
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        className="w-full border border-black/10 bg-white/40 py-4 pl-12 pr-4 font-['Montserrat'] text-xs font-bold shadow-inner outline-none transition-colors focus:bg-white"
                                    />
                                </div>

                                {/* Filter chips */}
                                <div className="scrollbar-hide flex w-full gap-2 overflow-x-auto pb-2 md:w-auto md:pb-0">
                                    {[
                                        'all',
                                        'active',
                                        'maintenance',
                                        'offline',
                                    ].map((status) => (
                                        <motion.button
                                            key={status}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() =>
                                                setStatusFilter(status)
                                            }
                                            className={`whitespace-nowrap border border-black/10 px-6 py-3 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest transition-all ${
                                                statusFilter === status
                                                    ? 'bg-black text-[#dfed2b] shadow-lg'
                                                    : 'bg-white/40 text-black hover:bg-white/80'
                                            }`}
                                        >
                                            {status}
                                        </motion.button>
                                    ))}
                                </div>
                            </motion.div>

                            {filteredResources.length === 0 ? (
                                <motion.div
                                    variants={itemVariants}
                                    className="border border-dashed border-black/20 bg-white/20 py-20 text-center font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/40 backdrop-blur-sm"
                                >
                                    No active node stations match your filters.
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                                    {filteredResources.map((res) => {
                                        const accentColors = {
                                            solar: '#dfed2b',
                                            wind: '#A2E3E3',
                                            hydro: '#9FD3FF',
                                            biomass: '#C3EAA6',
                                            geothermal: '#FFA47A',
                                        };
                                        const trueColor =
                                            accentColors[type?.toLowerCase()] ||
                                            '#dfed2b';
                                        const glowClass = `hover-glow-${type?.toLowerCase()}`;
                                        return (
                                            <motion.div
                                                key={res.id}
                                                variants={itemVariants}
                                                whileHover={{ y: -8 }}
                                                className={`eco-nexus-glass-card group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden p-8 shadow-xl transition-all duration-500 ${glowClass} hover-slide-chevron`}
                                            >
                                                {/* Slide-in vibrant background overlay */}
                                                <div
                                                    className="absolute inset-0 z-0 -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0"
                                                    style={{
                                                        backgroundColor: `${trueColor}20`,
                                                    }}
                                                />

                                                <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between">
                                                    <div>
                                                        <div className="mb-6 flex items-start justify-between">
                                                            <span className="border border-black/10 bg-white/80 px-2 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40 shadow-sm transition-colors group-hover:text-black/60">
                                                                ND-{res.id}
                                                            </span>
                                                            <span
                                                                className={`flex items-center gap-2 border border-black/10 bg-white/80 px-2 py-1 font-['Montserrat'] text-[10px] font-bold uppercase shadow-sm transition-all duration-300 ${
                                                                    res.status ===
                                                                    'active'
                                                                        ? 'text-green-600'
                                                                        : res.status ===
                                                                            'maintenance'
                                                                          ? 'text-yellow-600'
                                                                          : 'text-red-600'
                                                                }`}
                                                            >
                                                                <span className="h-2 w-2 animate-pulse rounded-full bg-current" />
                                                                {res.status}
                                                            </span>
                                                        </div>

                                                        <h3 className="mb-8 font-['Montserrat'] text-3xl font-black uppercase leading-none tracking-tighter text-black transition-colors group-hover:text-black">
                                                            {res.title}
                                                        </h3>

                                                        <div className="space-y-3 font-['Montserrat'] text-[10px] font-bold uppercase text-black/70 transition-colors duration-300 group-hover:text-black">
                                                            <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                                                <span>
                                                                    CAPACITY
                                                                </span>
                                                                <span className="text-sm text-black">
                                                                    {
                                                                        res.capacity
                                                                    }{' '}
                                                                    MW
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                                                <span>
                                                                    RATING
                                                                </span>
                                                                <span className="text-black">
                                                                    {
                                                                        res.accuracy
                                                                    }
                                                                </span>
                                                            </div>

                                                            <div className="flex items-center justify-between pb-2">
                                                                <span>
                                                                    LOCATION
                                                                </span>
                                                                <span className="max-w-[150px] truncate text-right text-black">
                                                                    {res.location_name ||
                                                                        `${parseFloat(res.latitude).toFixed(2)}, ${parseFloat(res.longitude).toFixed(2)}`}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="pointer-events-auto relative z-20 mt-8">
                                                        <Link
                                                            to={`/resources/${res.id}`}
                                                            className="flex w-full items-center justify-center gap-2 bg-black py-4 font-['Montserrat'] text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-colors hover:bg-[#dfed2b] hover:text-black group-hover:bg-black group-hover:text-[#dfed2b]"
                                                        >
                                                            VIEW DETAILS{' '}
                                                            <ArrowLeft className="h-4 w-4 rotate-180 transition-all duration-300" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="docs"
                            initial="hidden"
                            animate="show"
                            exit={{ opacity: 0, y: -10 }}
                            variants={containerVariants}
                            className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                        >
                            {docsList.length === 0 ? (
                                <motion.div
                                    variants={itemVariants}
                                    className="col-span-full border border-dashed border-black/20 bg-white/20 py-20 text-center font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/40 backdrop-blur-sm"
                                >
                                    No playbook manuals available for this
                                    division yet.
                                </motion.div>
                            ) : (
                                docsList.map((doc, idx) => {
                                    const accentColors = {
                                        solar: '#dfed2b',
                                        wind: '#A2E3E3',
                                        hydro: '#9FD3FF',
                                        biomass: '#C3EAA6',
                                        geothermal: '#FFA47A',
                                    };
                                    const trueColor =
                                        accentColors[type?.toLowerCase()] ||
                                        '#dfed2b';
                                    const glowClass = `hover-glow-${type?.toLowerCase()}`;
                                    return (
                                        <motion.div
                                            key={idx}
                                            variants={itemVariants}
                                            whileHover={{ y: -8 }}
                                            className={`eco-nexus-glass-card group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden p-8 shadow-xl transition-all duration-500 ${glowClass}`}
                                        >
                                            {/* Slide-in vibrant background overlay */}
                                            <div
                                                className="absolute inset-0 z-0 -translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0"
                                                style={{
                                                    backgroundColor: `${trueColor}15`,
                                                }}
                                            />

                                            <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between">
                                                <div>
                                                    <div className="mb-6 flex items-center justify-between">
                                                        <span className="border border-black/10 bg-[#dfed2b] px-3 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black shadow-sm transition-all group-hover:bg-black group-hover:text-[#dfed2b]">
                                                            {doc.type}
                                                        </span>
                                                        <span className="font-['Montserrat'] text-[10px] font-bold tracking-widest text-black/40 transition-colors group-hover:text-black">
                                                            {doc.size}
                                                        </span>
                                                    </div>

                                                    <h4 className="mb-4 font-['Montserrat'] text-2xl font-black uppercase leading-none tracking-tighter text-black transition-colors group-hover:text-black">
                                                        {doc.title}
                                                    </h4>

                                                    <p className="mb-8 font-['Inter'] text-xs leading-relaxed text-black/60 transition-colors group-hover:text-black/80">
                                                        {doc.desc}
                                                    </p>
                                                </div>

                                                <div className="pointer-events-auto relative z-20">
                                                    <motion.button
                                                        whileHover={{
                                                            scale: 1.02,
                                                        }}
                                                        whileTap={{
                                                            scale: 0.98,
                                                        }}
                                                        onClick={() =>
                                                            alert(
                                                                `Initiating secure local download of playbooks: "${doc.title}"`,
                                                            )
                                                        }
                                                        className="group flex w-full items-center justify-center gap-2 border border-black/10 bg-white/80 py-4 font-['Montserrat'] text-[10px] font-black uppercase tracking-widest text-black shadow-lg transition-colors hover:bg-black hover:text-[#dfed2b]"
                                                    >
                                                        <Download className="h-4 w-4 group-hover:animate-bounce" />
                                                        DOWNLOAD ASSET
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

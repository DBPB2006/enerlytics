import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import {
    Cpu,
    Aperture,
    Layers,
    Database,
    Flame,
    Globe,
    ArrowRight,
    ArrowUpRight,
    MessageSquare,
} from 'lucide-react';
import api from '../../utils/api';

// Snappy, Premium Animation Variants
const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
};

const fadeRight = {
    hidden: { opacity: 0, x: -12 },
    show: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
};

const scaleUp = {
    hidden: { opacity: 0, scale: 0.98 },
    show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
    },
};

export default function Home() {
    const { user } = useSelector((state) => state.auth);
    const [metrics, setMetrics] = useState({
        total_resources: 0,
        total_output: 0,
        average_efficiency: 'N/A',
    });
    const [loading, setLoading] = useState(true);
    const [hoveredNode, setHoveredNode] = useState(null);
    const [mapNodes, setMapNodes] = useState([]);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const response = await api.get('/analytics');
                if (response.data && response.data.summary) {
                    setMetrics(response.data.summary);

                    if (response.data.resources) {
                        const nodes = response.data.resources
                            .filter(
                                (r) =>
                                    r.latitude !== null && r.longitude !== null,
                            )
                            .map((r) => {
                                // Approximate abstract projection mapping
                                let x = ((r.longitude + 180) / 360) * 100;
                                let y = ((90 - r.latitude) / 180) * 100;

                                // Clamp slightly to keep dots inside the container
                                x = Math.max(5, Math.min(95, x));
                                y = Math.max(5, Math.min(95, y));

                                return {
                                    id: r.id,
                                    x: `${x}%`,
                                    y: `${y}%`,
                                    label: r.title,
                                    output: `${r.estimated_output} ${r.unit}`,
                                    type: r.type,
                                };
                            });
                        setMapNodes(nodes);
                    }
                }
            } catch (err) {
            } finally {
                setLoading(false);
            }
        };
        fetchMetrics();
    }, []);



    return (
        <div className="relative z-10 w-full select-none overflow-hidden pb-20">
            {/* 1. CINEMATIC HERO SECTION */}
            <section className="relative flex min-h-[90vh] items-center justify-center overflow-hidden px-6 pb-20 pt-24 md:px-12">
                {/* Deep Gradient Overlay to make the text pop immersively against the fixed global background */}
                <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-white/20 via-white/40 to-white/90 backdrop-blur-[2px]" />

                <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="space-y-8 lg:col-span-8"
                    >
                        <motion.div
                            variants={fadeRight}
                            className="inline-flex items-center gap-2 bg-black px-4 py-1.5 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b] shadow-2xl"
                        >
                            <Cpu className="h-3 w-3" /> COMMUNITY CLEAN ENERGY
                        </motion.div>

                        <motion.h1
                            variants={fadeUp}
                            className="font-['Montserrat'] text-6xl font-black uppercase leading-[0.85] tracking-tighter text-black md:text-8xl lg:text-[7.5rem]"
                        >
                            Fuel Your Day <br />
                            <motion.span
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.45,
                                    ease: [0.16, 1, 0.3, 1],
                                    delay: 0.15,
                                }}
                                className="mx-1 inline-block bg-black px-4 py-2 text-white shadow-2xl"
                            >
                                The Better
                            </motion.span>{' '}
                            Way
                        </motion.h1>

                        <motion.p
                            variants={fadeUp}
                            className="max-w-xl pt-4 font-['Montserrat'] text-sm font-bold uppercase leading-relaxed tracking-widest text-black/70 md:text-base"
                        >
                            Enerlytics is the premium platform built for modern
                            renewable energy communities. Track resource
                            efficiency, view playbooks, and connect with local
                            community groups.
                        </motion.p>

                        <div
                            className="flex flex-wrap gap-4 pt-8"
                        >
                            <Link to="/resources">
                                <button
                                    className="leaf-shape-sm group flex items-center justify-center gap-3 border border-black bg-black px-8 py-5 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-[#dfed2b] shadow-2xl transition-all duration-500 hover:bg-transparent hover:text-black hover:backdrop-blur-md"
                                >
                                    EXPLORE RESOURCES{' '}
                                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-2" />
                                </button>
                            </Link>
                            <Link to="/analytics">
                                <button
                                    className="flex items-center justify-center border border-black bg-white/10 px-8 py-5 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black shadow-lg backdrop-blur-md transition-all duration-500 hover:bg-black hover:text-white"
                                >
                                    OUR ENERGY ANALYTICS
                                </button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Abstract Hero Decor */}
                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                            duration: 0.45,
                            ease: [0.16, 1, 0.3, 1],
                            delay: 0.15,
                        }}
                        className="perspective-1000 relative hidden justify-end lg:col-span-4 lg:flex"
                    >
                        <motion.div
                            animate={{ y: [0, -3, 0] }}
                            transition={{
                                duration: 8,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="leaf-shape-lg relative z-10 w-full max-w-sm border border-black/10 bg-white/20 p-8 shadow-2xl backdrop-blur-xl"
                        >
                            <div className="absolute -right-3 -top-3 bg-[#dfed2b] px-3 py-1 font-['Montserrat'] text-[8px] font-bold uppercase tracking-widest text-black shadow-md">
                                ENERGY TRACKING
                            </div>
 
                            <div className="mb-8 flex items-center gap-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        duration: 50,
                                        repeat: Infinity,
                                        ease: 'linear',
                                    }}
                                    className="leaf-shape-sm flex h-12 w-12 items-center justify-center bg-black text-[#dfed2b]"
                                >
                                    <svg
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                        className="h-6 w-6"
                                    >
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            fill="rgba(223, 237, 43, 0.2)"
                                        />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="6"
                                            stroke="currentColor"
                                            strokeDasharray="3 3"
                                        />
                                        <path d="M12 2v20M2 12h20M7.75 7.75l8.5 8.5M7.75 16.25l8.5-8.5" />
                                        <circle
                                            cx="12"
                                            cy="12"
                                            r="2"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </motion.div>
                                <div>
                                    <h4 className="font-['Montserrat'] text-2xl font-black uppercase leading-none tracking-tighter text-black">
                                        Community Registry
                                    </h4>
                                    <p className="mt-1 font-['Montserrat'] text-[9px] font-bold uppercase tracking-widest text-black/50">
                                        Resource #182 • Validated
                                    </p>
                                </div>
                            </div>
 
                            <div className="space-y-4 font-['Montserrat'] text-xs font-bold uppercase tracking-widest">
                                <div
                                    className="group relative flex cursor-pointer items-center justify-between overflow-hidden border border-black/5 bg-white/40 p-4 shadow-inner"
                                >
                                    <div className="absolute inset-0 z-0 -translate-x-full bg-[#dfed2b]/20 transition-transform duration-300 group-hover:translate-x-0" />
                                    <span className="relative z-10 text-black/60 transition-colors group-hover:text-black">
                                        SOLAR FEED
                                    </span>
                                    <span className="relative z-10 font-black text-black">
                                        +18.4 MW
                                    </span>
                                </div>
                                <div
                                    className="group relative flex cursor-pointer items-center justify-between overflow-hidden border border-black/5 bg-white/40 p-4 shadow-inner"
                                >
                                    <div className="absolute inset-0 z-0 -translate-x-full bg-[#A2E3E3]/20 transition-transform duration-300 group-hover:translate-x-0" />
                                    <span className="relative z-10 text-black/60 transition-colors group-hover:text-black">
                                        WIND KINETIC
                                    </span>
                                    <span className="relative z-10 font-black text-black">
                                        +14.2 MW
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* 2. REAL-TIME METRICS BAR (Immersive Section) */}
            <section className="relative z-10 mx-auto my-32 max-w-7xl px-6 md:px-12">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="leaf-shape-lg grid grid-cols-1 gap-12 bg-black p-12 text-center font-['Montserrat'] text-white shadow-2xl md:grid-cols-3 md:p-16"
                >
                    <motion.div
                        variants={fadeUp}
                        className="hover-glow-solar group relative cursor-pointer space-y-4 overflow-hidden border border-white/5 bg-black p-8 text-white transition-all duration-500 hover:border-[#dfed2b]/40"
                    >
                        <div className="relative z-10 space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                ACTIVE CLEAN OUTPUT
                            </span>
                            <div className="font-['Montserrat'] text-5xl font-black tracking-tighter text-[#dfed2b] md:text-7xl">
                                {loading
                                    ? '0.0'
                                    : metrics.total_output.toFixed(1)}{' '}
                                <span className="font-['Montserrat'] text-lg font-bold tracking-widest text-white/60">
                                    MW
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="hover-glow-wind group relative cursor-pointer space-y-4 overflow-hidden border border-y border-white/10 border-white/5 bg-black p-8 text-white transition-all duration-500 hover:border-[#A2E3E3]/40 md:border-x md:border-y-0"
                    >
                        <div className="relative z-10 space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                REGISTERED RESOURCES
                            </span>
                            <div className="font-['Montserrat'] text-5xl font-black tracking-tighter text-white md:text-7xl">
                                {loading ? '0' : metrics.total_resources}{' '}
                                <span className="font-['Montserrat'] text-lg font-bold tracking-widest text-white/60">
                                    GROUPS
                                </span>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={fadeUp}
                        className="hover-glow-solar group relative cursor-pointer space-y-4 overflow-hidden border border-white/5 bg-black p-8 text-white transition-all duration-500 hover:border-[#dfed2b]/40"
                    >
                        <div className="relative z-10 space-y-4">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                AVG CELL EFFICIENCY
                            </span>
                            <div className="font-['Montserrat'] text-5xl font-black tracking-tighter text-[#dfed2b] md:text-7xl">
                                {metrics.average_efficiency}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* 4. INTERACTIVE GEOSPATIAL MAP PREVIEW */}
            <section className="mx-auto mb-32 max-w-7xl px-6 md:px-12">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={scaleUp}
                    className="eco-nexus-glass-card relative overflow-hidden border border-black/5 bg-white/60 p-0 shadow-2xl backdrop-blur-2xl"
                >
                    <div className="absolute right-6 top-6 z-20 bg-black px-4 py-1.5 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b] shadow-xl">
                        MAP-V1
                    </div>

                    <div className="relative z-10 grid grid-cols-1 items-stretch lg:grid-cols-12">
                        <div className="group relative flex cursor-pointer flex-col justify-center overflow-hidden border-r border-black/5 bg-white/40 p-12 transition-all duration-500 hover:bg-white/70 md:p-16 lg:col-span-5">
                            <div className="relative z-10 flex h-full flex-col justify-center">
                                <span className="mb-6 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/50">
                                    // GEOSPATIAL COORDINATES
                                </span>
                                <h2 className="mb-6 font-['Montserrat'] text-5xl font-black uppercase leading-[0.9] tracking-tighter text-black md:text-6xl">
                                    INTERACTIVE RESOURCE MAP
                                </h2>
                                <p className="mb-10 font-['Montserrat'] text-xs font-medium uppercase leading-relaxed tracking-widest text-black/70">
                                    Users map clean energy generation across
                                    regional areas. Click or hover on the
                                    interactive spots to view active power
                                    outputs.
                                </p>

                                <Link
                                    to="/resources"
                                    className="relative z-20 inline-block"
                                >
                                    <button
                                        className="w-full border border-black bg-transparent px-8 py-5 font-['Montserrat'] text-[10px] font-black uppercase tracking-widest text-black shadow-lg transition-all duration-500 hover:bg-black hover:text-white md:w-auto"
                                    >
                                        LAUNCH LIVE MAP
                                    </button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative flex min-h-[500px] items-center justify-center overflow-hidden bg-black/[0.03] lg:col-span-7">
                            {/* Real Map Graphic */}
                            <img
                                src="/map-bg.png"
                                alt="Geospatial Map Background"
                                className="absolute inset-0 h-full w-full object-cover opacity-80"
                            />

                            {mapNodes.map((node) => (
                                <div
                                    key={node.id}
                                    className="absolute cursor-pointer"
                                    style={{ left: node.x, top: node.y }}
                                    onMouseEnter={() => setHoveredNode(node)}
                                    onMouseLeave={() => setHoveredNode(null)}
                                >
                                    <div
                                        className="relative h-4 w-4 rounded-full bg-black shadow-lg"
                                    >
                                        <span className="absolute inset-0 animate-ping rounded-full bg-[#dfed2b] opacity-50" />
                                    </div>
                                </div>
                            ))}

                            <AnimatePresence>
                                {hoveredNode && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        transition={{
                                            duration: 0.4,
                                            ease: 'easeOut',
                                        }}
                                        className="pointer-events-none absolute bottom-8 left-8 min-w-[280px] bg-black p-6 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white shadow-2xl"
                                    >
                                        <h4 className="mb-4 border-b border-white/20 pb-4 text-sm leading-tight">
                                            {hoveredNode.label}
                                        </h4>
                                        <div className="flex items-end justify-between text-[#dfed2b]">
                                            <span className="text-[9px] opacity-70">
                                                LIVE OUTPUT
                                            </span>
                                            <span className="font-['Montserrat'] text-2xl font-black">
                                                {hoveredNode.output}
                                            </span>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* 5. PLAYFUL CTA (Reimagined as Cinematic Banner) */}
            <section className="mx-auto mt-40 max-w-7xl px-6 md:px-12">
                <motion.div
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeUp}
                    className="leaf-shape-xl hover-glow-solar group relative cursor-pointer overflow-hidden bg-black p-16 text-center shadow-2xl transition-all duration-500 md:p-24"
                >
                    {/* Subtle noise/texture overlay */}
                    <div className="pointer-events-none absolute inset-0 z-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10" />

                    <div className="relative z-10 mx-auto max-w-4xl space-y-12">
                        <h2 className="font-['Montserrat'] text-5xl font-black uppercase leading-[0.9] tracking-tighter text-white md:text-8xl">
                            READY TO CLAIM <br />{' '}
                            <span className="text-[#dfed2b]">
                                GRID INDEPENDENCE?
                            </span>
                        </h2>
                        <p className="mx-auto max-w-2xl font-['Montserrat'] text-xs font-bold uppercase leading-relaxed tracking-widest text-white/70 md:text-sm">
                            Register your local wind turbines, solar arrays, or
                            hydro streams. Empower your neighborhood with
                            transparent energy tracking.
                        </p>
                        <div className="flex flex-wrap justify-center gap-6 pt-8">
                            {user ? (
                                <Link to="/resources" className="relative z-20">
                                    <button
                                        className="bg-[#dfed2b] px-10 py-6 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black shadow-2xl transition-all duration-500 hover:bg-white hover:text-black"
                                    >
                                        GO TO MAP
                                    </button>
                                </Link>
                            ) : (
                                <Link to="/signup" className="relative z-20">
                                    <button
                                        className="bg-[#dfed2b] px-10 py-6 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black shadow-2xl transition-all duration-500 hover:bg-white hover:text-black"
                                    >
                                        SIGN UP
                                    </button>
                                </Link>
                            )}
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Cpu,
    AlertTriangle,
    Activity,
    TrendingUp,
    BarChart3,
} from 'lucide-react';
import api from '../../utils/api';
import {
    OperationalOutput,
    FactorCorrelation,
    UtilizationTrend,
} from '../../components/AnalyticsCharts';

// Animation Variants
const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 8 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 250, damping: 25 },
    },
};

const scaleIn = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { duration: 0.15, ease: 'easeOut' },
    },
};

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setError('');
                const response = await api.get('/analytics');
                setData(response.data);
            } catch {
                setError('Failed to retrieve energy analytics.');
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full select-none items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: 'linear',
                        }}
                    >
                        <Cpu className="h-10 w-10 text-black" />
                    </motion.div>
                    <p className="animate-pulse font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60">
                        Syncing energy logs...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="relative z-10 flex min-h-[calc(100vh-80px)] w-full select-none items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="eco-nexus-glass-card relative w-full max-w-md overflow-hidden bg-white/80 p-8 shadow-2xl"
                >
                    <div className="absolute right-0 top-0 bg-red-500 px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                        WARNING
                    </div>
                    <div className="mt-4 flex flex-col items-center space-y-6 text-center">
                        <motion.div
                            animate={{ rotate: [-5, 5, -5] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                        >
                            <AlertTriangle className="h-12 w-12 text-red-500" />
                        </motion.div>
                        <p className="font-['Montserrat'] text-sm font-bold uppercase tracking-widest text-black">
                            {(
                                error ||
                                'Global energy metrics are currently offline.'
                            ).toUpperCase()}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-black py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-red-500 hover:text-white"
                        >
                            RECONNECT FEED
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const { summary = {}, categories = {}, charts = {} } = data;

    const summaryCards = [
        {
            title: 'Total Yield',
            subtitle: 'Active Energy Rating',
            value: `${summary.total_output ? summary.total_output.toFixed(1) : '0.0'}`,
            unit: ' MW',
            code: 'YIELD',
        },
        {
            title: 'Total Assets',
            subtitle: 'Registered Resources',
            value: `${summary.total_resources || 0}`,
            unit: ' Groups',
            code: 'RESOURCES',
        },
        {
            title: 'Grid Efficiency',
            subtitle: 'System Wide Index',
            value: `${summary.average_efficiency || 'N/A'}`,
            unit: '',
            code: 'EFFICIENCY',
        },
    ];

    return (
        <motion.div
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            variants={staggerContainer}
            className="relative z-10 w-full select-none overflow-hidden pb-20 pt-6"
        >
            <div className="mx-auto max-w-7xl px-6 md:px-12">
                {/* Page Header */}
                <motion.div variants={fadeUp} className="mb-10">
                    <span className="mb-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                        // GLOBAL ENERGY NETWORK
                    </span>
                    <h1 className="mb-2 font-['Montserrat'] text-5xl font-black uppercase tracking-tighter text-black md:text-6xl">
                        Network Analytics
                    </h1>
                    <p className="font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60">
                        Real-time power contribution tracking
                    </p>
                </motion.div>

                {/* Global Summary Cards */}
                <motion.div
                    variants={staggerContainer}
                    className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3"
                >
                    {summaryCards.map((card, i) => {
                        const glowClasses = [
                            'hover-glow-solar',
                            'hover-glow-wind',
                            'hover-glow-solar',
                        ];
                        const slideColors = ['#d4e157', '#A2E3E3', '#d4e157'];
                        return (
                            <motion.div
                                key={i}
                                variants={fadeUp}
                                className={`eco-nexus-glass-card group relative z-10 cursor-pointer overflow-hidden bg-white/40 p-6 shadow-xl transition-all duration-500 hover:bg-white md:p-8 ${glowClasses[i]}`}
                            >
                                {/* Sliding vibrant overlay */}
                                <div
                                    className="absolute inset-0 z-0 -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0"
                                    style={{ backgroundColor: slideColors[i] }}
                                />

                                <div className="pointer-events-none relative z-10">
                                    <div className="absolute -right-6 -top-6 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white transition-colors duration-500 group-hover:bg-black group-hover:text-white">
                                        {card.code}
                                    </div>
                                    <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40 transition-colors duration-500 group-hover:text-black/60">
                                        // {card.subtitle.toUpperCase()}
                                    </span>
                                    <h3 className="mb-4 font-['Montserrat'] text-2xl font-black uppercase tracking-tighter text-black transition-colors duration-500">
                                        {card.title}
                                    </h3>
                                    <div className="font-['Montserrat']">
                                        <span
                                            className="text-5xl font-black text-black transition-colors duration-500 group-hover:text-black"
                                            style={{
                                                WebkitTextStroke: '1px black',
                                            }}
                                        >
                                            {card.value}
                                        </span>
                                        <span className="ml-2 font-['Montserrat'] text-sm font-bold uppercase tracking-widest text-black/60 transition-colors duration-500 group-hover:text-black/80">
                                            {card.unit}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Core Layout Grid */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mb-12 grid grid-cols-1 items-start gap-12 lg:grid-cols-12"
                >
                    {/* Category breakdown */}
                    <motion.div
                        variants={fadeUp}
                        className="flex flex-col gap-8 lg:col-span-4"
                    >
                        <div className="eco-nexus-glass-card relative overflow-hidden bg-white/40 p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                SEC-BRK
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // ENERGY RESOURCE SECTORS
                            </span>
                            <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                SECTOR BREAKDOWN
                            </h2>

                            <div className="space-y-6">
                                {Object.entries(categories).map(
                                    ([key, details]) => {
                                        const percentage =
                                            summary.total_resources > 0
                                                ? Math.min(
                                                      (details.count /
                                                          summary.total_resources) *
                                                          100,
                                                      100,
                                                  )
                                                : 0;

                                        const accentColors = {
                                            solar: '#d4e157',
                                            wind: '#A2E3E3',
                                            hydro: '#9FD3FF',
                                            biomass: '#C3EAA6',
                                            geothermal: '#FFA47A',
                                        };
                                        const trueColor =
                                            accentColors[key.toLowerCase()] ||
                                            '#d4e157';
                                        const glowClass = `hover-glow-${key.toLowerCase()}`;

                                        return (
                                            <motion.div
                                                key={key}
                                                className={`group relative cursor-pointer overflow-hidden border border-black/10 bg-white/40 p-5 shadow-sm transition-all duration-300 hover:bg-white ${glowClass}`}
                                            >
                                                {/* Static opacity background overlay on hover (no motion) */}
                                                <div
                                                    className="absolute inset-0 z-0 bg-black/5 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                                                    style={{
                                                        backgroundColor: `${trueColor}20`,
                                                    }}
                                                />

                                                <div className="pointer-events-none relative z-10">
                                                    <div className="mb-4 flex justify-between border-b border-black/10 pb-3">
                                                        <span
                                                            className="font-['Montserrat'] text-xl font-black uppercase tracking-tighter text-black transition-colors group-hover:text-black"
                                                            style={{
                                                                WebkitTextStroke:
                                                                    '0.5px black',
                                                            }}
                                                        >
                                                            {key}
                                                        </span>
                                                        <span
                                                            className="border border-black/10 px-2 py-1 font-['Montserrat'] text-[9px] font-black uppercase tracking-widest text-black shadow-sm transition-all"
                                                            style={{
                                                                backgroundColor:
                                                                    trueColor,
                                                            }}
                                                        >
                                                            ACTIVE
                                                        </span>
                                                    </div>

                                                    <div className="mb-4 grid grid-cols-2 gap-4 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60 transition-colors duration-300 group-hover:text-black/80">
                                                        <div>
                                                            <span className="mb-1 block">
                                                                RESOURCES
                                                            </span>
                                                            <span className="font-black text-black">
                                                                {details.count}
                                                            </span>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="mb-1 block">
                                                                OUTPUT
                                                            </span>
                                                            <span className="font-black text-black">
                                                                {details.total_capacity?.toFixed(
                                                                    1,
                                                                ) || 0.0}{' '}
                                                                MW
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="relative h-4 w-full overflow-hidden border border-black/10 bg-black/10">
                                                        <div
                                                            className="h-full transition-colors"
                                                            style={{
                                                                width: `${percentage}%`,
                                                                backgroundColor:
                                                                    trueColor,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    },
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Recharts Analytics Panel */}
                    <motion.div
                        variants={scaleIn}
                        className="flex flex-col gap-8 lg:col-span-8"
                    >
                        <div className="eco-nexus-glass-card relative overflow-hidden bg-white/60 p-6 shadow-xl md:p-10">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#d4e157] shadow-md">
                                METRICS
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                // PERFORMANCE METRICS
                            </span>
                            <h2 className="mb-8 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                ENERGY CURVE STATS
                            </h2>

                            <div className="space-y-12">
                                {/* 1. Operational Output */}
                                <div className="group">
                                    <h3 className="mb-6 flex items-center gap-3 border-b border-black/10 pb-3 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black">
                                        <div>
                                            <Activity className="h-5 w-5" />
                                        </div>
                                        OPERATIONAL OUTPUT (MW)
                                    </h3>
                                    <div className="border border-black/10 bg-white/80 p-4 shadow-inner transition-shadow group-hover:shadow-md">
                                        <OperationalOutput
                                            data={charts.pulse}
                                        />
                                    </div>
                                </div>

                                {/* 2. Correlations & Utilization in Columns */}
                                <div className="grid grid-cols-1 gap-8 border-t border-black/10 pt-8 md:grid-cols-2">
                                    <div className="group">
                                        <h3 className="mb-6 flex items-center gap-3 border-b border-black/10 pb-3 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black">
                                            <div>
                                                <TrendingUp className="h-5 w-5" />
                                            </div>
                                            SOLAR INTENSITY CORRELATION
                                        </h3>
                                        <div className="border border-black/10 bg-white/80 p-4 shadow-inner transition-shadow group-hover:shadow-md">
                                            <FactorCorrelation
                                                data={charts.correlation}
                                                type="solar"
                                            />
                                        </div>
                                    </div>

                                    <div className="group">
                                        <h3 className="mb-6 flex items-center gap-3 border-b border-black/10 pb-3 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black">
                                            <div>
                                                <BarChart3 className="h-5 w-5" />
                                            </div>
                                            CAPACITY UTILIZATION (%)
                                        </h3>
                                        <div className="border border-black/10 bg-white/80 p-4 shadow-inner transition-shadow group-hover:shadow-md">
                                            <UtilizationTrend
                                                data={charts.trend}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}

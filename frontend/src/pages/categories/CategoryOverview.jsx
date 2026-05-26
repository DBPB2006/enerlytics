import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sun,
    Wind,
    Droplet,
    Flame,
    Globe,
    ArrowLeft,
    ArrowUpRight,
    TrendingUp,
    BookOpen,
} from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';
import api from '../../utils/api';

const CATEGORY_DETAILS = {
    solar: {
        title: 'SOLAR ARRAY',
        icon: Sun,
        color: '#d4e157',
        image: '/solar.png',
        tagline: 'Unlocking democratic grid reserves from our nearest star.',
        description:
            'Photovoltaic cells collect and convert solar energy into clean electricity. Enerlytics helps local solar groups publish clear cell efficiency indexes, register panels, and monitor capacity reserves.',
        hotspots: [
            'Alamosa Valley Co-op',
            'Eastside Solar Assembly',
            'Sunnyvale Community Roofs',
        ],
    },
    wind: {
        title: 'WIND KINETIC',
        icon: Wind,
        color: '#A2E3E3',
        image: '/wind.png',
        tagline:
            'Harnessing high-altitude flow systems for neighborhood grids.',
        description:
            'Modern wind turbines generate clean electricity from regional wind currents. Using Enerlytics, local wind energy groups track rotor speeds, record generator outputs, and publish active status data.',
        hotspots: [
            'Breezy Ridge Co-op',
            'North Shore Turbine Circle',
            'Cascadia Wind Farm',
        ],
    },
    hydro: {
        title: 'HYDRO FLOW',
        icon: Droplet,
        color: '#9FD3FF',
        image: '/hydro.png',
        tagline:
            'Gravity fed water kinetic grids for decentralized collectives.',
        description:
            'Local river stream turbines capture energy from flowing water. Community groups leverage Enerlytics to log water flow rates, track seasonal generation curves, and maintain environmental standards.',
        hotspots: [
            'Salmon Creek Hydro',
            'Valley Gravity Feed',
            'Riverbend Micro-Turbine',
        ],
    },
    biomass: {
        title: 'BIOMASS GAS',
        icon: Flame,
        color: '#C3EAA6',
        image: '/biomass.png',
        tagline: 'Zero-waste closed loop power from agricultural co-products.',
        description:
            'Community groups convert local organic waste materials into clean synthetic gases. Enerlytics guarantees auditable carbon metrics, showing full material traceability logs and gasification heat efficiency indexes.',
        hotspots: [
            'Sagebrush Farm Digester',
            'Hillside Organic Exchange',
            'County Waste Gasifier',
        ],
    },
    geothermal: {
        title: 'GEOTHERMAL CORE',
        icon: Globe,
        color: '#FFA47A',
        image: '/geothermal.png',
        tagline: 'Tapping direct core heat pressure for robust grid baseloads.',
        description:
            'Deep subterranean heat wells generate constant steam pressure, supplying highly stable baseload clean current. Community groups use Enerlytics to audit thermal pressures, record outputs, and map heat dissipation curves.',
        hotspots: [
            'Hot Springs Baseload Node',
            'Volcanic Ridge Heat Core',
            'Valley Hot Well',
        ],
    },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    show: {
        opacity: 1,
        scale: 1,
        transition: { type: 'spring', stiffness: 100, damping: 20 },
    },
};

export default function CategoryOverview() {
    const { type } = useParams();
    const details =
        CATEGORY_DETAILS[type?.toLowerCase()] || CATEGORY_DETAILS.solar;
    const IconComponent = details.icon;

    const [liveSummary, setLiveSummary] = useState(null);
    const [liveHotspots, setLiveHotspots] = useState([]);

    useEffect(() => {
        const fetchLiveData = async () => {
            try {
                const [summaryRes, resourcesRes] = await Promise.all([
                    api.get('/resources/categories/summary'),
                    api.get(`/resources?type=${type}`),
                ]);

                if (summaryRes.data && summaryRes.data[type?.toLowerCase()]) {
                    setLiveSummary(summaryRes.data[type?.toLowerCase()]);
                }

                if (resourcesRes.data && Array.isArray(resourcesRes.data)) {
                    const names = resourcesRes.data
                        .slice(0, 3)
                        .map((r) => r.title);
                    setLiveHotspots(names);
                }
            } catch {
                // Silently handle error for clean production logs
            }
        };
        fetchLiveData();
    }, [type]);

    const getDynamicTrendData = () => {
        const totalOutput = liveSummary ? liveSummary.total_output : 0;
        const lowerType = type?.toLowerCase();
        const roundVal = (val) => Math.round(val * 10) / 10;

        if (lowerType === 'solar') {
            return [
                { hour: '08:00', output: roundVal(totalOutput * 0.15) },
                { hour: '10:00', output: roundVal(totalOutput * 0.55) },
                { hour: '12:00', output: roundVal(totalOutput * 1.0) },
                { hour: '14:00', output: roundVal(totalOutput * 0.9) },
                { hour: '16:00', output: roundVal(totalOutput * 0.45) },
                { hour: '18:00', output: roundVal(totalOutput * 0.1) },
            ];
        } else if (lowerType === 'wind') {
            return [
                { hour: '08:00', output: roundVal(totalOutput * 0.65) },
                { hour: '10:00', output: roundVal(totalOutput * 0.75) },
                { hour: '12:00', output: roundVal(totalOutput * 0.92) },
                { hour: '14:00', output: roundVal(totalOutput * 0.82) },
                { hour: '16:00', output: roundVal(totalOutput * 0.88) },
                { hour: '18:00', output: roundVal(totalOutput * 1.0) },
            ];
        } else if (lowerType === 'hydro') {
            return [
                { hour: '08:00', output: roundVal(totalOutput * 0.95) },
                { hour: '10:00', output: roundVal(totalOutput * 0.96) },
                { hour: '12:00', output: roundVal(totalOutput * 1.0) },
                { hour: '14:00', output: roundVal(totalOutput * 0.98) },
                { hour: '16:00', output: roundVal(totalOutput * 0.95) },
                { hour: '18:00', output: roundVal(totalOutput * 0.95) },
            ];
        } else if (lowerType === 'biomass') {
            return [
                { hour: '08:00', output: roundVal(totalOutput * 0.68) },
                { hour: '10:00', output: roundVal(totalOutput * 0.85) },
                { hour: '12:00', output: roundVal(totalOutput * 1.0) },
                { hour: '14:00', output: roundVal(totalOutput * 1.0) },
                { hour: '16:00', output: roundVal(totalOutput * 0.78) },
                { hour: '18:00', output: roundVal(totalOutput * 0.68) },
            ];
        } else {
            return [
                { hour: '08:00', output: roundVal(totalOutput * 1.0) },
                { hour: '10:00', output: roundVal(totalOutput * 1.0) },
                { hour: '12:00', output: roundVal(totalOutput * 1.0) },
                { hour: '14:00', output: roundVal(totalOutput * 1.0) },
                { hour: '16:00', output: roundVal(totalOutput * 1.0) },
                { hour: '18:00', output: roundVal(totalOutput * 1.0) },
            ];
        }
    };

    const trendData = getDynamicTrendData();

    return (
        <motion.div
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            variants={staggerContainer}
            className="relative z-10 mx-auto w-full max-w-7xl select-none overflow-hidden px-6 pb-20 md:px-12"
        >
            <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 0.2 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="pointer-events-none absolute right-10 top-10 h-96 w-96 rounded-full blur-3xl filter"
                style={{ backgroundColor: details.color }}
            />

            <div className="relative z-10 pt-4">
                <motion.div variants={fadeUp}>
                    <Link
                        to="/categories"
                        className="group mb-8 inline-flex items-center gap-2 font-['Montserrat'] text-xs font-bold uppercase text-black/60 transition-colors hover:text-black"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />{' '}
                        Back to Categories
                    </Link>
                </motion.div>

                <div className="mb-8 grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12">
                    <motion.div
                        variants={scaleIn}
                        className="group relative flex min-h-[500px] flex-col justify-between overflow-hidden bg-black p-8 shadow-2xl md:p-12 lg:col-span-8"
                    >
                        <div className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden">
                            <img
                                src={details.image}
                                alt={details.title}
                                className="h-full w-full scale-100 object-cover opacity-40 grayscale transition-all duration-1000 ease-out group-hover:scale-105 group-hover:opacity-60 group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />
                        </div>

                        <div className="z-25 absolute right-0 top-0 bg-[#d4e157] px-4 py-1 font-['Montserrat'] text-[10px] font-bold tracking-wider text-black">
                            AUDITED RESOURCE DATA
                        </div>

                        <div className="relative z-20 space-y-4">
                            <div className="mb-6 flex items-center gap-4">
                                <motion.div
                                    whileHover={{ rotate: 15 }}
                                    className="bg-[#d4e157] p-4 text-black shadow-lg"
                                >
                                    <IconComponent className="h-6 w-6" />
                                </motion.div>
                                <span className="border border-[#d4e157]/30 bg-white/10 px-2 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#d4e157] backdrop-blur-sm">
                                    RENEWABLE DIVISION
                                </span>
                            </div>

                            <h1 className="font-['Montserrat'] text-5xl font-black uppercase leading-none tracking-tighter text-white transition-colors duration-700 group-hover:text-[#d4e157] md:text-7xl">
                                {details.title}
                            </h1>

                            <p className="mt-4 max-w-xl font-['Montserrat'] text-sm font-bold leading-relaxed text-white md:text-base">
                                {details.tagline}
                            </p>

                            <p className="max-w-2xl font-['Inter'] text-xs font-medium leading-relaxed text-white/70">
                                {details.description}
                            </p>
                        </div>

                        <div className="relative z-20 mt-12 flex flex-wrap gap-4">
                            <Link
                                to={`/categories/${type?.toLowerCase()}/list`}
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 bg-[#d4e157] px-6 py-4 font-['Montserrat'] text-xs font-black uppercase text-black shadow-xl transition-colors hover:bg-white"
                                >
                                    <BookOpen className="h-4 w-4" />
                                    PLAYBOOKS & GUIDES
                                </motion.button>
                            </Link>
                            <Link to="/resources">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="flex items-center gap-2 border border-white/20 bg-white/10 px-6 py-4 font-['Montserrat'] text-xs font-black uppercase text-white shadow-md backdrop-blur-sm transition-colors hover:bg-white/20"
                                >
                                    ACTIVE MAP
                                </motion.button>
                            </Link>
                        </div>

                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 0.02 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="pointer-events-none absolute -bottom-10 -right-10 z-10"
                        >
                            <IconComponent className="h-96 w-96 text-white" />
                        </motion.div>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        className="flex flex-col gap-4 lg:col-span-4"
                    >
                        <motion.div
                            variants={fadeUp}
                            whileHover={{ x: -5, scale: 1.01 }}
                            className="eco-nexus-glass-card group flex flex-1 cursor-pointer flex-col justify-between p-6 shadow-lg transition-all hover:bg-white/60"
                        >
                            <div className="flex items-start justify-between">
                                <span className="border border-black/10 bg-white/60 px-2 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    Total Capacity
                                </span>
                                <div className="h-2 w-2 rounded-full bg-black" />
                            </div>
                            <div
                                className="mt-4 font-['Montserrat'] text-5xl font-black tracking-tighter text-black transition-colors group-hover:text-[#d4e157]"
                                style={{ WebkitTextStroke: '1px black' }}
                            >
                                {liveSummary
                                    ? `${liveSummary.total_output.toFixed(1)} MW`
                                    : '0.0 MW'}
                            </div>
                            <span className="mt-2 font-['Inter'] text-[9px] font-bold uppercase text-black/50">
                                Total active output tracker.
                            </span>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            whileHover={{ x: -5, scale: 1.01 }}
                            className="eco-nexus-glass-card group flex flex-1 cursor-pointer flex-col justify-between p-6 shadow-lg transition-all hover:bg-white/60"
                        >
                            <div className="flex items-start justify-between">
                                <span className="border border-black/10 bg-white/60 px-2 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    Efficiency
                                </span>
                                <div className="h-2 w-2 rounded-sm bg-black" />
                            </div>
                            <div
                                className="mt-4 font-['Montserrat'] text-5xl font-black tracking-tighter text-black transition-colors group-hover:text-[#d4e157]"
                                style={{ WebkitTextStroke: '1px black' }}
                            >
                                {liveSummary
                                    ? liveSummary.avg_efficiency.toUpperCase()
                                    : 'N/A'}
                            </div>
                            <span className="mt-2 font-['Inter'] text-[9px] font-bold uppercase text-black/50">
                                Average generation conversion.
                            </span>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            whileHover={{ scale: 1.02 }}
                            className="group relative flex flex-1 cursor-pointer flex-col justify-between overflow-hidden bg-black p-6 text-white shadow-2xl"
                        >
                            <div className="absolute inset-0 z-0 translate-x-full bg-[#d4e157] transition-transform duration-500 ease-out group-hover:translate-x-0" />
                            <div className="relative z-10">
                                <div className="flex items-start justify-between">
                                    <span className="font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white/60 transition-colors group-hover:text-black/60">
                                        Displacement
                                    </span>
                                    <div className="h-2 w-2 rounded-sm bg-[#d4e157] transition-colors group-hover:bg-black" />
                                </div>
                                <div className="mt-4 font-['Montserrat'] text-5xl font-black tracking-tighter text-[#d4e157] transition-colors group-hover:text-black">
                                    {liveSummary
                                        ? `${(liveSummary.total_output * 280).toLocaleString(undefined, { maximumFractionDigits: 0 })}T CO₂`
                                        : '0T CO₂'}
                                </div>
                                <span className="mt-2 font-['Inter'] text-[9px] font-bold uppercase text-white/50 transition-colors group-hover:text-black/50">
                                    Displaced annually on the grid.
                                </span>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true }}
                    className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12"
                >
                    <motion.div
                        variants={scaleIn}
                        className="eco-nexus-glass-card p-8 shadow-xl lg:col-span-7"
                    >
                        <div className="mb-6 flex items-center justify-between border-b border-black/10 pb-4">
                            <div>
                                <span className="mb-1 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    GENERATION CHART
                                </span>
                                <h3 className="font-['Montserrat'] text-3xl font-black uppercase tracking-tight text-black">
                                    Average Generation Profile
                                </h3>
                            </div>
                            <motion.div
                                whileHover={{ rotate: 180 }}
                                transition={{ duration: 0.5 }}
                            >
                                <TrendingUp className="h-8 w-8 text-black opacity-40" />
                            </motion.div>
                        </div>

                        <div className="mt-4 h-64 w-full font-['Montserrat']">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart
                                    data={trendData}
                                    margin={{
                                        top: 10,
                                        right: 10,
                                        left: -25,
                                        bottom: 0,
                                    }}
                                >
                                    <defs>
                                        <linearGradient
                                            id="colorTrend"
                                            x1="0"
                                            y1="0"
                                            x2="0"
                                            y2="1"
                                        >
                                            <stop
                                                offset="5%"
                                                stopColor={details.color}
                                                stopOpacity={0.8}
                                            />
                                            <stop
                                                offset="95%"
                                                stopColor={details.color}
                                                stopOpacity={0.1}
                                            />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="hour"
                                        stroke="#000"
                                        tick={{ fontSize: 9, fontWeight: 700 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#000"
                                        tick={{ fontSize: 9, fontWeight: 700 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{
                                            stroke: 'black',
                                            strokeWidth: 1,
                                            strokeDasharray: '4 4',
                                        }}
                                        content={({ active, payload }) => {
                                            if (
                                                active &&
                                                payload &&
                                                payload.length
                                            ) {
                                                return (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            scale: 0.9,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            scale: 1,
                                                        }}
                                                        className="border border-white/20 bg-black p-3 font-['Montserrat'] text-xs font-bold text-white shadow-2xl"
                                                    >
                                                        <p className="mb-1 text-[9px] uppercase text-[#d4e157]">
                                                            TIME:{' '}
                                                            {
                                                                payload[0]
                                                                    .payload
                                                                    .hour
                                                            }
                                                        </p>
                                                        <p>
                                                            OUTPUT:{' '}
                                                            {payload[0].value}{' '}
                                                            MW
                                                        </p>
                                                    </motion.div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="output"
                                        stroke="#000"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorTrend)"
                                        activeDot={{
                                            r: 6,
                                            fill: '#d4e157',
                                            stroke: '#000',
                                            strokeWidth: 2,
                                        }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    <motion.div
                        variants={staggerContainer}
                        className="flex flex-col gap-4 lg:col-span-5"
                    >
                        <motion.div
                            variants={fadeUp}
                            className="eco-nexus-glass-card flex-1 p-8 shadow-xl"
                        >
                            <div className="mb-6 border-b border-black/10 pb-4">
                                <span className="mb-1 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    REGIONAL HOTSPOTS
                                </span>
                                <h3 className="font-['Montserrat'] text-3xl font-black uppercase tracking-tight text-black">
                                    Active Coordinates
                                </h3>
                            </div>

                            <div className="space-y-4">
                                {(liveHotspots.length > 0
                                    ? liveHotspots
                                    : details.hotspots
                                ).map((spot, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ scale: 1.02, x: 5 }}
                                        className="group flex cursor-pointer items-center justify-between border border-black/10 bg-white/40 p-4 shadow-sm transition-colors hover:bg-white"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="bg-black/5 px-2 py-1 font-['Montserrat'] text-[10px] font-bold text-black/40 transition-colors group-hover:text-black">
                                                0{index + 1}.
                                            </span>
                                            <span className="font-['Montserrat'] text-sm font-black uppercase tracking-tight text-black">
                                                {spot}
                                            </span>
                                        </div>
                                        <ArrowUpRight className="h-4 w-4 text-black/40 transition-colors group-hover:text-black" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            variants={fadeUp}
                            whileHover={{ scale: 1.02 }}
                            className="group relative flex cursor-pointer items-center justify-between overflow-hidden bg-black p-6 text-white shadow-2xl"
                        >
                            <div className="absolute inset-0 z-0 translate-y-full bg-[#d4e157] transition-transform duration-300 ease-out group-hover:translate-y-0"></div>
                            <div className="relative z-10 flex items-center gap-4 transition-colors group-hover:text-black">
                                <Globe className="h-8 w-8 opacity-50 transition-opacity group-hover:opacity-100" />
                                <div>
                                    <h4 className="font-['Montserrat'] text-xl font-black uppercase tracking-tight">
                                        Need a resource setup?
                                    </h4>
                                    <p className="font-['Montserrat'] text-[10px] font-bold opacity-70 group-hover:opacity-100">
                                        Register your array or turbine.
                                    </p>
                                </div>
                            </div>
                            <Link
                                to="/resources/create"
                                className="relative z-10 border border-white/20 bg-white/10 px-4 py-2 font-['Montserrat'] text-[10px] font-bold backdrop-blur-sm transition-colors hover:bg-black hover:text-[#d4e157] group-hover:border-black/20 group-hover:bg-white/40 group-hover:text-black"
                            >
                                INITIATE
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
}

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import api from '../../utils/api';

const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.2 },
    },
};

const fadeUp = {
    hidden: { opacity: 0, y: 50 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
    },
};

export default function Categories() {
    const [liveSummary, setLiveSummary] = useState(null);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await api.get('/resources/categories/summary');
                setLiveSummary(res.data);
            } catch (err) {
                console.error('Failed to fetch category summaries', err);
            }
        };
        fetchSummary();
    }, []);

    const categoryCards = [
        {
            id: 'solar',
            number: '01.',
            title: 'SOLAR',
            desc: 'Solar power metrics. Real-time solar intensity tracking.',
            image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop',
        },
        {
            id: 'wind',
            number: '02.',
            title: 'WIND',
            desc: 'Turbine angular velocity and atmospheric pressure differentials.',
            image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1000&auto=format&fit=crop',
        },
        {
            id: 'hydro',
            number: '03.',
            title: 'HYDRO',
            desc: 'Flow rate dynamics and turbine pressure metrics. Reservoir level management.',
            image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop',
        },
        {
            id: 'biomass',
            number: '04.',
            title: 'BIOMASS',
            desc: 'Organic material conversion and thermal output metrics.',
            image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop',
        },
        {
            id: 'geothermal',
            number: '05.',
            title: 'GEOTHERMAL',
            desc: 'Subterranean heat extraction and steam pressure metrics.',
            image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1000&auto=format&fit=crop',
        },
    ];

    return (
        <>
            <div className="relative z-10 flex min-h-screen w-full flex-col overflow-hidden px-6 pb-32 md:px-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-16 pt-20"
                >
                    <div className="mb-6 inline-block bg-black px-4 py-1.5 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b] shadow-2xl">
                        RENEWABLE CATEGORIES
                    </div>
                    <h1 className="m-0 font-['Montserrat'] text-7xl font-black uppercase leading-[0.8] tracking-tighter text-black md:text-9xl">
                        ENERGY <br />{' '}
                        <span className="text-black/80">INSIGHTS</span>
                    </h1>
                </motion.div>

                <main className="flex flex-grow items-start justify-center py-6">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        animate="show"
                        className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
                    >
                        {categoryCards.map((cat) => {
                            const realMetric = liveSummary
                                ? liveSummary[cat.id]
                                : null;
                            const metrics = [
                                {
                                    label: 'Active Nodes',
                                    value: realMetric
                                        ? `${realMetric.count}`
                                        : '0',
                                },
                                {
                                    label: 'Total Yield',
                                    value: realMetric
                                        ? `${realMetric.total_output.toFixed(1)} MW`
                                        : '0.0 MW',
                                },
                                {
                                    label: 'Avg Efficiency',
                                    value: realMetric
                                        ? `${realMetric.avg_efficiency.toUpperCase()}`
                                        : 'N/A',
                                },
                            ];

                            return (
                                <motion.div
                                    key={cat.id}
                                    variants={fadeUp}
                                    className="group relative h-[600px] cursor-pointer overflow-hidden border border-black/20 bg-black shadow-2xl"
                                >
                                    <div className="absolute inset-0 h-full w-full">
                                        <img
                                            src={cat.image}
                                            alt={cat.title}
                                            className="h-full w-full scale-100 object-cover grayscale transition-all duration-1000 ease-out group-hover:scale-110 group-hover:grayscale-0"
                                        />
                                    </div>

                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 transition-opacity duration-1000 group-hover:opacity-70" />

                                    <div className="absolute left-6 top-6 z-10 flex w-[calc(100%-3rem)] items-start justify-between text-white mix-blend-difference">
                                        <div className="font-['Montserrat'] text-xs font-bold tracking-widest text-white/60">
                                            {cat.number}
                                        </div>
                                        <motion.div
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 3,
                                                ease: 'easeInOut',
                                            }}
                                            className="h-3 w-3 bg-[#dfed2b] shadow-lg"
                                        />
                                    </div>

                                    <div className="absolute bottom-0 left-0 z-10 flex h-full w-full flex-col justify-end p-8 text-white">
                                        <div className="translate-y-8 transform transition-transform duration-700 ease-out group-hover:translate-y-0">
                                            <h3 className="mb-4 font-['Montserrat'] text-5xl font-black uppercase leading-none tracking-tighter text-white transition-colors duration-700 group-hover:text-[#dfed2b]">
                                                {cat.title}
                                            </h3>
                                            <p className="mb-8 font-['Montserrat'] text-[10px] font-medium uppercase leading-relaxed tracking-widest text-white/70 opacity-0 transition-opacity delay-100 duration-700 group-hover:opacity-100">
                                                {cat.desc}
                                            </p>

                                            <div className="mb-8 space-y-4 border-t border-white/20 pt-6 font-['Montserrat'] text-[10px] font-bold uppercase text-white/50">
                                                {metrics.map((m, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="flex justify-between pb-2 transition-colors duration-700 group-hover:text-white/80"
                                                    >
                                                        <span>{m.label}</span>
                                                        <span className="text-white">
                                                            {m.value}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <Link to={`/categories/${cat.id}`}>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="flex w-full items-center justify-center gap-3 bg-[#dfed2b] py-4 font-['Montserrat'] text-[10px] font-black uppercase tracking-widest text-black shadow-2xl transition-colors duration-500 hover:bg-white"
                                                >
                                                    VIEW CATEGORY{' '}
                                                    <ArrowRight className="h-4 w-4" />
                                                </motion.button>
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </main>
            </div>

            <motion.div
                initial={{ opacity: 0, x: -50, rotate: -15 }}
                animate={{ opacity: 1, x: 0, rotate: -3 }}
                transition={{
                    duration: 1.5,
                    ease: [0.16, 1, 0.3, 1],
                    delay: 1,
                }}
                className="fixed left-10 top-1/3 z-20 hidden transform cursor-pointer border border-black/10 bg-[#dfed2b] p-4 font-['Montserrat'] text-xs font-black text-black shadow-2xl transition-transform hover:rotate-0 lg:block"
            >
                Enerlytics Insights
            </motion.div>

            <div className="pointer-events-none fixed inset-0 z-0 flex flex-col items-center justify-center overflow-hidden opacity-10 mix-blend-overlay">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    className="-mt-20 font-['Montserrat'] text-[30vw] font-black uppercase leading-[0.8] text-black"
                >
                    ENERGY
                </motion.div>
            </div>
        </>
    );
}

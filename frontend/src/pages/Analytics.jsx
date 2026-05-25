import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, AlertTriangle, Activity, TrendingUp, BarChart3, PieChart } from "lucide-react";
import api from "../utils/api";
import { OperationalOutput, FactorCorrelation, UtilizationTrend } from "../components/AnalyticsCharts";

// Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 100, damping: 20 } }
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setError("");
        const response = await api.get("/analytics");
        setData(response.data);
      } catch (err) {
        setError("Failed to retrieve energy analytics.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center select-none z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }}>
            <Cpu className="h-10 w-10 text-black" />
          </motion.div>
          <p className="font-['Montserrat'] text-xs text-black/60 uppercase tracking-widest font-bold animate-pulse">Syncing energy logs...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center p-4 select-none z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="eco-nexus-glass-card max-w-md w-full p-8 shadow-2xl relative overflow-hidden bg-white/80"
        >
          <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
            WARNING
          </div>
          <div className="flex flex-col items-center text-center space-y-6 mt-4">
            <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ repeat: Infinity, duration: 0.5 }}>
              <AlertTriangle className="h-12 w-12 text-red-500" />
            </motion.div>
            <p className="text-sm font-['Montserrat'] font-bold text-black uppercase tracking-widest">
              {(error || "Global energy metrics are currently offline.").toUpperCase()}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
              className="w-full bg-black hover:bg-red-500 hover:text-white text-white text-xs py-4 font-['Montserrat'] font-black uppercase tracking-widest transition-colors shadow-lg"
            >
              RECONNECT FEED
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  const { summary = {}, categories = {}, charts = {} } = data;

  const summaryCards = [
    { title: "Total Yield", subtitle: "Active Energy Rating", value: `${summary.total_output ? summary.total_output.toFixed(1) : "0.0"}`, unit: " MW", code: "YIELD" },
    { title: "Total Assets", subtitle: "Registered Resources", value: `${summary.total_resources || 0}`, unit: " Groups", code: "RESOURCES" },
    { title: "Grid Efficiency", subtitle: "System Wide Index", value: `${summary.average_efficiency || "N/A"}`, unit: "", code: "EFFICIENCY" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      variants={staggerContainer}
      className="relative w-full pb-20 pt-6 select-none z-10 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12">

        {/* Page Header */}
        <motion.div variants={fadeUp} className="mb-10">
          <span className="text-[10px] font-['Montserrat'] text-black/60 uppercase tracking-widest font-bold block mb-2">
            // GLOBAL ENERGY NETWORK
          </span>
          <h1 className="font-['Montserrat'] text-5xl md:text-6xl font-black uppercase text-black tracking-tighter mb-2">
            Network Analytics
          </h1>
          <p className="text-xs text-black/60 font-['Montserrat'] font-bold uppercase tracking-widest">
            Real-time power contribution tracking
          </p>
        </motion.div>

        {/* Global Summary Cards */}
        <motion.div variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {summaryCards.map((card, i) => {
            const glowClasses = ["hover-glow-solar", "hover-glow-wind", "hover-glow-solar"];
            const slideColors = ["#dfed2b", "#A2E3E3", "#dfed2b"];
            return (
              <motion.div 
                key={i} 
                variants={fadeUp}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden bg-white/40 hover:bg-white transition-all duration-500 cursor-pointer group z-10 ${glowClasses[i]}`}
              >
                {/* Sliding vibrant overlay */}
                <div 
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"
                  style={{ backgroundColor: slideColors[i] }}
                />

                <div className="relative z-10 pointer-events-none">
                  <div className="absolute -top-6 -right-6 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase group-hover:bg-black group-hover:text-white transition-colors duration-500">
                    {card.code}
                  </div>
                  <span className="text-[10px] font-['Montserrat'] text-black/40 group-hover:text-black/60 font-bold uppercase tracking-widest block mb-2 mt-2 transition-colors duration-500">
                    // {card.subtitle.toUpperCase()}
                  </span>
                  <h3 className="font-['Montserrat'] text-2xl font-black text-black uppercase tracking-tighter mb-4 transition-colors duration-500">
                    {card.title}
                  </h3>
                  <div className="font-['Montserrat']">
                    <span className="text-5xl font-black text-black group-hover:text-black transition-colors duration-500" style={{ WebkitTextStroke: '1px black' }}>
                      {card.value}
                    </span>
                    <span className="text-sm font-['Montserrat'] text-black/60 group-hover:text-black/80 ml-2 uppercase font-bold tracking-widest transition-colors duration-500">{card.unit}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Core Layout Grid */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-12">

          {/* Category breakdown */}
          <motion.div variants={fadeUp} className="lg:col-span-4 flex flex-col gap-8">
            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden bg-white/40">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                SEC-BRK
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // ENERGY RESOURCE SECTORS
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                SECTOR BREAKDOWN
              </h2>

              <div className="space-y-6">
                {Object.entries(categories).map(([key, details]) => {
                  const percentage = summary.total_resources > 0 
                    ? Math.min((details.count / summary.total_resources) * 100, 100) 
                    : 0;

                  const accentColors = {
                    solar: "#dfed2b",
                    wind: "#A2E3E3",
                    hydro: "#9FD3FF",
                    biomass: "#C3EAA6",
                    geothermal: "#FFA47A"
                  };
                  const trueColor = accentColors[key.toLowerCase()] || "#dfed2b";
                  const glowClass = `hover-glow-${key.toLowerCase()}`;

                  return (
                    <motion.div 
                      whileHover={{ scale: 1.02, x: 5 }}
                      key={key} 
                      className={`relative bg-white/40 border border-black/10 p-5 hover:bg-white transition-all duration-300 shadow-sm cursor-pointer group overflow-hidden ${glowClass}`}
                    >
                      {/* Slide-in vibrant background overlay */}
                      <div 
                        className="absolute inset-0 bg-black/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"
                        style={{ backgroundColor: `${trueColor}20` }}
                      />

                      <div className="relative z-10 pointer-events-none">
                        <div className="flex justify-between border-b border-black/10 pb-3 mb-4">
                          <span className="font-black text-black uppercase font-['Montserrat'] text-xl tracking-tighter group-hover:text-black transition-colors" style={{ WebkitTextStroke: '0.5px black' }}>{key}</span>
                          <span 
                            className="text-[9px] text-black px-2 py-1 font-black font-['Montserrat'] uppercase tracking-widest border border-black/10 shadow-sm transition-all"
                            style={{ backgroundColor: trueColor }}
                          >
                            ACTIVE
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-['Montserrat'] font-bold text-black/60 group-hover:text-black/80 mb-4 uppercase tracking-widest transition-colors duration-300">
                          <div>
                            <span className="block mb-1">RESOURCES</span>
                            <span className="text-black font-black">{details.count}</span>
                          </div>
                          <div className="text-right">
                            <span className="block mb-1">OUTPUT</span>
                            <span className="text-black font-black">{details.total_capacity?.toFixed(1) || 0.0} MW</span>
                          </div>
                        </div>

                        <div className="w-full h-4 bg-black/10 border border-black/10 overflow-hidden relative">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                            className="h-full transition-colors"
                            style={{ backgroundColor: trueColor }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Recharts Analytics Panel */}
          <motion.div variants={scaleIn} className="lg:col-span-8 flex flex-col gap-8">
            <div className="eco-nexus-glass-card p-6 md:p-10 shadow-xl relative overflow-hidden bg-white/60">
              <div className="absolute top-0 right-0 bg-black text-[#dfed2b] px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase shadow-md">
                METRICS
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest block mb-2 mt-2">
                // PERFORMANCE METRICS
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-8">
                ENERGY CURVE STATS
              </h2>

              <div className="space-y-12">
                
                {/* 1. Operational Output */}
                <motion.div whileHover={{ scale: 1.01 }} className="group">
                  <h3 className="text-xs font-['Montserrat'] text-black uppercase font-black mb-6 border-b border-black/10 pb-3 flex items-center gap-3 tracking-widest">
                    <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                      <Activity className="h-5 w-5" />
                    </motion.div>
                    OPERATIONAL OUTPUT (MW)
                  </h3>
                  <div className="bg-white/80 p-4 border border-black/10 shadow-inner group-hover:shadow-md transition-shadow">
                    <OperationalOutput data={charts.pulse} />
                  </div>
                </motion.div>

                {/* 2. Correlations & Utilization in Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-black/10">
                  <motion.div whileHover={{ scale: 1.02 }} className="group">
                    <h3 className="text-xs font-['Montserrat'] text-black uppercase font-black mb-6 border-b border-black/10 pb-3 flex items-center gap-3 tracking-widest">
                      <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
                        <TrendingUp className="h-5 w-5" />
                      </motion.div>
                      SOLAR INTENSITY CORRELATION
                    </h3>
                    <div className="bg-white/80 p-4 border border-black/10 shadow-inner group-hover:shadow-md transition-shadow">
                      <FactorCorrelation data={charts.correlation} type="solar" />
                    </div>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.02 }} className="group">
                    <h3 className="text-xs font-['Montserrat'] text-black uppercase font-black mb-6 border-b border-black/10 pb-3 flex items-center gap-3 tracking-widest">
                      <motion.div whileHover={{ scale: 1.2 }}>
                        <BarChart3 className="h-5 w-5" />
                      </motion.div>
                      CAPACITY UTILIZATION (%)
                    </h3>
                    <div className="bg-white/80 p-4 border border-black/10 shadow-inner group-hover:shadow-md transition-shadow">
                      <UtilizationTrend data={charts.trend} />
                    </div>
                  </motion.div>
                </div>

              </div>
            </div>
          </motion.div>

        </motion.div>

      </div>
    </motion.div>
  );
}

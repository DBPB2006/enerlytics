import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, Wind, Droplet, Flame, Globe, ArrowLeft, ArrowUpRight, TrendingUp, BookOpen } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import api from "../utils/api";

const CATEGORY_DETAILS = {
  solar: {
    title: "SOLAR ARRAY",
    icon: Sun,
    color: "#dfed2b",
    image: "/solar.png",
    tagline: "Unlocking democratic grid reserves from our nearest star.",
    description: "Photovoltaic cells collect and convert solar energy into clean electricity. Enerlytics helps local solar groups publish clear cell efficiency indexes, register panels, and monitor capacity reserves.",
    hotspots: ["Alamosa Valley Co-op", "Eastside Solar Assembly", "Sunnyvale Community Roofs"]
  },
  wind: {
    title: "WIND KINETIC",
    icon: Wind,
    color: "#A2E3E3",
    image: "/wind.png",
    tagline: "Harnessing high-altitude flow systems for neighborhood grids.",
    description: "Modern wind turbines generate clean electricity from regional wind currents. Using Enerlytics, local wind energy groups track rotor speeds, record generator outputs, and publish active status data.",
    hotspots: ["Breezy Ridge Co-op", "North Shore Turbine Circle", "Cascadia Wind Farm"]
  },
  hydro: {
    title: "HYDRO FLOW",
    icon: Droplet,
    color: "#9FD3FF",
    image: "/hydro.png",
    tagline: "Gravity fed water kinetic grids for decentralized collectives.",
    description: "Local river stream turbines capture energy from flowing water. Community groups leverage Enerlytics to log water flow rates, track seasonal generation curves, and maintain environmental standards.",
    hotspots: ["Salmon Creek Hydro", "Valley Gravity Feed", "Riverbend Micro-Turbine"]
  },
  biomass: {
    title: "BIOMASS GAS",
    icon: Flame,
    color: "#C3EAA6",
    image: "/biomass.png",
    tagline: "Zero-waste closed loop power from agricultural co-products.",
    description: "Community groups convert local organic waste materials into clean synthetic gases. Enerlytics guarantees auditable carbon metrics, showing full material traceability logs and gasification heat efficiency indexes.",
    hotspots: ["Sagebrush Farm Digester", "Hillside Organic Exchange", "County Waste Gasifier"]
  },
  geothermal: {
    title: "GEOTHERMAL CORE",
    icon: Globe,
    color: "#FFA47A",
    image: "/geothermal.png",
    tagline: "Tapping direct core heat pressure for robust grid baseloads.",
    description: "Deep subterranean heat wells generate constant steam pressure, supplying highly stable baseload clean current. Community groups use Enerlytics to audit thermal pressures, record outputs, and map heat dissipation curves.",
    hotspots: ["Hot Springs Baseload Node", "Volcanic Ridge Heat Core", "Valley Hot Well"]
  }
};

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

export default function CategoryOverview() {
  const { type } = useParams();
  const details = CATEGORY_DETAILS[type?.toLowerCase()] || CATEGORY_DETAILS.solar;
  const IconComponent = details.icon;

  const [liveSummary, setLiveSummary] = useState(null);
  const [liveHotspots, setLiveHotspots] = useState([]);

  useEffect(() => {
    const fetchLiveData = async () => {
      try {
        const [summaryRes, resourcesRes] = await Promise.all([
          api.get('/resources/categories/summary'),
          api.get(`/resources?type=${type}`)
        ]);

        if (summaryRes.data && summaryRes.data[type?.toLowerCase()]) {
          setLiveSummary(summaryRes.data[type?.toLowerCase()]);
        }

        if (resourcesRes.data && Array.isArray(resourcesRes.data)) {
          const names = resourcesRes.data.slice(0, 3).map(r => r.title);
          setLiveHotspots(names);
        }
      } catch (err) {
        console.error("Failed to fetch live category overview data", err);
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
        { hour: "08:00", output: roundVal(totalOutput * 0.15) },
        { hour: "10:00", output: roundVal(totalOutput * 0.55) },
        { hour: "12:00", output: roundVal(totalOutput * 1.0) },
        { hour: "14:00", output: roundVal(totalOutput * 0.90) },
        { hour: "16:00", output: roundVal(totalOutput * 0.45) },
        { hour: "18:00", output: roundVal(totalOutput * 0.10) },
      ];
    } else if (lowerType === 'wind') {
      return [
        { hour: "08:00", output: roundVal(totalOutput * 0.65) },
        { hour: "10:00", output: roundVal(totalOutput * 0.75) },
        { hour: "12:00", output: roundVal(totalOutput * 0.92) },
        { hour: "14:00", output: roundVal(totalOutput * 0.82) },
        { hour: "16:00", output: roundVal(totalOutput * 0.88) },
        { hour: "18:00", output: roundVal(totalOutput * 1.0) },
      ];
    } else if (lowerType === 'hydro') {
      return [
        { hour: "08:00", output: roundVal(totalOutput * 0.95) },
        { hour: "10:00", output: roundVal(totalOutput * 0.96) },
        { hour: "12:00", output: roundVal(totalOutput * 1.0) },
        { hour: "14:00", output: roundVal(totalOutput * 0.98) },
        { hour: "16:00", output: roundVal(totalOutput * 0.95) },
        { hour: "18:00", output: roundVal(totalOutput * 0.95) },
      ];
    } else if (lowerType === 'biomass') {
      return [
        { hour: "08:00", output: roundVal(totalOutput * 0.68) },
        { hour: "10:00", output: roundVal(totalOutput * 0.85) },
        { hour: "12:00", output: roundVal(totalOutput * 1.0) },
        { hour: "14:00", output: roundVal(totalOutput * 1.0) },
        { hour: "16:00", output: roundVal(totalOutput * 0.78) },
        { hour: "18:00", output: roundVal(totalOutput * 0.68) },
      ];
    } else { // geothermal
      return [
        { hour: "08:00", output: roundVal(totalOutput * 1.0) },
        { hour: "10:00", output: roundVal(totalOutput * 1.0) },
        { hour: "12:00", output: roundVal(totalOutput * 1.0) },
        { hour: "14:00", output: roundVal(totalOutput * 1.0) },
        { hour: "16:00", output: roundVal(totalOutput * 1.0) },
        { hour: "18:00", output: roundVal(totalOutput * 1.0) },
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
      className="relative w-full pb-20 select-none px-6 md:px-12 z-10 max-w-7xl mx-auto overflow-hidden"
    >
      {/* Background blobs based on active theme */}
      <motion.div 
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-10 right-10 w-96 h-96 rounded-full filter blur-3xl pointer-events-none" 
        style={{ backgroundColor: details.color }}
      />

      <div className="pt-4 relative z-10">
        {/* Back Link */}
        <motion.div variants={fadeUp}>
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 text-xs font-bold text-black/60 hover:text-black transition-colors mb-8 font-['Montserrat'] uppercase group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to Categories
          </Link>
        </motion.div>

        {/* Dynamic Theme Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 items-stretch">
          
          {/* Magazine Hero */}
          <motion.div variants={scaleIn} className="lg:col-span-8 bg-black p-8 md:p-12 relative flex flex-col justify-between shadow-2xl overflow-hidden group min-h-[500px]">
            {/* Background cover image with grayscale to color reveal */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
              <img 
                src={details.image} 
                alt={details.title} 
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 scale-100 group-hover:scale-105 transition-all duration-1000 ease-out opacity-40 group-hover:opacity-60"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
            </div>

            <div className="absolute top-0 right-0 bg-[#dfed2b] text-black px-4 py-1 text-[10px] font-bold font-['Montserrat'] tracking-wider z-25">
              AUDITED RESOURCE DATA
            </div>
            
            <div className="space-y-4 relative z-20">
              <div className="flex items-center gap-4 mb-6">
                <motion.div 
                  whileHover={{ rotate: 15 }}
                  className="p-4 bg-[#dfed2b] text-black shadow-lg"
                >
                  <IconComponent className="h-6 w-6" />
                </motion.div>
                <span className="text-[10px] font-['Montserrat'] uppercase tracking-widest text-[#dfed2b] font-bold bg-white/10 px-2 py-1 border border-[#dfed2b]/30 backdrop-blur-sm">
                  RENEWABLE DIVISION
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black font-['Montserrat'] text-white uppercase leading-none tracking-tighter group-hover:text-[#dfed2b] transition-colors duration-700">
                {details.title}
              </h1>
              
              <p className="text-sm md:text-base font-['Montserrat'] font-bold text-white leading-relaxed mt-4 max-w-xl">
                {details.tagline}
              </p>

              <p className="text-xs text-white/70 font-medium leading-relaxed max-w-2xl font-['Inter']">
                {details.description}
              </p>
            </div>

            <div className="mt-12 flex flex-wrap gap-4 relative z-20">
              <Link to={`/categories/${type?.toLowerCase()}/list`}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#dfed2b] text-black px-6 py-4 text-xs font-black font-['Montserrat'] uppercase hover:bg-white transition-colors flex items-center gap-2 shadow-xl"
                >
                  <BookOpen className="h-4 w-4" />
                  PLAYBOOKS & GUIDES
                </motion.button>
              </Link>
              <Link to="/resources">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white/10 text-white px-6 py-4 text-xs font-black font-['Montserrat'] uppercase border border-white/20 hover:bg-white/20 transition-colors flex items-center gap-2 shadow-md backdrop-blur-sm"
                >
                  ACTIVE MAP
                </motion.button>
              </Link>
            </div>
            
            {/* Decorative background element inside card */}
            <motion.div 
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 0.02 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="absolute -bottom-10 -right-10 pointer-events-none z-10"
            >
              <IconComponent className="w-96 h-96 text-white" />
            </motion.div>
          </motion.div>

          {/* Quick Metrics Panel */}
          <motion.div variants={staggerContainer} className="lg:col-span-4 flex flex-col gap-4">
            {/* Stat Card 1 */}
            <motion.div variants={fadeUp} whileHover={{ x: -5, scale: 1.01 }} className="flex-1 eco-nexus-glass-card p-6 flex flex-col justify-between group hover:bg-white/60 transition-all shadow-lg cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold bg-white/60 px-2 py-1 border border-black/10">Total Capacity</span>
                <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 bg-black rounded-full" />
              </div>
              <div className="text-5xl font-black font-['Montserrat'] text-black mt-4 tracking-tighter group-hover:text-[#dfed2b] transition-colors" style={{ WebkitTextStroke: '1px black' }}>
                {liveSummary ? `${liveSummary.total_output.toFixed(1)} MW` : "0.0 MW"}
              </div>
              <span className="text-[9px] font-['Inter'] text-black/50 font-bold mt-2 uppercase">Total active output tracker.</span>
            </motion.div>

            {/* Stat Card 2 */}
            <motion.div variants={fadeUp} whileHover={{ x: -5, scale: 1.01 }} className="flex-1 eco-nexus-glass-card p-6 flex flex-col justify-between group hover:bg-white/60 transition-all shadow-lg cursor-pointer">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold bg-white/60 px-2 py-1 border border-black/10">Efficiency</span>
                <div className="w-2 h-2 bg-black rounded-sm" />
              </div>
              <div className="text-5xl font-black font-['Montserrat'] text-black mt-4 tracking-tighter group-hover:text-[#dfed2b] transition-colors" style={{ WebkitTextStroke: '1px black' }}>
                {liveSummary ? liveSummary.avg_efficiency.toUpperCase() : "N/A"}
              </div>
              <span className="text-[9px] font-['Inter'] text-black/50 font-bold mt-2 uppercase">Average generation conversion.</span>
            </motion.div>

            {/* Stat Card 3 */}
            <motion.div variants={fadeUp} whileHover={{ x: -5, scale: 1.01 }} className="flex-1 bg-black text-white p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-[#dfed2b] translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-['Montserrat'] uppercase tracking-widest text-white/60 font-bold group-hover:text-black/60 transition-colors">Displacement</span>
                  <div className="w-2 h-2 bg-[#dfed2b] group-hover:bg-black transition-colors rounded-sm" />
                </div>
                <div className="text-5xl font-black font-['Montserrat'] text-[#dfed2b] mt-4 tracking-tighter group-hover:text-black transition-colors">
                  {liveSummary ? `${(liveSummary.total_output * 280).toLocaleString(undefined, {maximumFractionDigits: 0})}T CO₂` : "0T CO₂"}
                </div>
                <span className="text-[9px] font-['Inter'] text-white/50 font-bold mt-2 uppercase group-hover:text-black/50 transition-colors">Displaced annually on the grid.</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Magazine Spreads: Trends & Hotspots */}
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          
          {/* Generation Trend Recharts Panel */}
          <motion.div variants={scaleIn} className="lg:col-span-7 eco-nexus-glass-card p-8 shadow-xl">
            <div className="mb-6 pb-4 border-b border-black/10 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold mb-1 block">GENERATION CHART</span>
                <h3 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tight">Average Generation Profile</h3>
              </div>
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <TrendingUp className="h-8 w-8 text-black opacity-40" />
              </motion.div>
            </div>

            <div className="h-64 w-full mt-4 font-['Montserrat']">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={details.color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={details.color} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="hour" stroke="#000" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <YAxis stroke="#000" tick={{ fontSize: 9, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ stroke: 'black', strokeWidth: 1, strokeDasharray: '4 4' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-black text-white p-3 text-xs font-bold font-['Montserrat'] shadow-2xl border border-white/20"
                          >
                            <p className="text-[#dfed2b] text-[9px] uppercase mb-1">TIME: {payload[0].payload.hour}</p>
                            <p>OUTPUT: {payload[0].value} MW</p>
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
                    activeDot={{ r: 6, fill: '#dfed2b', stroke: '#000', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Regional Hotspots & Projects list */}
          <motion.div variants={staggerContainer} className="lg:col-span-5 flex flex-col gap-4">
            <motion.div variants={fadeUp} className="eco-nexus-glass-card p-8 flex-1 shadow-xl">
              <div className="pb-4 border-b border-black/10 mb-6">
                <span className="text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold block mb-1">REGIONAL HOTSPOTS</span>
                <h3 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tight">Active Coordinates</h3>
              </div>

              <div className="space-y-4">
                {(liveHotspots.length > 0 ? liveHotspots : details.hotspots).map((spot, index) => (
                  <motion.div 
                    key={index}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="bg-white/40 border border-black/10 p-4 flex items-center justify-between hover:bg-white transition-colors cursor-pointer group shadow-sm"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-['Montserrat'] text-[10px] font-bold text-black/40 group-hover:text-black transition-colors bg-black/5 px-2 py-1">
                        0{index + 1}.
                      </span>
                      <span className="text-sm font-black text-black uppercase font-['Montserrat'] tracking-tight">{spot}</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-black/40 group-hover:text-black transition-colors" />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp} whileHover={{ scale: 1.02 }} className="bg-black text-white p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 bg-[#dfed2b] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              <div className="relative z-10 flex items-center gap-4 group-hover:text-black transition-colors">
                <Globe className="h-8 w-8 opacity-50 group-hover:opacity-100 group-hover:animate-spin-slow transition-opacity" />
                <div>
                  <h4 className="font-['Montserrat'] text-xl font-black uppercase tracking-tight">Need a resource setup?</h4>
                  <p className="text-[10px] font-['Montserrat'] opacity-70 group-hover:opacity-100 font-bold">Register your array or turbine.</p>
                </div>
              </div>
              <Link to="/resources/create" className="relative z-10 bg-white/10 px-4 py-2 text-[10px] font-['Montserrat'] font-bold hover:bg-black hover:text-[#dfed2b] transition-colors border border-white/20 group-hover:border-black/20 group-hover:text-black group-hover:bg-white/40 backdrop-blur-sm">
                INITIATE
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

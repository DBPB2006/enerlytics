import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, Aperture, Layers, Database, Flame, Globe, ArrowRight, ArrowUpRight, MessageSquare } from "lucide-react";
import api from "../utils/api";

// Smooth, Cinematic Animation Variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

const fadeRight = {
  hidden: { opacity: 0, x: -50 },
  show: { opacity: 1, x: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

const scaleUp = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
};

export default function Home() {
  const [metrics, setMetrics] = useState({
    total_resources: 0,
    total_output: 0,
    average_efficiency: "N/A",
  });
  const [loading, setLoading] = useState(true);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [mapNodes, setMapNodes] = useState([]);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await api.get("/analytics");
        if (response.data && response.data.summary) {
          setMetrics(response.data.summary);
          
          if (response.data.resources) {
            const nodes = response.data.resources
              .filter(r => r.latitude !== null && r.longitude !== null)
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
                  type: r.type
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

  const categories = [
    { id: "solar", title: "Solar Power", icon: Aperture, color: "#dfed2b", text: "Solar panels capturing clean solar energy." },
    { id: "wind", title: "Wind Energy", icon: Layers, color: "#A2E3E3", text: "Wind turbines capturing regional wind kinetic energy." },
    { id: "hydro", title: "Hydro Power", icon: Database, color: "#9FD3FF", text: "Hydroelectric generators tracking clean water currents." },
    { id: "biomass", title: "Biomass Gas", icon: Flame, color: "#C3EAA6", text: "Organic gasification units harvesting clean bioenergy." },
    { id: "geothermal", title: "Geothermal Heat", icon: Globe, color: "#FFA47A", text: "Tapping subterranean core heat pressure." },
  ];

  const testimonials = [
    { name: "Kassandra Vance", role: "Wind Group Lead", text: "Enerlytics gave our regional group the exact transparent publishing power we needed to secure state clean energy credits." },
    { name: "Julian Thorne", role: "Solar Operator", text: "The playbook resources helped us align 12 neighborhood rooftops in under a week. Incredible UI!" },
    { name: "Sylvia Chen", role: "Hydro Specialist", text: "Democratic resource mapping keeps our local river stream turbine outputs transparent and auditable." },
  ];



  return (
    <div className="relative w-full pb-20 overflow-hidden select-none z-10">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-6 md:px-12 pt-24 pb-20 overflow-hidden">
        {/* Deep Gradient Overlay to make the text pop immersively against the fixed global background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-white/40 to-white/90 backdrop-blur-[2px] z-0 pointer-events-none" />

        <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="lg:col-span-8 space-y-8"
          >
            <motion.div
              variants={fadeRight}
              className="inline-flex items-center gap-2 bg-black text-[#dfed2b] px-4 py-1.5 text-[10px] font-bold font-['Montserrat'] tracking-widest uppercase shadow-2xl"
            >
              <Cpu className="h-3 w-3" /> COMMUNITY CLEAN ENERGY
            </motion.div>
            
            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-8xl lg:text-[7.5rem] font-black font-['Montserrat'] text-black uppercase leading-[0.85] tracking-tighter"
            >
              Fuel Your Day <br />
              <motion.span 
                initial={{ opacity: 0, rotateX: 90 }} 
                animate={{ opacity: 1, rotateX: 0 }} 
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.6 }} 
                className="inline-block text-white bg-black px-4 py-2 mx-1 shadow-2xl"
              >
                The Better
              </motion.span> Way
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-sm md:text-base text-black/70 font-['Montserrat'] font-bold leading-relaxed max-w-xl uppercase tracking-widest pt-4"
            >
              Enerlytics is the premium platform built for modern renewable energy communities. Track resource efficiency, view playbooks, and connect with local community groups.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-4 pt-8"
            >
              <Link to="/resources">
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="bg-black text-[#dfed2b] border border-black px-8 py-5 text-xs font-['Montserrat'] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center gap-3 group shadow-2xl hover:bg-transparent hover:text-black hover:backdrop-blur-md leaf-shape-sm"
                >
                  EXPLORE RESOURCES <ArrowRight className="h-4 w-4 group-hover:translate-x-2 transition-transform duration-500" />
                </motion.button>
              </Link>
              <Link to="/analytics">
                <motion.button 
                  whileHover={{ scale: 1.02 }} 
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 border border-black text-black px-8 py-5 text-xs font-['Montserrat'] font-black uppercase tracking-widest transition-all duration-500 flex items-center justify-center shadow-lg backdrop-blur-md hover:bg-black hover:text-white"
                >
                  OUR ENERGY ANALYTICS
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Abstract Hero Decor */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            className="hidden lg:flex lg:col-span-4 justify-end relative perspective-1000"
          >
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-full max-w-sm bg-white/20 backdrop-blur-xl border border-black/10 p-8 shadow-2xl relative z-10 leaf-shape-lg"
            >
              <div className="absolute -top-3 -right-3 bg-[#dfed2b] text-black px-3 py-1 text-[8px] font-bold font-['Montserrat'] tracking-widest uppercase shadow-md">
                ENERGY TRACKING
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 bg-black text-[#dfed2b] flex items-center justify-center leaf-shape-sm"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-6 w-6">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" fill="rgba(223, 237, 43, 0.2)" />
                    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeDasharray="3 3" />
                    <path d="M12 2v20M2 12h20M7.75 7.75l8.5 8.5M7.75 16.25l8.5-8.5" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" />
                  </svg>
                </motion.div>
                <div>
                  <h4 className="font-['Montserrat'] text-2xl font-black text-black uppercase leading-none tracking-tighter">Community Registry</h4>
                  <p className="text-[9px] text-black/50 font-['Montserrat'] font-bold uppercase tracking-widest mt-1">Resource #182 • Validated</p>
                </div>
              </div>

              <div className="space-y-4 font-['Montserrat'] text-xs font-bold uppercase tracking-widest">
                <motion.div 
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="bg-white/40 border border-black/5 p-4 flex justify-between items-center shadow-inner relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[#dfed2b]/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0" />
                  <span className="relative z-10 text-black/60 group-hover:text-black transition-colors">SOLAR FEED</span>
                  <span className="relative z-10 font-black text-black">+18.4 MW</span>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.05, x: 5 }}
                  className="bg-white/40 border border-black/5 p-4 flex justify-between items-center shadow-inner relative overflow-hidden group cursor-pointer"
                >
                  <div className="absolute inset-0 bg-[#A2E3E3]/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0" />
                  <span className="relative z-10 text-black/60 group-hover:text-black transition-colors">WIND KINETIC</span>
                  <span className="relative z-10 font-black text-black">+14.2 MW</span>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* 2. REAL-TIME METRICS BAR (Immersive Section) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 my-32 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="bg-black text-white p-12 md:p-16 shadow-2xl grid grid-cols-1 md:grid-cols-3 gap-12 text-center font-['Montserrat'] leaf-shape-lg"
        >
          <motion.div variants={fadeUp} className="group relative overflow-hidden cursor-pointer hover-glow-solar transition-all duration-500 bg-black text-white p-8 border border-white/5 space-y-4">
            <div className="absolute inset-0 bg-[#dfed2b] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] text-white/50 group-hover:text-black/50 font-bold uppercase tracking-widest transition-colors duration-500">ACTIVE CLEAN OUTPUT</span>
              <div className="text-5xl md:text-7xl font-black font-['Montserrat'] text-[#dfed2b] group-hover:text-black tracking-tighter transition-colors duration-500">
                {loading ? "0.0" : metrics.total_output.toFixed(1)} <span className="text-lg font-bold text-white/60 group-hover:text-black/60 font-['Montserrat'] tracking-widest transition-colors duration-500">MW</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="group relative overflow-hidden cursor-pointer hover-glow-wind transition-all duration-500 bg-black text-white p-8 border border-white/5 space-y-4 border-y border-white/10 md:border-y-0 md:border-x">
            <div className="absolute inset-0 bg-[#A2E3E3] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] text-white/50 group-hover:text-black/50 font-bold uppercase tracking-widest transition-colors duration-500">REGISTERED RESOURCES</span>
              <div className="text-5xl md:text-7xl font-black font-['Montserrat'] text-white group-hover:text-black tracking-tighter transition-colors duration-500">
                {loading ? "0" : metrics.total_resources} <span className="text-lg font-bold text-white/60 group-hover:text-black/60 font-['Montserrat'] tracking-widest transition-colors duration-500">GROUPS</span>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="group relative overflow-hidden cursor-pointer hover-glow-solar transition-all duration-500 bg-black text-white p-8 border border-white/5 space-y-4">
            <div className="absolute inset-0 bg-[#dfed2b] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
            <div className="relative z-10 space-y-4">
              <span className="text-[10px] text-white/50 group-hover:text-black/50 font-bold uppercase tracking-widest transition-colors duration-500">AVG CELL EFFICIENCY</span>
              <div className="text-5xl md:text-7xl font-black font-['Montserrat'] text-[#dfed2b] group-hover:text-black tracking-tighter transition-colors duration-500">
                {metrics.average_efficiency}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>



      {/* 4. INTERACTIVE GEOSPATIAL MAP PREVIEW */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mb-32">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={scaleUp}
          className="eco-nexus-glass-card p-0 shadow-2xl relative overflow-hidden bg-white/60 backdrop-blur-2xl border border-black/5"
        >
          <div className="absolute top-6 right-6 bg-black text-[#dfed2b] px-4 py-1.5 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase z-20 shadow-xl">
            MAP-V1
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch relative z-10">
            
            <div className="lg:col-span-5 p-12 md:p-16 flex flex-col justify-center border-r border-black/5 bg-white/40 relative overflow-hidden group cursor-pointer hover-glow-solar transition-all duration-500">
              <div className="absolute inset-0 bg-[#dfed2b] translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
              <div className="relative z-10 flex flex-col justify-center h-full">
                <span className="text-[10px] font-['Montserrat'] font-bold uppercase text-black/50 group-hover:text-black/50 tracking-widest mb-6 block transition-colors">
                  // GEOSPATIAL COORDINATES
                </span>
                <h2 className="text-5xl md:text-6xl font-black font-['Montserrat'] text-black uppercase leading-[0.9] tracking-tighter mb-6 group-hover:text-black transition-colors">
                  INTERACTIVE RESOURCE MAP
                </h2>
                <p className="text-xs text-black/70 group-hover:text-black/80 font-['Montserrat'] font-medium leading-relaxed uppercase tracking-widest mb-10 transition-colors">
                  Users map clean energy generation across regional areas. Click or hover on the interactive spots to view active power outputs.
                </p>
                
                <Link to="/resources" className="inline-block relative z-20">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-transparent border border-black hover:bg-black hover:text-white group-hover:bg-black group-hover:text-[#dfed2b] group-hover:border-black text-black px-8 py-5 text-[10px] font-['Montserrat'] font-black uppercase tracking-widest transition-all duration-500 shadow-lg w-full md:w-auto"
                  >
                    LAUNCH LIVE MAP
                  </motion.button>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 bg-black/[0.03] min-h-[500px] relative overflow-hidden flex items-center justify-center">
              
              {/* Abstract Map Graphic */}
              <svg className="w-[120%] h-[120%] text-black/[0.04] absolute inset-0 m-auto" fill="currentColor" viewBox="0 0 800 400">
                <path d="M150,150 Q180,120 220,160 T300,120 T380,180 T480,130 T600,190 T700,110 T750,200 L750,300 L150,300 Z" />
              </svg>

              {mapNodes.map((node) => (
                <div
                  key={node.id}
                  className="absolute cursor-pointer"
                  style={{ left: node.x, top: node.y }}
                  onMouseEnter={() => setHoveredNode(node)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <motion.div
                    whileHover={{ scale: 1.5 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-4 h-4 rounded-full relative shadow-lg bg-black"
                  >
                    <span className="absolute inset-0 rounded-full bg-[#dfed2b] opacity-50 animate-ping" />
                  </motion.div>
                </div>
              ))}

              <AnimatePresence>
                {hoveredNode && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="absolute bottom-8 left-8 bg-black text-white p-6 shadow-2xl text-[10px] font-['Montserrat'] pointer-events-none min-w-[280px] uppercase font-bold tracking-widest"
                  >
                    <h4 className="text-sm leading-tight mb-4 border-b border-white/20 pb-4">{hoveredNode.label}</h4>
                    <div className="flex justify-between items-end text-[#dfed2b]">
                      <span className="opacity-70 text-[9px]">LIVE OUTPUT</span>
                      <span className="font-black text-2xl font-['Montserrat']">{hoveredNode.output}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

          </div>
        </motion.div>
      </section>

      {/* 5. PLAYFUL CTA (Reimagined as Cinematic Banner) */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 mt-40">
        <motion.div 
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
          className="relative bg-black p-16 md:p-24 text-center shadow-2xl overflow-hidden leaf-shape-xl group cursor-pointer transition-all duration-500 hover-glow-solar"
        >
          {/* Slide-in vibrant background overlay */}
          <div className="absolute inset-0 bg-[#dfed2b] translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-out z-0" />
          
          {/* Subtle noise/texture overlay */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none z-0" />
          
          <div className="max-w-4xl mx-auto space-y-12 relative z-10">
            <h2 className="text-5xl md:text-8xl font-black font-['Montserrat'] text-white group-hover:text-black uppercase leading-[0.9] tracking-tighter transition-colors duration-500">
              READY TO CLAIM <br/> <span className="text-[#dfed2b] group-hover:text-black transition-colors duration-500">GRID INDEPENDENCE?</span>
            </h2>
            <p className="text-xs md:text-sm text-white/70 group-hover:text-black/75 font-['Montserrat'] font-bold leading-relaxed uppercase tracking-widest max-w-2xl mx-auto transition-colors duration-500">
              Register your local wind turbines, solar arrays, or hydro streams. Empower your neighborhood with transparent energy tracking.
            </p>
            <div className="pt-8 flex justify-center gap-6 flex-wrap">
              <Link to="/signup" className="relative z-20">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#dfed2b] group-hover:bg-black group-hover:text-[#dfed2b] text-black px-10 py-6 text-xs font-['Montserrat'] font-black uppercase tracking-widest transition-all duration-500 shadow-2xl"
                >
                  SIGN UP
                </motion.button>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import api from "../utils/api";

// Cinematic Animation Variants
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

export default function Categories() {
  const [liveSummary, setLiveSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/resources/categories/summary');
        setLiveSummary(res.data);
      } catch (err) {
        console.error("Failed to fetch category summaries", err);
      }
    };
    fetchSummary();
  }, []);

  const categoryCards = [
    {
      id: "solar",
      number: "01.",
      title: "SOLAR",
      desc: "Solar power metrics. Real-time solar intensity tracking.",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "wind",
      number: "02.",
      title: "WIND",
      desc: "Turbine angular velocity and atmospheric pressure differentials.",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "hydro",
      number: "03.",
      title: "HYDRO",
      desc: "Flow rate dynamics and turbine pressure metrics. Reservoir level management.",
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "biomass",
      number: "04.",
      title: "BIOMASS",
      desc: "Organic material conversion and thermal output metrics.",
      image: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop"
    },
    {
      id: "geothermal",
      number: "05.",
      title: "GEOTHERMAL",
      desc: "Subterranean heat extraction and steam pressure metrics.",
      image: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1000&auto=format&fit=crop"
    }
  ];

  return (
    <>
      <div className="relative min-h-screen w-full flex flex-col px-6 md:px-12 z-10 overflow-hidden pb-32">

        {/* Cinematic Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 pt-20"
        >
          <div className="bg-black text-[#dfed2b] px-4 py-1.5 inline-block font-['Montserrat'] text-[10px] mb-6 font-bold shadow-2xl tracking-widest uppercase">
            RENEWABLE CATEGORIES
          </div>
          <h1 className="font-['Montserrat'] text-7xl md:text-9xl leading-[0.8] text-black m-0 uppercase font-black tracking-tighter">
            ENERGY <br /> <span className="text-black/80">INSIGHTS</span>
          </h1>
        </motion.div>

        {/* Cinematic Floating Grid: Categories */}
        <main className="flex-grow flex items-start justify-center py-6">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-[1400px] mx-auto"
          >
            {categoryCards.map((cat) => {
              const realMetric = liveSummary ? liveSummary[cat.id] : null;
              const metrics = [
                { label: "Active Nodes", value: realMetric ? `${realMetric.count}` : "0" },
                { label: "Total Yield", value: realMetric ? `${realMetric.total_output.toFixed(1)} MW` : "0.0 MW" },
                { label: "Avg Efficiency", value: realMetric ? `${realMetric.avg_efficiency.toUpperCase()}` : "N/A" }
              ];

              return (
                <motion.div
                  key={cat.id}
                  variants={fadeUp}
                  className="group relative h-[600px] bg-black overflow-hidden cursor-pointer shadow-2xl border border-black/20"
                >
                  {/* Full Bleed Image with Grayscale to Color reveal */}
                  <div className="absolute inset-0 w-full h-full">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="object-cover w-full h-full grayscale group-hover:grayscale-0 scale-100 group-hover:scale-110 transition-all duration-1000 ease-out"
                    />
                  </div>

                  {/* Deep Cinematic Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-1000" />

                  {/* Top Number Indicator */}
                  <div className="absolute top-6 left-6 flex justify-between items-start w-[calc(100%-3rem)] z-10 mix-blend-difference text-white">
                    <div className="font-['Montserrat'] font-bold text-white/60 text-xs tracking-widest">{cat.number}</div>
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="w-3 h-3 bg-[#dfed2b] shadow-lg"
                    />
                  </div>

                  {/* Bottom Content Area */}
                  <div className="absolute bottom-0 left-0 w-full p-8 flex flex-col justify-end h-full z-10 text-white">

                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700 ease-out">
                      <h3 className="font-['Montserrat'] text-5xl leading-none font-black mb-4 uppercase tracking-tighter text-white group-hover:text-[#dfed2b] transition-colors duration-700">
                        {cat.title}
                      </h3>
                      <p className="text-[10px] leading-relaxed font-['Montserrat'] text-white/70 font-medium uppercase tracking-widest mb-8 opacity-0 group-hover:opacity-100 transition-opacity duration-700 delay-100">
                        {cat.desc}
                      </p>

                      <div className="space-y-4 mb-8 font-['Montserrat'] text-[10px] text-white/50 uppercase font-bold border-t border-white/20 pt-6">
                        {metrics.map((m, idx) => (
                          <div key={idx} className="flex justify-between pb-2 group-hover:text-white/80 transition-colors duration-700">
                            <span>{m.label}</span>
                            <span className="text-white">{m.value}</span>
                          </div>
                        ))}
                      </div>

                      <Link to={`/categories/${cat.id}`}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full bg-[#dfed2b] text-black py-4 font-black text-[10px] font-['Montserrat'] uppercase tracking-widest hover:bg-white transition-colors duration-500 flex items-center justify-center gap-3 shadow-2xl"
                        >
                          VIEW CATEGORY <ArrowRight className="w-4 h-4" />
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
        transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 1 }}
        className="fixed top-1/3 left-10 bg-[#dfed2b] text-black p-4 z-20 shadow-2xl font-['Montserrat'] text-xs font-black border border-black/10 transform transition-transform hidden lg:block hover:rotate-0 cursor-pointer"
      >
        Enerlytics Insights
      </motion.div>

      {/* Watermark Layer */}
      <div className="fixed inset-0 flex flex-col justify-center items-center z-0 overflow-hidden pointer-events-none mix-blend-overlay opacity-10">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="text-[30vw] font-['Montserrat'] font-black uppercase text-black leading-[0.8] -mt-20"
        >
          ENERGY
        </motion.div>
      </div>
    </>
  );
}

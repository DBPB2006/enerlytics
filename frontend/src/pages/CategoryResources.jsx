import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Cpu, AlertTriangle, MapPin, Activity, Sun, Wind, Droplet, Flame, Globe, Search, BookOpen, Download, HelpCircle, CheckSquare } from "lucide-react";
import api from "../utils/api";

const CATEGORY_DOCS = {
  solar: [
    { title: "Hyperlocal Solar Angling Manual", size: "2.4 MB", type: "PDF Guide", desc: "Detailed mathematical lookup sheet for optimizing solar tilt angles by seasonal solar coordinates." },
    { title: "Cooperative Solar Installation Checklist", size: "1.2 MB", type: "Checklist", desc: "Step-by-step assembly playbook for neighborhood rooftop cooperative panel mounts." },
    { title: "Photovoltaic Inverter Safety Code", size: "3.1 MB", type: "Technical Spec", desc: "Federated standards for linking community PV storage arrays to regional grid feeds." }
  ],
  wind: [
    { title: "Kinetic Turbine Foundation Guide", size: "4.8 MB", type: "PDF Guide", desc: "Geological criteria and concrete pouring checklists for community kinetic wind turbine installations." },
    { title: "Blade Aerodynamics Maintenance Sheet", size: "850 KB", type: "Checklist", desc: "Recommended inspection schedules, lubrication grades, and rotor blade cleaning methodologies." },
    { title: "Decentralized Wind Governor Tuning", size: "1.7 MB", type: "Technical Spec", desc: "Configuring automated power brakes and load dumps to handle seasonal gale surges safely." }
  ],
  hydro: [
    { title: "Gravity Stream Micro-Turbine Playbook", size: "3.5 MB", type: "PDF Guide", desc: "Sizing guidelines for gravity-fed streams and regional run-of-river flow installations." },
    { title: "Fish Bypass Ecological Standards", size: "1.4 MB", type: "Checklist", desc: "Ensuring stream node setups preserve fish migrations and avoid oxygen depletion spots." },
    { title: "Hydraulic Head Height Calculus Sheet", size: "2.0 MB", type: "Technical Spec", desc: "Simple spreadsheet templates for converting flow volumes and gravity drops directly into load projections." }
  ],
  biomass: [
    { title: "Co-product Gasification Best Practices", size: "2.8 MB", type: "PDF Guide", desc: "Optimizing material moisture indices to maintain safe high-temperature synthetic gas yields." },
    { title: "Anaerobic Digestion Log Sheets", size: "900 KB", type: "Checklist", desc: "Daily monitoring tables for tracking pH, temperature, and methane purity logs." }
  ],
  geothermal: [
    { title: "Subterranean Well Pressure Audits", size: "5.2 MB", type: "PDF Guide", desc: "Subsurface temperature logs, flow volume tracking, and core valve maintenance guides." }
  ]
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function CategoryResources() {
  const { type } = useParams();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("nodes");

  useEffect(() => {
    const fetchCategoryResources = async () => {
      try {
        setError("");
        const response = await api.get(`/resources?type=${type}`);
        setResources(response.data);
      } catch (err) {
        setResources([]);
        setError("Failed to fetch node stations from the database.");
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryResources();
  }, [type]);

  const getCategoryMeta = () => {
    const energyType = type?.toLowerCase();
    switch (energyType) {
      case "solar":
        return { title: "Solar Generation", icon: Sun, color: "#dfed2b", bgClass: "bg-[#FFF9C4]", desc: "Direct conversion solar energy harvesting units. These arrays capture direct electromagnetic radiation from coordinates mapping close to the equator. Load yields are calculated relative to panel coverage efficiency factors." };
      case "wind":
        return { title: "Wind Turbines", icon: Wind, color: "#dfed2b", bgClass: "bg-[#E0F7F7]", desc: "Kinetic wind capture turbines operated by community cooperatives. Outputs correlate with rotor swept dimensions and weather speed vectors. High variations are recorded due to altitude wind velocities." };
      case "hydro":
        return { title: "Hydroelectric Plants", icon: Droplet, color: "#dfed2b", bgClass: "bg-[#E1F0FF]", desc: "Run-of-the-river flow assemblies utilizing gravitational velocity head drops. Yield is calculated by water density weight multiplied by cubic flow rate and gravity acceleration coefficients." };
      case "biomass":
        return { title: "Biomass Gasifiers", icon: Flame, color: "#dfed2b", bgClass: "bg-[#F1FAD8]", desc: "Synthetic gasification structures utilizing regional organic byproducts. These assets convert material loads into robust, closed-loop cooperative loads." };
      case "geothermal":
        return { title: "Geothermal Heat Core", icon: Globe, color: "#dfed2b", bgClass: "bg-[#FFEBE1]", desc: "subterranean heat baseload nodes extracting steady pressure profiles from volcanic heat grids." };
      default:
        return { title: "Energy Resources", icon: Cpu, color: "#dfed2b", bgClass: "bg-white", desc: "Federated renewable resource node profiles." };
    }
  };

  const meta = getCategoryMeta();
  const Icon = meta.icon;
  const docsList = CATEGORY_DOCS[type?.toLowerCase()] || [];

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title?.toLowerCase().includes(searchQuery.toLowerCase()) || res.location_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || res.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCapacity = resources.reduce((acc, r) => acc + (parseFloat(r.capacity) || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full pb-20 pt-6 select-none"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-12 relative z-10">
        
        {/* Back Link */}
        <Link 
          to="/categories" 
          className="inline-flex items-center gap-2 text-[10px] font-bold font-['Montserrat'] tracking-widest text-black/60 hover:text-black hover:bg-white/40 px-4 py-2 border border-black/10 transition-colors mb-8 uppercase backdrop-blur-md group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> BACK TO SYSTEMS
        </Link>

        {/* Sub-hero Profile Header */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mb-12"
        >
          <div className="eco-nexus-glass-card p-8 md:p-12 shadow-2xl flex flex-col lg:flex-row items-stretch justify-between gap-12 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-64 h-64 ${meta.bgClass} opacity-50 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none`}></div>
            <div className="max-w-3xl relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <motion.div whileHover={{ scale: 1.05 }} className="bg-black text-[#dfed2b] p-3 shadow-xl">
                  <Icon className="h-8 w-8" />
                </motion.div>
                <h1 className="font-['Montserrat'] text-5xl md:text-6xl font-black uppercase text-black tracking-tighter leading-none m-0">
                  {meta.title} <span className="text-black/40">REGISTRY</span>
                </h1>
              </div>
              <p className="text-sm text-black/70 font-['Inter'] leading-relaxed">
                {meta.desc}
              </p>
            </div>

            {/* Aggregated values */}
            <div className="flex flex-row lg:flex-col justify-between lg:justify-center gap-8 border-t lg:border-t-0 lg:border-l border-black/10 pt-8 lg:pt-0 lg:pl-12 shrink-0 min-w-[200px] relative z-10">
              <div>
                <span className="block text-[10px] text-black/40 uppercase font-bold font-['Montserrat'] tracking-widest mb-1">AGGREGATED NODES</span>
                <span className="font-black text-4xl text-black font-['Montserrat'] tracking-tighter leading-none">{resources.length}</span>
              </div>
              <div>
                <span className="block text-[10px] text-black/40 uppercase font-bold font-['Montserrat'] tracking-widest mb-1">AGGREGATED CAPACITY</span>
                <span className="font-black text-4xl text-black font-['Montserrat'] tracking-tighter leading-none">{totalCapacity.toFixed(1)} <span className="text-xl text-black/40">MW</span></span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab navigation with gliding underline */}
        <div className="flex gap-4 mb-8 font-['Montserrat'] font-bold text-xs relative">
          {["nodes", "docs"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-6 py-3 border border-black/10 uppercase tracking-widest transition-colors ${
                activeTab === tab ? "bg-black text-[#dfed2b]" : "bg-white/40 text-black/60 hover:bg-white/80 hover:text-black"
              }`}
            >
              {tab === "nodes" && "NODE STATIONS"}
              {tab === "docs" && "PLAYBOOKS & GUIDES"}
              {activeTab === tab && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-[#dfed2b]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <AnimatePresence mode="wait">
          {activeTab === "nodes" ? (
            <motion.div
              key="nodes"
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -10 }}
              variants={containerVariants}
              className="space-y-8"
            >
              {/* Search and Filters */}
              <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-6 items-center justify-between eco-nexus-glass-card p-4 md:p-6 shadow-xl">
                {/* Search input */}
                <div className="relative w-full md:max-w-md flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-black/40" />
                  <input
                    type="text"
                    placeholder="Search node stations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full text-xs border border-black/10 bg-white/40 pl-12 pr-4 py-4 outline-none font-bold font-['Montserrat'] focus:bg-white transition-colors shadow-inner"
                  />
                </div>

                {/* Filter chips */}
                <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                  {["all", "active", "maintenance", "offline"].map((status) => (
                    <motion.button
                      key={status}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setStatusFilter(status)}
                      className={`px-6 py-3 border border-black/10 text-[10px] font-bold font-['Montserrat'] uppercase tracking-widest transition-all whitespace-nowrap ${
                        statusFilter === status 
                          ? "bg-black text-[#dfed2b] shadow-lg" 
                          : "bg-white/40 text-black hover:bg-white/80"
                      }`}
                    >
                      {status}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {filteredResources.length === 0 ? (
                <motion.div variants={itemVariants} className="text-center py-20 border border-dashed border-black/20 text-xs text-black/40 bg-white/20 font-bold font-['Montserrat'] uppercase tracking-widest backdrop-blur-sm">
                  No active node stations match your filters.
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredResources.map((res) => {
                    const accentColors = {
                      solar: "#dfed2b",
                      wind: "#A2E3E3",
                      hydro: "#9FD3FF",
                      biomass: "#C3EAA6",
                      geothermal: "#FFA47A"
                    };
                    const trueColor = accentColors[type?.toLowerCase()] || "#dfed2b";
                    const glowClass = `hover-glow-${type?.toLowerCase()}`;
                    return (
                      <motion.div
                        key={res.id}
                        variants={itemVariants}
                        whileHover={{ y: -8 }}
                        className={`eco-nexus-glass-card p-8 flex flex-col justify-between h-full shadow-xl transition-all duration-500 relative overflow-hidden group cursor-pointer ${glowClass} hover-slide-chevron`}
                      >
                        {/* Slide-in vibrant background overlay */}
                        <div 
                          className="absolute inset-0 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0"
                          style={{ backgroundColor: `${trueColor}20` }}
                        />

                        <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                          <div>
                            <div className="flex justify-between items-start mb-6">
                              <span className="text-[10px] font-['Montserrat'] font-bold text-black/40 uppercase tracking-widest bg-white/80 px-2 py-1 border border-black/10 shadow-sm transition-colors group-hover:text-black/60">
                                ND-{res.id}
                              </span>
                              <span className={`uppercase font-['Montserrat'] font-bold text-[10px] flex items-center gap-2 px-2 py-1 border border-black/10 bg-white/80 shadow-sm transition-all duration-300 ${
                                res.status === "active" ? "text-green-600" : res.status === "maintenance" ? "text-yellow-600" : "text-red-600"
                              }`}>
                                <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
                                {res.status}
                              </span>
                            </div>
                            
                            <h3 className="font-['Montserrat'] text-3xl font-black uppercase text-black tracking-tighter leading-none mb-8 group-hover:text-black transition-colors">
                              {res.title}
                            </h3>

                            <div className="space-y-3 text-[10px] font-bold font-['Montserrat'] uppercase text-black/70 group-hover:text-black transition-colors duration-300">
                              <div className="flex justify-between items-center border-b border-black/10 pb-2">
                                <span>CAPACITY</span>
                                <span className="text-black text-sm">{res.capacity} MW</span>
                              </div>

                              <div className="flex justify-between items-center border-b border-black/10 pb-2">
                                <span>RATING</span>
                                <span className="text-black">{res.accuracy}</span>
                              </div>

                              <div className="flex justify-between items-center pb-2">
                                <span>LOCATION</span>
                                <span className="text-black text-right truncate max-w-[150px]">{res.location_name || `${parseFloat(res.latitude).toFixed(2)}, ${parseFloat(res.longitude).toFixed(2)}`}</span>
                              </div>
                            </div>
                          </div>

                          <div className="mt-8 relative z-20 pointer-events-auto">
                            <Link
                              to={`/resources/${res.id}`}
                              className="w-full bg-black text-white py-4 text-[10px] font-black font-['Montserrat'] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#dfed2b] hover:text-black group-hover:bg-black group-hover:text-[#dfed2b] transition-colors shadow-xl"
                            >
                              VIEW DETAILS <ArrowLeft className="h-4 w-4 rotate-180 transition-all duration-300" />
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
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {docsList.length === 0 ? (
                <motion.div variants={itemVariants} className="col-span-full text-center py-20 border border-dashed border-black/20 text-xs text-black/40 bg-white/20 font-bold font-['Montserrat'] uppercase tracking-widest backdrop-blur-sm">
                  No playbook manuals available for this division yet.
                </motion.div>
              ) : (
                docsList.map((doc, idx) => {
                  const accentColors = {
                    solar: "#dfed2b",
                    wind: "#A2E3E3",
                    hydro: "#9FD3FF",
                    biomass: "#C3EAA6",
                    geothermal: "#FFA47A"
                  };
                  const trueColor = accentColors[type?.toLowerCase()] || "#dfed2b";
                  const glowClass = `hover-glow-${type?.toLowerCase()}`;
                  return (
                    <motion.div
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ y: -8 }}
                      className={`eco-nexus-glass-card p-8 flex flex-col justify-between h-full shadow-xl transition-all duration-500 relative overflow-hidden group cursor-pointer ${glowClass}`}
                    >
                      {/* Slide-in vibrant background overlay */}
                      <div 
                        className="absolute inset-0 -translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0"
                        style={{ backgroundColor: `${trueColor}15` }}
                      />

                      <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                        <div>
                          <div className="flex justify-between items-center mb-6">
                            <span className="bg-[#dfed2b] text-black px-3 py-1 text-[10px] font-bold font-['Montserrat'] tracking-widest uppercase border border-black/10 shadow-sm group-hover:bg-black group-hover:text-[#dfed2b] transition-all">
                              {doc.type}
                            </span>
                            <span className="text-[10px] font-['Montserrat'] font-bold text-black/40 tracking-widest transition-colors group-hover:text-black">
                              {doc.size}
                            </span>
                          </div>
                          
                          <h4 className="font-['Montserrat'] text-2xl font-black text-black uppercase leading-none tracking-tighter mb-4 group-hover:text-black transition-colors">
                            {doc.title}
                          </h4>
                          
                          <p className="text-xs text-black/60 font-['Inter'] leading-relaxed mb-8 transition-colors group-hover:text-black/80">
                            {doc.desc}
                          </p>
                        </div>

                        <div className="pointer-events-auto relative z-20">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => alert(`Initiating secure local download of playbooks: "${doc.title}"`)}
                            className="w-full bg-white/80 border border-black/10 text-black py-4 text-[10px] font-black font-['Montserrat'] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black hover:text-[#dfed2b] transition-colors shadow-lg group"
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

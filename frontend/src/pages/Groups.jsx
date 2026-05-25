import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, MapPin, Loader2, ShieldAlert, Users, ArrowRight, Sparkles, X, Compass, Globe } from "lucide-react";
import api from "../utils/api";
import confetti from "canvas-confetti";

export default function Groups() {
  const navigate = useNavigate();
  const [joinedGroups, setJoinedGroups] = useState([]);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [modalError, setModalError] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setError("");
      const [joinedRes, discoverRes] = await Promise.all([
        api.get("/groups"),
        api.get("/groups/discover")
      ]);
      setJoinedGroups(joinedRes.data);
      setDiscoverGroups(discoverRes.data);

      // Check if user belongs to any group but hasn't enabled MFA
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (joinedRes.data.length > 0 && !user.mfa_enabled) {
        alert("Multi-Factor Authentication (MFA) setup is mandatory for community members. Redirecting to setup...");
        navigate("/mfa/setup");
        return;
      }
    } catch (err) {
      setError("Failed to fetch community cooperatives directory.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleJoinRequest = async (groupId) => {
    try {
      const response = await api.post(`/groups/${groupId}/join`);
      if (response.data.message) {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.8 }, colors: ["#dfed2b", "#ffffff", "#000000"] });
        fetchGroups();
      }
    } catch (err) {
      if (err.response?.data?.error === 'MFA_REQUIRED') {
        alert(err.response.data.message);
        navigate("/mfa/setup");
      } else {
        alert(err.response?.data?.error || "Failed to submit membership request.");
      }
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setModalError("");
    setModalLoading(true);

    try {
      const response = await api.post("/groups", { name, description, location });
      if (response.status === 201 || response.status === 200) {
        confetti({ particleCount: 150, spread: 80, colors: ["#dfed2b", "#ffffff", "#000000"] });
        setName("");
        setDescription("");
        setLocation("");
        setModalOpen(false);
        fetchGroups();
      }
    } catch (err) {
      if (err.response?.data?.error === 'MFA_REQUIRED') {
        setModalOpen(false);
        alert(err.response.data.message);
        navigate("/mfa/setup");
      } else {
        setModalError(err.response?.data?.message || "Failed to initialize community.");
      }
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-68px)] w-full pb-20 pt-10 overflow-hidden select-none z-10"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-black text-[#dfed2b] px-4 py-1 text-[10px] font-bold font-['Montserrat'] tracking-widest uppercase">
              <Globe className="h-3 w-3" /> REGIONAL ENERGY GROUPS
            </div>
            <h1 className="font-['Montserrat'] text-5xl md:text-6xl font-black uppercase text-black leading-none tracking-tighter">
              Community Groups
            </h1>
            <p className="text-xs font-bold text-black/60 font-['Montserrat'] uppercase tracking-widest max-w-xl">
              Connect with local community energy groups, track shared resources, and collaborate on sustainability.
            </p>
          </div>
          
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#dfed2b] hover:bg-black hover:text-white text-black font-['Montserrat'] font-black px-6 py-4 transition-colors uppercase tracking-widest text-xs self-start sm:self-auto border border-black/10"
          >
            <Plus className="h-4 w-4" />
            Create Group
          </button>
        </div>

        {error && (
          <div className="mb-8 flex items-center gap-3 bg-black text-[#dfed2b] p-4 text-[10px] font-['Montserrat'] font-bold uppercase">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-28 gap-4">
            <Loader2 className="h-10 w-10 text-black animate-spin" />
            <span className="text-xs font-['Montserrat'] text-black/60 uppercase tracking-widest font-bold animate-pulse">Loading community groups...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            
            {/* 1. Joined Groups */}
            <div className="space-y-6">
              <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                  MY GROUPS
                </div>
                <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                  // YOUR MEMBERSHIPS
                </span>
                <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                  YOUR GROUPS
                </h2>

                {joinedGroups.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-black/20 text-[10px] font-['Montserrat'] text-black/40 bg-white/40 uppercase tracking-widest font-bold">
                    No active group memberships.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinedGroups.map((g, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: -6, scale: 1.01 }}
                        key={g.id} 
                        className="relative bg-white/40 border border-black/10 p-6 shadow-md overflow-hidden group cursor-pointer hover-glow-solar hover-slide-chevron transition-all duration-300"
                      >
                        {/* Slide-in vibrant background overlay */}
                        <div className="absolute inset-0 bg-[#dfed2b]/15 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
                        
                        <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="font-['Montserrat'] font-black text-2xl text-black uppercase tracking-tighter transition-colors group-hover:text-black">
                                {g.name}
                              </h3>
                              {g.location && (
                                <span className="text-[10px] font-['Montserrat'] text-black/60 group-hover:text-black/80 font-bold uppercase flex items-center gap-2 mt-2 tracking-widest transition-colors">
                                  <MapPin className="h-3 w-3" /> {g.location}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] bg-[#dfed2b] text-black px-3 py-1 font-black font-['Montserrat'] uppercase tracking-widest border border-black/10">
                              ACTIVE
                            </span>
                          </div>
                          {g.description && (
                            <p className="text-xs font-['Montserrat'] text-black/60 group-hover:text-black/80 font-bold leading-relaxed mb-6 uppercase transition-colors">
                              {g.description}
                            </p>
                          )}
                          <div className="pointer-events-auto relative z-20">
                            <Link
                              to={`/groups/${g.id}`}
                              className="w-full text-center bg-black hover:bg-[#dfed2b] hover:text-black text-white text-[10px] font-['Montserrat'] font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-all duration-300"
                            >
                              <Compass className="h-4 w-4 group-hover:rotate-45 transition-transform duration-500" /> VIEW GROUP DETAILS
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Discover Groups */}
            <div className="space-y-6">
              <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden bg-[#dfed2b]/20">
                <div className="absolute top-0 right-0 bg-black text-[#dfed2b] px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                  DISCOVER
                </div>
                <span className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest block mb-2 mt-2">
                  // PUBLIC DIRECTORY
                </span>
                <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                  DISCOVER GROUPS
                </h2>

                {discoverGroups.length === 0 ? (
                  <div className="text-center py-16 border border-dashed border-black/20 text-[10px] font-['Montserrat'] text-black/40 bg-white/40 uppercase tracking-widest font-bold">
                    No other groups available in this region.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {discoverGroups.map((g, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        whileHover={{ x: 6, scale: 1.01 }}
                        key={g.id} 
                        className="relative bg-white/40 border border-black/10 p-6 shadow-md overflow-hidden group cursor-pointer hover-glow-wind hover-slide-chevron transition-all duration-300"
                      >
                        {/* Slide-in vibrant background overlay */}
                        <div className="absolute inset-0 bg-[#A2E3E3]/15 translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out z-0" />
                        
                        <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
                          <div className="mb-4">
                            <h3 className="font-['Montserrat'] font-black text-2xl text-black uppercase tracking-tighter transition-colors group-hover:text-black">
                              {g.name}
                            </h3>
                            {g.location && (
                              <span className="text-[10px] font-['Montserrat'] text-black/60 group-hover:text-black/80 font-bold uppercase flex items-center gap-2 mt-2 tracking-widest transition-colors">
                                <MapPin className="h-3 w-3" /> {g.location}
                              </span>
                            )}
                          </div>
                          {g.description && (
                            <p className="text-xs font-['Montserrat'] text-black/60 group-hover:text-black/80 font-bold leading-relaxed mb-6 uppercase transition-colors">
                              {g.description}
                            </p>
                          )}
                          
                          <div className="pointer-events-auto relative z-20">
                            <button
                              onClick={() => handleJoinRequest(g.id)}
                              className="w-full text-center bg-white border border-black/20 hover:bg-black hover:text-white text-black py-3 text-[10px] font-['Montserrat'] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2"
                            >
                              <Users className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" /> REQUEST MEMBERSHIP
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {/* Modal: Initialize Group */}
        <AnimatePresence>
          {modalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-md relative z-10"
              >
                <div className="eco-nexus-glass-card p-6 md:p-8 shadow-2xl relative overflow-hidden bg-white">
                  <div className="absolute top-0 right-0 bg-black text-[#dfed2b] px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                    CREATE
                  </div>
                  
                  <button 
                    onClick={() => setModalOpen(false)}
                    className="absolute top-4 right-4 text-black/40 hover:text-black transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-4">
                    // GROUP DETAILS
                  </span>
                  <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                    CREATE NEW GROUP
                  </h2>

                  <form onSubmit={handleCreateGroup} className="space-y-6">
                    {modalError && (
                      <div className="flex items-center gap-3 bg-red-500 text-white p-4 text-[10px] font-['Montserrat'] font-bold uppercase">
                        <ShieldAlert className="h-4 w-4 shrink-0" />
                        <span>{modalError}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold">GROUP NAME</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eastside Community Solar"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black/5 border border-black/10 px-4 py-3 text-sm font-['Montserrat'] font-bold text-black focus:outline-none focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold">LOCATION / REGION</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Portland, OR"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-black/5 border border-black/10 px-4 py-3 text-sm font-['Montserrat'] font-bold text-black focus:outline-none focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold">DESCRIPTION / MISSION</label>
                      <textarea
                        rows="3"
                        required
                        placeholder="Describe the purpose of this group..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-black/5 border border-black/10 px-4 py-3 text-sm font-['Montserrat'] font-bold text-black focus:outline-none focus:bg-white transition-colors"
                      />
                    </div>

                    <div className="flex justify-end gap-4 pt-4 border-t border-black/10">
                      <button
                        type="button"
                        onClick={() => setModalOpen(false)}
                        className="text-[10px] font-['Montserrat'] font-bold text-black/60 hover:text-black uppercase tracking-widest"
                      >
                        CANCEL
                      </button>
                      <button
                        type="submit"
                        disabled={modalLoading}
                        className="bg-black text-white hover:bg-[#dfed2b] hover:text-black px-6 py-3 text-[10px] font-['Montserrat'] font-black uppercase tracking-widest transition-colors"
                      >
                        {modalLoading ? "CREATING..." : "CREATE"}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

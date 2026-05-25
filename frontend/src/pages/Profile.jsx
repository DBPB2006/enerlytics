import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, ShieldAlert, Key, HardDrive, Terminal, Award, Zap, AwardIcon, Compass, Sparkles, UserCheck } from "lucide-react";
import api from "../utils/api";

export default function Profile() {
  const navigate = useNavigate();
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;
  const token = localStorage.getItem("token");

  const handleDisconnect = async () => {
    try {
      await api.post('/logout');
    } catch (e) {
      console.error("Logout failed", e);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.dispatchEvent(new Event('auth-change'));
      navigate("/login");
    }
  };

  if (!user) {
    return (
      <div className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center p-4 z-10">
        <div className="eco-nexus-glass-card max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
            WARNING
          </div>
          <div className="flex flex-col items-center text-center space-y-6 mt-4">
            <ShieldAlert className="h-12 w-12 text-red-500" />
            <p className="text-sm font-['Montserrat'] font-bold text-black uppercase tracking-widest">
              No authenticated operator session detected. Please sign in to continue.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-black hover:bg-[#dfed2b] hover:text-black text-white text-xs py-3 font-['Montserrat'] font-black flex items-center justify-center gap-2 transition-colors uppercase tracking-widest"
            >
              SIGN IN
            </button>
          </div>
        </div>
      </div>
    );
  }

  const registrationDate = user.created_at ? new Date(user.created_at).toLocaleDateString() : "2026-04-20";

  const sustainabilityBadges = [
    { title: "Solar Pioneer", desc: "First 10 MW mapped", emoji: "☀️", color: "#dfed2b", text: "text-black" },
    { title: "Wind Kineticist", desc: "Turbine assembly lead", emoji: "💨", color: "#A2E3E3", text: "text-black" },
    { title: "Hydro Guardian", desc: "Gravity stream validated", emoji: "🌊", color: "#9FD3FF", text: "text-black" },
    { title: "Coop Leader", desc: "Active cooperatives", emoji: "🌱", color: "#C3EAA6", text: "text-black" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-68px)] w-full pb-20 pt-8 overflow-hidden select-none z-10"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12 relative z-10">
        
        <div className="mb-10 space-y-2">
          <div className="inline-flex items-center gap-2 bg-black text-[#dfed2b] px-4 py-1 text-[10px] font-bold font-['Montserrat'] tracking-widest uppercase">
            <UserCheck className="h-3 w-3" /> USER PROFILE
          </div>
          <h1 className="font-['Montserrat'] text-5xl md:text-6xl font-black uppercase text-black leading-none tracking-tighter">
            User Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            
            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                PROFILE
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // USER INFORMATION
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                ACCOUNT DETAILS
              </h2>

              <div className="space-y-8">
                
                <div className="flex items-center gap-6 border-b border-black/10 pb-6">
                  <div className="h-20 w-20 bg-black text-[#dfed2b] flex items-center justify-center font-black text-3xl font-['Montserrat'] uppercase tracking-tighter shadow-md">
                    {user.name.substring(0, 2)}
                  </div>
                  <div>
                    <h2 className="font-['Montserrat'] font-black text-4xl text-black uppercase leading-none tracking-tighter">
                      {user.name}
                    </h2>
                    <span className="text-xs font-['Montserrat'] font-bold text-black/60 mt-2 block tracking-widest uppercase">{user.email}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-xs font-bold text-black font-['Montserrat'] uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Award className="h-4 w-4" /> Participation Status</span>
                    <span>{user.is_validated ? 'Validated Member' : 'Pending Verification'}</span>
                  </div>
                  <div className="w-full bg-white/40 border border-black/10 h-6 overflow-hidden relative">
                    <div className="bg-[#dfed2b] h-full" style={{ width: user.is_validated ? '100%' : '50%' }} />
                    <div className="absolute inset-0 border border-black/20 pointer-events-none" />
                  </div>
                  <p className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                    <Zap className="h-3 w-3" /> Renewable tracking active
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 font-['Montserrat'] text-xs font-bold uppercase">
                  <div className="border border-black/10 p-5 bg-white/40 hover:bg-white transition-all duration-300 hover-glow-solar hover:scale-[1.03] cursor-pointer relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#dfed2b]/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0" />
                    <div className="relative z-10">
                      <span className="block text-[10px] text-black/60 tracking-widest mb-1">Account Role</span>
                      <span className="font-black text-black">{user.role?.replace('_', ' ') || 'Citizen'}</span>
                    </div>
                  </div>
                  <div className="border border-black/10 p-5 bg-white/40 hover:bg-white transition-all duration-300 hover-glow-solar hover:scale-[1.03] cursor-pointer relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#dfed2b]/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0" />
                    <div className="relative z-10">
                      <span className="block text-[10px] text-black/60 tracking-widest mb-1">MFA Protection</span>
                      <span className={`font-black ${user.mfa_required ? "text-black" : "text-red-500"}`}>
                        {user.mfa_required ? "MFA ENABLED" : "MFA DISABLED"}
                      </span>
                    </div>
                  </div>
                  <div className="border border-black/10 p-5 bg-white/40 hover:bg-white transition-all duration-300 hover-glow-solar hover:scale-[1.03] cursor-pointer relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#dfed2b]/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0" />
                    <div className="relative z-10">
                      <span className="block text-[10px] text-black/60 tracking-widest mb-1">Validation ID</span>
                      <span className="font-black text-black">{user.unique_id || "N/A"}</span>
                    </div>
                  </div>
                  <div className="border border-black/10 p-5 bg-white/40 hover:bg-white transition-all duration-300 hover-glow-solar hover:scale-[1.03] cursor-pointer relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[#dfed2b]/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0" />
                    <div className="relative z-10">
                      <span className="block text-[10px] text-black/60 tracking-widest mb-1">Registration Date</span>
                      <span className="font-black text-black">{registrationDate}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                AWARDS
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // SUSTAINABILITY MILESTONES
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                EARNED BADGES
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {sustainabilityBadges.map((badge, idx) => {
                  const glowClasses = [
                    "hover-glow-solar",
                    "hover-glow-wind",
                    "hover-glow-hydro",
                    "hover-glow-biomass"
                  ];
                  return (
                    <div 
                      key={idx}
                      className={`p-5 flex flex-col items-center justify-between text-center transition-all duration-500 hover-grayscale-reveal hover:scale-105 cursor-pointer shadow-md hover:shadow-xl ${glowClasses[idx]} group`}
                      style={{ backgroundColor: badge.color }}
                    >
                      <div className="w-12 h-12 bg-white/60 flex items-center justify-center text-2xl mb-4 shadow-sm group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">
                        {badge.emoji}
                      </div>
                      <div className="space-y-1">
                        <h4 className={`font-['Montserrat'] font-black text-sm uppercase leading-tight ${badge.text}`}>{badge.title}</h4>
                        <p className={`text-[9px] font-['Montserrat'] font-bold leading-tight uppercase tracking-widest opacity-80 ${badge.text}`}>{badge.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                LOGS
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // RECENT ACCOUNT OPERATIONS
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                ACTIVITY LOG
              </h2>

              <div className="space-y-4 font-['Montserrat'] text-xs">
                <div className="flex gap-4 items-start border-l-4 border-black pl-5 py-4 bg-white/40 hover:bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer group hover-rotate-icon relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#dfed2b]/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0" />
                  <Terminal className="h-5 w-5 shrink-0 text-black mt-0.5 relative z-10 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="font-black text-black uppercase tracking-widest mb-1">Resource Mapped</div>
                    <span className="text-[10px] text-black/60 font-bold uppercase tracking-widest block">Status: Active</span>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start border-l-4 border-black pl-5 py-4 bg-white/40 hover:bg-white transition-all duration-300 hover:scale-[1.02] cursor-pointer group hover-rotate-icon relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#dfed2b]/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0" />
                  <Terminal className="h-5 w-5 shrink-0 text-black mt-0.5 relative z-10 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="font-black text-black uppercase tracking-widest mb-1">Community Group Joined</div>
                    <span className="text-[10px] text-black/60 font-bold uppercase tracking-widest block">Status: Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden bg-red-500/10">
              <div className="absolute top-0 right-0 bg-black text-red-500 px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                SESSION
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest block mb-2 mt-2">
                // SESSION MANAGEMENT
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                LOGOUT
              </h2>

              <div className="space-y-4 font-['Montserrat'] text-xs text-black font-bold uppercase">
                <div className="pt-2">
                  <button
                    onClick={handleDisconnect}
                    className="w-full bg-red-500 hover:bg-black text-white py-4 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    LOG OUT
                  </button>
                </div>
              </div>
            </div>

            <div className="h-10 w-full bg-black/5 flex items-center justify-center text-[10px] font-['Montserrat'] tracking-widest text-black/40 border border-black/10 select-none uppercase font-bold">
              ||||| SECURE SESSION |||||
            </div>
          </div>

        </div>

      </div>
    </motion.div>
  );
}

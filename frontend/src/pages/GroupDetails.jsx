import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Cpu, AlertTriangle, MapPin, Check, X, LogOut, ShieldAlert, Sparkles, Activity, FileText } from "lucide-react";
import api from "../utils/api";
import confetti from "canvas-confetti";

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [group, setGroup] = useState(null);
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchGroupDetails = async () => {
    try {
      setError("");
      const groupRes = await api.get(`/groups/${id}`);
      setGroup(groupRes.data);

      // Check if user belongs to the group but hasn't enabled MFA
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (!user.mfa_enabled) {
        alert("Multi-Factor Authentication (MFA) setup is mandatory for community members. Redirecting to setup...");
        navigate("/mfa/setup");
        return;
      }

      const resourcesRes = await api.get(`/groups/${id}/resources`);
      setResources(resourcesRes.data);

      const userRole = groupRes.data.users?.[0]?.pivot?.role;
      if (userRole === "owner" || userRole === "admin" || userRole === "member") {
        const membersRes = await api.get(`/groups/${id}/members`);
        setMembers(membersRes.data);
      }
      if (userRole === "owner" || userRole === "admin") {
        const reqRes = await api.get(`/groups/${id}/requests`);
        setRequests(reqRes.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || 
        "Failed to load group details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  const handleApprove = async (userId) => {
    try {
      await api.post(`/groups/${id}/approve/${userId}`);
      confetti({ particleCount: 50, spread: 40, colors: ["#dfed2b", "#ffffff"] });
      fetchGroupDetails();
    } catch (err) {
      alert("Failed to approve membership request.");
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.post(`/groups/${id}/reject/${userId}`);
      fetchGroupDetails();
    } catch (err) {
      alert("Failed to reject membership request.");
    }
  };

  const handleLeaveGroup = async () => {
    if (!window.confirm("Leave this group?")) return;
    try {
      await api.post(`/groups/${id}/leave`);
      navigate("/groups");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to leave group.");
    }
  };

  const handlePromote = async (userId) => {
    try {
      await api.post(`/groups/${id}/promote/${userId}`);
      fetchGroupDetails();
    } catch (err) {
      alert("Failed to promote user.");
    }
  };

  const handleDemote = async (userId) => {
    try {
      await api.post(`/groups/${id}/demote/${userId}`);
      fetchGroupDetails();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to demote user.");
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center z-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2Icon className="h-10 w-10 text-black animate-spin" />
          <p className="font-['Montserrat'] text-xs text-black/60 uppercase tracking-widest font-bold animate-pulse">Retrieving group details...</p>
        </div>
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center p-4 z-10">
        <div className="eco-nexus-glass-card max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
            DENIED
          </div>
          <div className="flex flex-col items-center text-center space-y-6 mt-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-sm font-['Montserrat'] font-bold text-black">
              {error.toUpperCase() || "GROUP DETAILS ARE CURRENTLY UNREACHABLE."}
            </p>
            <Link to="/groups" className="w-full bg-black hover:bg-[#dfed2b] hover:text-black text-white text-xs py-3 font-['Montserrat'] font-black flex items-center justify-center gap-2 transition-colors uppercase tracking-widest">
              <ArrowLeft className="h-4 w-4" /> Back to directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentUserRole = group.users?.[0]?.pivot?.role || "member";
  const isAdminOrOwner = currentUserRole === "owner" || currentUserRole === "admin";
  const isOwner = currentUserRole === "owner";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-68px)] w-full pb-20 pt-8 overflow-hidden select-none z-10"
    >
      <div className="mx-auto max-w-7xl px-6 md:px-12 relative z-10">
        
        <Link to="/groups" className="inline-flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold uppercase tracking-widest text-black/60 hover:text-black mb-6 group transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Directory
        </Link>

        {/* Header Panel */}
        <div className="mb-8 eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden bg-white/60">
          <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
            GROUP-{group.id}
          </div>
          <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
            // GROUP DETAILS
          </span>
          <h1 className="font-['Montserrat'] text-5xl font-black text-black uppercase tracking-tighter mb-6">
            {group.name}
          </h1>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-black/10 pt-6">
            <div>
              <span className="text-[10px] font-['Montserrat'] text-black/60 uppercase font-bold tracking-widest">GROUP LOCATION</span>
              {group.location && (
                <p className="text-sm font-['Montserrat'] font-black text-black mt-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-black/60" />
                  {group.location.toUpperCase()}
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 font-['Montserrat'] text-xs self-start md:self-auto">
              <div className="flex border border-black/20 bg-white shadow-md">
                <span className="px-4 py-2 uppercase font-black text-black bg-[#dfed2b] border-r border-black/20 tracking-widest">
                  ROLE: {currentUserRole}
                </span>
                {currentUserRole !== "owner" && (
                  <button
                    onClick={handleLeaveGroup}
                    className="px-4 py-2 font-black uppercase text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer flex items-center gap-2 tracking-widest"
                  >
                    <LogOut className="h-4 w-4" />
                    DISCONNECT
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main Resources List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                ACTIVE-RESOURCES
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // REGISTERED ENERGY PRODUCTION RESOURCES
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                GROUP RESOURCES
              </h2>

              {resources.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-black/20 text-[10px] font-['Montserrat'] text-black/40 bg-white/40 uppercase tracking-widest font-bold">
                  No energy assets registered under this group yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {resources.map((res, idx) => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      key={res.id} 
                      className="bg-white/40 border border-black/10 p-5 hover:bg-white/60 transition-colors flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="font-['Montserrat'] font-black text-xl text-black uppercase leading-tight truncate pr-4">
                            {res.title}
                          </h4>
                          <span className={`w-2 h-2 mt-1.5 shrink-0 ${
                            res.status === "active" ? "bg-[#C3EAA6] border border-black" : res.status === "maintenance" ? "bg-[#FFF066] border border-black" : "bg-red-500 border border-black"
                          }`} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-['Montserrat'] text-black/60 mb-6 font-bold uppercase tracking-widest">
                          <div>
                            <span className="block mb-1">TYPE</span>
                            <span className="font-black text-black">{res.type}</span>
                          </div>
                          <div>
                            <span className="block mb-1">CAPACITY</span>
                            <span className="font-black text-black">{res.capacity} MW</span>
                          </div>
                        </div>
                      </div>

                      <Link
                        to={`/resources/${res.id}`}
                        className="w-full text-center bg-black hover:bg-[#dfed2b] hover:text-black text-white text-[10px] font-['Montserrat'] font-black uppercase tracking-widest py-3 flex items-center justify-center gap-2 transition-colors"
                      >
                        DEEP DIVE DETAILS <Activity className="h-4 w-4" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                INFO-02
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // MISSION STATEMENT
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-4">
                GROUP OVERVIEW
              </h2>
              <div className="bg-white/40 p-5 border border-black/10 relative">
                <FileText className="absolute top-4 right-4 h-5 w-5 text-black/20" />
                <p className="text-xs text-black leading-relaxed font-bold font-['Montserrat'] italic pr-8">
                  "{group.description || "No mission description logged for this community group."}"
                </p>
              </div>
            </div>

            {isAdminOrOwner && (
              <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden bg-[#dfed2b]/20">
                <div className="absolute top-0 right-0 bg-black text-[#dfed2b] px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                  INBOX
                </div>
                <span className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest block mb-2 mt-2">
                  // MEMBERSHIP REQUESTS INBOX
                </span>
                <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6 outline-text">
                  PENDING REQUESTS
                </h2>

                {requests.length === 0 ? (
                  <div className="text-center py-8 text-[10px] font-['Montserrat'] text-black/40 bg-white/40 border border-dashed border-black/20 uppercase tracking-widest font-bold">
                    NO PENDING MEMBERSHIP REQUESTS.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {requests.map((r, idx) => (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        key={r.id} 
                        className="border border-black/10 p-5 bg-white/60 space-y-4 font-['Montserrat'] text-xs font-bold"
                      >
                        <div className="flex flex-col gap-2">
                          <span className="font-black text-black uppercase truncate text-sm">{r.name}</span>
                          <span className="text-[10px] text-black/60 uppercase tracking-widest">{r.email}</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(r.id)}
                            className="flex-1 bg-black text-white hover:bg-[#dfed2b] hover:text-black py-3 text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                          >
                            <Check className="h-4 w-4" /> APPROVE
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            className="flex-1 bg-white border border-black/20 hover:bg-red-500 hover:text-white py-3 text-[10px] text-black font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                          >
                            <X className="h-4 w-4" /> REJECT
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                MEMBERS
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // NETWORK REGISTRY
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-4 outline-text">
                GROUP MEMBERS
              </h2>
              
              <div className="space-y-3">
                {members.map((m, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={m.id} 
                    className="border border-black/10 p-4 bg-white/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4 font-['Montserrat'] text-xs font-bold"
                  >
                    <div>
                      <span className="font-black text-black uppercase block text-sm">{m.name}</span>
                      <span className="text-[10px] text-black/60 uppercase tracking-widest">{m.pivot.role}</span>
                    </div>
                    {isOwner && m.pivot.role !== "owner" && (
                      <div className="flex gap-2">
                        {m.pivot.role === "member" ? (
                          <button
                            onClick={() => handlePromote(m.id)}
                            className="bg-black text-white hover:bg-[#dfed2b] hover:text-black px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors"
                          >
                            PROMOTE
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDemote(m.id)}
                            className="bg-white border border-black/20 hover:bg-black hover:text-white text-black px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-colors"
                          >
                            DEMOTE
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
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

function Loader2Icon({ className }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

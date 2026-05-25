import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Trash2, Cpu, AlertTriangle, MapPin, Compass, Users, Activity, Zap, ShieldCheck, HelpCircle, Loader2 } from "lucide-react";
import api from "../utils/api";
import AnalyticsCharts from "../components/AnalyticsCharts";

export default function ResourceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [resource, setResource] = useState(null);
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setError("");
        const [response, metricsRes] = await Promise.all([
          api.get(`/resources/${id}`),
          api.get(`/resources/${id}/metrics`)
        ]);
        setResource(response.data);
        setMetrics(metricsRes.data);
      } catch (err) {
        setError("Failed to fetch resource details or access was denied.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
      await api.delete(`/resources/${id}`);
      navigate("/resources");
    } catch (err) {
      alert("Failed to delete this resource.");
    }
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center z-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 text-black animate-spin" />
          <p className="font-['Montserrat'] text-xs text-black/60 uppercase tracking-widest font-bold animate-pulse">Retrieving resource data...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center p-4 z-10">
        <div className="eco-nexus-glass-card max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-red-500 text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
            EXCEPTION
          </div>
          <div className="flex flex-col items-center text-center space-y-6 mt-4">
            <AlertTriangle className="h-12 w-12 text-red-500" />
            <p className="text-sm font-['Montserrat'] font-bold text-black">
              {error.toUpperCase() || "RESOURCE DETAILS ARE CURRENTLY UNREACHABLE."}
            </p>
            <Link to="/resources" className="w-full bg-black hover:bg-[#dfed2b] hover:text-black text-white text-xs py-3 font-['Montserrat'] font-black flex items-center justify-center gap-2 transition-colors uppercase">
              <ArrowLeft className="h-4 w-4" /> Back to Map Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const canModify = resource.created_by === currentUser.id || (resource.group && resource.group.owner_id === currentUser.id);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-68px)] w-full pb-20 pt-8 overflow-hidden select-none z-10 max-w-7xl mx-auto px-6 md:px-12"
    >
      <Link to="/resources" className="inline-flex items-center gap-1.5 text-xs font-['Montserrat'] font-bold uppercase tracking-widest text-black/60 hover:text-black mb-6 group transition-colors">
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back to Map Directory
      </Link>

      {/* Header Panel */}
      <div className="mb-8 eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
          RESOURCE-{resource.id}
        </div>
        <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
          // RESOURCE SPECIFICATIONS
        </span>
        <h1 className="font-['Montserrat'] text-5xl font-black text-black uppercase tracking-tighter mb-6">
          {resource.title}
        </h1>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-t border-black/10 pt-6">
          <div>
            <span className="text-[10px] font-['Montserrat'] text-black/60 uppercase font-bold">RESOURCE LOCATION</span>
            <p className="text-sm font-['Montserrat'] font-black text-black mt-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-black/60" />
              {resource.location_name?.toUpperCase() || `${resource.latitude}, ${resource.longitude}`}, {resource.region?.toUpperCase() || "GLOBAL"}
            </p>
          </div>

          {canModify && (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                to={`/resources/edit/${id}`}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#dfed2b] hover:bg-black hover:text-white text-black px-6 py-3 text-xs font-['Montserrat'] font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                EDIT RESOURCE
              </Link>
              <button
                onClick={handleDelete}
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 text-xs font-['Montserrat'] font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                <Trash2 className="h-4 w-4" />
                DELETE RESOURCE
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
              02
            </div>
            <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
              // CORE METRICS
            </span>
            <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
              OPERATIONAL PARAMETERS
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-['Montserrat']">
              <div className="bg-white/40 border border-black/10 p-4">
                <span className="block text-[10px] text-black/60 uppercase font-bold">CAPACITY</span>
                <span className="text-xl font-black text-black mt-2 block">{resource.capacity} MW</span>
              </div>
              <div className="bg-white/40 border border-black/10 p-4">
                <span className="block text-[10px] text-black/60 uppercase font-bold">STATUS</span>
                <span className="text-sm font-black text-black mt-2 block uppercase bg-[#dfed2b] px-2 py-1 w-fit border border-black/10">
                  {resource.status}
                </span>
              </div>
              <div className="bg-white/40 border border-black/10 p-4">
                <span className="block text-[10px] text-black/60 uppercase font-bold">LOAD FACTOR</span>
                <span className="text-xl font-black text-black mt-2 block">
                  {resource.utilization !== undefined && resource.utilization !== null
                    ? parseFloat(resource.utilization).toFixed(0)
                    : (resource.load_factor ? (resource.load_factor * 100).toFixed(0) : 0)}%
                </span>
              </div>
              <div className="bg-white/40 border border-black/10 p-4">
                <span className="block text-[10px] text-black/60 uppercase font-bold">ACCURACY</span>
                <span className="text-xl font-black text-black uppercase mt-2 block">{resource.accuracy || "N/A"}</span>
              </div>
            </div>
          </div>

          <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
              03
            </div>
            <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
              // ASSET PHYSICS
            </span>
            <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
              TYPE SPECIFIC METRICS
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-['Montserrat'] text-xs">
              {resource.type === "solar" && (
                <>
                  <div className="bg-white/40 border border-black/10 p-5 flex justify-between items-center">
                    <span className="text-black/60 uppercase font-bold">Panel Surface Area</span>
                    <span className="font-black text-black text-sm">{resource.panel_area || 0} m²</span>
                  </div>
                  <div className="bg-white/40 border border-black/10 p-5 flex justify-between items-center">
                    <span className="text-black/60 uppercase font-bold">Cell Efficiency</span>
                    <span className="font-black text-black text-sm">
                      {resource.efficiency !== undefined && resource.efficiency !== null
                        ? (parseFloat(resource.efficiency) * 100).toFixed(1)
                        : (resource.cell_efficiency ? (parseFloat(resource.cell_efficiency) * 100).toFixed(1) : 0)}%
                    </span>
                  </div>
                </>
              )}
              {resource.type === "wind" && (
                <>
                  <div className="bg-white/40 border border-black/10 p-5 flex justify-between items-center">
                    <span className="text-black/60 uppercase font-bold">Rotor Swept Area</span>
                    <span className="font-black text-black text-sm">{resource.rotor_area || resource.rotor_swept_area || 0} m²</span>
                  </div>
                  <div className="bg-white/40 border border-black/10 p-5 flex justify-between items-center">
                    <span className="text-black/60 uppercase font-bold">Turbine Model</span>
                    <span className="font-black text-black uppercase text-sm">{resource.turbine_model || "N/A"}</span>
                  </div>
                </>
              )}
              {resource.type === "hydro" && (
                <>
                  <div className="bg-white/40 border border-black/10 p-5 flex justify-between items-center">
                    <span className="text-black/60 uppercase font-bold">Water Flow Rate</span>
                    <span className="font-black text-black text-sm">{resource.flow_rate || 0} m³/s</span>
                  </div>
                  <div className="bg-white/40 border border-black/10 p-5 flex justify-between items-center">
                    <span className="text-black/60 uppercase font-bold">Hydraulic Head Height</span>
                    <span className="font-black text-black text-sm">{resource.head || 0} m</span>
                  </div>
                </>
              )}
              {resource.type !== "solar" && resource.type !== "wind" && resource.type !== "hydro" && (
                <div className="col-span-2 bg-white/40 border border-black/10 p-8 text-center text-black/60 flex flex-col items-center gap-3">
                  <HelpCircle className="h-6 w-6 text-black/20" />
                  <span className="font-bold">Type-specific physical variables are consolidated inside general telemetry logs.</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Analytics Charts Section */}
          <AnalyticsCharts resource={resource} metrics={metrics} />
          
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          
          <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
              04
            </div>
            <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
              // OVERVIEW
            </span>
            <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-4">
              RESOURCE DETAILS
            </h2>
            <div className="bg-white/40 p-5 border border-black/10">
              <p className="text-xs text-black leading-relaxed font-bold font-['Montserrat'] italic">
                "{resource.description || "No description logged for this energy resource."}"
              </p>
            </div>
          </div>

          {resource.group && (
            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                GROUP
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // AFFILIATED GROUP
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                COMMUNITY GROUP
              </h2>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="bg-black text-[#dfed2b] p-4">
                    <Users className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-['Montserrat'] font-black text-xl text-black uppercase leading-none">
                      {resource.group.name}
                    </h4>
                    <span className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase mt-2 block">
                      GROUP INFO
                    </span>
                  </div>
                </div>
                <Link
                  to={`/groups/${resource.group.id}`}
                  className="w-full text-center bg-black hover:bg-[#dfed2b] hover:text-black text-white text-xs font-['Montserrat'] font-black py-4 flex items-center justify-center gap-2 transition-colors uppercase tracking-widest"
                >
                  VIEW GROUP DETAILS <Compass className="h-4 w-4" />
                </Link>
              </div>
            </div>
          )}

          {resource.energy_insight && (
            <div className="eco-nexus-glass-card p-6 md:p-8 shadow-xl relative overflow-hidden bg-[#dfed2b]/20">
              <div className="absolute top-0 right-0 bg-black text-[#dfed2b] px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                INSIGHT
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest block mb-2 mt-2">
                // OUTPUT SUMMARY
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-6">
                ESTIMATED POWER YIELD
              </h2>
              <div className="space-y-4 font-['Montserrat'] text-xs text-black font-bold">
                <div className="flex justify-between border-b border-black/10 pb-3">
                  <span className="text-black/60 uppercase">DAILY OUTPUT:</span>
                  <span className="font-black text-sm">{resource.energy_insight.estimated_output?.toFixed(2)} MW</span>
                </div>
                <div className="flex justify-between border-b border-black/10 pb-3">
                  <span className="text-black/60 uppercase">EFFICIENCY INDEX:</span>
                  <span className="font-black uppercase bg-black text-[#dfed2b] px-2 py-1 flex items-center gap-2">
                    <ShieldCheck className="h-3 w-3" />
                    {resource.energy_insight.efficiency_score}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-black/60 uppercase">RELIABILITY:</span>
                  <span className="font-black text-black">{resource.energy_insight.reliability_index || "HIGH QUALITY"}</span>
                </div>
              </div>
            </div>
          )}

          <div className="h-10 w-full bg-black/5 flex items-center justify-center text-[10px] font-['Montserrat'] tracking-widest text-black/40 border border-black/10 select-none uppercase font-bold">
            ||||| SECURE SESSION |||||
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

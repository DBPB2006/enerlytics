import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useParams } from "react-router-dom";
import { motion as motionFramer, AnimatePresence } from "framer-motion";
import { ArrowLeft, Save, AlertCircle, Sparkles, Upload, Sun, Wind, Droplet, Flame, Globe, Tags, Check, Trash2, Loader2 } from "lucide-react";
import api from "../utils/api";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Search as SearchIcon } from "lucide-react";

export default function CreateResource() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const queryLat = searchParams.get("lat");
  const queryLng = searchParams.get("lng");

  const { id } = useParams();
  const isEditMode = !!id;

  const [step, setStep] = useState(1);
  const [groups, setGroups] = useState([]);
  const [loadingGroups, setLoadingGroups] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("solar");
  const [capacity, setCapacity] = useState("");
  const [latitude, setLatitude] = useState(queryLat || "");
  const [longitude, setLongitude] = useState(queryLng || "");
  const [locationName, setLocationName] = useState("");
  const [region, setRegion] = useState("");
  const [status, setStatus] = useState("active");
  const [groupId, setGroupId] = useState("");

  const [irradiance, setIrradiance] = useState("");
  const [windSpeed, setWindSpeed] = useState("");
  const [riverFlow, setRiverFlow] = useState("");

  const [panelArea, setPanelArea] = useState("");
  const [cellEfficiency, setCellEfficiency] = useState("0.18");
  const [rotorSweptArea, setRotorSweptArea] = useState("");
  const [turbineModel, setTurbineModel] = useState("");
  const [flowRate, setFlowRate] = useState("");
  const [head, setHead] = useState("");

  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState(["Rooftop Co-op", "Low-noise"]);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await api.get("/groups");
        setGroups(response.data);
      } catch (err) {
        setGroups([
          { id: 1, name: "Pacific Northwest Wind Circle" },
          { id: 2, name: "Eastside Solar Assembly" },
          { id: 3, name: "Valley Gravity Hydro Co-op" },
        ]);
      } finally {
        setLoadingGroups(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const fetchResource = async () => {
        try {
          const res = await api.get(`/resources/${id}`);
          const data = res.data;
          setTitle(data.title || "");
          setDescription(data.description || "");
          setType(data.type || "solar");
          setCapacity(data.capacity || "");
          setLatitude(data.latitude || "");
          setLongitude(data.longitude || "");
          setLocationName(data.location_name || "");
          setRegion(data.region || "");
          setStatus(data.status || "active");
          setGroupId(data.group_id || "");
          setIrradiance(data.irradiance || "");
          setWindSpeed(data.wind_speed || "");
          setRiverFlow(data.river_flow || "");
          setPanelArea(data.panel_area || "");
          setCellEfficiency(data.efficiency || data.cell_efficiency || "0.18");
          setRotorSweptArea(data.rotor_area || data.rotor_swept_area || "");
          setTurbineModel(data.turbine_model || "");
          setFlowRate(data.flow_rate || "");
          setHead(data.head || "");
        } catch (err) {
          setError("Failed to fetch node details for editing.");
        }
      };
      fetchResource();
    }
  }, [id, isEditMode]);

  useEffect(() => {
    calculateLivePreview();
  }, [type, capacity, irradiance, windSpeed, riverFlow, panelArea, cellEfficiency, rotorSweptArea, flowRate, head]);

  const calculateLivePreview = () => {
    let output = 0;
    let score = "MEDIUM";
    const cap = parseFloat(capacity) || 0;

    if (type === "solar") {
      const area = parseFloat(panelArea) || 0;
      const eff = parseFloat(cellEfficiency) || 0.15;
      const irr = parseFloat(irradiance) || 150; 
      output = (area * eff * irr) / 1000000; 
      output = Math.min(output, cap);
      score = irr > 200 ? "HIGH" : irr > 100 ? "MEDIUM" : "LOW";
    } else if (type === "wind") {
      const area = parseFloat(rotorSweptArea) || 0;
      const speed = parseFloat(windSpeed) || 0;
      output = (0.5 * 1.225 * area * Math.pow(speed, 3) * 0.4) / 1000000;
      output = Math.min(output, cap);
      score = speed > 10 ? "HIGH" : speed > 5 ? "MEDIUM" : "LOW";
    } else if (type === "hydro") {
      const flow = parseFloat(flowRate) || parseFloat(riverFlow) || 0;
      const h = parseFloat(head) || 0;
      output = (1000 * 9.81 * flow * h * 0.8) / 1000000;
      output = Math.min(output, cap);
      score = flow > 15 ? "HIGH" : flow > 5 ? "MEDIUM" : "LOW";
    } else {
      output = cap * 0.35;
      score = "HIGH";
    }

    if (output > 0) {
      setPreview({
        estimated_output: output,
        efficiency_score: score,
        accuracy: "PREVIEW_ESTIMATE"
      });
    } else {
      setPreview(null);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput && !tags.includes(tagInput)) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFile({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitLoading(true);

    const payload = {
      title,
      description,
      type,
      capacity: parseFloat(capacity),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      location_name: locationName,
      region,
      status: status === "offline" ? "inactive" : status,
      group_id: groupId ? parseInt(groupId) : null,
      
      // Match backend required validation rules
      accuracy: "verified",
      efficiency: type === "solar" ? parseFloat(cellEfficiency) || 0.18 : 0.35,

      // Match backend expected field names
      panel_area: type === "solar" && panelArea ? parseFloat(panelArea) : null,
      rotor_area: type === "wind" && rotorSweptArea ? parseFloat(rotorSweptArea) : null,
      flow_rate: type === "hydro" && flowRate ? parseFloat(flowRate) : null,
      head: type === "hydro" && head ? parseFloat(head) : null,

      // Add environmental override fields
      irradiance: type === "solar" && irradiance ? parseFloat(irradiance) : null,
      wind_speed: type === "wind" && windSpeed ? parseFloat(windSpeed) : null,
      river_flow: type === "hydro" && riverFlow ? parseFloat(riverFlow) : null,
    };

    try {
      if (isEditMode) {
        await api.put(`/resources/${id}`, payload);
      } else {
        await api.post("/resources", payload);
      }
      navigate("/resources");
    } catch (err) {
      const serverError = err.response?.data?.message || err.response?.data?.error || "Failed to save resource. Please verify all fields are filled correctly.";
      setError(serverError);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Helper map hook to update map center dynamically when user searches or manual edits coordinates
  function MapFocusController({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        map.setView([parseFloat(lat), parseFloat(lng)], 11, {
          animate: true,
          duration: 1
        });
      }
    }, [lat, lng, map]);
    return null;
  }

  // Handle map click events to place coordinates directly
  function MapEventsHandler({ setLat, setLng, setLocName, setRegName }) {
    useMapEvents({
      click(e) {
        const clickedLat = e.latlng.lat.toFixed(6);
        const clickedLng = e.latlng.lng.toFixed(6);
        setLat(clickedLat);
        setLng(clickedLng);
        
        // Reverse-geocoding to resolve address details beautifully
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedLat}&lon=${clickedLng}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.suburb || "Selected Location";
              const state = data.address.state || "";
              const country = data.address.country || "";
              setLocName(city);
              setRegName(state ? `${state}, ${country}` : country);
            }
          })
          .catch(() => {});
      }
    });
    return null;
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const resLat = parseFloat(result.lat).toFixed(6);
        const resLng = parseFloat(result.lon).toFixed(6);
        setLatitude(resLat);
        setLongitude(resLng);
        
        // Split displays cleanly
        const displayNameParts = result.display_name.split(",");
        const titlePart = displayNameParts[0] || "Selected Node";
        const regionParts = displayNameParts.slice(1, 3).map(s => s.trim()).join(", ");
        setLocationName(titlePart);
        setRegion(regionParts || "India");
      } else {
        alert("Location not found. Please try a different query or select manually on the map.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const categories = [
    { id: "solar", label: "Solar PV", icon: Sun, color: "#dfed2b" },
    { id: "wind", label: "Wind Onshore", icon: Wind, color: "#A2E3E3" },
    { id: "hydro", label: "Hydroelectric", icon: Droplet, color: "#9FD3FF" },
    { id: "biomass", label: "Biomass Gas", icon: Flame, color: "#C3EAA6" },
    { id: "geothermal", label: "Geothermal Heat", icon: Globe, color: "#FFA47A" },
  ];

  return (
    <motionFramer.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="relative w-full pb-20 pt-6 select-none z-10"
    >
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        
        <button 
          onClick={() => navigate("/resources")} 
          className="inline-flex items-center gap-1.5 text-xs font-bold font-['Montserrat'] uppercase tracking-widest text-black/60 hover:text-black mb-6 group cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Cancel Registration
        </button>

        <div className="mb-8">
          <span className="text-[10px] font-['Montserrat'] text-black/60 uppercase tracking-widest font-bold block mb-2">
            // ADD FEDERATION ASSET
          </span>
          <h1 className="font-['Montserrat'] text-5xl font-black uppercase text-black tracking-tighter outline-text">
            {isEditMode ? "Edit Energy Node" : "Register Energy Node"}
          </h1>
        </div>

        <div className="w-full bg-white/40 border border-black/10 rounded-none p-4 mb-8 flex items-center justify-between shadow-xl font-['Montserrat']">
          {[1, 2, 3].map((s) => (
            <button
              key={s}
              onClick={() => step > s && setStep(s)}
              className={`flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer ${
                step === s ? "text-black" : step > s ? "text-black/80 hover:text-black" : "text-black/40"
              }`}
            >
              <span className={`w-8 h-8 flex items-center justify-center text-xs ${
                step === s ? "bg-black text-[#dfed2b]" : step > s ? "bg-[#dfed2b] text-black" : "bg-white/40 text-black/40"
              }`}>
                {step > s ? <Check className="h-4 w-4" /> : s}
              </span>
              <span className="hidden sm:inline">{s === 1 ? "General Info" : s === 2 ? "Tech Specs" : "Verification"}</span>
            </button>
          ))}
          <div className="hidden md:block flex-1 h-0.5 bg-black/10 mx-8 relative overflow-hidden">
            <motionFramer.div
              animate={{ width: `${((step - 1) / 2) * 100}%` }}
              className="h-full bg-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8">
            <div className="eco-nexus-glass-card p-6 md:p-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                {step === 1 ? "WIZARD: 01" : step === 2 ? "WIZARD: 02" : "WIZARD: 03"}
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/40 font-bold uppercase tracking-widest block mb-2 mt-2">
                // WIZARD NODE ENTRY
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-8">
                {step === 1 ? "GENERAL INFORMATION" : step === 2 ? "TECHNICAL PARAMETERS" : "VERIFICATION & ATTACHMENTS"}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex items-center gap-3 bg-black text-[#dfed2b] p-4 text-[10px] font-['Montserrat'] font-bold uppercase">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* STEP 1 */}
                {step === 1 && (
                  <div className="space-y-6 font-['Montserrat'] text-xs font-bold">
                    
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-black/60">Select Energy Category</label>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {categories.map((cat) => {
                          const CatIcon = cat.icon;
                          const isSelected = type === cat.id;
                          return (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setType(cat.id)}
                              className={`p-4 border transition-colors flex flex-col items-center text-center gap-3 cursor-pointer ${
                                isSelected ? "bg-black border-black text-[#dfed2b]" : "bg-white/40 border-black/10 text-black hover:bg-white/60"
                              }`}
                            >
                              <div className="w-10 h-10 flex items-center justify-center border border-current" style={{ backgroundColor: isSelected ? 'transparent' : cat.color }}>
                                <CatIcon className={`h-5 w-5 ${isSelected ? 'text-[#dfed2b]' : 'text-black'}`} />
                              </div>
                              <span className="text-[9px] tracking-widest uppercase">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-black/60">Resource Node Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cascadia Solar Array Circle"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-black/60">Capacity Rating (MW)</label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          placeholder="2.5"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-black/60">Sub Division / Region</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Oregon, USA"
                          value={region}
                          onChange={(e) => setRegion(e.target.value)}
                          className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-black/60">Latitude Coordinates</label>
                        <input
                          type="number"
                          step="0.000001"
                          required
                          placeholder="45.7512"
                          value={latitude}
                          onChange={(e) => setLatitude(e.target.value)}
                          className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase tracking-widest text-black/60">Longitude Coordinates</label>
                        <input
                          type="number"
                          step="0.000001"
                          required
                          placeholder="-122.6512"
                          value={longitude}
                          onChange={(e) => setLongitude(e.target.value)}
                          className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase tracking-widest text-black/60">City / Location Area</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Portland"
                        value={locationName}
                        onChange={(e) => setLocationName(e.target.value)}
                        className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                      />
                    </div>

                    <div className="flex justify-end pt-6">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="bg-black hover:bg-[#dfed2b] hover:text-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center"
                      >
                        CONTINUE TO STEP 2
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <div className="space-y-8 font-['Montserrat'] text-xs font-bold">
                    
                    <div className="bg-white/40 border border-black/10 p-6">
                      <h4 className="text-[10px] text-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" /> // CLIMATE COEFFICIENT VALUES
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {type === "solar" && (
                          <div className="space-y-2">
                            <label className="block text-[10px] text-black/60 uppercase tracking-widest">Solar Irradiance (W/m²)</label>
                            <input
                              type="number"
                              placeholder="250"
                              value={irradiance}
                              onChange={(e) => setIrradiance(e.target.value)}
                              className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                            />
                          </div>
                        )}
                        {type === "wind" && (
                          <div className="space-y-2">
                            <label className="block text-[10px] text-black/60 uppercase tracking-widest">Wind Speed (m/s)</label>
                            <input
                              type="number"
                              placeholder="6.5"
                              value={windSpeed}
                              onChange={(e) => setWindSpeed(e.target.value)}
                              className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                            />
                          </div>
                        )}
                        {type === "hydro" && (
                          <div className="space-y-2">
                            <label className="block text-[10px] text-black/60 uppercase tracking-widest">River Flow Volume (m³/s)</label>
                            <input
                              type="number"
                              placeholder="12.0"
                              value={riverFlow}
                              onChange={(e) => setRiverFlow(e.target.value)}
                              className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                            />
                          </div>
                        )}
                        <div className="space-y-2">
                          <label className="block text-[10px] text-black/60 uppercase tracking-widest">Operation Mode Status</label>
                          <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors"
                          >
                            <option value="active">ACTIVE GENERATION</option>
                            <option value="maintenance">MAINTENANCE AUDIT</option>
                            <option value="offline">OFFLINE HALT</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/40 border border-black/10 p-6">
                      <h4 className="text-[10px] text-black uppercase tracking-widest mb-6 flex items-center gap-2">
                        // MATERIAL ARCHITECTURE SPECS
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {type === "solar" && (
                          <>
                            <div className="space-y-2">
                              <label className="block text-[10px] text-black/60 uppercase tracking-widest">Panel Surface Area (m²)</label>
                              <input
                                type="number"
                                placeholder="120"
                                value={panelArea}
                                onChange={(e) => setPanelArea(e.target.value)}
                                className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] text-black/60 uppercase tracking-widest">Cell Efficiency Rating</label>
                              <input
                                type="number"
                                step="0.01"
                                placeholder="0.18"
                                value={cellEfficiency}
                                onChange={(e) => setCellEfficiency(e.target.value)}
                                className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                              />
                            </div>
                          </>
                        )}
                        {type === "wind" && (
                          <>
                            <div className="space-y-2">
                              <label className="block text-[10px] text-black/60 uppercase tracking-widest">Rotor Swept Area (m²)</label>
                              <input
                                type="number"
                                placeholder="4500"
                                value={rotorSweptArea}
                                onChange={(e) => setRotorSweptArea(e.target.value)}
                                className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] text-black/60 uppercase tracking-widest">Turbine Model Reference</label>
                              <input
                                type="text"
                                placeholder="GE-2.5-120"
                                value={turbineModel}
                                onChange={(e) => setTurbineModel(e.target.value)}
                                className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                              />
                            </div>
                          </>
                        )}
                        {type === "hydro" && (
                          <>
                            <div className="space-y-2">
                              <label className="block text-[10px] text-black/60 uppercase tracking-widest">Gravity Flow Rate (m³/s)</label>
                              <input
                                type="number"
                                placeholder="15.5"
                                value={flowRate}
                                onChange={(e) => setFlowRate(e.target.value)}
                                className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-[10px] text-black/60 uppercase tracking-widest">Hydraulic Head Height (m)</label>
                              <input
                                type="number"
                                placeholder="45"
                                value={head}
                                onChange={(e) => setHead(e.target.value)}
                                className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                              />
                            </div>
                          </>
                        )}
                        {type !== "solar" && type !== "wind" && type !== "hydro" && (
                          <div className="col-span-full py-8 text-center text-[10px] text-black/40 uppercase tracking-widest">
                            No special specs required for this category type.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between pt-6 border-t border-black/10">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="bg-white/40 hover:bg-black hover:text-white border border-black/10 px-8 py-4 text-black text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center"
                      >
                        BACK
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep(3)}
                        className="bg-black hover:bg-[#dfed2b] hover:text-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center"
                      >
                        CONTINUE TO STEP 3
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <div className="space-y-8 font-['Montserrat'] text-xs font-bold">
                    
                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-black/60">Resource Custom Tags</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {tags.map((tag) => (
                          <span 
                            key={tag} 
                            className="bg-black text-[#dfed2b] text-[10px] px-3 py-1 flex items-center gap-2 uppercase tracking-widest"
                          >
                            {tag}
                            <button 
                              type="button" 
                              onClick={() => handleRemoveTag(tag)}
                              className="text-white hover:text-red-500 font-bold"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="e.g. Community Roof"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30 flex-1"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="bg-black text-white hover:bg-[#dfed2b] hover:text-black px-6 py-3 uppercase tracking-widest transition-colors"
                        >
                          ADD TAG
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-black/60">Group Affiliation</label>
                      {loadingGroups ? (
                        <p className="text-[10px] text-black/40 uppercase tracking-widest">Checking groups...</p>
                      ) : (
                        <select
                          value={groupId}
                          onChange={(e) => setGroupId(e.target.value)}
                          className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors uppercase tracking-widest"
                        >
                          <option value="">INDEPENDENTLY MANAGED</option>
                          {groups.filter(g => g.pivot && g.pivot.role === 'owner').map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-black/60">Upload Resource Blueprints / Schematic Photos</label>
                      <div
                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={handleFileDrop}
                        onClick={() => {
                          const mockName = `${type}_blueprint_schematic.png`;
                          setUploadedFile({ name: mockName, size: "1.4 MB" });
                        }}
                        className={`border border-dashed p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-4 ${
                          dragOver ? "bg-[#dfed2b]/20 border-black" : "bg-white/20 border-black/20 hover:border-black/50"
                        }`}
                      >
                        <Upload className="h-6 w-6 text-black/60" />
                        <span className="text-xs uppercase tracking-widest text-black">DRAG AND DROP OR CLICK TO UPLOAD</span>
                        <span className="text-[10px] text-black/40 uppercase tracking-widest">PNG, PDF, SVG UP TO 10MB</span>
                      </div>

                      {uploadedFile && (
                        <motionFramer.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-black text-[#dfed2b] p-4 flex justify-between items-center"
                        >
                          <div className="flex items-center gap-3">
                            <Check className="h-4 w-4" />
                            <span className="text-[10px] uppercase tracking-widest">{uploadedFile.name} ({uploadedFile.size})</span>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => setUploadedFile(null)} 
                            className="text-white hover:text-red-500"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </motionFramer.div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] uppercase tracking-widest text-black/60">Detailed Resource Description</label>
                      <textarea
                        rows="4"
                        placeholder="Detail the operational configuration or group mission directives of this energy resource..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full bg-white/40 border border-black/10 px-4 py-3 text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                      />
                    </div>

                    <div className="flex justify-between pt-6 border-t border-black/10">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="bg-white/40 hover:bg-black hover:text-white border border-black/10 px-8 py-4 text-black text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center"
                      >
                        BACK
                      </button>
                      
                      <button
                        type="submit"
                        disabled={submitLoading}
                        className="bg-black hover:bg-[#dfed2b] hover:text-black text-white px-8 py-4 text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                      >
                        <Save className="h-4 w-4" />
                        {submitLoading ? (isEditMode ? "SAVING..." : "REGISTERING...") : (isEditMode ? "SAVE NODE CHANGES" : "PUBLISH ENERGY NODE")}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
          {/* Interactive Map & Yield Preview Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <div className="eco-nexus-glass-card p-6 md:p-8 relative overflow-hidden shadow-xl bg-[#dfed2b]/10 border border-black/10">
              <div className="absolute top-0 right-0 bg-black text-[#dfed2b] px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
                LOCATION SELECTOR
              </div>
              <span className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest block mb-2 mt-2">
                // MAP & GEOLOCATION
              </span>
              <h2 className="font-['Montserrat'] text-3xl font-black text-black uppercase tracking-tighter mb-4">
                SELECT POSITION
              </h2>

              <p className="text-[10px] font-['Montserrat'] text-black/60 leading-relaxed uppercase font-bold tracking-widest mb-6">
                // SEARCH PLACE OR CLICK DIRECTLY ON THE MAP TO AUTOFRESH LATITUDE, LONGITUDE, CITY & REGION.
              </p>

              {/* SEARCH INPUT BAR */}
              <form onSubmit={handleSearchLocation} className="mb-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Search city, district, state..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white border border-black/10 px-3 py-2 text-xs font-bold uppercase text-black focus:outline-none placeholder:text-black/30 font-['Montserrat']"
                />
                <button
                  type="submit"
                  disabled={searching}
                  className="bg-black text-[#dfed2b] hover:bg-black/80 px-4 py-2 font-['Montserrat'] text-xs font-bold uppercase tracking-widest flex items-center justify-center transition-colors"
                >
                  {searching ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#dfed2b]" />
                  ) : (
                    <SearchIcon className="h-4 w-4" />
                  )}
                </button>
              </form>

              {/* MINI LEAFLET MAP VIEWPORT */}
              <div className="w-full h-64 bg-black/10 border border-black/10 mb-6 overflow-hidden relative" style={{ zIndex: 1 }}>
                <MapContainer
                  center={[parseFloat(latitude) || 20.5937, parseFloat(longitude) || 78.9629]}
                  zoom={latitude && longitude ? 10 : 5}
                  scrollWheelZoom={true}
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapFocusController lat={latitude} lng={longitude} />
                  <MapEventsHandler
                    setLat={setLatitude}
                    setLng={setLongitude}
                    setLocName={setLocationName}
                    setRegName={setRegion}
                  />
                  {latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude)) && (
                    <Marker
                      position={[parseFloat(latitude), parseFloat(longitude)]}
                      icon={L.divIcon({
                        html: `<div class="w-8 h-8 rounded-full bg-black border-2 border-[#dfed2b] flex items-center justify-center shadow-lg"><div class="w-2.5 h-2.5 rounded-full bg-[#dfed2b] animate-ping"></div></div>`,
                        className: "custom-leaflet-creation-marker",
                        iconSize: [32, 32],
                        iconAnchor: [16, 16]
                      })}
                    />
                  )}
                </MapContainer>
              </div>

              {/* ESTIMATED LIVE YIELD PREVIEW PANEL */}
              <div className="space-y-4 border-t border-black/10 pt-6">
                <span className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest block">
                  // ESTIMATED REAL-TIME GENERATION
                </span>
                {preview ? (
                  <div className="space-y-3 font-['Montserrat'] text-[11px] font-bold text-black uppercase">
                    <div className="flex justify-between items-center border-b border-black/10 pb-2">
                      <span className="text-black/60 tracking-widest">ESTIMATED YIELD:</span>
                      <span className="font-black text-xs">{preview.estimated_output ? preview.estimated_output.toFixed(2) : "0.00"} MW</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-black/10 pb-2">
                      <span className="text-black/60 tracking-widest">EFFICIENCY INDEX:</span>
                      <span className="font-black bg-black text-[#dfed2b] px-2 py-0.5">{preview.efficiency_score}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-black/20 bg-white/20 text-[9px] text-black/40 font-bold uppercase tracking-widest">
                    INPUT METRICS FOR ENERGY ESTIMATES.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </motionFramer.div>
  );
}

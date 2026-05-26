import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { motion as motionFramer, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Save,
    AlertCircle,
    Sparkles,
    Upload,
    Sun,
    Wind,
    Droplet,
    Flame,
    Globe,
    Tags,
    Check,
    Trash2,
    Loader2,
} from 'lucide-react';
import api from '../utils/api';
import L from 'leaflet';
import {
    MapContainer,
    TileLayer,
    Marker,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Search as SearchIcon } from 'lucide-react';
// Helper map hook to update map center dynamically when user searches or manual edits coordinates
function MapFocusController({ lat, lng }) {
    const map = useMap();
    useEffect(() => {
        if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
            map.setView([parseFloat(lat), parseFloat(lng)], 11, {
                animate: true,
                duration: 1,
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
            fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${clickedLat}&lon=${clickedLng}`,
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data && data.address) {
                        const city =
                            data.address.city ||
                            data.address.town ||
                            data.address.village ||
                            data.address.suburb ||
                            'Selected Location';
                        const state = data.address.state || '';
                        const country = data.address.country || '';
                        setLocName(city);
                        setRegName(
                            state ? `${state}, ${country}` : country,
                        );
                    }
                })
                .catch(() => {});
        },
    });
    return null;
}

export default function CreateResource() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const queryLat = searchParams.get('lat');
    const queryLng = searchParams.get('lng');

    const { id } = useParams();
    const isEditMode = !!id;

    const [step, setStep] = useState(1);
    const [groups, setGroups] = useState([]);
    const [loadingGroups, setLoadingGroups] = useState(true);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState('solar');
    const [capacity, setCapacity] = useState('');
    const [latitude, setLatitude] = useState(queryLat || '');
    const [longitude, setLongitude] = useState(queryLng || '');
    const [locationName, setLocationName] = useState('');
    const [region, setRegion] = useState('');
    const [status, setStatus] = useState('active');
    const [groupId, setGroupId] = useState('');

    const [irradiance, setIrradiance] = useState('');
    const [windSpeed, setWindSpeed] = useState('');
    const [riverFlow, setRiverFlow] = useState('');

    const [panelArea, setPanelArea] = useState('');
    const [cellEfficiency, setCellEfficiency] = useState('0.18');
    const [rotorSweptArea, setRotorSweptArea] = useState('');
    const [turbineModel, setTurbineModel] = useState('');
    const [flowRate, setFlowRate] = useState('');
    const [head, setHead] = useState('');

    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState(['Rooftop Co-op', 'Low-noise']);

    const [uploadedFile, setUploadedFile] = useState(null);
    const [dragOver, setDragOver] = useState(false);

    const [preview, setPreview] = useState(null);
    const [error, setError] = useState('');
    const [submitLoading, setSubmitLoading] = useState(false);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get('/groups');
                setGroups(response.data);
            } catch (err) {
                setGroups([
                    { id: 1, name: 'Pacific Northwest Wind Circle' },
                    { id: 2, name: 'Eastside Solar Assembly' },
                    { id: 3, name: 'Valley Gravity Hydro Co-op' },
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
                    setTitle(data.title || '');
                    setDescription(data.description || '');
                    setType(data.type || 'solar');
                    setCapacity(data.capacity || '');
                    setLatitude(data.latitude || '');
                    setLongitude(data.longitude || '');
                    setLocationName(data.location_name || '');
                    setRegion(data.region || '');
                    setStatus(data.status || 'active');
                    setGroupId(data.group_id || '');
                    setIrradiance(data.irradiance || '');
                    setWindSpeed(data.wind_speed || '');
                    setRiverFlow(data.river_flow || '');
                    setPanelArea(data.panel_area || '');
                    setCellEfficiency(
                        data.efficiency || data.cell_efficiency || '0.18',
                    );
                    setRotorSweptArea(
                        data.rotor_area || data.rotor_swept_area || '',
                    );
                    setTurbineModel(data.turbine_model || '');
                    setFlowRate(data.flow_rate || '');
                    setHead(data.head || '');
                } catch (err) {
                    setError('Failed to fetch node details for editing.');
                }
            };
            fetchResource();
        }
    }, [id, isEditMode]);

    const calculateLivePreview = () => {
        let output = 0;
        let score = 'MEDIUM';
        const cap = parseFloat(capacity) || 0;

        if (type === 'solar') {
            const area = parseFloat(panelArea) || 0;
            const eff = parseFloat(cellEfficiency) || 0.15;
            const irr = parseFloat(irradiance) || 150;
            output = (area * eff * irr) / 1000000;
            output = Math.min(output, cap);
            score = irr > 200 ? 'HIGH' : irr > 100 ? 'MEDIUM' : 'LOW';
        } else if (type === 'wind') {
            const area = parseFloat(rotorSweptArea) || 0;
            const speed = parseFloat(windSpeed) || 0;
            output = (0.5 * 1.225 * area * Math.pow(speed, 3) * 0.4) / 1000000;
            output = Math.min(output, cap);
            score = speed > 10 ? 'HIGH' : speed > 5 ? 'MEDIUM' : 'LOW';
        } else if (type === 'hydro') {
            const flow = parseFloat(flowRate) || parseFloat(riverFlow) || 0;
            const h = parseFloat(head) || 0;
            output = (1000 * 9.81 * flow * h * 0.8) / 1000000;
            output = Math.min(output, cap);
            score = flow > 15 ? 'HIGH' : flow > 5 ? 'MEDIUM' : 'LOW';
        } else {
            output = cap * 0.35;
            score = 'HIGH';
        }

        if (output > 0) {
            setPreview({
                estimated_output: output,
                efficiency_score: score,
                accuracy: 'PREVIEW_ESTIMATE',
            });
        } else {
            setPreview(null);
        }
    };

    useEffect(() => {
        calculateLivePreview();
    }, [
        type,
        capacity,
        irradiance,
        windSpeed,
        riverFlow,
        panelArea,
        cellEfficiency,
        rotorSweptArea,
        flowRate,
        head,
    ]);

    const handleAddTag = (e) => {
        e.preventDefault();
        if (tagInput && !tags.includes(tagInput)) {
            setTags([...tags, tagInput]);
            setTagInput('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        setTags(tags.filter((t) => t !== tagToRemove));
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setUploadedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB',
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
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
            status: status === 'offline' ? 'inactive' : status,
            group_id: groupId ? parseInt(groupId) : null,

            // Match backend required validation rules
            accuracy: 'verified',
            efficiency:
                type === 'solar' ? parseFloat(cellEfficiency) || 0.18 : 0.35,

            // Match backend expected field names
            panel_area:
                type === 'solar' && panelArea ? parseFloat(panelArea) : null,
            rotor_area:
                type === 'wind' && rotorSweptArea
                    ? parseFloat(rotorSweptArea)
                    : null,
            flow_rate:
                type === 'hydro' && flowRate ? parseFloat(flowRate) : null,
            head: type === 'hydro' && head ? parseFloat(head) : null,

            // Add environmental override fields
            irradiance:
                type === 'solar' && irradiance ? parseFloat(irradiance) : null,
            wind_speed:
                type === 'wind' && windSpeed ? parseFloat(windSpeed) : null,
            river_flow:
                type === 'hydro' && riverFlow ? parseFloat(riverFlow) : null,
        };

        try {
            if (isEditMode) {
                await api.put(`/resources/${id}`, payload);
            } else {
                await api.post('/resources', payload);
            }
            navigate('/resources');
        } catch (err) {
            const serverError =
                err.response?.data?.message ||
                err.response?.data?.error ||
                'Failed to save resource. Please verify all fields are filled correctly.';
            setError(serverError);
        } finally {
            setSubmitLoading(false);
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searching, setSearching] = useState(false);

    const handleSearchLocation = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const result = data[0];
                const resLat = parseFloat(result.lat).toFixed(6);
                const resLng = parseFloat(result.lon).toFixed(6);
                setLatitude(resLat);
                setLongitude(resLng);

                // Split displays cleanly
                const displayNameParts = result.display_name.split(',');
                const titlePart = displayNameParts[0] || 'Selected Node';
                const regionParts = displayNameParts
                    .slice(1, 3)
                    .map((s) => s.trim())
                    .join(', ');
                setLocationName(titlePart);
                setRegion(regionParts || 'India');
            } else {
                alert(
                    'Location not found. Please try a different query or select manually on the map.',
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const categories = [
        { id: 'solar', label: 'Solar PV', icon: Sun, color: '#dfed2b' },
        { id: 'wind', label: 'Wind Onshore', icon: Wind, color: '#A2E3E3' },
        {
            id: 'hydro',
            label: 'Hydroelectric',
            icon: Droplet,
            color: '#9FD3FF',
        },
        { id: 'biomass', label: 'Biomass Gas', icon: Flame, color: '#C3EAA6' },
        {
            id: 'geothermal',
            label: 'Geothermal Heat',
            icon: Globe,
            color: '#FFA47A',
        },
    ];

    return (
        <motionFramer.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full select-none pb-20 pt-6"
        >
            <div className="mx-auto max-w-6xl px-6 md:px-12">
                <button
                    onClick={() => navigate('/resources')}
                    className="group mb-6 inline-flex cursor-pointer items-center gap-1.5 font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60 transition-colors hover:text-black"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                    Cancel Registration
                </button>

                <div className="mb-8">
                    <span className="mb-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                        // ADD FEDERATION ASSET
                    </span>
                    <h1 className="outline-text font-['Montserrat'] text-5xl font-black uppercase tracking-tighter text-black">
                        {isEditMode
                            ? 'Edit Energy Node'
                            : 'Register Energy Node'}
                    </h1>
                </div>

                <div className="mb-8 flex w-full items-center justify-between rounded-none border border-black/10 bg-white/40 p-4 font-['Montserrat'] shadow-xl">
                    {[1, 2, 3].map((s) => (
                        <button
                            key={s}
                            onClick={() => step > s && setStep(s)}
                            className={`flex cursor-pointer items-center gap-3 text-[10px] font-bold uppercase tracking-widest ${
                                step === s
                                    ? 'text-black'
                                    : step > s
                                      ? 'text-black/80 hover:text-black'
                                      : 'text-black/40'
                            }`}
                        >
                            <span
                                className={`flex h-8 w-8 items-center justify-center text-xs ${
                                    step === s
                                        ? 'bg-black text-[#dfed2b]'
                                        : step > s
                                          ? 'bg-[#dfed2b] text-black'
                                          : 'bg-white/40 text-black/40'
                                }`}
                            >
                                {step > s ? <Check className="h-4 w-4" /> : s}
                            </span>
                            <span className="hidden sm:inline">
                                {s === 1
                                    ? 'General Info'
                                    : s === 2
                                      ? 'Tech Specs'
                                      : 'Verification'}
                            </span>
                        </button>
                    ))}
                    <div className="relative mx-8 hidden h-0.5 flex-1 overflow-hidden bg-black/10 md:block">
                        <motionFramer.div
                            animate={{ width: `${((step - 1) / 2) * 100}%` }}
                            className="h-full bg-black"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-2xl md:p-10">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                {step === 1
                                    ? 'WIZARD: 01'
                                    : step === 2
                                      ? 'WIZARD: 02'
                                      : 'WIZARD: 03'}
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // WIZARD NODE ENTRY
                            </span>
                            <h2 className="mb-8 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                {step === 1
                                    ? 'GENERAL INFORMATION'
                                    : step === 2
                                      ? 'TECHNICAL PARAMETERS'
                                      : 'VERIFICATION & ATTACHMENTS'}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="flex items-center gap-3 bg-black p-4 font-['Montserrat'] text-[10px] font-bold uppercase text-[#dfed2b]">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* STEP 1 */}
                                {step === 1 && (
                                    <div className="space-y-6 font-['Montserrat'] text-xs font-bold">
                                        <div className="space-y-3">
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                Select Energy Category
                                            </label>
                                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                                                {categories.map((cat) => {
                                                    const CatIcon = cat.icon;
                                                    const isSelected =
                                                        type === cat.id;
                                                    return (
                                                        <button
                                                            key={cat.id}
                                                            type="button"
                                                            onClick={() =>
                                                                setType(cat.id)
                                                            }
                                                            className={`flex cursor-pointer flex-col items-center gap-3 border p-4 text-center transition-colors ${
                                                                isSelected
                                                                    ? 'border-black bg-black text-[#dfed2b]'
                                                                    : 'border-black/10 bg-white/40 text-black hover:bg-white/60'
                                                            }`}
                                                        >
                                                            <div
                                                                className="flex h-10 w-10 items-center justify-center border border-current"
                                                                style={{
                                                                    backgroundColor:
                                                                        isSelected
                                                                            ? 'transparent'
                                                                            : cat.color,
                                                                }}
                                                            >
                                                                <CatIcon
                                                                    className={`h-5 w-5 ${isSelected ? 'text-[#dfed2b]' : 'text-black'}`}
                                                                />
                                                            </div>
                                                            <span className="text-[9px] uppercase tracking-widest">
                                                                {cat.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                Resource Node Title
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Cascadia Solar Array Circle"
                                                value={title}
                                                onChange={(e) =>
                                                    setTitle(e.target.value)
                                                }
                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                    Capacity Rating (MW)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    required
                                                    placeholder="2.5"
                                                    value={capacity}
                                                    onChange={(e) =>
                                                        setCapacity(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                    Sub Division / Region
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="e.g. Oregon, USA"
                                                    value={region}
                                                    onChange={(e) =>
                                                        setRegion(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                    Latitude Coordinates
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    required
                                                    placeholder="45.7512"
                                                    value={latitude}
                                                    onChange={(e) =>
                                                        setLatitude(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                    Longitude Coordinates
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    required
                                                    placeholder="-122.6512"
                                                    value={longitude}
                                                    onChange={(e) =>
                                                        setLongitude(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                City / Location Area
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="e.g. Portland"
                                                value={locationName}
                                                onChange={(e) =>
                                                    setLocationName(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="flex items-center justify-center bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                                            >
                                                CONTINUE TO STEP 2
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2 */}
                                {step === 2 && (
                                    <div className="space-y-8 font-['Montserrat'] text-xs font-bold">
                                        <div className="border border-black/10 bg-white/40 p-6">
                                            <h4 className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black">
                                                <Sparkles className="h-4 w-4" />{' '}
                                                // CLIMATE COEFFICIENT VALUES
                                            </h4>

                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                {type === 'solar' && (
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                            Solar Irradiance
                                                            (W/m²)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            placeholder="250"
                                                            value={irradiance}
                                                            onChange={(e) =>
                                                                setIrradiance(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                        />
                                                    </div>
                                                )}
                                                {type === 'wind' && (
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                            Wind Speed (m/s)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            placeholder="6.5"
                                                            value={windSpeed}
                                                            onChange={(e) =>
                                                                setWindSpeed(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                        />
                                                    </div>
                                                )}
                                                {type === 'hydro' && (
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                            River Flow Volume
                                                            (m³/s)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            placeholder="12.0"
                                                            value={riverFlow}
                                                            onChange={(e) =>
                                                                setRiverFlow(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                            className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                        />
                                                    </div>
                                                )}
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                        Operation Mode Status
                                                    </label>
                                                    <select
                                                        value={status}
                                                        onChange={(e) =>
                                                            setStatus(
                                                                e.target.value,
                                                            )
                                                        }
                                                        className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors focus:bg-white/60 focus:outline-none"
                                                    >
                                                        <option value="active">
                                                            ACTIVE GENERATION
                                                        </option>
                                                        <option value="maintenance">
                                                            MAINTENANCE AUDIT
                                                        </option>
                                                        <option value="offline">
                                                            OFFLINE HALT
                                                        </option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border border-black/10 bg-white/40 p-6">
                                            <h4 className="mb-6 flex items-center gap-2 text-[10px] uppercase tracking-widest text-black">
                                                // MATERIAL ARCHITECTURE SPECS
                                            </h4>

                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                {type === 'solar' && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Panel Surface
                                                                Area (m²)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="120"
                                                                value={
                                                                    panelArea
                                                                }
                                                                onChange={(e) =>
                                                                    setPanelArea(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Cell Efficiency
                                                                Rating
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.18"
                                                                value={
                                                                    cellEfficiency
                                                                }
                                                                onChange={(e) =>
                                                                    setCellEfficiency(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                {type === 'wind' && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Rotor Swept Area
                                                                (m²)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="4500"
                                                                value={
                                                                    rotorSweptArea
                                                                }
                                                                onChange={(e) =>
                                                                    setRotorSweptArea(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Turbine Model
                                                                Reference
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="GE-2.5-120"
                                                                value={
                                                                    turbineModel
                                                                }
                                                                onChange={(e) =>
                                                                    setTurbineModel(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                {type === 'hydro' && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Gravity Flow
                                                                Rate (m³/s)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="15.5"
                                                                value={flowRate}
                                                                onChange={(e) =>
                                                                    setFlowRate(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Hydraulic Head
                                                                Height (m)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="45"
                                                                value={head}
                                                                onChange={(e) =>
                                                                    setHead(
                                                                        e.target
                                                                            .value,
                                                                    )
                                                                }
                                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                {type !== 'solar' &&
                                                    type !== 'wind' &&
                                                    type !== 'hydro' && (
                                                        <div className="col-span-full py-8 text-center text-[10px] uppercase tracking-widest text-black/40">
                                                            No special specs
                                                            required for this
                                                            category type.
                                                        </div>
                                                    )}
                                            </div>
                                        </div>

                                        <div className="flex justify-between border-t border-black/10 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="flex items-center justify-center border border-black/10 bg-white/40 px-8 py-4 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
                                            >
                                                BACK
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setStep(3)}
                                                className="flex items-center justify-center bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
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
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                Resource Custom Tags
                                            </label>
                                            <div className="mb-3 flex flex-wrap gap-2">
                                                {tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="flex items-center gap-2 bg-black px-3 py-1 text-[10px] uppercase tracking-widest text-[#dfed2b]"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveTag(
                                                                    tag,
                                                                )
                                                            }
                                                            className="font-bold text-white hover:text-red-500"
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
                                                    onChange={(e) =>
                                                        setTagInput(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full flex-1 border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddTag}
                                                    className="bg-black px-6 py-3 uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                                                >
                                                    ADD TAG
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                Group Affiliation
                                            </label>
                                            {loadingGroups ? (
                                                <p className="text-[10px] uppercase tracking-widest text-black/40">
                                                    Checking groups...
                                                </p>
                                            ) : (
                                                <select
                                                    value={groupId}
                                                    onChange={(e) =>
                                                        setGroupId(
                                                            e.target.value,
                                                        )
                                                    }
                                                    className="w-full border border-black/10 bg-white/40 px-4 py-3 uppercase tracking-widest text-black transition-colors focus:bg-white/60 focus:outline-none"
                                                >
                                                    <option value="">
                                                        INDEPENDENTLY MANAGED
                                                    </option>
                                                    {groups
                                                        .filter(
                                                            (g) =>
                                                                g.pivot &&
                                                                g.pivot.role ===
                                                                    'owner',
                                                        )
                                                        .map((g) => (
                                                            <option
                                                                key={g.id}
                                                                value={g.id}
                                                            >
                                                                {g.name}
                                                            </option>
                                                        ))}
                                                </select>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                Upload Resource Blueprints /
                                                Schematic Photos
                                            </label>
                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragOver(true);
                                                }}
                                                onDragLeave={() =>
                                                    setDragOver(false)
                                                }
                                                onDrop={handleFileDrop}
                                                onClick={() => {
                                                    const mockName = `${type}_blueprint_schematic.png`;
                                                    setUploadedFile({
                                                        name: mockName,
                                                        size: '1.4 MB',
                                                    });
                                                }}
                                                className={`flex cursor-pointer flex-col items-center justify-center gap-4 border border-dashed p-8 text-center transition-colors ${
                                                    dragOver
                                                        ? 'border-black bg-[#dfed2b]/20'
                                                        : 'border-black/20 bg-white/20 hover:border-black/50'
                                                }`}
                                            >
                                                <Upload className="h-6 w-6 text-black/60" />
                                                <span className="text-xs uppercase tracking-widest text-black">
                                                    DRAG AND DROP OR CLICK TO
                                                    UPLOAD
                                                </span>
                                                <span className="text-[10px] uppercase tracking-widest text-black/40">
                                                    PNG, PDF, SVG UP TO 10MB
                                                </span>
                                            </div>

                                            {uploadedFile && (
                                                <motionFramer.div
                                                    initial={{
                                                        opacity: 0,
                                                        y: -10,
                                                    }}
                                                    animate={{
                                                        opacity: 1,
                                                        y: 0,
                                                    }}
                                                    className="flex items-center justify-between bg-black p-4 text-[#dfed2b]"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Check className="h-4 w-4" />
                                                        <span className="text-[10px] uppercase tracking-widest">
                                                            {uploadedFile.name}{' '}
                                                            ({uploadedFile.size}
                                                            )
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setUploadedFile(
                                                                null,
                                                            )
                                                        }
                                                        className="text-white hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </motionFramer.div>
                                            )}
                                        </div>

                                        <div className="space-y-3">
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                Detailed Resource Description
                                            </label>
                                            <textarea
                                                rows="4"
                                                placeholder="Detail the operational configuration or group mission directives of this energy resource..."
                                                value={description}
                                                onChange={(e) =>
                                                    setDescription(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                            />
                                        </div>

                                        <div className="flex justify-between border-t border-black/10 pt-6">
                                            <button
                                                type="button"
                                                onClick={() => setStep(2)}
                                                className="flex items-center justify-center border border-black/10 bg-white/40 px-8 py-4 text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
                                            >
                                                BACK
                                            </button>

                                            <button
                                                type="submit"
                                                disabled={submitLoading}
                                                className="flex items-center justify-center gap-2 bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                                            >
                                                <Save className="h-4 w-4" />
                                                {submitLoading
                                                    ? isEditMode
                                                        ? 'SAVING...'
                                                        : 'REGISTERING...'
                                                    : isEditMode
                                                      ? 'SAVE NODE CHANGES'
                                                      : 'PUBLISH ENERGY NODE'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                    {/* Interactive Map & Yield Preview Sidebar */}
                    <div className="space-y-8 lg:col-span-4">
                        <div className="eco-nexus-glass-card relative overflow-hidden border border-black/10 bg-[#dfed2b]/10 p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b]">
                                LOCATION SELECTOR
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                // MAP & GEOLOCATION
                            </span>
                            <h2 className="mb-4 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                SELECT POSITION
                            </h2>

                            <p className="mb-6 font-['Montserrat'] text-[10px] font-bold uppercase leading-relaxed tracking-widest text-black/60">
                                // SEARCH PLACE OR CLICK DIRECTLY ON THE MAP TO
                                AUTOFRESH LATITUDE, LONGITUDE, CITY & REGION.
                            </p>

                            {/* SEARCH INPUT BAR */}
                            <form
                                onSubmit={handleSearchLocation}
                                className="mb-6 flex gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder="Search city, district, state..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="flex-1 border border-black/10 bg-white px-3 py-2 font-['Montserrat'] text-xs font-bold uppercase text-black placeholder:text-black/30 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="flex items-center justify-center bg-black px-4 py-2 font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-[#dfed2b] transition-colors hover:bg-black/80"
                                >
                                    {searching ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-[#dfed2b]" />
                                    ) : (
                                        <SearchIcon className="h-4 w-4" />
                                    )}
                                </button>
                            </form>

                            {/* MINI LEAFLET MAP VIEWPORT */}
                            <div
                                className="relative mb-6 h-64 w-full overflow-hidden border border-black/10 bg-black/10"
                                style={{ zIndex: 1 }}
                            >
                                <MapContainer
                                    center={[
                                        parseFloat(latitude) || 20.5937,
                                        parseFloat(longitude) || 78.9629,
                                    ]}
                                    zoom={latitude && longitude ? 10 : 5}
                                    scrollWheelZoom={true}
                                    className="h-full w-full"
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <MapFocusController
                                        lat={latitude}
                                        lng={longitude}
                                    />
                                    <MapEventsHandler
                                        setLat={setLatitude}
                                        setLng={setLongitude}
                                        setLocName={setLocationName}
                                        setRegName={setRegion}
                                    />
                                    {latitude &&
                                        longitude &&
                                        !isNaN(parseFloat(latitude)) &&
                                        !isNaN(parseFloat(longitude)) && (
                                            <Marker
                                                position={[
                                                    parseFloat(latitude),
                                                    parseFloat(longitude),
                                                ]}
                                                icon={L.divIcon({
                                                    html: `<div class="w-8 h-8 rounded-full bg-black border-2 border-[#dfed2b] flex items-center justify-center shadow-lg"><div class="w-2.5 h-2.5 rounded-full bg-[#dfed2b] animate-ping"></div></div>`,
                                                    className:
                                                        'custom-leaflet-creation-marker',
                                                    iconSize: [32, 32],
                                                    iconAnchor: [16, 16],
                                                })}
                                            />
                                        )}
                                </MapContainer>
                            </div>

                            {/* ESTIMATED LIVE YIELD PREVIEW PANEL */}
                            <div className="space-y-4 border-t border-black/10 pt-6">
                                <span className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                    // ESTIMATED REAL-TIME GENERATION
                                </span>
                                {preview ? (
                                    <div className="space-y-3 font-['Montserrat'] text-[11px] font-bold uppercase text-black">
                                        <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                            <span className="tracking-widest text-black/60">
                                                ESTIMATED YIELD:
                                            </span>
                                            <span className="text-xs font-black">
                                                {preview.estimated_output
                                                    ? preview.estimated_output.toFixed(
                                                          2,
                                                      )
                                                    : '0.00'}{' '}
                                                MW
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                            <span className="tracking-widest text-black/60">
                                                EFFICIENCY INDEX:
                                            </span>
                                            <span className="bg-black px-2 py-0.5 font-black text-[#dfed2b]">
                                                {preview.efficiency_score}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="border border-dashed border-black/20 bg-white/20 py-4 text-center text-[9px] font-bold uppercase tracking-widest text-black/40">
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

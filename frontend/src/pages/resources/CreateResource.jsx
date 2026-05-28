import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { motion as motionFramer } from 'framer-motion';
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
    Check,
    Trash2,
    Loader2,
} from 'lucide-react';
import api from '../../utils/api';
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
function MapEventsHandler({ setLat, setLng, setLocName, setRegName, clearErr }) {
    useMapEvents({
        click(e) {
            const clickedLat = e.latlng.lat.toFixed(6);
            const clickedLng = e.latlng.lng.toFixed(6);
            setLat(clickedLat);
            setLng(clickedLng);
            clearErr('latitude');
            clearErr('longitude');

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
                        clearErr('locationName');
                        clearErr('region');
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

    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [submitLoading, setSubmitLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const response = await api.get('/groups');
                setGroups(response.data);
            } catch {
                setGroups([
                    { id: 1, name: 'Karnataka Wind Cooperative' },
                    { id: 2, name: 'Bangalore Solar Assembly' },
                    { id: 3, name: 'Kerala Hydro Federation' },
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
                    if (data.blueprint_name) {
                        setUploadedFile({
                            name: data.blueprint_name,
                            size: 'Stored Blueprint',
                        });
                    }
                } catch {
                    setError('Failed to fetch node details for editing.');
                }
            };
            fetchResource();
        }
    }, [id, isEditMode]);

    useEffect(() => {
        const fetchPreview = async () => {
            const cap = parseFloat(capacity);
            if (isNaN(cap) || cap <= 0) {
                setPreview(null);
                return;
            }
            try {
                const res = await api.post('/resources/calculate', {
                    type,
                    capacity: cap,
                    efficiency: parseFloat(cellEfficiency),
                    panel_area: parseFloat(panelArea),
                    rotor_area: parseFloat(rotorSweptArea),
                    flow_rate: parseFloat(flowRate),
                    head: parseFloat(head),
                    latitude: parseFloat(latitude),
                    longitude: parseFloat(longitude),
                });
                setPreview(res.data);
            } catch {
                setPreview(null);
            }
        };
        fetchPreview();
    }, [
        type,
        capacity,
        cellEfficiency,
        panelArea,
        rotorSweptArea,
        flowRate,
        head,
        latitude,
        longitude,
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

    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadedFile({
                name: file.name,
                size: file.size > 1024 * 1024
                    ? (file.size / 1024 / 1024).toFixed(1) + ' MB'
                    : (file.size / 1024).toFixed(1) + ' KB',
            });
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            setUploadedFile({
                name: file.name,
                size: file.size > 1024 * 1024
                    ? (file.size / 1024 / 1024).toFixed(1) + ' MB'
                    : (file.size / 1024).toFixed(1) + ' KB',
            });
        }
    };

    const clearErr = (field) => {
        if (fieldErrors[field]) {
            setFieldErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const mapValidationErrors = (errors) => {
        const mapped = {};
        const keyMap = {
            location_name: 'locationName',
            panel_area: 'panelArea',
            rotor_area: 'rotorSweptArea',
            wind_speed: 'windSpeed',
            flow_rate: 'flowRate',
            river_flow: 'riverFlow',
            efficiency: 'cellEfficiency',
            cell_efficiency: 'cellEfficiency',
        };
        Object.keys(errors).forEach((key) => {
            const camelKey = keyMap[key] || key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
            mapped[camelKey] = errors[key][0];
        });
        return mapped;
    };

    const handleContinueToStep2 = async () => {
        setFieldErrors({});
        setError('');
        try {
            await api.post('/resources/validate', {
                step: 1,
                title,
                type,
                capacity: parseFloat(capacity),
                region,
                latitude: parseFloat(latitude),
                longitude: parseFloat(longitude),
                location_name: locationName,
            });
            setStep(2);
        } catch (err) {
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors || {};
                setFieldErrors(mapValidationErrors(errors));
            } else {
                setError(err.response?.data?.message || 'Validation failed.');
            }
        }
    };
    const handleContinueToStep3 = async () => {
        setFieldErrors({});
        setError('');
        try {
            await api.post('/resources/validate', {
                step: 2,
                type,
                panel_area: panelArea !== '' ? parseFloat(panelArea) : null,
                efficiency: cellEfficiency !== '' ? parseFloat(cellEfficiency) : null,
                rotor_area: rotorSweptArea !== '' ? parseFloat(rotorSweptArea) : null,
                flow_rate: flowRate !== '' ? parseFloat(flowRate) : null,
                head: head !== '' ? parseFloat(head) : null,
            });
            setStep(3);
        } catch (err) {
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors || {};
                setFieldErrors(mapValidationErrors(errors));
            } else {
                setError(err.response?.data?.message || 'Validation failed.');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setFieldErrors({});
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
            accuracy: 'verified',
            efficiency:
                type === 'solar' ? parseFloat(cellEfficiency) || 0.18 : 0.35,
            panel_area:
                type === 'solar' && panelArea ? parseFloat(panelArea) : null,
            rotor_area:
                type === 'wind' && rotorSweptArea
                    ? parseFloat(rotorSweptArea)
                    : null,
            flow_rate:
                type === 'hydro' && flowRate ? parseFloat(flowRate) : null,
            head: type === 'hydro' && head ? parseFloat(head) : null,
            blueprint_name: uploadedFile ? uploadedFile.name : null,
        };

        try {
            if (isEditMode) {
                await api.put(`/resources/${id}`, payload);
            } else {
                await api.post('/resources', payload);
            }
            navigate('/resources');
        } catch (err) {
            if (err.response && err.response.status === 422) {
                const errors = err.response.data.errors || {};
                setFieldErrors(mapValidationErrors(errors));
                setError('Failed to save resource. Please check validation errors.');
            } else {
                const serverError =
                    err.response?.data?.message ||
                    err.response?.data?.error ||
                    'Failed to save resource. Please verify all fields are filled correctly.';
                setError(serverError);
            }
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
                clearErr('latitude');
                clearErr('longitude');

                const displayNameParts = result.display_name.split(',');
                const titlePart = displayNameParts[0] || 'Selected Node';
                const regionParts = displayNameParts
                    .slice(1, 3)
                    .map((s) => s.trim())
                    .join(', ');
                setLocationName(titlePart);
                setRegion(regionParts || 'India');
                clearErr('locationName');
                clearErr('region');
            } else {
                alert(
                    'Location not found. Please try a different query or select manually on the map.',
                );
            }
        } catch {
            // Silently handle geocoding error for clean production
        } finally {
            setSearching(false);
        }
    };

    const categories = [
        { id: 'solar', label: 'Solar PV', icon: Sun, color: '#d4e157' },
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
                        // ADD RENEWABLE ASSET
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
                            type="button"
                            onClick={() => {
                                if (s === 1) setStep(1);
                                else if (s === 2 && step >= 2) setStep(2);
                                else if (s === 3 && step >= 3) setStep(3);
                            }}
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
                                        ? 'bg-black text-[#d4e157]'
                                        : step > s
                                          ? 'bg-[#d4e157] text-black'
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
                                    <div className="flex items-center gap-3 bg-black p-4 font-['Montserrat'] text-[10px] font-bold uppercase text-[#d4e157]">
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
                                                            onClick={() => {
                                                                setType(cat.id);
                                                                setFieldErrors({});
                                                            }}
                                                            className={`flex cursor-pointer flex-col items-center gap-3 border p-4 text-center transition-colors ${
                                                                isSelected
                                                                    ? 'border-black bg-black text-[#d4e157]'
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
                                                                    className={`h-5 w-5 ${isSelected ? 'text-[#d4e157]' : 'text-black'}`}
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
                                                placeholder="e.g. Bangalore Solar Array"
                                                value={title}
                                                onChange={(e) => {
                                                    setTitle(e.target.value);
                                                    clearErr('title');
                                                }}
                                                className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.title ? 'border-red-500' : 'border-black/10'}`}
                                            />
                                            {fieldErrors.title && (
                                                <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.title}</span>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                    Capacity Rating (MW)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    placeholder="2.5"
                                                    value={capacity}
                                                    onChange={(e) => {
                                                        setCapacity(e.target.value);
                                                        clearErr('capacity');
                                                    }}
                                                    className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.capacity ? 'border-red-500' : 'border-black/10'}`}
                                                />
                                                {fieldErrors.capacity && (
                                                    <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.capacity}</span>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                    Sub Division / Region
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. Karnataka, India"
                                                    value={region}
                                                    onChange={(e) => {
                                                        setRegion(e.target.value);
                                                        clearErr('region');
                                                    }}
                                                    className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.region ? 'border-red-500' : 'border-black/10'}`}
                                                />
                                                {fieldErrors.region && (
                                                    <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.region}</span>
                                                )}
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
                                                    placeholder="12.9716"
                                                    value={latitude}
                                                    onChange={(e) => {
                                                        setLatitude(e.target.value);
                                                        clearErr('latitude');
                                                    }}
                                                    className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.latitude ? 'border-red-500' : 'border-black/10'}`}
                                                />
                                                {fieldErrors.latitude && (
                                                    <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.latitude}</span>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                    Longitude Coordinates
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.000001"
                                                    placeholder="77.5946"
                                                    value={longitude}
                                                    onChange={(e) => {
                                                        setLongitude(e.target.value);
                                                        clearErr('longitude');
                                                    }}
                                                    className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.longitude ? 'border-red-500' : 'border-black/10'}`}
                                                />
                                                {fieldErrors.longitude && (
                                                    <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.longitude}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                City / Location Area
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Bangalore"
                                                value={locationName}
                                                onChange={(e) => {
                                                    setLocationName(e.target.value);
                                                    clearErr('locationName');
                                                }}
                                                className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.locationName ? 'border-red-500' : 'border-black/10'}`}
                                            />
                                            {fieldErrors.locationName && (
                                                <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.locationName}</span>
                                            )}
                                        </div>

                                        <div className="flex justify-end pt-6">
                                            <button
                                                type="button"
                                                onClick={handleContinueToStep2}
                                                className="flex items-center justify-center bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#d4e157] hover:text-black"
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
                                                // OPERATIONAL SETTINGS
                                            </h4>

                                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                        Operation Mode Status
                                                    </label>
                                                    <select
                                                        value={status}
                                                        onChange={(e) => setStatus(e.target.value)}
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
                                                                Panel Surface Area (m²)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="120"
                                                                value={panelArea}
                                                                onChange={(e) => {
                                                                    setPanelArea(e.target.value);
                                                                    clearErr('panelArea');
                                                                }}
                                                                className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.panelArea ? 'border-red-500' : 'border-black/10'}`}
                                                            />
                                                            {fieldErrors.panelArea && (
                                                                <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.panelArea}</span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Cell Efficiency Rating
                                                            </label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.18"
                                                                value={cellEfficiency}
                                                                onChange={(e) => {
                                                                    setCellEfficiency(e.target.value);
                                                                    clearErr('cellEfficiency');
                                                                }}
                                                                className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.cellEfficiency ? 'border-red-500' : 'border-black/10'}`}
                                                            />
                                                            {fieldErrors.cellEfficiency && (
                                                                <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.cellEfficiency}</span>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                                {type === 'wind' && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Rotor Swept Area (m²)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="4500"
                                                                value={rotorSweptArea}
                                                                onChange={(e) => {
                                                                    setRotorSweptArea(e.target.value);
                                                                    clearErr('rotorSweptArea');
                                                                }}
                                                                className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.rotorSweptArea ? 'border-red-500' : 'border-black/10'}`}
                                                            />
                                                            {fieldErrors.rotorSweptArea && (
                                                                <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.rotorSweptArea}</span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Turbine Model Reference
                                                            </label>
                                                            <input
                                                                type="text"
                                                                placeholder="GE-2.5-120"
                                                                value={turbineModel}
                                                                onChange={(e) => setTurbineModel(e.target.value)}
                                                                className="w-full border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                            />
                                                        </div>
                                                    </>
                                                )}
                                                {type === 'hydro' && (
                                                    <>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Gravity Flow Rate (m³/s)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="15.5"
                                                                value={flowRate}
                                                                onChange={(e) => {
                                                                    setFlowRate(e.target.value);
                                                                    clearErr('flowRate');
                                                                }}
                                                                className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.flowRate ? 'border-red-500' : 'border-black/10'}`}
                                                            />
                                                            {fieldErrors.flowRate && (
                                                                <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.flowRate}</span>
                                                            )}
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                                Hydraulic Head Height (m)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                placeholder="45"
                                                                value={head}
                                                                onChange={(e) => {
                                                                    setHead(e.target.value);
                                                                    clearErr('head');
                                                                }}
                                                                className={`w-full border bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none ${fieldErrors.head ? 'border-red-500' : 'border-black/10'}`}
                                                            />
                                                            {fieldErrors.head && (
                                                                <span className="block font-bold text-red-500 text-[9px] uppercase tracking-wider">{fieldErrors.head}</span>
                                                            )}
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
                                                onClick={handleContinueToStep3}
                                                className="flex items-center justify-center bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#d4e157] hover:text-black"
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
                                                        className="flex items-center gap-2 bg-black px-3 py-1 text-[10px] uppercase tracking-widest text-[#d4e157]"
                                                    >
                                                        {tag}
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveTag(tag)
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
                                                    placeholder="e.g. Community Rooftop"
                                                    value={tagInput}
                                                    onChange={(e) => setTagInput(e.target.value)}
                                                    className="w-full flex-1 border border-black/10 bg-white/40 px-4 py-3 text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleAddTag}
                                                    className="bg-black px-6 py-3 uppercase tracking-widest text-white transition-colors hover:bg-[#d4e157] hover:text-black"
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
                                                    onChange={(e) => setGroupId(e.target.value)}
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
                                                Upload Resource Blueprints / Schematic Photos
                                            </label>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                style={{ display: 'none' }}
                                                accept=".png,.pdf,.svg,.jpg,.jpeg"
                                            />
                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    setDragOver(true);
                                                }}
                                                onDragLeave={() => setDragOver(false)}
                                                onDrop={handleFileDrop}
                                                onClick={() => fileInputRef.current?.click()}
                                                className={`flex cursor-pointer flex-col items-center justify-center gap-4 border border-dashed p-8 text-center transition-colors ${
                                                    dragOver
                                                        ? 'border-black bg-[#d4e157]/20'
                                                        : 'border-black/20 bg-white/20 hover:border-black/50'
                                                }`}
                                            >
                                                <Upload className="h-6 w-6 text-black/60" />
                                                <span className="text-xs uppercase tracking-widest text-black">
                                                    DRAG AND DROP OR CLICK TO UPLOAD
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
                                                    className="flex items-center justify-between bg-black p-4 text-[#d4e157]"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Check className="h-4 w-4" />
                                                        <span className="text-[10px] uppercase tracking-widest">
                                                            {uploadedFile.name}{' '}
                                                            ({uploadedFile.size})
                                                        </span>
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
                                            <label className="block text-[10px] uppercase tracking-widest text-black/60">
                                                Detailed Resource Description
                                            </label>
                                            <textarea
                                                rows="4"
                                                placeholder="Detail the operational configuration or group mission directives of this energy resource..."
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
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
                                                className="flex items-center justify-center gap-2 bg-black px-8 py-4 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#d4e157] hover:text-black disabled:opacity-50"
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
                        <div className="eco-nexus-glass-card relative overflow-hidden border border-black/10 bg-[#d4e157]/10 p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#d4e157]">
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
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="flex-1 border border-black/10 bg-white px-3 py-2 font-['Montserrat'] text-xs font-bold uppercase text-black placeholder:text-black/30 focus:outline-none"
                                />
                                <button
                                    type="submit"
                                    disabled={searching}
                                    className="flex items-center justify-center bg-black px-4 py-2 font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-[#d4e157] transition-colors hover:bg-black/80"
                                >
                                    {searching ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-[#d4e157]" />
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
                                        clearErr={clearErr}
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
                                                    html: `<div class="w-8 h-8 rounded-full bg-black border-2 border-[#d4e157] flex items-center justify-center shadow-lg"><div class="w-2.5 h-2.5 rounded-full bg-[#d4e157] animate-ping"></div></div>`,
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
                                            <span className="bg-black px-2 py-0.5 font-black text-[#d4e157]">
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

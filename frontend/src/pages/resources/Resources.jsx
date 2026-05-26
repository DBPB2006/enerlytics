import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus,
    Compass,
    Loader2,
    X,
    Search,
    Sliders,
    ChevronRight,
    Sun,
    Wind,
    Droplet,
    Flame,
    Globe,
} from 'lucide-react';
import api from '../../utils/api';

import L from 'leaflet';
import {
    MapContainer,
    TileLayer,
    Marker,
    Tooltip,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const getTypeColor = (type) => {
    switch (type.toLowerCase()) {
        case 'solar':
            return { primary: '#dfed2b', text: '#000' };
        case 'wind':
            return { primary: '#A2E3E3', text: '#000' };
        case 'hydro':
            return { primary: '#9FD3FF', text: '#000' };
        case 'biomass':
            return { primary: '#C3EAA6', text: '#000' };
        case 'geothermal':
            return { primary: '#FFA47A', text: '#000' };
        default:
            return { primary: '#fff', text: '#000' };
    }
};

const getMarkerIconHtml = (type, colors, active) => {
    let iconHtml = '';
    switch (type.toLowerCase()) {
        case 'solar':
            iconHtml = `<img src="/solar.png" alt="Solar" class="w-12 h-12 object-contain" />`;
            break;
        case 'wind':
            iconHtml = `<img src="/wind.png" alt="Wind" class="w-12 h-12 object-contain" />`;
            break;
        case 'hydro':
            iconHtml = `<img src="/hydro.png" alt="Hydro" class="w-12 h-12 object-contain" />`;
            break;
        case 'biomass':
            iconHtml = `<img src="/biomass.png" alt="Biomass" class="w-12 h-12 object-contain" />`;
            break;
        case 'geothermal':
            iconHtml = `<img src="/geothermal.png" alt="Geothermal" class="w-12 h-12 object-contain" />`;
            break;
        default:
            iconHtml = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
      `;
    }

    return `
    <div class="relative flex flex-col items-center justify-end select-none cursor-pointer" style="width: 64px; height: 64px;">
      <div class="relative z-10">
        ${iconHtml}
      </div>
      ${
          active
              ? `
        <div class="absolute -top-6 bg-black text-[#dfed2b] px-2 py-0.5 text-[8px] font-['Montserrat'] whitespace-nowrap z-20 shadow-2xl font-bold">
          NODE ACTIVE
        </div>
      `
              : ''
      }
    </div>
  `;
};

const getMarkerIcon = (type, colors, active) => {
    return L.divIcon({
        html: getMarkerIconHtml(type, colors, active),
        className: 'custom-leaflet-marker',
        iconSize: [64, 64],
        iconAnchor: [32, 64],
    });
};

function MapController({ selectedResource, resources }) {
    const map = useMap();
    useEffect(() => {
        if (selectedResource) {
            map.setView(
                [
                    parseFloat(selectedResource.latitude),
                    parseFloat(selectedResource.longitude),
                ],
                13,
                {
                    animate: true,
                    duration: 1.2,
                },
            );
        }
    }, [selectedResource, map]);

    useEffect(() => {
        if (resources && resources.length > 0) {
            const lats = resources
                .map((r) => parseFloat(r.latitude))
                .filter((n) => !isNaN(n));
            const lngs = resources
                .map((r) => parseFloat(r.longitude))
                .filter((n) => !isNaN(n));
            if (lats.length > 0 && lngs.length > 0) {
                map.fitBounds(
                    [
                        [Math.min(...lats), Math.min(...lngs)],
                        [Math.max(...lats), Math.max(...lngs)],
                    ],
                    { padding: [50, 50], maxZoom: 13 },
                );
            }
        }
    }, [resources, map]);
    return null;
}

function MapEventsTracker({ setMouseCoords, isClickingCoords, navigate }) {
    useMapEvents({
        mousemove(e) {
            setMouseCoords({
                lat: e.latlng.lat.toFixed(4),
                lng: e.latlng.lng.toFixed(4),
                x: e.containerPoint.x,
                y: e.containerPoint.y,
            });
        },
        click(e) {
            if (isClickingCoords) {
                navigate(
                    `/resources/create?lat=${e.latlng.lat.toFixed(6)}&lng=${e.latlng.lng.toFixed(6)}`,
                );
            }
        },
    });
    return null;
}

export default function Resources() {
    const navigate = useNavigate();
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedStatuses, setSelectedStatuses] = useState([
        'active',
        'maintenance',
        'offline',
    ]);
    const [minCapacity, setMinCapacity] = useState(0);
    const [maxCapacity, setMaxCapacity] = useState(500);

    const [selectedResource, setSelectedResource] = useState(null);
    const [isClickingCoords, setIsClickingCoords] = useState(false);
    const [mouseCoords, setMouseCoords] = useState({
        x: 0,
        y: 0,
        lat: '13.0500',
        lng: '77.6200',
    });

    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                setError('');
                const response = await api.get('/resources');
                const data = response.data || [];
                setResources(data);
                setSelectedResource(null);
            } catch (err) {
                setResources([]);
                setSelectedResource(null);
                setError('Failed to load energy nodes from database.');
            } finally {
                setLoading(false);
            }
        };
        fetchResources();
    }, []);

    const filteredResources = resources.filter((res) => {
        const matchesSearch =
            res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            res.location_name
                ?.toLowerCase()
                .includes(searchQuery.toLowerCase());
        const matchesType = searchQuery
            ? true
            : selectedTypes.length === 0 || selectedTypes.includes(res.type.toLowerCase());
        const matchesStatus = selectedStatuses.includes(
            res.status.toLowerCase(),
        );
        const matchesCapacity =
            res.capacity >= minCapacity && res.capacity <= maxCapacity;
        return matchesSearch && matchesType && matchesStatus && matchesCapacity;
    });

    const toggleTypeFilter = (type) => {
        if (selectedTypes.includes(type)) {
            setSelectedTypes(selectedTypes.filter((t) => t !== type));
        } else {
            setSelectedTypes([...selectedTypes, type]);
        }
    };

    const toggleStatusFilter = (status) => {
        if (selectedStatuses.includes(status)) {
            setSelectedStatuses(selectedStatuses.filter((s) => s !== status));
        } else {
            setSelectedStatuses([...selectedStatuses, status]);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 m-0 h-full w-full select-none overflow-hidden bg-black p-0"
        >
            <style
                dangerouslySetInnerHTML={{
                    __html: `
        .leaflet-container { font-family: 'JetBrains Mono', monospace !important; background-color: #E1EBED !important; }
        .leaflet-bar { border: 1px solid rgba(0,0,0,0.2) !important; box-shadow: none !important; border-radius: 0 !important; }
        .leaflet-bar a { background-color: rgba(255,255,255,0.8) !important; color: #000 !important; border-bottom: 1px solid rgba(0,0,0,0.1) !important; }
        .leaflet-bar a:hover { background-color: #dfed2b !important; }
        .custom-leaflet-marker { background: transparent !important; border: none !important; }

        .custom-leaflet-tooltip {
          background-color: #000 !important;
          border: none !important;
          border-radius: 0 !important;
          padding: 8px 12px !important;
          color: #fff !important;
          font-family: 'JetBrains Mono', monospace !important;
          font-weight: 700 !important;
        }
        .custom-leaflet-tooltip::before { border-top-color: #000 !important; }
      `,
                }}
            />

            {/* Map Viewport */}
            <div className="absolute inset-0 z-0">
                <MapContainer
                    center={[13.05, 77.62]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    zoomControl={true}
                >
                    <TileLayer
                        attribution="&copy; CARTO"
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />
                    <MapController
                        selectedResource={selectedResource}
                        resources={filteredResources}
                    />
                    <MapEventsTracker
                        setMouseCoords={setMouseCoords}
                        isClickingCoords={isClickingCoords}
                        navigate={navigate}
                    />

                    {filteredResources.map((res) => {
                        const latVal = parseFloat(res.latitude);
                        const lngVal = parseFloat(res.longitude);
                        if (isNaN(latVal) || isNaN(lngVal)) return null;

                        const active = selectedResource?.id === res.id;
                        const colors = getTypeColor(res.type);

                        return (
                            <Marker
                                key={res.id}
                                position={[latVal, lngVal]}
                                icon={getMarkerIcon(res.type, colors, active)}
                                eventHandlers={{
                                    click: () => setSelectedResource(res),
                                }}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, -15]}
                                    opacity={1}
                                    className="custom-leaflet-tooltip"
                                >
                                    <div className="text-center">
                                        <h4 className="font-['Montserrat'] text-sm font-black uppercase">
                                            {res.title}
                                        </h4>
                                        <div className="mt-1 text-[9px] text-[#dfed2b]">
                                            {res.capacity} MW
                                        </div>
                                    </div>
                                </Tooltip>
                            </Marker>
                        );
                    })}
                </MapContainer>

                {/* Crosshair guidelines on map hover */}
                <div
                    className="pointer-events-none absolute bottom-0 top-0 z-[1000] border-l border-black/10"
                    style={{ left: `${mouseCoords.x}px` }}
                />
                <div
                    className="pointer-events-none absolute left-0 right-0 z-[1000] border-t border-black/10"
                    style={{ top: `${mouseCoords.y}px` }}
                />
            </div>

            {/* Floating Status & Targeting Indicators */}
            <div className="pointer-events-none absolute bottom-6 right-6 z-[1000] border border-white/20 bg-black/80 px-4 py-2 font-['Montserrat'] text-[10px] font-bold text-white shadow-2xl backdrop-blur">
                <div className="flex gap-4">
                    <span>LAT: {mouseCoords.lat}° N</span>
                    <span>LNG: {mouseCoords.lng}° E</span>
                </div>
            </div>

            {isClickingCoords && (
                <div className="absolute left-1/2 top-32 z-[1000] -translate-x-1/2 animate-pulse whitespace-nowrap border-2 border-red-700 bg-red-500 px-6 py-3 font-['Montserrat'] text-xs font-black text-white shadow-2xl">
                    🚨 TARGETING MODE: CLICK ANYWHERE ON MAP TO PIN COORDINATES
                </div>
            )}

            {/* Sidebar Toggle Button */}
            <motion.button
                initial={false}
                animate={{ left: isSidebarOpen ? '400px' : '0px' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={`absolute top-1/2 z-[4000] hidden -translate-y-1/2 cursor-pointer border border-black/10 bg-black p-3 text-[#dfed2b] shadow-2xl transition-colors hover:bg-[#dfed2b] hover:text-black md:flex ${!isSidebarOpen && 'ml-4'}`}
            >
                <ChevronRight
                    className={`h-6 w-6 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`}
                />
            </motion.button>

            {/* Mobile Sidebar Toggle */}
            <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute bottom-24 right-6 z-[4000] rounded-full border border-black/10 bg-black p-4 text-[#dfed2b] shadow-2xl md:hidden"
            >
                <Sliders className="h-6 w-6" />
            </button>

            {/* Sidebar Explorer */}
            <motion.div
                initial={false}
                animate={{ x: isSidebarOpen ? 0 : '-100%' }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="absolute bottom-0 left-0 top-0 z-[4000] flex w-full shrink-0 flex-col border-r border-black/10 bg-white/95 pt-32 shadow-[10px_0_30px_rgba(0,0,0,0.1)] backdrop-blur-2xl md:w-[400px]"
            >
                <div className="border-b border-black/10 p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <div className="inline-block bg-black px-2 py-0.5 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                GEOSPATIAL REGISTRY
                            </div>
                            <h2 className="mt-2 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                Grid Nodes
                            </h2>
                        </div>
                        <span className="border border-black/10 bg-white/40 px-3 py-1 font-['Montserrat'] text-xs font-bold text-black">
                            {filteredResources.length} NODES
                        </span>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                        <input
                            type="text"
                            placeholder="Search nodes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full border border-black/10 bg-black/5 px-4 py-3 pl-12 font-['Montserrat'] text-sm font-bold text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                        />
                    </div>

                    <button
                        onClick={() => {
                            setIsClickingCoords(!isClickingCoords);
                            if (window.innerWidth < 768)
                                setIsSidebarOpen(false);
                        }}
                        className={`flex w-full items-center justify-center gap-2 py-3 font-['Montserrat'] text-xs font-black uppercase transition-colors ${
                            isClickingCoords
                                ? 'bg-red-500 text-white'
                                : 'bg-[#dfed2b] text-black hover:bg-black hover:text-white'
                        }`}
                    >
                        <Plus className="h-4 w-4" />
                        {isClickingCoords
                            ? 'CANCEL TARGETING'
                            : 'REGISTER ENERGY NODE'}
                    </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto p-6">
                    <div className="border border-black/10 bg-black/5 p-4">
                        <span className="mb-4 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                            // REFINE SYSTEM FILTERS
                        </span>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block font-['Montserrat'] text-[10px] font-bold uppercase text-black">
                                    Families
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => {
                                            if (selectedTypes.length === 5) {
                                                setSelectedTypes([]);
                                            } else {
                                                setSelectedTypes([
                                                    'solar',
                                                    'wind',
                                                    'hydro',
                                                    'biomass',
                                                    'geothermal',
                                                ]);
                                            }
                                        }}
                                        className="px-3 py-1 font-['Montserrat'] text-[10px] font-bold uppercase transition-colors"
                                        style={{
                                            backgroundColor:
                                                selectedTypes.length === 5
                                                    ? '#000'
                                                    : 'rgba(255,255,255,0.4)',
                                            color:
                                                selectedTypes.length === 5
                                                    ? '#fff'
                                                    : '#000',
                                            border: '1px solid rgba(0,0,0,0.1)',
                                        }}
                                    >
                                        ALL
                                    </button>

                                    {[
                                        'solar',
                                        'wind',
                                        'hydro',
                                        'biomass',
                                        'geothermal',
                                    ].map((type) => {
                                        const active =
                                            selectedTypes.includes(type);
                                        const colors = getTypeColor(type);
                                        return (
                                            <button
                                                key={type}
                                                onClick={() =>
                                                    toggleTypeFilter(type)
                                                }
                                                className="cursor-pointer px-3 py-1 font-['Montserrat'] text-[10px] font-bold uppercase shadow-sm transition-all duration-200 hover:shadow-md"
                                                style={{
                                                    backgroundColor: active
                                                        ? colors.primary
                                                        : 'rgba(255,255,255,0.4)',
                                                     color: active
                                                         ? colors.text
                                                         : '#000',
                                                     border: '1px solid rgba(0,0,0,0.1)',
                                                 }}
                                             >
                                                 {type}
                                             </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="mb-2 block font-['Montserrat'] text-[10px] font-bold uppercase text-black">
                                    Status
                                </label>
                                <div className="flex gap-2">
                                    {['active', 'maintenance', 'offline'].map(
                                        (status) => {
                                            const active =
                                                selectedStatuses.includes(
                                                    status,
                                                );
                                            return (
                                                <button
                                                    key={status}
                                                    onClick={() =>
                                                        toggleStatusFilter(
                                                            status,
                                                        )
                                                    }
                                                    className={`flex-1 border border-black/10 py-1.5 font-['Montserrat'] text-[10px] font-bold uppercase transition-colors ${
                                                        active
                                                            ? 'bg-black text-white'
                                                            : 'bg-white/40 text-black'
                                                    }`}
                                                >
                                                    {status}
                                                </button>
                                            );
                                        },
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="mb-2 flex justify-between font-['Montserrat'] text-[10px] font-bold text-black">
                                    <span>CAPACITY CAP</span>
                                    <span>
                                        {minCapacity} - {maxCapacity} MW
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="500"
                                    value={maxCapacity}
                                    onChange={(e) =>
                                        setMaxCapacity(parseInt(e.target.value))
                                    }
                                    className="h-1 w-full cursor-pointer bg-black/10 accent-black"
                                />
                            </div>
                        </div>
                    </div>

                    <motion.div
                        initial="hidden"
                        animate="show"
                        className="space-y-3 pb-24"
                    >
                        {filteredResources.map((res) => {
                            const active = selectedResource?.id === res.id;
                            const typeColor = getTypeColor(res.type);
                            const glowClass = `hover-glow-${res.type.toLowerCase()}`;
                            return (
                                <motion.div
                                    key={res.id}
                                    onClick={() => {
                                        setSelectedResource(res);
                                        if (window.innerWidth < 768)
                                            setIsSidebarOpen(false);
                                    }}
                                    className={`group relative cursor-pointer overflow-hidden border p-4 transition-all duration-300 ${glowClass} hover-slide-chevron ${
                                        active
                                            ? 'border-black bg-white shadow-lg'
                                            : 'border-black/10 bg-white/40 hover:bg-white'
                                    }`}
                                >
                                    <div
                                        className="absolute inset-0 z-0 -translate-x-full transition-transform duration-500 ease-out group-hover:translate-x-0"
                                        style={{
                                            backgroundColor: `${typeColor.primary}20`,
                                        }}
                                    />

                                    <div className="pointer-events-none relative z-10 flex h-full flex-col justify-between">
                                        <div className="mb-2 flex items-start justify-between">
                                            <h3 className="truncate pr-4 font-['Montserrat'] text-lg font-black uppercase leading-tight text-black transition-colors duration-300 group-hover:text-black">
                                                {res.title}
                                            </h3>
                                            <ChevronRight className="h-4 w-4 shrink-0 text-black/30 transition-all duration-300 group-hover:text-black" />
                                        </div>
                                        <div className="flex items-center justify-between font-['Montserrat'] text-[10px] font-bold uppercase text-black/60 transition-colors duration-300 group-hover:text-black">
                                            <span className="flex items-center gap-2">
                                                <span
                                                    className="h-2 w-2 shrink-0 rounded-full"
                                                    style={{
                                                        backgroundColor:
                                                            typeColor.primary,
                                                        border: '1px solid #000',
                                                    }}
                                                />
                                                {res.type}
                                            </span>
                                            <span className="shrink-0 text-black">
                                                {res.capacity} MW
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </motion.div>

            {/* Selected Resource Overlay (Right Side) */}
            <AnimatePresence>
                {selectedResource && (
                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="pointer-events-auto absolute bottom-6 right-6 top-32 z-[4000] flex w-80 flex-col border border-black/20 bg-white/95 shadow-2xl backdrop-blur-2xl"
                    >
                        <div className="relative border-b border-black/10 p-6">
                            <button
                                onClick={() => setSelectedResource(null)}
                                className="absolute right-4 top-4 text-black/40 hover:text-black"
                            >
                                <X className="h-5 w-5" />
                            </button>
                            <span className="mb-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // PERFORMANCE SPECS
                            </span>
                            <h3 className="pr-8 font-['Montserrat'] text-3xl font-black uppercase leading-none text-black">
                                {selectedResource.title}
                            </h3>
                        </div>

                        <div className="flex-1 space-y-4 overflow-y-auto p-6 font-['Montserrat'] text-xs font-bold uppercase text-black">
                            <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                <span className="text-black/40">STATUS:</span>
                                <span className="border border-black/10 bg-[#dfed2b] px-2 py-1">
                                    {selectedResource.status}
                                </span>
                            </div>
                            <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                <span className="text-black/40">TYPE:</span>
                                <span>{selectedResource.type}</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                <span className="text-black/40">CAPACITY:</span>
                                <span>{selectedResource.capacity} MW</span>
                            </div>
                            <div className="flex items-center justify-between border-b border-black/10 pb-2">
                                <span className="text-black/40">LOC:</span>
                                <span
                                    className="max-w-[150px] truncate"
                                    title={selectedResource.location_name}
                                >
                                    {selectedResource.location_name ||
                                        `${parseFloat(selectedResource.latitude).toFixed(2)}, ${parseFloat(selectedResource.longitude).toFixed(2)}`}
                                </span>
                            </div>

                            {selectedResource.description && (
                                <div className="mt-6">
                                    <span className="mb-2 block text-[10px] text-black/40">
                                        // DIRECTIVE
                                    </span>
                                    <p className="text-[10px] normal-case italic leading-relaxed text-black/80">
                                        "{selectedResource.description}"
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-black p-6 text-white">
                            <Link
                                to={`/resources/${selectedResource.id}`}
                                className="flex w-full items-center justify-center gap-2 bg-white py-3 text-[10px] font-black uppercase tracking-widest text-black transition-colors hover:bg-[#dfed2b]"
                            >
                                <Compass className="h-4 w-4" />
                                DEEP DIVE SPECS
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

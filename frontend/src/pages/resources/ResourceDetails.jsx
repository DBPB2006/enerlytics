import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Trash2,
    AlertTriangle,
    MapPin,
    Compass,
    Users,
    ShieldCheck,
    HelpCircle,
    Loader2,
} from 'lucide-react';
import api from '../../utils/api';
import AnalyticsCharts from '../../components/AnalyticsCharts';

export default function ResourceDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [resource, setResource] = useState(null);
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            try {
                setError('');
                const [response, metricsRes] = await Promise.all([
                    api.get(`/resources/${id}`),
                    api.get(`/resources/${id}/metrics`),
                ]);
                setResource(response.data);
                setMetrics(metricsRes.data);
            } catch (err) {
                setError(
                    'Failed to fetch resource details or access was denied.',
                );
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this resource?'))
            return;
        try {
            await api.delete(`/resources/${id}`);
            navigate('/resources');
        } catch (err) {
            alert('Failed to delete this resource.');
        }
    };

    if (loading) {
        return (
            <div className="relative z-10 flex min-h-[calc(100vh-68px)] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-black" />
                    <p className="animate-pulse font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60">
                        Retrieving resource data...
                    </p>
                </div>
            </div>
        );
    }

    if (error || !resource) {
        return (
            <div className="relative z-10 flex min-h-[calc(100vh-68px)] w-full items-center justify-center p-4">
                <div className="eco-nexus-glass-card relative w-full max-w-md overflow-hidden p-8 shadow-2xl">
                    <div className="absolute right-0 top-0 bg-red-500 px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                        EXCEPTION
                    </div>
                    <div className="mt-4 flex flex-col items-center space-y-6 text-center">
                        <AlertTriangle className="h-12 w-12 text-red-500" />
                        <p className="font-['Montserrat'] text-sm font-bold text-black">
                            {error.toUpperCase() ||
                                'RESOURCE DETAILS ARE CURRENTLY UNREACHABLE.'}
                        </p>
                        <Link
                            to="/resources"
                            className="flex w-full items-center justify-center gap-2 bg-black py-3 font-['Montserrat'] text-xs font-black uppercase text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                        >
                            <ArrowLeft className="h-4 w-4" /> Back to Map
                            Directory
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const canModify =
        resource.created_by === currentUser.id ||
        (resource.group && resource.group.owner_id === currentUser.id);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mx-auto min-h-[calc(100vh-68px)] w-full max-w-7xl select-none overflow-hidden px-6 pb-20 pt-8 md:px-12"
        >
            <Link
                to="/resources"
                className="group mb-6 inline-flex items-center gap-1.5 font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60 transition-colors hover:text-black"
            >
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Back to Map Directory
            </Link>

            {/* Header Panel */}
            <div className="eco-nexus-glass-card relative mb-8 overflow-hidden p-6 shadow-xl md:p-8">
                <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                    RESOURCE-{resource.id}
                </div>
                <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                    // RESOURCE SPECIFICATIONS
                </span>
                <h1 className="mb-6 font-['Montserrat'] text-5xl font-black uppercase tracking-tighter text-black">
                    {resource.title}
                </h1>

                <div className="flex flex-col justify-between gap-6 border-t border-black/10 pt-6 md:flex-row md:items-end">
                    <div>
                        <span className="font-['Montserrat'] text-[10px] font-bold uppercase text-black/60">
                            RESOURCE LOCATION
                        </span>
                        <p className="mt-2 flex items-center gap-2 font-['Montserrat'] text-sm font-black text-black">
                            <MapPin className="h-4 w-4 text-black/60" />
                            {resource.location_name?.toUpperCase() ||
                                `${resource.latitude}, ${resource.longitude}`}
                            , {resource.region?.toUpperCase() || 'GLOBAL'}
                        </p>
                    </div>

                    {canModify && (
                        <div className="flex flex-col items-center gap-3 sm:flex-row">
                            <Link
                                to={`/resources/edit/${id}`}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 bg-[#dfed2b] px-6 py-3 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white sm:w-auto"
                            >
                                EDIT RESOURCE
                            </Link>
                            <button
                                onClick={handleDelete}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 bg-red-500 px-6 py-3 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-red-600 sm:w-auto"
                            >
                                <Trash2 className="h-4 w-4" />
                                DELETE RESOURCE
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
                {/* Main Details */}
                <div className="space-y-8 lg:col-span-2">
                    <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                        <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                            02
                        </div>
                        <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                            // CORE METRICS
                        </span>
                        <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                            OPERATIONAL PARAMETERS
                        </h2>

                        <div className="grid grid-cols-2 gap-4 font-['Montserrat'] sm:grid-cols-4">
                            <div className="border border-black/10 bg-white/40 p-4">
                                <span className="block text-[10px] font-bold uppercase text-black/60">
                                    CAPACITY
                                </span>
                                <span className="mt-2 block text-xl font-black text-black">
                                    {resource.capacity} MW
                                </span>
                            </div>
                            <div className="border border-black/10 bg-white/40 p-4">
                                <span className="block text-[10px] font-bold uppercase text-black/60">
                                    STATUS
                                </span>
                                <span className="mt-2 block w-fit border border-black/10 bg-[#dfed2b] px-2 py-1 text-sm font-black uppercase text-black">
                                    {resource.status}
                                </span>
                            </div>
                            <div className="border border-black/10 bg-white/40 p-4">
                                <span className="block text-[10px] font-bold uppercase text-black/60">
                                    LOAD FACTOR
                                </span>
                                <span className="mt-2 block text-xl font-black text-black">
                                    {resource.utilization !== undefined &&
                                    resource.utilization !== null
                                        ? parseFloat(
                                              resource.utilization,
                                          ).toFixed(0)
                                        : resource.load_factor
                                          ? (
                                                resource.load_factor * 100
                                            ).toFixed(0)
                                          : 0}
                                    %
                                </span>
                            </div>
                            <div className="border border-black/10 bg-white/40 p-4">
                                <span className="block text-[10px] font-bold uppercase text-black/60">
                                    ACCURACY
                                </span>
                                <span className="mt-2 block text-xl font-black uppercase text-black">
                                    {resource.accuracy || 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                        <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                            03
                        </div>
                        <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                            // ASSET PHYSICS
                        </span>
                        <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                            TYPE SPECIFIC METRICS
                        </h2>

                        <div className="grid grid-cols-1 gap-4 font-['Montserrat'] text-xs sm:grid-cols-2">
                            {resource.type === 'solar' && (
                                <>
                                    <div className="flex items-center justify-between border border-black/10 bg-white/40 p-5">
                                        <span className="font-bold uppercase text-black/60">
                                            Panel Surface Area
                                        </span>
                                        <span className="text-sm font-black text-black">
                                            {resource.panel_area || 0} m²
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border border-black/10 bg-white/40 p-5">
                                        <span className="font-bold uppercase text-black/60">
                                            Cell Efficiency
                                        </span>
                                        <span className="text-sm font-black text-black">
                                            {resource.efficiency !==
                                                undefined &&
                                            resource.efficiency !== null
                                                ? (
                                                      parseFloat(
                                                          resource.efficiency,
                                                      ) * 100
                                                  ).toFixed(1)
                                                : resource.cell_efficiency
                                                  ? (
                                                        parseFloat(
                                                            resource.cell_efficiency,
                                                        ) * 100
                                                    ).toFixed(1)
                                                  : 0}
                                            %
                                        </span>
                                    </div>
                                </>
                            )}
                            {resource.type === 'wind' && (
                                <>
                                    <div className="flex items-center justify-between border border-black/10 bg-white/40 p-5">
                                        <span className="font-bold uppercase text-black/60">
                                            Rotor Swept Area
                                        </span>
                                        <span className="text-sm font-black text-black">
                                            {resource.rotor_area ||
                                                resource.rotor_swept_area ||
                                                0}{' '}
                                            m²
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border border-black/10 bg-white/40 p-5">
                                        <span className="font-bold uppercase text-black/60">
                                            Turbine Model
                                        </span>
                                        <span className="text-sm font-black uppercase text-black">
                                            {resource.turbine_model || 'N/A'}
                                        </span>
                                    </div>
                                </>
                            )}
                            {resource.type === 'hydro' && (
                                <>
                                    <div className="flex items-center justify-between border border-black/10 bg-white/40 p-5">
                                        <span className="font-bold uppercase text-black/60">
                                            Water Flow Rate
                                        </span>
                                        <span className="text-sm font-black text-black">
                                            {resource.flow_rate || 0} m³/s
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between border border-black/10 bg-white/40 p-5">
                                        <span className="font-bold uppercase text-black/60">
                                            Hydraulic Head Height
                                        </span>
                                        <span className="text-sm font-black text-black">
                                            {resource.head || 0} m
                                        </span>
                                    </div>
                                </>
                            )}
                            {resource.type !== 'solar' &&
                                resource.type !== 'wind' &&
                                resource.type !== 'hydro' && (
                                    <div className="col-span-2 flex flex-col items-center gap-3 border border-black/10 bg-white/40 p-8 text-center text-black/60">
                                        <HelpCircle className="h-6 w-6 text-black/20" />
                                        <span className="font-bold">
                                            Type-specific physical variables are
                                            consolidated inside general
                                            telemetry logs.
                                        </span>
                                    </div>
                                )}
                        </div>
                    </div>

                    {/* Analytics Charts Section */}
                    <AnalyticsCharts resource={resource} metrics={metrics} />
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                        <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                            04
                        </div>
                        <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                            // OVERVIEW
                        </span>
                        <h2 className="mb-4 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                            RESOURCE DETAILS
                        </h2>
                        <div className="border border-black/10 bg-white/40 p-5">
                            <p className="font-['Montserrat'] text-xs font-bold italic leading-relaxed text-black">
                                "
                                {resource.description ||
                                    'No description logged for this energy resource.'}
                                "
                            </p>
                        </div>
                    </div>

                    {resource.group && (
                        <div className="eco-nexus-glass-card relative overflow-hidden p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                                GROUP
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                                // AFFILIATED GROUP
                            </span>
                            <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                COMMUNITY GROUP
                            </h2>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="bg-black p-4 text-[#dfed2b]">
                                        <Users className="h-6 w-6 animate-pulse" />
                                    </div>
                                    <div>
                                        <h4 className="font-['Montserrat'] text-xl font-black uppercase leading-none text-black">
                                            {resource.group.name}
                                        </h4>
                                        <span className="mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase text-black/60">
                                            GROUP INFO
                                        </span>
                                    </div>
                                </div>
                                <Link
                                    to={`/groups/${resource.group.id}`}
                                    className="flex w-full items-center justify-center gap-2 bg-black py-4 text-center font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                                >
                                    VIEW GROUP DETAILS{' '}
                                    <Compass className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {resource.energy_insight && (
                        <div className="eco-nexus-glass-card relative overflow-hidden bg-[#dfed2b]/20 p-6 shadow-xl md:p-8">
                            <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#dfed2b]">
                                INSIGHT
                            </div>
                            <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                // OUTPUT SUMMARY
                            </span>
                            <h2 className="mb-6 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                                ESTIMATED POWER YIELD
                            </h2>
                            <div className="space-y-4 font-['Montserrat'] text-xs font-bold text-black">
                                <div className="flex justify-between border-b border-black/10 pb-3">
                                    <span className="uppercase text-black/60">
                                        DAILY OUTPUT:
                                    </span>
                                    <span className="text-sm font-black">
                                        {resource.energy_insight.estimated_output?.toFixed(
                                            2,
                                        )}{' '}
                                        MW
                                    </span>
                                </div>
                                <div className="flex justify-between border-b border-black/10 pb-3">
                                    <span className="uppercase text-black/60">
                                        EFFICIENCY INDEX:
                                    </span>
                                    <span className="flex items-center gap-2 bg-black px-2 py-1 font-black uppercase text-[#dfed2b]">
                                        <ShieldCheck className="h-3 w-3" />
                                        {
                                            resource.energy_insight
                                                .efficiency_score
                                        }
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="uppercase text-black/60">
                                        RELIABILITY:
                                    </span>
                                    <span className="font-black text-black">
                                        {resource.energy_insight
                                            .reliability_index ||
                                            'HIGH QUALITY'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex h-10 w-full select-none items-center justify-center border border-black/10 bg-black/5 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                        ||||| SECURE SESSION |||||
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

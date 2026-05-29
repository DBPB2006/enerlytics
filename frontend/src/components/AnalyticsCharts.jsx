import { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { motion } from 'framer-motion';

/**
 * AnalyticsCharts Component
 * Displays performance trend, environmental impact, and utilization.
 * Adapted for the Neo-Brutalism Cinematic theme.
 */
const AnalyticsCharts = ({ resource, metrics = [] }) => {
    const chartData = useMemo(() => {
        if (!metrics || metrics.length === 0) return [];

        const normalize = (value, min, max) => {
            if (max === min) return 0;
            return ((value - min) / (max - min)) * 100;
        };

        // Sort by time to ensure smooth trend lines
        const sorted = [...metrics].sort(
            (a, b) => new Date(a.time) - new Date(b.time),
        );

        // Calculate normalization bounds for environmental variables
        const vectorValues = sorted.map((m) =>
            resource?.type === 'solar' ? m.irradiance || 0 : m.wind || 0,
        );
        const minV = Math.min(...vectorValues);
        const maxV = Math.max(...vectorValues);

        return sorted.map((m) => ({
            ...m,
            // time is already formatted as 'H:i' in the backend, but if it's a full date string:
            time:
                m.time.length > 5
                    ? new Date(m.time).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                      })
                    : m.time,
            // Normalize environmental factors to 0-100 for aligned comparison
            vector: normalize(
                resource?.type === 'solar' ? m.irradiance || 0 : m.wind || 0,
                minV,
                maxV,
            ),
            // Clamp utilization and ensure percentage format
            utilization:
                m.utilization > 1.0
                    ? Math.min(100, parseFloat(m.utilization))
                    : Math.min(
                          100,
                          Math.max(0, (parseFloat(m.utilization) || 0) * 100),
                      ),
        }));
    }, [resource, metrics]);

    // Cinematic Theme Colors for Light Background
    const primaryColor = '#000000'; // Pure Black
    const secondaryColor = '#808080'; // Dark Grey for secondary lines
    const outlineColor = 'rgba(0, 0, 0, 0.5)';
    const gridColor = 'rgba(0, 0, 0, 0.05)';
    const bgColor = '#ffffff';

    return (
        <div className="mt-8 space-y-8">
            {/* 1. Output Trend (Line Chart) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="eco-nexus-glass-card relative overflow-hidden p-6 md:p-8"
            >
                <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#d4e157]">
                    METRICS // CHART-1
                </div>

                <div className="relative z-10 mb-8 flex items-start justify-between">
                    <div>
                        <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                            // OPERATIONAL OUTPUT
                        </span>
                        <p className="font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                            Energy Output Trend (24h)
                        </p>
                    </div>
                    <div className="flex items-center gap-4 border border-black/10 bg-white/40 p-2">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-black"></span>
                            <span className="font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black">
                                Output (MW)
                            </span>
                        </div>
                    </div>
                </div>
                <div className="relative z-10 h-64 w-full font-['Montserrat']">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="2 2"
                                vertical={false}
                                stroke={gridColor}
                            />
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 10,
                                    fill: outlineColor,
                                    fontWeight: 'bold',
                                }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 10,
                                    fill: outlineColor,
                                    fontWeight: 'bold',
                                }}
                            />
                            <Tooltip
                                contentStyle={{
                                    border: `1px solid ${outlineColor}`,
                                    borderRadius: '0',
                                    fontSize: '10px',
                                    backgroundColor: bgColor,
                                    color: 'black',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                }}
                                cursor={{
                                    stroke: outlineColor,
                                    strokeWidth: 1,
                                    strokeDasharray: '2 2',
                                }}
                            />
                            <Line
                                type="step"
                                dataKey="output"
                                stroke={primaryColor}
                                strokeWidth={2}
                                dot={false}
                                animationDuration={2000}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* 2. Environmental Impact Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="eco-nexus-glass-card relative overflow-hidden p-6 md:p-8"
            >
                <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                    METRICS // CHART-2
                </div>
                <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                    // ENVIRONMENTAL CORRELATION
                </span>
                <p className="mb-8 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                    Environment vs. Output
                </p>
                <div className="h-64 w-full font-['Montserrat']">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <LineChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="2 2"
                                vertical={false}
                                stroke={gridColor}
                            />
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 10,
                                    fill: outlineColor,
                                    fontWeight: 'bold',
                                }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                yAxisId="left"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 10,
                                    fill: outlineColor,
                                    fontWeight: 'bold',
                                }}
                            />
                            <YAxis
                                yAxisId="right"
                                orientation="right"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 10,
                                    fill: outlineColor,
                                    fontWeight: 'bold',
                                }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    border: `1px solid ${outlineColor}`,
                                    borderRadius: '0',
                                    fontSize: '10px',
                                    backgroundColor: bgColor,
                                    color: 'black',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                }}
                            />
                            <Line
                                yAxisId="left"
                                type="linear"
                                dataKey="output"
                                stroke={primaryColor}
                                strokeWidth={2}
                                dot={false}
                                name="Output (MW)"
                            />
                            <Line
                                yAxisId="right"
                                type="step"
                                dataKey="vector"
                                stroke={secondaryColor}
                                strokeWidth={1}
                                dot={false}
                                name={
                                    resource?.type === 'solar'
                                        ? 'Solar Intensity (%)'
                                        : resource?.type === 'wind'
                                          ? 'Wind Potential (%)'
                                          : 'Flow Potential (%)'
                                }
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-6 border border-black/10 bg-white/40 p-4 text-center">
                    <p className="font-['Montserrat'] text-[9px] font-bold uppercase tracking-widest text-black/70">
                        Correlation between primary environmental factors
                        (normalized) and generation levels
                    </p>
                </div>
            </motion.div>

            {/* 3. Utilization Over Time (Bar Chart) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="eco-nexus-glass-card relative overflow-hidden border-l-4 border-l-black p-6 md:p-8"
            >
                <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-[#d4e157]">
                    METRICS // CHART-3
                </div>
                <span className="mb-2 mt-2 block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/40">
                    // UTILIZATION TREND
                </span>
                <p className="mb-8 font-['Montserrat'] text-3xl font-black uppercase tracking-tighter text-black">
                    Efficiency Timeline
                </p>
                <div className="h-64 w-full font-['Montserrat']">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <BarChart data={chartData}>
                            <CartesianGrid
                                strokeDasharray="2 2"
                                vertical={false}
                                stroke={gridColor}
                            />
                            <XAxis
                                dataKey="time"
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 10,
                                    fill: outlineColor,
                                    fontWeight: 'bold',
                                }}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{
                                    fontSize: 10,
                                    fill: outlineColor,
                                    fontWeight: 'bold',
                                }}
                                domain={[0, 100]}
                            />
                            <Tooltip
                                contentStyle={{
                                    border: `1px solid ${outlineColor}`,
                                    borderRadius: '0',
                                    fontSize: '10px',
                                    backgroundColor: bgColor,
                                    color: 'black',
                                    textTransform: 'uppercase',
                                    fontWeight: 'bold',
                                }}
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                            />
                            <Bar
                                dataKey="utilization"
                                name="Utilization %"
                                fill={primaryColor}
                                radius={[0, 0, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>
        </div>
    );
};

export default AnalyticsCharts;

export const OperationalOutput = ({ data }) => {
    const primaryColor = '#000000';
    const outlineColor = 'rgba(0, 0, 0, 0.5)';
    const gridColor = 'rgba(0, 0, 0, 0.05)';
    const bgColor = '#ffffff';

    return (
        <div className="relative z-10 h-64 w-full font-['Montserrat']">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={data}>
                    <CartesianGrid
                        strokeDasharray="2 2"
                        vertical={false}
                        stroke={gridColor}
                    />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 10,
                            fill: outlineColor,
                            fontWeight: 'bold',
                        }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 10,
                            fill: outlineColor,
                            fontWeight: 'bold',
                        }}
                    />
                    <Tooltip
                        contentStyle={{
                            border: `1px solid ${outlineColor}`,
                            borderRadius: '0',
                            fontSize: '10px',
                            backgroundColor: bgColor,
                            color: 'black',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                        }}
                        cursor={{
                            stroke: outlineColor,
                            strokeWidth: 1,
                            strokeDasharray: '2 2',
                        }}
                    />
                    <Line
                        type="step"
                        dataKey="output"
                        stroke={primaryColor}
                        strokeWidth={2}
                        dot={false}
                        animationDuration={2000}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const FactorCorrelation = ({ data, type }) => {
    const primaryColor = '#000000';
    const secondaryColor = '#808080';
    const outlineColor = 'rgba(0, 0, 0, 0.5)';
    const gridColor = 'rgba(0, 0, 0, 0.05)';
    const bgColor = '#ffffff';

    return (
        <div className="h-64 w-full font-['Montserrat']">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <LineChart data={data}>
                    <CartesianGrid
                        strokeDasharray="2 2"
                        vertical={false}
                        stroke={gridColor}
                    />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 10,
                            fill: outlineColor,
                            fontWeight: 'bold',
                        }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        yAxisId="left"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 10,
                            fill: outlineColor,
                            fontWeight: 'bold',
                        }}
                    />
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 10,
                            fill: outlineColor,
                            fontWeight: 'bold',
                        }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            border: `1px solid ${outlineColor}`,
                            borderRadius: '0',
                            fontSize: '10px',
                            backgroundColor: bgColor,
                            color: 'black',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                        }}
                    />
                    <Line
                        yAxisId="left"
                        type="linear"
                        dataKey="output"
                        stroke={primaryColor}
                        strokeWidth={2}
                        dot={false}
                        name="Output (MW)"
                    />
                    <Line
                        yAxisId="right"
                        type="step"
                        dataKey="vector"
                        stroke={secondaryColor}
                        strokeWidth={1}
                        dot={false}
                        name={
                            type === 'solar'
                                ? 'Solar Intensity (%)'
                                : type === 'wind'
                                  ? 'Wind Potential (%)'
                                  : 'Flow Potential (%)'
                        }
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export const UtilizationTrend = ({ data }) => {
    const primaryColor = '#000000';
    const outlineColor = 'rgba(0, 0, 0, 0.5)';
    const gridColor = 'rgba(0, 0, 0, 0.05)';
    const bgColor = '#ffffff';

    return (
        <div className="h-64 w-full font-['Montserrat']">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart data={data}>
                    <CartesianGrid
                        strokeDasharray="2 2"
                        vertical={false}
                        stroke={gridColor}
                    />
                    <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 10,
                            fill: outlineColor,
                            fontWeight: 'bold',
                        }}
                        interval="preserveStartEnd"
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fontSize: 10,
                            fill: outlineColor,
                            fontWeight: 'bold',
                        }}
                        domain={[0, 100]}
                    />
                    <Tooltip
                        contentStyle={{
                            border: `1px solid ${outlineColor}`,
                            borderRadius: '0',
                            fontSize: '10px',
                            backgroundColor: bgColor,
                            color: 'black',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                        }}
                        cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                    />
                    <Bar
                        dataKey="utilization"
                        name="Utilization %"
                        fill={primaryColor}
                        radius={[0, 0, 0, 0]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

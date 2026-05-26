import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

export default function GridContainer({
    children,
    title,
    subtitle,
    warning = false,
    code = '',
    className = '',
    headerClassName = '',
    type = 'light', // "light", "white", "dots", "clear", "solar", "wind", "hydro", "geo", "biomass"
    interactive = false,
}) {
    // Determine background styling based on panel type
    let bgStyle = 'bg-[#FAF6F0]';
    if (type === 'white') {
        bgStyle = 'bg-white';
    } else if (type === 'dots') {
        bgStyle = 'bg-white relative';
    } else if (type === 'clear') {
        bgStyle = 'bg-transparent border-none! shadow-none!';
    } else if (type === 'solar') {
        bgStyle = 'bg-[#FFF9C4]';
    } else if (type === 'wind') {
        bgStyle = 'bg-[#E0F7F7]';
    } else if (type === 'hydro') {
        bgStyle = 'bg-[#E1F0FF]';
    } else if (type === 'geo') {
        bgStyle = 'bg-[#FFEBE1]';
    } else if (type === 'biomass') {
        bgStyle = 'bg-[#F1FAD8]';
    }

    const borderClass =
        type === 'clear' ? '' : 'border-[3px] border-[#122B1E] rounded-none';
    const shadowClass =
        type === 'clear' ? '' : 'shadow-[4px_4px_0px_0px_#122B1E]';
    const hoverClass =
        interactive && type !== 'clear'
            ? 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#122B1E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#122B1E] transition-all duration-200'
            : '';

    return (
        <div
            className={`relative select-none overflow-hidden p-6 ${bgStyle} ${borderClass} ${shadowClass} ${hoverClass} ${className}`}
        >
            {/* Render dotted layer if requested */}
            {type === 'dots' && (
                <div className="bg-eco-dots pointer-events-none absolute inset-0 z-0" />
            )}

            {/* Decorative leaf element in corner */}
            {!interactive && type !== 'clear' && (
                <div className="pointer-events-none absolute right-3 top-3 text-[#122B1E]/10">
                    <Leaf className="h-6 w-6" />
                </div>
            )}

            {/* Code Badge */}
            {code && (
                <div className="absolute right-3 top-3 rounded-none bg-[#122B1E] px-2 py-0.5 font-mono text-[8px] font-bold tracking-widest text-white">
                    {code}
                </div>
            )}

            {/* Header section */}
            {(title || subtitle) && (
                <div
                    className={`relative z-10 mb-5 flex flex-col gap-0.5 border-b-2 border-[#122B1E]/15 pb-3 ${headerClassName}`}
                >
                    {subtitle && (
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#6E8578]">
                            🌱 {subtitle}
                        </span>
                    )}
                    {title && (
                        <h3 className="font-display flex items-center justify-between text-base font-extrabold uppercase tracking-tight text-[#122B1E] md:text-lg">
                            <span className="flex items-center gap-2">
                                {title}
                            </span>
                            {warning && (
                                <span className="h-2.5 w-2.5 animate-ping rounded-none border border-[#122B1E] bg-red-400" />
                            )}
                        </h3>
                    )}
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 h-full w-full">{children}</div>
        </div>
    );
}

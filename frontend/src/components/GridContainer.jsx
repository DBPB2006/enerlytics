import React from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

export default function GridContainer({
  children,
  title,
  subtitle,
  warning = false,
  code = "",
  className = "",
  headerClassName = "",
  type = "light", // "light", "white", "dots", "clear", "solar", "wind", "hydro", "geo", "biomass"
  interactive = false
}) {
  // Determine background styling based on panel type
  let bgStyle = "bg-[#FAF6F0]";
  if (type === "white") {
    bgStyle = "bg-white";
  } else if (type === "dots") {
    bgStyle = "bg-white relative";
  } else if (type === "clear") {
    bgStyle = "bg-transparent border-none! shadow-none!";
  } else if (type === "solar") {
    bgStyle = "bg-[#FFF9C4]";
  } else if (type === "wind") {
    bgStyle = "bg-[#E0F7F7]";
  } else if (type === "hydro") {
    bgStyle = "bg-[#E1F0FF]";
  } else if (type === "geo") {
    bgStyle = "bg-[#FFEBE1]";
  } else if (type === "biomass") {
    bgStyle = "bg-[#F1FAD8]";
  }

  const borderClass = type === "clear" ? "" : "border-[3px] border-[#122B1E] rounded-none";
  const shadowClass = type === "clear" ? "" : "shadow-[4px_4px_0px_0px_#122B1E]";
  const hoverClass = interactive && type !== "clear" 
    ? "hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#122B1E] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_#122B1E] transition-all duration-200" 
    : "";

  return (
    <div 
      className={`p-6 relative overflow-hidden select-none ${bgStyle} ${borderClass} ${shadowClass} ${hoverClass} ${className}`}
    >
      {/* Render dotted layer if requested */}
      {type === "dots" && (
        <div className="absolute inset-0 bg-eco-dots z-0 pointer-events-none" />
      )}

      {/* Decorative leaf element in corner */}
      {!interactive && type !== "clear" && (
        <div className="absolute top-3 right-3 text-[#122B1E]/10 pointer-events-none">
          <Leaf className="h-6 w-6" />
        </div>
      )}

      {/* Code Badge */}
      {code && (
        <div className="absolute top-3 right-3 bg-[#122B1E] text-white px-2 py-0.5 rounded-none text-[8px] font-mono tracking-widest font-bold">
          {code}
        </div>
      )}

      {/* Header section */}
      {(title || subtitle) && (
        <div className={`mb-5 pb-3 border-b-2 border-[#122B1E]/15 flex flex-col gap-0.5 relative z-10 ${headerClassName}`}>
          {subtitle && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E8578] font-bold">
              🌱 {subtitle}
            </span>
          )}
          {title && (
            <h3 className="font-display text-base md:text-lg font-extrabold tracking-tight text-[#122B1E] uppercase flex items-center justify-between">
              <span className="flex items-center gap-2">
                {title}
              </span>
              {warning && <span className="h-2.5 w-2.5 rounded-none bg-red-400 animate-ping border border-[#122B1E]" />}
            </h3>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}

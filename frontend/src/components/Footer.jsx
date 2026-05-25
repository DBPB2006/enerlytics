import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <>
      {/* Scattered Telemetry & Preserved Details */}
      <footer className="w-full mt-auto flex flex-col md:flex-row justify-between items-end gap-12 pb-6 px-6 md:px-12 select-none relative z-10 font-['Inter'] selection:bg-[#dfed2b] selection:text-black">
        {/* Dynamic Footer / TBD */}
      </footer>

      {/* Floating Metadata - Shared Globally */}
      <div className="fixed bottom-6 left-6 z-50 mix-blend-difference text-white/50 font-['Montserrat'] text-[10px] uppercase tracking-widest [writing-mode:vertical-rl] transform rotate-180 pointer-events-none">
        Enerlytics Renewable Tracker
      </div>
      
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 font-['Montserrat'] text-[10px] text-right">
        <Link className="text-black/40 hover:text-black transition-colors bg-white/20 backdrop-blur px-2" to="#">Privacy Policy</Link>
        <Link className="text-black/40 hover:text-black transition-colors bg-white/20 backdrop-blur px-2" to="#">Terms of Service</Link>
        <span className="text-black font-black bg-[#dfed2b] px-2 py-1 shadow-md">System Online</span>
      </div>
    </>
  );
}

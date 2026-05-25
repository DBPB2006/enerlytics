import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldAlert } from "lucide-react";

export default function Modal({
  isOpen,
  onClose,
  title = "System Update",
  subtitle = "Enerlytics Registry node",
  children,
  size = "md" // "sm", "md", "lg"
}) {
  
  // Close on Escape keypress
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto select-none">
          
          {/* Backdrop Blur/Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#122B1E]/40 backdrop-blur-sm"
          />

          {/* Modal Panel Card */}
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`w-full ${sizeClasses[size]} bg-white border-[3px] border-[#122B1E] rounded-none shadow-[6px_6px_0px_0px_#122B1E] p-6 relative z-10 flex flex-col`}
          >
            
            {/* Corner Decorative Leaf Pattern */}
            <div className="absolute top-0 right-12 w-8 h-4 bg-[#C3EAA6] border-b-[3px] border-x-[3px] border-[#122B1E] rounded-none" />

            {/* Header */}
            <div className="pb-4 border-b-2 border-[#122B1E]/15 flex items-start justify-between gap-4">
              <div>
                {subtitle && (
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#6E8578] font-bold">
                    🌱 {subtitle}
                  </span>
                )}
                <h3 className="font-display text-lg md:text-xl font-black text-[#122B1E] uppercase mt-0.5">
                  {title}
                </h3>
              </div>
              
              <button
                onClick={onClose}
                className="p-1.5 border-[2px] border-[#122B1E] bg-[#FAF6F0] rounded-none text-[#122B1E] hover:bg-red-100 hover:text-red-600 transition-colors shadow-[2px_2px_0px_0px_#122B1E] cursor-pointer active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#122B1E]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="py-5 flex-1 max-h-[70vh] overflow-y-auto text-sm text-[#122B1E] font-medium leading-relaxed">
              {children}
            </div>

          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
}

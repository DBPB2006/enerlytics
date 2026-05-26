import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert } from 'lucide-react';

export default function Modal({
    isOpen,
    onClose,
    title = 'System Update',
    subtitle = 'Enerlytics Registry node',
    children,
    size = 'md', // "sm", "md", "lg"
}) {
    // Close on Escape keypress
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleEscape);
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const sizeClasses = {
        sm: 'max-w-md',
        md: 'max-w-xl',
        lg: 'max-w-3xl',
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex select-none items-center justify-center overflow-y-auto p-4">
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
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25,
                        }}
                        className={`w-full ${sizeClasses[size]} relative z-10 flex flex-col rounded-none border-[3px] border-[#122B1E] bg-white p-6 shadow-[6px_6px_0px_0px_#122B1E]`}
                    >
                        {/* Corner Decorative Leaf Pattern */}
                        <div className="absolute right-12 top-0 h-4 w-8 rounded-none border-x-[3px] border-b-[3px] border-[#122B1E] bg-[#C3EAA6]" />

                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 border-b-2 border-[#122B1E]/15 pb-4">
                            <div>
                                {subtitle && (
                                    <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#6E8578]">
                                        🌱 {subtitle}
                                    </span>
                                )}
                                <h3 className="font-display mt-0.5 text-lg font-black uppercase text-[#122B1E] md:text-xl">
                                    {title}
                                </h3>
                            </div>

                            <button
                                onClick={onClose}
                                className="cursor-pointer rounded-none border-[2px] border-[#122B1E] bg-[#FAF6F0] p-1.5 text-[#122B1E] shadow-[2px_2px_0px_0px_#122B1E] transition-colors hover:bg-red-100 hover:text-red-600 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#122B1E]"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Scrollable Content Body */}
                        <div className="max-h-[70vh] flex-1 overflow-y-auto py-5 text-sm font-medium leading-relaxed text-[#122B1E]">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

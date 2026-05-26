import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
    return (
        <>
            {/* The Page Content */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="h-full w-full"
            >
                {children}
            </motion.div>

            {/* The Cinematic Curtain Overlay - Portaled to escape stacking contexts */}
            {createPortal(
                <motion.div
                    className="pointer-events-none fixed inset-0 bg-black"
                    initial={{ scaleY: 1 }}
                    animate={{ scaleY: 0 }}
                    exit={{ scaleY: 1 }}
                    transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
                    style={{ transformOrigin: 'top', zIndex: 99999 }}
                />,
                document.body,
            )}
        </>
    );
};

export default PageTransition;

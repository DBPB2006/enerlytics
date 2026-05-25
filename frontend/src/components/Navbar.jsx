import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Power, User } from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [authTrigger, setAuthTrigger] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    const handleAuthChange = () => setAuthTrigger(prev => prev + 1);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const token = localStorage.getItem("token");
  const userString = localStorage.getItem("user");
  const user = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event('auth-change'));
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "OVERVIEW" },
    { path: "/resources", label: "EXPLORE MAP" },
    { path: "/categories", label: "CATEGORIES" },
    { path: "/analytics", label: "ANALYTICS" },
    { path: "/groups", label: "GROUPS" },
    { path: "/resources/create", label: "ADD RESOURCE" },
  ];

  return (
    <header className="fixed top-4 left-0 right-0 w-full z-[5000] flex justify-center px-6 pointer-events-none">
      <div className="w-full max-w-7xl flex items-center justify-between px-8 py-3.5 bg-white/70 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-full pointer-events-auto transition-all duration-300">
        
        {/* Brand / Logo - Left aligned */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img src="/logo.png" alt="Enerlytics Logo" className="h-9 w-auto object-contain brand-logo-light" />
          </Link>
        </div>

        {/* Main Nav Links - Centered exactly in the middle */}
        <nav className="hidden xl:flex items-center gap-1.5 text-xs font-bold font-['Montserrat'] tracking-widest uppercase shrink-0">
          {navLinks.map((link, idx) => {
            // Match exactly or start with for deep pages
            const isActive = link.path === "/" 
              ? location.pathname === "/" 
              : location.pathname.startsWith(link.path);

            return (
              <Link
                key={link.path}
                to={link.path}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                className={`relative px-5 py-2.5 text-[10px] font-black font-['Montserrat'] tracking-widest uppercase transition-colors duration-300 z-10 ${
                  isActive ? 'text-black' : 'text-black/50 hover:text-black'
                }`}
              >
                {/* Active Indicator Underline Dot */}
                {isActive && (
                  <motion.span
                    layoutId="active-nav-dot"
                    className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#dfed2b] border border-black/20 rounded-full"
                    transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  />
                )}

                {/* Sliding Hover Capsule Backdrop */}
                {hoveredIdx === idx && (
                  <motion.div
                    layoutId="navbar-hover-capsule"
                    className="absolute inset-0 bg-black/5 rounded-full -z-10"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Block - Right aligned */}
        <div className="flex-grow sm:flex-1 flex justify-end items-center gap-3 font-['Montserrat'] text-xs font-bold uppercase tracking-widest">
          {user ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-2 bg-white/40 border border-black/5 px-5 py-2.5 rounded-full hover:bg-white transition-all text-black shadow-sm text-[10px] font-black">
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">PROFILE</span>
              </Link>
              <button 
                onClick={handleLogout} 
                className="bg-black text-white hover:bg-[#dfed2b] hover:text-black px-5 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-md text-[10px] font-black cursor-pointer"
              >
                <Power className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">SIGN OUT</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="px-4 py-2.5 text-black/60 hover:text-black transition-colors text-[10px] font-black hidden sm:block">
                SIGN IN
              </Link>
              <Link to="/signup" className="bg-black text-[#dfed2b] px-6 py-2.5 hover:bg-[#dfed2b] hover:text-black transition-all border border-black shadow-sm rounded-full text-[10px] font-black">
                SIGN UP
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

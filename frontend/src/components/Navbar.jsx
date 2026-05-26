import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Power, User } from 'lucide-react';
import { logout } from '../redux/authSlice';

export default function Navbar() {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [hoveredIdx, setHoveredIdx] = useState(null);

    const { user } = useSelector((state) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navLinks = [
        { path: '/', label: 'OVERVIEW' },
        { path: '/resources', label: 'EXPLORE MAP' },
        { path: '/categories', label: 'CATEGORIES' },
        { path: '/analytics', label: 'ANALYTICS' },
        { path: '/groups', label: 'GROUPS' },
        { path: '/resources/create', label: 'ADD RESOURCE' },
    ];

    return (
        <header className="pointer-events-none fixed left-0 right-0 top-4 z-[5000] flex w-full justify-center px-6">
            <div className="pointer-events-auto flex w-full max-w-7xl items-center justify-between rounded-full border border-white/40 bg-white/70 px-8 py-3.5 shadow-2xl backdrop-blur-2xl transition-all duration-300">
                {/* Brand / Logo - Left aligned */}
                <div className="flex flex-1 justify-start">
                    <Link
                        to="/"
                        className="flex items-center transition-opacity hover:opacity-80"
                    >
                        <img
                            src="/logo.png"
                            alt="Enerlytics Logo"
                            className="brand-logo-light h-9 w-auto object-contain"
                        />
                    </Link>
                </div>

                {/* Main Nav Links - Centered exactly in the middle */}
                <nav className="hidden shrink-0 items-center gap-1.5 font-['Montserrat'] text-xs font-bold uppercase tracking-widest xl:flex">
                    {navLinks.map((link, idx) => {
                        // Match exactly or start with for deep pages
                        const isActive =
                            link.path === '/'
                                ? location.pathname === '/'
                                : location.pathname.startsWith(link.path);

                        return (
                            <Link
                                key={link.path}
                                to={link.path}
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                className={`relative z-10 px-5 py-2.5 font-['Montserrat'] text-[10px] font-black uppercase tracking-widest transition-colors duration-300 ${
                                    isActive
                                        ? 'text-black'
                                        : 'text-black/50 hover:text-black'
                                }`}
                            >
                                {/* Active Indicator Underline Dot */}
                                {isActive && (
                                    <motion.span
                                        layoutId="active-nav-dot"
                                        className="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full border border-black/20 bg-[#d4e157]"
                                        transition={{
                                            type: 'spring',
                                            stiffness: 350,
                                            damping: 25,
                                        }}
                                    />
                                )}

                                {/* Local Hover Capsule Backdrop */}
                                {hoveredIdx === idx && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute inset-0 -z-10 rounded-full bg-black/5"
                                    />
                                )}
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* Auth Block - Right aligned */}
                <div className="flex flex-grow items-center justify-end gap-3 font-['Montserrat'] text-xs font-bold uppercase tracking-widest sm:flex-1">
                    {user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 rounded-full border border-black/5 bg-white/40 px-5 py-2.5 text-[10px] font-black text-black shadow-sm transition-all hover:bg-white"
                            >
                                <User className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                    PROFILE
                                </span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-2.5 text-[10px] font-black text-white shadow-md transition-all hover:bg-[#d4e157] hover:text-black"
                            >
                                <Power className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">
                                    SIGN OUT
                                </span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="hidden px-4 py-2.5 text-[10px] font-black text-black/60 transition-colors hover:text-black sm:block"
                            >
                                SIGN IN
                            </Link>
                            <Link
                                to="/signup"
                                className="rounded-full border border-black bg-black px-6 py-2.5 text-[10px] font-black text-[#d4e157] shadow-sm transition-all hover:bg-[#d4e157] hover:text-black"
                            >
                                SIGN UP
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}


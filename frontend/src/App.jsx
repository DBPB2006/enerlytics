import { useState, useEffect, useRef } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PageTransition from './components/PageTransition';

// Pages
import Home from './pages/dashboard/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import AuthCallback from './pages/auth/AuthCallback';
import MfaSetup from './pages/auth/MfaSetup';
import MfaVerify from './pages/auth/MfaVerify';
import Resources from './pages/resources/Resources';
import ResourceDetails from './pages/resources/ResourceDetails';
import CreateResource from './pages/resources/CreateResource';
import Profile from './pages/dashboard/Profile';
import Groups from './pages/groups/Groups';
import GroupDetails from './pages/groups/GroupDetails';
import Analytics from './pages/dashboard/Analytics';
import Categories from './pages/categories/Categories';
import CategoryOverview from './pages/categories/CategoryOverview';
import CategoryResources from './pages/categories/CategoryResources';

// Private Route Wrapper Guard
function PrivateRoute({ children }) {
    const { token } = useSelector((state) => state.auth);
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function SplashAnimation({ onComplete }) {
    const videoRef = useRef(null);

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            const duration = videoRef.current.duration;
            if (duration && duration > 0) {
                // Play smoothly to fit exactly inside 2.0 seconds
                videoRef.current.playbackRate = duration / 1.5;
            }
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
        >
            <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={onComplete}
                className="absolute inset-0 h-full w-full object-cover opacity-80"
            >
                <source src="/landing.mp4" type="video/mp4" />
            </video>
        </motion.div>
    );
}

function AppLayout() {
    const location = useLocation();
    const isMapPage = location.pathname === '/resources';
    const [showSplash, setShowSplash] = useState(true);

    const navbarPaths = ['/', '/resources', '/categories', '/analytics', '/groups', '/resources/create', '/profile'];
    const isNavbarPage = (path) => navbarPaths.includes(path);

    const prevPathRef = useRef(location.pathname);
    const [animationKey, setAnimationKey] = useState(location.pathname);

    useEffect(() => {
        const prevPath = prevPathRef.current;
        const currentPath = location.pathname;

        // Trigger transition animation only when navigating between primary navbar pages
        if (isNavbarPage(prevPath) && isNavbarPage(currentPath)) {
            setAnimationKey(currentPath);
        }
        prevPathRef.current = currentPath;
    }, [location.pathname]);

    return (
        <div className="eco-nexus-bg-fixed-layer relative flex min-h-screen flex-col selection:bg-[#d4e157] selection:text-black">
            <AnimatePresence>
                {showSplash && (
                    <SplashAnimation
                        key="splash"
                        onComplete={() => setShowSplash(false)}
                    />
                )}
            </AnimatePresence>
            <div className="eco-nexus-scanline"></div>

            {/* Navbar Header (Now Floating) */}
            <Navbar />

            {/* Core Main Terminal Frame */}
            {/* Add top padding for all pages EXCEPT the full-screen map page */}
            <main
                className={`relative z-10 flex flex-1 flex-col ${isMapPage ? '' : 'pt-24'}`}
            >
                <AnimatePresence mode="wait">
                    <Routes
                        location={location}
                        key={animationKey}
                    >
                        {/* Public Entry Points */}
                        <Route
                            path="/"
                            element={
                                <PageTransition>
                                    <Home />
                                </PageTransition>
                            }
                        />
                        <Route
                            path="/login"
                            element={<Login />}
                        />
                        <Route
                            path="/signup"
                            element={<Signup />}
                        />
                        <Route
                            path="/auth/callback"
                            element={<AuthCallback />}
                        />
                        <Route
                            path="/mfa/setup"
                            element={<MfaSetup />}
                        />
                        <Route
                            path="/mfa/verify"
                            element={<MfaVerify />}
                        />

                        {/* Protected Technical Operator Node Ports */}
                        <Route
                            path="/resources"
                            element={
                                <PrivateRoute>
                                    <PageTransition>
                                        <Resources />
                                    </PageTransition>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/resources/:id"
                            element={
                                <PrivateRoute>
                                    <ResourceDetails />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/resources/create"
                            element={
                                <PrivateRoute>
                                    <PageTransition>
                                        <CreateResource />
                                    </PageTransition>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/resources/edit/:id"
                            element={
                                <PrivateRoute>
                                    <CreateResource />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/groups"
                            element={
                                <PrivateRoute>
                                    <PageTransition>
                                        <Groups />
                                    </PageTransition>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/groups/:id"
                            element={
                                <PrivateRoute>
                                    <GroupDetails />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/analytics"
                            element={
                                <PrivateRoute>
                                    <PageTransition>
                                        <Analytics />
                                    </PageTransition>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/categories"
                            element={
                                <PrivateRoute>
                                    <PageTransition>
                                        <Categories />
                                    </PageTransition>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/categories/:type"
                            element={
                                <PrivateRoute>
                                    <CategoryOverview />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/categories/:type/list"
                            element={
                                <PrivateRoute>
                                    <CategoryResources />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <PrivateRoute>
                                    <PageTransition>
                                        <Profile />
                                    </PageTransition>
                                </PrivateRoute>
                            }
                        />

                        {/* Fallback Redirect */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </AnimatePresence>
            </main>

            {/* Global Playful Footer */}
            {!isMapPage && <Footer />}
        </div>
    );
}

export default function App() {
    return (
        <Router>
            <AppLayout />
        </Router>
    );
}


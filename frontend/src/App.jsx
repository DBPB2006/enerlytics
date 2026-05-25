import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PageTransition from "./components/PageTransition";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AuthCallback from "./pages/AuthCallback";
import MfaSetup from "./pages/MfaSetup";
import MfaVerify from "./pages/MfaVerify";
import Resources from "./pages/Resources";
import ResourceDetails from "./pages/ResourceDetails";
import CreateResource from "./pages/CreateResource";
import Profile from "./pages/Profile";
import Groups from "./pages/Groups";
import GroupDetails from "./pages/GroupDetails";
import Analytics from "./pages/Analytics";
import Categories from "./pages/Categories";
import CategoryOverview from "./pages/CategoryOverview";
import CategoryResources from "./pages/CategoryResources";

// Private Route Wrapper Guard
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function SplashAnimation({ onComplete }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 4.0; // Play 4x faster (completes in ~1.6s)
    }
    const timer = setTimeout(() => {
      onComplete();
    }, 1650);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 2.0 } }}
      className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        onEnded={onComplete}
        className="absolute inset-0 w-full h-full object-cover opacity-80"
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
  const [authTrigger, setAuthTrigger] = useState(0);

  useEffect(() => {
    const handleAuthChange = () => setAuthTrigger(prev => prev + 1);
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return (
    <div className="min-h-screen eco-nexus-bg-fixed-layer relative flex flex-col selection:bg-[#dfed2b] selection:text-black">
      <AnimatePresence>
        {showSplash && (
          <SplashAnimation key="splash" onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>
      <div className="eco-nexus-scanline"></div>

      {/* Navbar Header (Now Floating) */}
      <Navbar key={`nav-${authTrigger}`} />

      {/* Core Main Terminal Frame */}
      {/* Add top padding for all pages EXCEPT the full-screen map page */}
      <main className={`flex-1 flex flex-col relative z-10 ${isMapPage ? '' : 'pt-24'}`}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={`${location.pathname}-${authTrigger}`}>
            {/* Public Entry Points */}
            <Route path="/" element={<PageTransition><Home /></PageTransition>} />
            <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><Signup /></PageTransition>} />
            <Route path="/auth/callback" element={<PageTransition><AuthCallback /></PageTransition>} />
            <Route path="/mfa/setup" element={<PageTransition><MfaSetup /></PageTransition>} />
            <Route path="/mfa/verify" element={<PageTransition><MfaVerify /></PageTransition>} />

            {/* Protected Technical Operator Node Ports */}
            <Route
              path="/resources"
              element={
                <PrivateRoute>
                  <PageTransition><Resources /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/resources/:id"
              element={
                <PrivateRoute>
                  <PageTransition><ResourceDetails /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/resources/create"
              element={
                <PrivateRoute>
                  <PageTransition><CreateResource /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/resources/edit/:id"
              element={
                <PrivateRoute>
                  <PageTransition><CreateResource /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <PageTransition><Groups /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/groups/:id"
              element={
                <PrivateRoute>
                  <PageTransition><GroupDetails /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <PrivateRoute>
                  <PageTransition><Analytics /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/categories"
              element={
                <PrivateRoute>
                  <PageTransition><Categories /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/categories/:type"
              element={
                <PrivateRoute>
                  <PageTransition><CategoryOverview /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/categories/:type/list"
              element={
                <PrivateRoute>
                  <PageTransition><CategoryResources /></PageTransition>
                </PrivateRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <PageTransition><Profile /></PageTransition>
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

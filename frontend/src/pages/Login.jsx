import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, Mail, ShieldAlert, Zap, Compass, Wind, Sun } from "lucide-react";
import api from "../utils/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const urlError = searchParams.get("error");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", { email, password });
      const data = response.data;

      if (data.mfa_setup_required) {
        navigate(`/mfa/setup?user_id=${data.user_id}`);
      } else if (data.mfa_required) {
        navigate(`/mfa/verify?user_id=${data.user_id}`);
      } else if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.dispatchEvent(new Event('auth-change'));
        navigate("/");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        "Authentication failed. Please verify credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSSO = () => {
    window.location.href = "http://localhost:8000/api/auth/google/redirect?mode=login";
  };

  const displayError = error || urlError;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-68px)] w-full flex flex-col lg:flex-row overflow-hidden select-none px-6 md:px-12 z-10 max-w-7xl mx-auto"
    >
      {/* 1. Left Illustrative Pane */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center relative pr-12">
        <div className="relative z-10 space-y-4">
          <div className="inline-block bg-[#dfed2b] text-black px-3 py-1 font-['Montserrat'] text-[10px] font-bold tracking-widest uppercase">
            AUTHENTICATION PROTOCOL
          </div>
          <h1 className="font-['Montserrat'] font-black text-6xl uppercase leading-none tracking-tighter">
            WELCOME BACK
          </h1>
          <p className="text-sm font-['Inter'] text-black/70 font-semibold max-w-sm leading-relaxed mt-4">
            Sign in to access your energy tracking dashboard, view community projects, and manage resources.
          </p>
        </div>

        <div className="mt-12 flex gap-4 font-['Montserrat']">
          <div className="eco-nexus-glass-card p-4 flex items-center gap-3">
            <Sun className="h-5 w-5 text-black" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Solar Power</span>
          </div>
          <div className="eco-nexus-glass-card p-4 flex items-center gap-3">
            <Wind className="h-5 w-5 text-black" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Wind Kinetic</span>
          </div>
        </div>

        <div className="absolute bottom-10 font-['Montserrat'] text-[10px] text-black/40 uppercase tracking-widest">
          // SECURE CONNECTION ESTABLISHED
        </div>
      </div>

      {/* 2. Right Interactive Form Pane */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="w-full max-w-md relative z-10">
          <div className="eco-nexus-glass-card p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
              SECURE PORTAL
            </div>
            
            <h2 className="font-['Montserrat'] text-4xl font-black uppercase mb-8 mt-2">Sign In</h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {displayError && (
                <div className="flex items-center gap-3 bg-black text-[#dfed2b] p-4 text-[10px] font-['Montserrat'] font-bold uppercase">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span>{displayError}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                  <input
                    type="email"
                    required
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/40 border border-black/10 px-4 py-4 pl-12 text-sm font-['Montserrat'] font-bold text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                  <input
                    type="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/40 border border-black/10 px-4 py-4 pl-12 text-sm font-['Montserrat'] font-bold text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest hover:bg-[#dfed2b] hover:text-black transition-colors flex items-center justify-center gap-2"
              >
                {loading ? "SIGNING IN..." : "SIGN IN"}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-black/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-['Montserrat'] font-bold uppercase tracking-widest">
                <span className="bg-[#E1EBED] px-4 text-black/40">OR SIGN IN WITH</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSSO}
              className="w-full bg-white/40 border border-black/10 text-black py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest hover:bg-white/60 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4 fill-current text-black" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.706 0 3.257.614 4.47 1.637l2.427-2.428C17.47 1.704 15.018 1 12.24 1c-5.523 0-10 4.477-10 10s4.477 10 10 10c5.786 0 9.61-4.068 9.61-9.782 0-.66-.06-1.296-.17-1.933H12.24z"/>
              </svg>
              Sign In with Google
            </button>

            <div className="mt-8 pt-6 border-t border-black/10 flex justify-between items-center">
              <p className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest">
                New User?{" "}
                <Link to="/signup" className="text-black font-black underline hover:text-[#dfed2b] hover:bg-black px-1 transition-colors">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

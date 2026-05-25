import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import api from "../utils/api";

export default function MfaVerify() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get("user_id");
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/mfa/verify", {
        user_id: userId,
        otp: code
      });
      if (response.data.token && response.data.user) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        window.dispatchEvent(new Event('auth-change'));
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Invalid authentication code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center py-16 px-6 md:px-12 z-10 max-w-7xl mx-auto"
    >
      <div className="w-full max-w-md relative z-10">
        <div className="eco-nexus-glass-card p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
            MFA VERIFICATION
          </div>

          <h2 className="font-['Montserrat'] text-4xl font-black uppercase mb-8 mt-2">Two-Factor Authentication</h2>

          <form onSubmit={handleVerify} className="space-y-6 mt-2">
            
            {error && (
              <div className="flex items-center gap-3 bg-black text-[#dfed2b] p-4 text-[10px] font-['Montserrat'] font-bold uppercase">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Glowing lock badge */}
            <div className="flex justify-center py-4">
              <div className="h-20 w-20 bg-black flex items-center justify-center text-[#dfed2b] shadow-2xl">
                <ShieldCheck className="h-10 w-10 animate-pulse" />
              </div>
            </div>

            <p className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest leading-relaxed text-center">
              Enter the 6-digit verification code from your authenticator app:
            </p>

            <div className="space-y-2">
              <label className="block text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold">
                Verification Code
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40" />
                <input
                  type="text"
                  required
                  placeholder="000 000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-white/40 border border-black/10 px-4 py-4 pl-12 text-center font-['Montserrat'] font-black text-lg tracking-widest text-black focus:outline-none focus:bg-white/60 transition-colors placeholder:text-black/30"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest hover:bg-[#dfed2b] hover:text-black transition-colors flex items-center justify-center gap-2"
            >
              {loading ? "VERIFYING..." : "Verify Code"}
            </button>
          </form>

          {/* Barcode strip */}
          <div className="h-8 w-full bg-black/5 flex items-center justify-center text-[10px] font-['Montserrat'] tracking-widest text-black/40 border border-black/10 select-none mt-8">
            ||||| SECURE MFA |||||
          </div>

        </div>
      </div>
    </motion.div>
  );
}

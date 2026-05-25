import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, AlertCircle, Copy, Check, Lock, QrCode } from "lucide-react";
import api from "../utils/api";

export default function MfaSetup() {
  const [searchParams] = useSearchParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userId = searchParams.get("user_id") || currentUser.id;
  const navigate = useNavigate();

  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError("Please sign in first to set up Multi-Factor Authentication.");
      setLoading(false);
      return;
    }

    const initMfa = async () => {
      try {
        const response = await api.post("/mfa/setup", { user_id: userId });
        setQrCode(response.data.qrCode);
        setSecret(response.data.secret);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to initialize 2FA pairing.");
      } finally {
        setLoading(false);
      }
    };

    initMfa();
  }, [userId]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitLoading(true);

    try {
      const response = await api.post("/mfa/enable", {
        user_id: userId,
        code: code
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
      setSubmitLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center z-10">
        <div className="flex flex-col items-center gap-4 text-center">
          <Loader2 className="h-10 w-10 text-black animate-spin" />
          <p className="font-['Montserrat'] text-xs text-black/60 uppercase tracking-widest font-bold animate-pulse">Configuring Multi-Factor Authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center py-16 px-6 md:px-12 z-10 max-w-7xl mx-auto"
    >
      <div className="w-full max-w-lg relative z-10">
        <div className="eco-nexus-glass-card p-8 md:p-12 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 bg-black text-white px-4 py-1 text-[10px] font-['Montserrat'] font-bold tracking-widest uppercase">
            MFA SETUP
          </div>

          <h2 className="font-['Montserrat'] text-4xl font-black uppercase mb-8 mt-2">Enable Multi-Factor Authentication</h2>

          <div className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 bg-black text-[#dfed2b] p-4 text-[10px] font-['Montserrat'] font-bold uppercase">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-[10px] font-['Montserrat'] text-black/60 font-bold uppercase tracking-widest leading-relaxed">
              Scan this QR code with your authenticator app (e.g. Google Authenticator or Authy):
            </p>

            {/* QR Code Container */}
            {qrCode && (
              <div className="flex justify-center bg-white/60 p-4 border border-black/10 w-fit mx-auto shadow-lg relative overflow-hidden">
                <div className="absolute top-1 left-1 opacity-20"><QrCode className="h-4 w-4 text-black" /></div>
                <div dangerouslySetInnerHTML={{ __html: qrCode }} />
              </div>
            )}

            {/* Secret key backup */}
            <div className="space-y-2">
              <label className="block text-[10px] font-['Montserrat'] uppercase tracking-widest text-black/60 font-bold">
                Secret Key (Manual Entry)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={secret}
                  className="flex-1 bg-white/40 border border-black/10 px-4 py-3 text-xs font-['Montserrat'] font-black text-black outline-none"
                />
                <button
                  onClick={copySecret}
                  className="bg-[#dfed2b] text-black px-6 hover:bg-black hover:text-white transition-colors cursor-pointer font-bold flex items-center justify-center border border-black/10"
                  title="Copy secret key"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Verification Form */}
            <form onSubmit={handleVerify} className="space-y-6 pt-6 border-t border-black/10">
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
                disabled={submitLoading}
                className="w-full bg-black text-white py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest hover:bg-[#dfed2b] hover:text-black transition-colors flex items-center justify-center gap-2"
              >
                {submitLoading ? "VERIFYING..." : "Enable MFA"}
              </button>
            </form>

            <div className="h-8 w-full bg-black/5 flex items-center justify-center text-[10px] font-['Montserrat'] tracking-widest text-black/40 border border-black/10 select-none mt-6">
              ||||| SECURE MFA |||||
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

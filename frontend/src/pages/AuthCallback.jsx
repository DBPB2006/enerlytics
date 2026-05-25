import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Cpu, Sun, Wind, CheckCircle2 } from "lucide-react";
import api from "../utils/api";
import GridContainer from "../components/GridContainer";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("VERIFYING AUTHORIZATION...");
  const [stage, setStage] = useState(1); // 1: resolving, 2: profiles, 3: completed

  useEffect(() => {
    const handleAuth = async () => {
      const token = searchParams.get("token");
      const mfaSetupRequired = searchParams.get("mfa_setup_required");
      const mfaRequired = searchParams.get("mfa_required");
      const userId = searchParams.get("user_id");

      if (mfaSetupRequired === "1" && userId) {
        navigate(`/mfa/setup?user_id=${userId}`);
        return;
      }

      if (mfaRequired === "1" && userId) {
        navigate(`/mfa/verify?user_id=${userId}`);
        return;
      }

      if (token) {
        localStorage.setItem("token", token);
        setStage(2);
        setStatus("RETRIEVING USER PROFILE...");
        try {
          // Fetch current authenticated user info
          const userResponse = await api.get("/user");
          localStorage.setItem("user", JSON.stringify(userResponse.data));
        window.dispatchEvent(new Event('auth-change'));
          setStage(3);
          setStatus("LOGIN SUCCESSFUL. REDIRECTING...");
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } catch (err) {
          localStorage.removeItem("token");
          navigate("/login?error=" + encodeURIComponent("Failed to fetch user profile."));
        }
      } else {
        const errorMsg = searchParams.get("error") || "Authentication callback parameters missing.";
        navigate(`/login?error=${encodeURIComponent(errorMsg)}`);
      }
    };

    handleAuth();
  }, [searchParams, navigate]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-[calc(100vh-68px)] w-full flex items-center justify-center overflow-hidden bg-[#FAF6F0]"
    >
      {/* Decorative Blobs */}
      <div className="eco-blob -top-20 -right-20 w-[450px] h-[450px] bg-[#E0F7F7]" />
      <div className="eco-blob top-1/2 -left-20 w-[400px] h-[400px] bg-[#F1FAD8]" />

      <div className="w-full max-w-md relative z-10 px-4">
        <GridContainer title="GOOGLE OAUTH" subtitle="CALLBACK HANDLER" code="OAUTH-SEC" type="dots">
          <div className="flex flex-col items-center justify-center py-10 text-center space-y-6">
            
            {/* Spinning clean energy loaders */}
            <div className="relative h-24 w-24 flex items-center justify-center bg-white border-[2.5px] border-[#122B1E] rounded-full shadow-[3px_3px_0px_0px_#122B1E]">
              
              {stage === 1 && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                  className="text-[#A2E3E3]"
                >
                  <Wind className="h-10 w-10 text-[#122B1E]" />
                </motion.div>
              )}

              {stage === 2 && (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-[#FFF066]"
                >
                  <Sun className="h-10 w-10 text-[#122B1E] fill-[#FFF066]" />
                </motion.div>
              )}

              {stage === 3 && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="text-[#C3EAA6]"
                >
                  <CheckCircle2 className="h-12 w-12 text-[#122B1E] fill-[#C3EAA6]" />
                </motion.div>
              )}
            </div>

            <div className="space-y-2.5">
              <p className="font-mono text-xs font-black text-[#122B1E] tracking-widest uppercase animate-pulse">
                {status}
              </p>
              
              {/* Progress Line */}
              <div className="w-32 bg-[#FAF6F0] border-[2px] border-[#122B1E] h-3.5 rounded-full overflow-hidden p-0.5 shadow-[1.5px_1.5px_0px_0px_#122B1E] mx-auto">
                <motion.div 
                  className="bg-[#C3EAA6] h-full rounded-full border border-[#122B1E]" 
                  initial={{ width: "20%" }}
                  animate={{ width: stage === 1 ? "40%" : stage === 2 ? "75%" : "100%" }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>

            <span className="text-[8px] font-mono text-[#6E8578] font-bold uppercase tracking-widest block">
              // Establishing secure session
            </span>

          </div>
        </GridContainer>
      </div>
    </motion.div>
  );
}

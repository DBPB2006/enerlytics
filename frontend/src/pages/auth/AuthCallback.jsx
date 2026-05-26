import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Sun, Wind, CheckCircle2 } from 'lucide-react';
import api from '../../utils/api';
import GridContainer from '../../components/GridContainer';
import { loginSuccess } from '../../redux/authSlice';

export default function AuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [status, setStatus] = useState('VERIFYING AUTHORIZATION...');
    const [stage, setStage] = useState(1); // 1: resolving, 2: profiles, 3: completed

    useEffect(() => {
        const handleAuth = async () => {
            const token = searchParams.get('token');
            const mfaSetupRequired = searchParams.get('mfa_setup_required');
            const mfaRequired = searchParams.get('mfa_required');
            const userId = searchParams.get('user_id');

            if (mfaSetupRequired === '1' && userId) {
                navigate(`/mfa/setup?user_id=${userId}`);
                return;
            }

            if (mfaRequired === '1' && userId) {
                navigate(`/mfa/verify?user_id=${userId}`);
                return;
            }

            if (token) {
                // Set temporary token in localStorage so the API client can use it to fetch the user profile
                localStorage.setItem('token', token);
                setStage(2);
                setStatus('RETRIEVING USER PROFILE...');
                try {
                    // Fetch current authenticated user info
                    const userResponse = await api.get('/user');
                    
                    // Dispatch loginSuccess which handles store state and persistent storage
                    dispatch(loginSuccess({ token, user: userResponse.data }));

                    setStage(3);
                    setStatus('LOGIN SUCCESSFUL. REDIRECTING...');
                    setTimeout(() => {
                        navigate('/');
                    }, 1500);
                } catch {
                    localStorage.removeItem('token');
                    navigate(
                        '/login?error=' +
                            encodeURIComponent('Failed to fetch user profile.'),
                    );
                }
            } else {
                const errorMsg =
                    searchParams.get('error') ||
                    'Authentication callback parameters missing.';
                navigate(`/login?error=${encodeURIComponent(errorMsg)}`);
            }
        };

        handleAuth();
    }, [searchParams, navigate, dispatch]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative flex min-h-[calc(100vh-68px)] w-full items-center justify-center overflow-hidden bg-[#FAF6F0]"
        >
            {/* Decorative Blobs */}
            <div className="eco-blob -right-20 -top-20 h-[450px] w-[450px] bg-[#E0F7F7]" />
            <div className="eco-blob -left-20 top-1/2 h-[400px] w-[400px] bg-[#F1FAD8]" />

            <div className="relative z-10 w-full max-w-md px-4">
                <GridContainer
                    title="GOOGLE OAUTH"
                    subtitle="CALLBACK HANDLER"
                    code="OAUTH-SEC"
                    type="dots"
                >
                    <div className="flex flex-col items-center justify-center space-y-6 py-10 text-center">
                        {/* Spinning clean energy loaders */}
                        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[2.5px] border-[#122B1E] bg-white shadow-[3px_3px_0px_0px_#122B1E]">
                            {stage === 1 && (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 2.5,
                                        ease: 'linear',
                                    }}
                                    className="text-[#A2E3E3]"
                                >
                                    <Wind className="h-10 w-10 text-[#122B1E]" />
                                </motion.div>
                            )}

                            {stage === 2 && (
                                <motion.div
                                    animate={{ scale: [1, 1.1, 1] }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                    }}
                                    className="text-[#FFF066]"
                                >
                                    <Sun className="h-10 w-10 fill-[#FFF066] text-[#122B1E]" />
                                </motion.div>
                            )}

                            {stage === 3 && (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1.1, opacity: 1 }}
                                    transition={{
                                        type: 'spring',
                                        stiffness: 200,
                                        damping: 15,
                                    }}
                                    className="text-[#C3EAA6]"
                                >
                                    <CheckCircle2 className="h-12 w-12 fill-[#C3EAA6] text-[#122B1E]" />
                                </motion.div>
                            )}
                        </div>

                        <div className="space-y-2.5">
                            <p className="animate-pulse font-mono text-xs font-black uppercase tracking-widest text-[#122B1E]">
                                {status}
                            </p>

                            {/* Progress Line */}
                            <div className="mx-auto h-3.5 w-32 overflow-hidden rounded-full border-[2px] border-[#122B1E] bg-[#FAF6F0] p-0.5 shadow-[1.5px_1.5px_0px_0px_#122B1E]">
                                <motion.div
                                    className="h-full rounded-full border border-[#122B1E] bg-[#C3EAA6]"
                                    initial={{ width: '20%' }}
                                    animate={{
                                        width:
                                            stage === 1
                                                ? '40%'
                                                : stage === 2
                                                  ? '75%'
                                                  : '100%',
                                    }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                        </div>

                        <span className="block font-mono text-[8px] font-bold uppercase tracking-widest text-[#6E8578]">
                            // Establishing secure session
                        </span>
                    </div>
                </GridContainer>
            </div>
        </motion.div>
    );
}

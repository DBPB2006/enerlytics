import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';
import { loginSuccess } from '../../redux/authSlice';

export default function MfaVerify() {
    const [searchParams] = useSearchParams();
    const userId = searchParams.get('user_id');
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/mfa/verify', {
                user_id: userId,
                otp: code,
            });
            if (response.data.token && response.data.user) {
                dispatch(loginSuccess({ token: response.data.token, user: response.data.user }));
                navigate('/');
            }
        } catch (err) {
            setError(
                err.response?.data?.message || 'Invalid authentication code.',
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-7xl items-center justify-center px-6 py-16 md:px-12"
        >
            <div className="relative z-10 w-full max-w-md">
                <div className="eco-nexus-glass-card relative overflow-hidden p-8 shadow-2xl md:p-12">
                    <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                        MFA VERIFICATION
                    </div>

                    <h2 className="mb-8 mt-2 font-['Montserrat'] text-4xl font-black uppercase">
                        Two-Factor Authentication
                    </h2>

                    <form onSubmit={handleVerify} className="mt-2 space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 bg-black p-4 font-['Montserrat'] text-[10px] font-bold uppercase text-[#dfed2b]">
                                <ShieldAlert className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Glowing lock badge */}
                        <div className="flex justify-center py-4">
                            <div className="flex h-20 w-20 items-center justify-center bg-black text-[#dfed2b] shadow-2xl">
                                <ShieldCheck className="h-10 w-10 animate-pulse" />
                            </div>
                        </div>

                        <p className="text-center font-['Montserrat'] text-[10px] font-bold uppercase leading-relaxed tracking-widest text-black/60">
                            Enter the 6-digit verification code from your
                            authenticator app:
                        </p>

                        <div className="space-y-2">
                            <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                Verification Code
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-black/40" />
                                <input
                                    type="text"
                                    required
                                    placeholder="000 000"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full border border-black/10 bg-white/40 px-4 py-4 pl-12 text-center font-['Montserrat'] text-lg font-black tracking-widest text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 bg-black py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#dfed2b] hover:text-black"
                        >
                            {loading ? 'VERIFYING...' : 'Verify Code'}
                        </button>
                    </form>

                    {/* Barcode strip */}
                    <div className="mt-8 flex h-8 w-full select-none items-center justify-center border border-black/10 bg-black/5 font-['Montserrat'] text-[10px] tracking-widest text-black/40">
                        ||||| SECURE MFA |||||
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

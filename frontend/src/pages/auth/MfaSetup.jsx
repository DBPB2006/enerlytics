import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Copy, Check, Lock, QrCode } from 'lucide-react';
import api from '../../utils/api';
import { loginSuccess } from '../../redux/authSlice';

export default function MfaSetup() {
    const [searchParams] = useSearchParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user: currentUser } = useSelector((state) => state.auth);
    const userId = searchParams.get('user_id') || currentUser?.id;

    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [code, setCode] = useState('');

    const [loading, setLoading] = useState(userId ? true : false);
    const [error, setError] = useState(
        userId
            ? ''
            : 'Please sign in first to set up Multi-Factor Authentication.',
    );
    const [submitLoading, setSubmitLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!userId) return;

        const initMfa = async () => {
            try {
                const response = await api.post('/mfa/setup', {
                    user_id: userId,
                });
                setQrCode(response.data.qrCode);
                setSecret(response.data.secret);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                        'Failed to initialize 2FA pairing.',
                );
            } finally {
                setLoading(false);
            }
        };

        initMfa();
    }, [userId]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        const cleanedCode = code.replace(/\s+/g, '');
        if (!cleanedCode || cleanedCode.length !== 6 || isNaN(cleanedCode)) {
            setError('Please enter a valid 6-digit verification code.');
            return;
        }

        setSubmitLoading(true);

        try {
            const response = await api.post('/mfa/enable', {
                user_id: userId,
                code: cleanedCode,
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
            <div className="relative z-10 flex min-h-[calc(100vh-68px)] w-full items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-black" />
                    <p className="animate-pulse font-['Montserrat'] text-xs font-bold uppercase tracking-widest text-black/60">
                        Configuring Multi-Factor Authentication...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 mx-auto flex min-h-[calc(100vh-68px)] w-full max-w-7xl items-center justify-center px-6 py-16 md:px-12"
        >
            <div className="relative z-10 w-full max-w-lg">
                <div className="eco-nexus-glass-card relative overflow-hidden p-8 shadow-2xl md:p-12">
                    <div className="absolute right-0 top-0 bg-black px-4 py-1 font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-white">
                        MFA SETUP
                    </div>

                    <h2 className="mb-8 mt-2 font-['Montserrat'] text-4xl font-black uppercase">
                        Enable Multi-Factor Authentication
                    </h2>

                    <div className="space-y-6">
                        {error && (
                            <div className="flex items-center gap-3 bg-black p-4 font-['Montserrat'] text-[10px] font-bold uppercase text-[#d4e157]">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <p className="font-['Montserrat'] text-[10px] font-bold uppercase leading-relaxed tracking-widest text-black/60">
                            Scan this QR code with your authenticator app (e.g.
                            Google Authenticator or Authy):
                        </p>

                        {/* QR Code Container */}
                        {qrCode && (
                            <div className="relative mx-auto flex w-fit justify-center overflow-hidden border border-black/10 bg-white/60 p-4 shadow-lg">
                                <div className="absolute left-1 top-1 opacity-20">
                                    <QrCode className="h-4 w-4 text-black" />
                                </div>
                                <div
                                    dangerouslySetInnerHTML={{ __html: qrCode }}
                                />
                            </div>
                        )}

                        {/* Secret key backup */}
                        <div className="space-y-2">
                            <label className="block font-['Montserrat'] text-[10px] font-bold uppercase tracking-widest text-black/60">
                                Secret Key (Manual Entry)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={secret}
                                    className="flex-1 border border-black/10 bg-white/40 px-4 py-3 font-['Montserrat'] text-xs font-black text-black outline-none"
                                />
                                <button
                                    onClick={copySecret}
                                    className="flex cursor-pointer items-center justify-center border border-black/10 bg-[#d4e157] px-6 font-bold text-black transition-colors hover:bg-black hover:text-white"
                                    title="Copy secret key"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Verification Form */}
                        <form
                            onSubmit={handleVerify}
                            className="space-y-6 border-t border-black/10 pt-6"
                        >
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
                                        onChange={(e) =>
                                            setCode(e.target.value)
                                        }
                                        className="w-full border border-black/10 bg-white/40 px-4 py-4 pl-12 text-center font-['Montserrat'] text-lg font-black tracking-widest text-black transition-colors placeholder:text-black/30 focus:bg-white/60 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitLoading}
                                className="flex w-full items-center justify-center gap-2 bg-black py-4 font-['Montserrat'] text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#d4e157] hover:text-black"
                            >
                                {submitLoading ? 'VERIFYING...' : 'Enable MFA'}
                            </button>
                        </form>

                        <div className="mt-6 flex h-8 w-full select-none items-center justify-center border border-black/10 bg-black/5 font-['Montserrat'] text-[10px] tracking-widest text-black/40">
                            ||||| SECURE MFA |||||
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

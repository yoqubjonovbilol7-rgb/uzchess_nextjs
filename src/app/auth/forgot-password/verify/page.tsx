'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

import AuthCard from '@/features/auth/components/AuthCard';
import OtpBoxes, { OTP_LEN } from '@/features/auth/components/OtpBoxes';
import SpinnerIcon from '@/features/auth/components/SpinnerIcon';

const BASE = 'http://localhost:3001';
const RESEND_SEC = 120;

function ForgotVerifyContent() {
    const router = useRouter();
    const params = useSearchParams();
    const phone  = params.get('phone') ?? '';

    const [digits, setDigits]       = useState<string[]>(Array(OTP_LEN).fill(''));
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const [success, setSuccess]     = useState(false);
    const [timer, setTimer]         = useState(RESEND_SEC);
    const [resending, setResending] = useState(false);
    const [resendInfo, setResendInfo] = useState('');

    const otp    = digits.join('');
    const filled = otp.length === OTP_LEN;

    const isEmail  = phone.includes('@');
    const loginType = isEmail ? 'email' : 'number';
    const display  = isEmail ? phone : phone.replace(/(\+\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(timer % 60).padStart(2, '0');

    useEffect(() => {
        if (timer <= 0) return;
        const id = setTimeout(() => setTimer(t => t - 1), 1000);
        return () => clearTimeout(id);
    }, [timer]);

    const submit = useCallback(async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!filled || loading) return;
        setLoading(true); setError('');
        try {
            await axios.post(`${BASE}/auth/verify-otp`, { login: phone, code: otp });
            setSuccess(true);
            setTimeout(() => router.push(
                `/auth/forgot-password/reset?phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(otp)}`
            ), 700);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message ?? err.response?.data?.error;
                setError(msg ?? "Kod noto'g'ri.");
            } else { setError('Xatolik yuz berdi.'); }
            setDigits(Array(OTP_LEN).fill(''));
        } finally { setLoading(false); }
    }, [filled, loading, otp, phone, router]);

    useEffect(() => {
        if (filled && !loading && !error && !success) submit();
    }, [filled, loading, error, success, submit]);

    async function resend() {
        if (resending) return;
        setResending(true); setError(''); setResendInfo('');
        try {
            await axios.post(`${BASE}/auth/resend-otp`, { login: phone, loginType });
        } catch {
        } finally {
            setDigits(Array(OTP_LEN).fill(''));
            setTimer(RESEND_SEC);
            setResendInfo('Yangi kod yuborildi!');
            setResending(false);
        }
    }

    return (
        <AuthCard>
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 mb-4 text-[#6B7280] hover:text-white transition-colors"
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Parolni qayta tiklash</span>
            </button>

            <p className="text-sm mb-3 leading-snug text-[#9CA3AF]">
                Tasdiqlash uchun maxsus kod quyidagi{' '}
                {isEmail ? 'elektron pochtaga' : 'raqamga'} yuborildi
            </p>

            <div className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 mb-4 bg-[#0D1117] border border-[#1F2937]">
                {isEmail
                    ? <svg className="w-4 h-4 flex-shrink-0 text-[#2EA6FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    : <svg className="w-4 h-4 flex-shrink-0 text-[#2EA6FF]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                }
                <span className="text-sm font-medium text-white">{display}</span>
            </div>

            <p className="text-xs mb-2.5 text-[#9CA3AF]">Maxsus kodni kiriting:</p>

            <form onSubmit={submit}>
                <OtpBoxes
                    digits={digits}
                    onChange={setDigits}
                    onError={() => setError('')}
                    disabled={loading || success}
                    state={success ? 'success' : error ? 'error' : 'idle'}
                />

                {error && <p className="text-xs mt-2 text-red-500">{error}</p>}
                {resendInfo && !error && <p className="text-xs mt-2 text-green-400">{resendInfo}</p>}

                <div className="my-4">
                    {timer > 0 ? (
                        <span className="text-sm text-[#6B7280]">{mm}:{ss} da qayta yuborish mumkin</span>
                    ) : (
                        <button
                            type="button"
                            onClick={resend}
                            disabled={resending}
                            className="inline-flex items-center gap-1.5 text-sm text-[#2EA6FF] hover:text-white disabled:opacity-50 transition-colors"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {resending ? 'Yuborilmoqda...' : 'Qayta yuborish'}
                        </button>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!filled || loading || success}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                        !filled || loading || success ? 'bg-[#1F2937] text-[#4B5563]' : 'bg-[#2EA6FF] text-white'
                    }`}
                >
                    {loading ? <><SpinnerIcon />Tekshirilmoqda...</> : success ? 'Tasdiqlandi ✓' : 'Tasdiqlash'}
                </button>
            </form>
        </AuthCard>
    );
}

export default function ForgotVerifyPage() {
    return (
        <Suspense fallback={null}>
            <ForgotVerifyContent />
        </Suspense>
    );
}
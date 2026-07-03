'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

import AuthCard from '@/features/auth/components/AuthCard';
import PasswordField from '@/features/auth/components/PasswordField';
import SpinnerIcon from '@/features/auth/components/SpinnerIcon';

const BASE = 'http://localhost:3001';

function ResetForm() {
    const router = useRouter();
    const params = useSearchParams();
    const phone  = params.get('phone') ?? '';
    const code   = params.get('code')  ?? '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [done, setDone]         = useState(false);

    const passwordsMatch = password.length >= 6 && confirm.length >= 6 && password === confirm;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password.length < 6) { setError("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
        if (password !== confirm)  { setError('Parollar mos kelmaydi'); return; }
        setLoading(true); setError('');
        try {
            const body = { login: phone, code, password };
            let res;
            try {
                res = await axios.post(`${BASE}/auth/reset-password`, body);
            } catch (firstErr) {
                if (axios.isAxiosError(firstErr) && (firstErr.response?.status === 404 || firstErr.response?.status === 405)) {
                    res = await axios.post(`${BASE}/auth/set-password`, body);
                } else {
                    throw firstErr;
                }
            }
            const token = res.data?.accessToken ?? res.data?.access_token ?? res.data?.token ?? res.data?.data?.token;
            if (token) {
                localStorage.setItem('token', token);
                window.dispatchEvent(new Event('auth-change'));
            }
            setDone(true);
            setTimeout(() => router.push('/'), 1200);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const raw = err.response?.data?.message ?? err.response?.data?.error ?? err.response?.data;
                const msg = Array.isArray(raw) ? raw[0] : (typeof raw === 'string' ? raw : 'Xatolik yuz berdi');
                setError(msg);
            } else {
                setError('Xatolik yuz berdi');
            }
        } finally { setLoading(false); }
    }

    if (done) {
        return (
            <AuthCard>
                <div className="flex flex-col items-center gap-3 py-4">
                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-white font-semibold">Parol muvaffaqiyatli yangilandi!</p>
                    <p className="text-[#6B7280] text-sm">Bosh sahifaga yo&apos;naltirilmoqda...</p>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard>
            <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 mb-5 text-[#6B7280] hover:text-white transition-colors"
            >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Parolni qayta tiklash</span>
            </button>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <PasswordField
                    label="Yangi parol"
                    value={password}
                    onChange={v => { setError(''); setPassword(v); }}
                    placeholder="Kamida 6 ta belgi"
                    error={!!error}
                    autoFocus
                />

                <PasswordField
                    label="Parolni tasdiqlang"
                    value={confirm}
                    onChange={v => { setError(''); setConfirm(v); }}
                    placeholder="Parolni qayta kiriting"
                    matchState={confirm.length > 0 ? (password === confirm ? 'match' : 'mismatch') : 'none'}
                />

                {error && (
                    <p className="text-xs text-red-500 -mt-1">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={!passwordsMatch || loading}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1 transition-colors ${
                        !passwordsMatch || loading
                            ? 'bg-[#1F2937] text-[#4B5563] cursor-not-allowed'
                            : 'bg-[#2EA6FF] hover:bg-[#1E96F0] text-white cursor-pointer'
                    }`}
                >
                    {loading ? <><SpinnerIcon />Saqlanmoqda...</> : 'Tasdiqlash'}
                </button>

                {password.length > 0 && password.length < 6 && (
                    <p className="text-xs text-[#6B7280] -mt-1 text-center">
                        Parol kamida 6 ta belgi bo&apos;lishi kerak ({password.length}/6)
                    </p>
                )}
            </form>
        </AuthCard>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<AuthCard><p className="text-[#6B7280] text-sm text-center py-4">Yuklanmoqda...</p></AuthCard>}>
            <ResetForm />
        </Suspense>
    );
}
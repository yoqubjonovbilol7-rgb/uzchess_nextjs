'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

import AuthCard from '@/features/auth/components/AuthCard';
import PasswordField from '@/features/auth/components/PasswordField';
import SpinnerIcon from '@/features/auth/components/SpinnerIcon';

const BASE = 'http://localhost:3001';

function SetPasswordContent() {
    const router = useRouter();
    const params = useSearchParams();
    const phone  = params.get('phone') ?? '';
    const code   = params.get('code')  ?? '';

    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const isMatch = password && confirm && password === confirm;
    const isValid = password.length >= 6 && Boolean(isMatch);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (password !== confirm) { setError('Parollar mos kelmayapti'); return; }
        if (password.length < 6) { setError("Parol kamida 6 ta belgi bo'lishi kerak"); return; }
        setLoading(true); setError('');
        try {
            const res = await axios.post(`${BASE}/auth/set-password`, { login: phone, password });
            const token = res.data?.accessToken ?? res.data?.access_token ?? res.data?.token ?? res.data?.data?.token;
            if (token) {
                localStorage.setItem('token', token);
                const pending = localStorage.getItem('user_pending');
                if (pending) { localStorage.setItem('user', pending); localStorage.removeItem('user_pending'); }
                else { localStorage.setItem('user', JSON.stringify({ login: phone })); }
                window.dispatchEvent(new Event('auth-change'));
            }
            router.push('/');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message ?? err.response?.data?.error;
                setError(msg ?? 'Xatolik yuz berdi');
            } else { setError('Xatolik yuz berdi'); }
        } finally { setLoading(false); }
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
                <span className="text-sm font-medium">Parol qo&apos;yish</span>
            </button>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <PasswordField
                    label="Parol"
                    value={password}
                    onChange={v => { setError(''); setPassword(v); }}
                    placeholder="Parolni kiriting"
                    error={!!error}
                    autoFocus
                />

                <PasswordField
                    label="Parolni tasdiqlang"
                    value={confirm}
                    onChange={v => { setError(''); setConfirm(v); }}
                    placeholder="Parolni tasdiqlang"
                    matchState={confirm ? (isMatch ? 'match' : 'mismatch') : 'none'}
                />

                {error && <p className="text-xs -mt-1 text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={!isValid || loading}
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1 transition-colors ${
                        !isValid || loading ? 'bg-[#1F2937] text-[#4B5563]' : 'bg-[#2EA6FF] text-white'
                    }`}
                >
                    {loading ? <><SpinnerIcon />Saqlanmoqda...</> : 'Tasdiqlash'}
                </button>
            </form>
        </AuthCard>
    );
}

export default function SetPasswordPage() {
    return (
        <Suspense fallback={null}>
            <SetPasswordContent />
        </Suspense>
    );
}
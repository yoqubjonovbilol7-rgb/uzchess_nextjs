'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import AuthCard from '@/features/auth/components/AuthCard';
import AuthTabs from '@/features/auth/components/AuthTabs';
import PhoneField from '@/features/auth/components/PhoneField';
import SpinnerIcon from '@/features/auth/components/SpinnerIcon';

const BASE = 'http://localhost:3001';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [tab, setTab]     = useState<'phone' | 'email'>('phone');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');

    const rawDigits = phone.replace(/\D/g, '');
    const fullPhone = '+998' + rawDigits;
    const loginVal  = tab === 'phone' ? fullPhone : email.trim();
    const canSubmit = tab === 'phone' ? rawDigits.length >= 9 : email.trim().length > 0;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit) return;
        setLoading(true); setError('');
        try {
            await axios.post(`${BASE}/auth/resend-otp`, { login: loginVal, loginType: tab === 'phone' ? 'number' : 'email' });
            router.push(`/auth/forgot-password/verify?phone=${encodeURIComponent(loginVal)}`);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message ?? err.response?.data?.error;
                setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Xatolik yuz berdi'));
            } else { setError('Xatolik yuz berdi'); }
        } finally { setLoading(false); }
    }

    return (
        <AuthCard onClose={() => router.push('/auth/sign-in')}>
            <h1 className="text-white font-bold text-lg mb-4">Parolni tiklash</h1>

            <AuthTabs value={tab} onChange={t => { setTab(t); setError(''); }} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                {tab === 'phone' ? (
                    <PhoneField
                        value={phone}
                        onChange={v => { setError(''); setPhone(v); }}
                        error={!!error}
                        autoFocus
                    />
                ) : (
                    <div>
                        <label className="block text-xs mb-1.5 text-[#9CA3AF]">Elektron pochta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => { setError(''); setEmail(e.target.value); }}
                            placeholder="example@gmail.com"
                            autoFocus
                            className={`w-full text-sm px-3 py-2.5 rounded-xl outline-none placeholder:text-[#4B5563] bg-[#0D1117] text-white border transition-colors ${error ? 'border-red-500' : 'border-[#1F2937] focus:border-[#2EA6FF]'}`}
                        />
                    </div>
                )}

                {error && <p className="text-xs -mt-1 text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={!canSubmit || loading}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1 bg-[#2EA6FF] text-white disabled:opacity-60 transition-opacity"
                >
                    {loading ? <><SpinnerIcon />Yuklanmoqda...</> : 'Davom etish'}
                </button>
            </form>
        </AuthCard>
    );
}
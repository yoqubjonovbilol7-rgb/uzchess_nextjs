'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import AuthCard from '@/features/auth/components/AuthCard';
import AuthTabs from '@/features/auth/components/AuthTabs';
import PhoneField from '@/features/auth/components/PhoneField';
import PasswordField from '@/features/auth/components/PasswordField';
import SpinnerIcon from '@/features/auth/components/SpinnerIcon';

const BASE = 'http://localhost:3001';

export default function SignInPage() {
    const router = useRouter();

    const [tab, setTab]           = useState<'phone' | 'email'>('phone');
    const [phone, setPhone]       = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    const rawDigits = phone.replace(/\D/g, '');
    const loginVal  = tab === 'phone' ? ('+998' + rawDigits) : email.trim();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (tab === 'phone' && rawDigits.length < 9) { setError("Telefon raqamini to'liq kiriting"); return; }
        if (tab === 'email' && !email.trim()) { setError('Elektron pochtani kiriting'); return; }
        if (!password) { setError('Parolni kiriting'); return; }
        setLoading(true); setError('');
        try {
            const res = await axios.post(`${BASE}/auth/sign-in`, { login: loginVal, password });
            const token = res.data?.accessToken ?? res.data?.access_token ?? res.data?.token ?? res.data?.data?.token;
            if (token) {
                localStorage.setItem('token', token);
                window.dispatchEvent(new Event('auth-change'));
                router.push('/');
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const msg = err.response?.data?.message ?? err.response?.data?.error ?? '';
                if (status === 401) setError("Login yoki parol noto'g'ri");
                else setError(Array.isArray(msg) ? msg[0] : (msg || 'Xatolik yuz berdi'));
            } else { setError('Xatolik yuz berdi'); }
        } finally { setLoading(false); }
    }

    return (
        <AuthCard>
            <h1 className="text-white font-bold text-lg mb-4">Tizimga kirish</h1>

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

                <div>
                    <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs text-[#9CA3AF]">Parol</label>
                        <Link href="/auth/forgot-password" className="text-xs text-[#2EA6FF]">
                            Parolni unutdingizmi?
                        </Link>
                    </div>
                    <PasswordField
                        label=""
                        value={password}
                        onChange={v => { setError(''); setPassword(v); }}
                        error={!!error}
                    />
                </div>

                {error && <p className="text-xs -mt-1 text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 mt-1 bg-[#2EA6FF] text-white disabled:opacity-70 transition-opacity"
                >
                    {loading ? <><SpinnerIcon />Yuklanmoqda...</> : 'Kirish'}
                </button>
            </form>

            <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-[#1F2937]" />
                <span className="text-xs text-[#4B5563]">yoki</span>
                <div className="flex-1 h-px bg-[#1F2937]" />
            </div>

            <div className="text-center">
                <Link href="/auth/sign-up" className="text-sm text-[#6B7280] hover:text-white transition-colors">
                    Ro&apos;yxatdan o&apos;tish
                </Link>
            </div>
        </AuthCard>
    );
}
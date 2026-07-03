'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

import AuthCard from '@/features/auth/components/AuthCard';
import AuthTabs from '@/features/auth/components/AuthTabs';
import PhoneField from '@/features/auth/components/PhoneField';
import SpinnerIcon from '@/features/auth/components/SpinnerIcon';

const BASE = 'http://localhost:3001';

export default function SignUpPage() {
    const router = useRouter();
    const [tab, setTab]     = useState<'phone' | 'email'>('phone');
    const [name, setName]   = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const [alreadyExists, setAlreadyExists] = useState(false);

    const rawDigits = phone.replace(/\D/g, '');
    const login = tab === 'phone' ? ('+998' + rawDigits) : email.trim();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        if (!name.trim()) { setError('Ismingizni kiriting'); return; }
        if (tab === 'phone' && rawDigits.length < 9) { setError("Telefon raqamini to'liq kiriting"); return; }
        if (tab === 'email' && !email.trim()) { setError('Elektron pochtani kiriting'); return; }
        setLoading(true);
        try {
            await axios.post(`${BASE}/auth/sign-up`, { login, loginType: tab === 'phone' ? 'number' : 'email', fullName: name.trim() });
            localStorage.setItem('user_pending', JSON.stringify({ fullName: name.trim(), login }));
            router.push(`/auth/sign-up/complete?phone=${encodeURIComponent(login)}`);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message ?? err.response?.data?.error;
                if (err.response?.status === 409) { setAlreadyExists(true); setError("Bu ma'lumot allaqachon ro'yxatdan o'tgan"); }
                else setError(Array.isArray(msg) ? msg[0] : (msg ?? 'Xatolik yuz berdi'));
            } else { setError('Xatolik yuz berdi'); }
        } finally { setLoading(false); }
    }

    return (
        <AuthCard>
            <h1 className="text-white font-bold text-lg mb-4">Ro&apos;yxatdan o&apos;tish</h1>

            <AuthTabs value={tab} onChange={t => { setTab(t); setError(''); setAlreadyExists(false); }} />

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div>
                    <label className="block text-xs mb-1.5 text-[#9CA3AF]">Ism-sharifingiz</label>
                    <input
                        type="text"
                        value={name}
                        onChange={e => { setError(''); setName(e.target.value); }}
                        placeholder="Ism-sharifingizni kiriting"
                        autoFocus
                        className="w-full text-sm px-3 py-2.5 rounded-xl outline-none placeholder:text-[#4B5563] bg-[#0D1117] text-white border border-[#1F2937] focus:border-[#2EA6FF] transition-colors"
                    />
                </div>

                {tab === 'phone' ? (
                    <PhoneField
                        value={phone}
                        onChange={v => { setError(''); setPhone(v); }}
                        error={!!error}
                    />
                ) : (
                    <div>
                        <label className="block text-xs mb-1.5 text-[#9CA3AF]">Elektron pochta</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => { setError(''); setEmail(e.target.value); }}
                            placeholder="example@gmail.com"
                            className={`w-full text-sm px-3 py-2.5 rounded-xl outline-none placeholder:text-[#4B5563] bg-[#0D1117] text-white border transition-colors ${error ? 'border-red-500' : 'border-[#1F2937] focus:border-[#2EA6FF]'}`}
                        />
                    </div>
                )}

                {error && (
                    <div className="-mt-1">
                        <p className="text-xs text-red-500">{error}</p>
                        {alreadyExists && (
                            <Link href="/auth/sign-in" className="text-xs text-[#2EA6FF] hover:underline mt-0.5 inline-block">
                                Tizimga kirish →
                            </Link>
                        )}
                    </div>
                )}

                <p className="text-xs leading-relaxed text-[#6B7280]">
                    Ro&apos;yxatdan o&apos;tish tugmasini bosqach foydalanish{' '}
                    <Link href="#" className="underline text-[#9CA3AF]">shartlari</Link>
                    {' '}va{' '}
                    <Link href="#" className="underline text-[#9CA3AF]">qoidalarini</Link>
                    {' '}qabul qilasiman
                </p>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 bg-[#2EA6FF] text-white disabled:opacity-70 transition-opacity"
                >
                    {loading ? <><SpinnerIcon />Yuklanmoqda...</> : "Ro'yxatdan o'tish"}
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-[#1F2937]" />
                    <span className="text-xs text-[#4B5563]">yoki</span>
                    <div className="flex-1 h-px bg-[#1F2937]" />
                </div>

                <Link
                    href="/auth/sign-in"
                    className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center bg-[#1F2937] text-[#9CA3AF] hover:bg-[#2A3341] transition-colors"
                >
                    Kirish
                </Link>
            </form>
        </AuthCard>
    );
}
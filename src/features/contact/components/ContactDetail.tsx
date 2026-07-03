'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

function fmtPhone(v: string) {
    const d = v.replace(/\D/g, '').slice(0, 9);
    return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

export default function ContactDetail() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!agreed) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 800));
        setLoading(false);
        setSuccess(true);
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-7xl mx-auto px-6 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_265px] gap-8 mb-8">
                    <div className="bg-[#0D1117] border border-[#1A2030] rounded-2xl p-8">
                        <h2 className="text-xl font-semibold mb-6">Bog&apos;lanish</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Ismingiz</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Ismingizni kiriting"
                                    className="w-full bg-[#0D0D0D] border border-[#1F2937] text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#2196F3] transition-colors placeholder:text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Telefon raqamingiz</label>
                                <div className="flex items-stretch rounded-xl overflow-hidden bg-[#0D0D0D] border border-[#1F2937] focus-within:border-[#2196F3] transition-colors">
                                    <span className="flex items-center px-3 text-sm border-r border-[#1F2937] text-gray-500 select-none">+998</span>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(fmtPhone(e.target.value))}
                                        placeholder="__ ___ __ __"
                                        className="flex-1 bg-transparent text-sm px-3 py-3 outline-none placeholder:text-gray-600 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Xabar</label>
                                <textarea
                                    value={message}
                                    onChange={e => setMessage(e.target.value)}
                                    placeholder="Xabaringizni yozing..."
                                    rows={5}
                                    className="w-full bg-[#0D0D0D] border border-[#1F2937] text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-[#2196F3] transition-colors placeholder:text-gray-600 resize-none"
                                />
                            </div>

                            <label className="flex items-start gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={agreed}
                                    onChange={e => setAgreed(e.target.checked)}
                                    className="mt-0.5 w-4 h-4 accent-[#2196F3]"
                                />
                                <span className="text-sm text-gray-400">
                                    Foydalanuvchi{' '}
                                    <span className="text-[#2196F3] cursor-pointer">shartnoma</span>
                                    {' '}va{' '}
                                    <span className="text-[#2196F3] cursor-pointer">qoidalarga</span>
                                    {' '}qabul qilaman
                                </span>
                            </label>

                            <button
                                type="submit"
                                disabled={!agreed || loading}
                                className="w-full py-3 rounded-xl font-semibold text-sm bg-[#2196F3] text-white hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? 'Yuborilmoqda...' : 'Yuborish'}
                            </button>
                        </form>
                    </div>

                    <div className="bg-[#0D1117] border border-[#1A2030] rounded-2xl p-8 flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#1A2030] flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-[#2196F3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Ish vaqti</p>
                                <p className="text-white font-medium">Dushanba - Juma 9:00-18:00</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#1A2030] flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-[#2196F3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">E-mail</p>
                                <p className="text-white font-medium">info@chessnation.uz</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#1A2030] flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-[#2196F3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Telefon</p>
                                <p className="text-white font-medium">+998 (71) 203 51 11</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#1A2030] flex items-center justify-center shrink-0">
                                <svg className="w-5 h-5 text-[#2196F3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Manzil</p>
                                <p className="text-white font-medium">Mingko&apos;rik</p>
                            </div>
                        </div>
                    </div>

                    {/* O'ng sidebar */}
                    <div className="flex flex-col gap-4">
                        <div className="w-full rounded-2xl overflow-hidden">
                            <Image
                                src="/Banners.png"
                                alt="Yoshlar portali"
                                width={265}
                                height={156}
                                className="w-full h-auto block"
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </div>
                        <div className="w-full rounded-2xl overflow-hidden">
                            <Image
                                src="/Lenta.png"
                                alt="Lenta"
                                width={265}
                                height={365}
                                className="w-full h-auto block"
                                style={{ width: '100%', height: 'auto' }}
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden border border-[#1A2030]" style={{ height: '400px' }}>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2996.0!2d69.2401!3d41.2995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDE3JzU4LjIiTiA2OcKwMTQnMjQuNCJF!5e0!3m2!1suz!2suz!4v1620000000000!5m2!1suz!2suz"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                </div>
            </div>

            {success && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm bg-[#1C1C1C] border border-[#2A2A2A] rounded-2xl p-8 mx-4 flex flex-col items-center text-center gap-4">
                        <button
                            onClick={() => setSuccess(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold">Muvaffaqiyatli yuborildi</h3>
                        <p className="text-gray-400 text-sm">Xabaringiz muvaffaqiyatli yuborildi</p>
                        <button
                            onClick={() => router.push('/courses')}
                            className="w-full py-3 rounded-xl font-semibold text-sm bg-[#2196F3] text-white hover:bg-[#1976D2] transition-colors mt-2"
                        >
                            Kursni ko&apos;rish
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
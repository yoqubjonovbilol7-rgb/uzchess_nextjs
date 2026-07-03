'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import SouvenirCard, { type Souvenir } from '@/features/souvenir/components/SouvenirCard';

const BASE = 'http://localhost:3001';

export default function SouvenirsPage() {
    const [souvenirs, setSouvenirs] = useState<Souvenir[]>([]);
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(8);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${BASE}/public/souvenir`).then(r => r.json()),
            fetch(`${BASE}/public/souvenir-images`).then(r => r.json()),
            fetch(`${BASE}/public/souvenir-colors`).then(r => r.json()),
        ]).then(([sRes, imgRes, colorRes]) => {
            const list: Souvenir[] = Array.isArray(sRes?.data) ? sRes.data : Array.isArray(sRes) ? sRes : [];
            const imgs = Array.isArray(imgRes?.data) ? imgRes.data : Array.isArray(imgRes) ? imgRes : [];
            const cols = Array.isArray(colorRes?.data) ? colorRes.data : Array.isArray(colorRes) ? colorRes : [];

            const merged = list.map(s => ({
                ...s,
                images: imgs.filter((i: { souvenirId: number }) => i.souvenirId === s.id),
                colors: cols.filter((c: { souvenirId: number }) => c.souvenirId === s.id),
            }));
            setSouvenirs(merged);
        }).catch(() => setSouvenirs([]))
            .finally(() => setLoading(false));
    }, []);

    const filtered = souvenirs.filter(s =>
        !search || s.title?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-black min-h-screen">
            <div className="w-full max-w-[1450px] mx-auto px-6 py-10">
                <div className="flex justify-center mb-8">
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setVisibleCount(8); }}
                        placeholder="Qidirish..."
                        className="bg-[#14181C] border border-[#1E2328] text-white text-sm rounded-xl px-4 py-2.5 outline-none focus:border-[#2196F3] placeholder:text-[#8A8F98] w-full md:w-[280px]"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="h-[320px] rounded-2xl bg-[#1A1D21] animate-pulse" />
                        ))}
                    </div>
                ) : filtered.length > 0 ? (
                    <>
                        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
                            {filtered.slice(0, visibleCount).map(s => (
                                <SouvenirCard key={s.id} souvenir={s} />
                            ))}
                        </div>

                        {filtered.length > 8 && (
                            <div className="w-full flex justify-center mt-8">
                                <button
                                    onClick={() => {
                                        if (visibleCount >= filtered.length) {
                                            setVisibleCount(8);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        } else {
                                            setVisibleCount(prev => prev + 8);
                                        }
                                    }}
                                    className="px-6 py-2.5 bg-[#1A1D21] border border-[#2A2F36] text-[#B1B5C3] text-sm font-medium rounded-lg hover:bg-[#23262F] hover:text-white hover:border-[#2196F3] transition-all duration-300 cursor-pointer"
                                >
                                    {visibleCount >= filtered.length ? 'Kamroq' : "Ko'proq"}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Image src="/Frame.png" alt="not found" width={300} height={300} style={{ width: '300px', height: '300px' }} className="opacity-40" />
                    </div>
                )}
            </div>
        </div>
    );
}
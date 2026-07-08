'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

interface Country { title: string; }

interface Props {
    countryId: string;
    setCountryId: (v: string) => void;
    category: string;
    setCategory: (v: string) => void;
    onClear: () => void;
}

export default function RankingFilter({ countryId, setCountryId, category, setCategory, onClear }: Props) {
    const [countries, setCountries] = useState<Country[]>([]);

    useEffect(() => {
        axios.get("http://localhost:3001/public/country")
            .then(res => setCountries(res.data?.data || res.data || []))
            .catch(() => {});
    }, []);

    return (
        <div className="w-[280px] flex-shrink-0 flex flex-col gap-4">
            <Image
                src="/Frame 10.png"
                alt="Reyting"
                width={280}
                height={86}
                loading="eager"
                className="w-full rounded-2xl"
                style={{ width: '100%', height: 'auto' }}
                unoptimized
            />

            <div className="bg-[#1A1D1F] border border-[#232627] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
                    <span className="text-white text-lg font-semibold">Filter</span>
                    <button onClick={onClear} className="text-[#2196F3] text-sm hover:text-blue-300 cursor-pointer transition">Tozalash</button>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <p className="text-[#9CA3AF] text-xs uppercase tracking-wide mb-2">Mamlakatni tanlang:</p>
                        <div className="relative">
                            <select
                                value={countryId}
                                onChange={e => setCountryId(e.target.value)}
                                className="w-full h-[48px] bg-[#232627] border border-[#2A2F36] rounded-xl px-4 pr-10 text-white outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="">Barchasi</option>
                                {countries.map(c => <option key={c.title} value={c.title}>{c.title}</option>)}
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                    <div>
                        <p className="text-[#9CA3AF] text-xs uppercase tracking-wide mb-2">Toifa:</p>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                className="w-full h-[48px] bg-[#232627] border border-[#2A2F36] rounded-xl px-4 pr-10 text-white outline-none text-sm appearance-none cursor-pointer"
                            >
                                <option value="">Barchasi</option>
                                <option value="classic">Klassika</option>
                                <option value="rapid">Rapid</option>
                                <option value="blitz">Blitz</option>
                            </select>
                            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
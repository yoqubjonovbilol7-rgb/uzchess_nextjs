'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Player {
    id: number;
    fullName: string;
    rating: number;
    image?: string;
    flagUrl?: string | null;
}

interface Props {
    players: Player[];
    loading: boolean;
}

export default function PlayerRating({ players, loading }: Props) {
    return (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
                <span className="text-white font-semibold text-sm">Reyting</span>
                <Link href="/ranking" className="text-[#2EA6FF] text-xs flex items-center gap-0.5 hover:underline">
                    Barchasi <ChevronRight size={12} />
                </Link>
            </div>
            <div className="flex flex-col gap-1">
                {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-8 bg-[#1A1D21] rounded-lg animate-pulse" />
                    ))
                    : players.map((p, idx) => (
                        <div key={p.id} className="flex items-center gap-2 py-1.5 border-b border-[#1A1A1A] last:border-0">
                            {idx === 0
                                ? <span className="text-yellow-400 text-sm flex-shrink-0">👑</span>
                                : <span className="text-[#8A8F98] text-xs w-5 flex-shrink-0 font-medium">{idx + 1}.</span>
                            }
                            <span className="text-white text-xs font-medium flex-1 truncate">{p.fullName}</span>
                            <span className="text-[#8A8F98] text-xs flex-shrink-0">{p.rating}</span>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
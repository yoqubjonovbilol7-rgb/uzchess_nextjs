'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Game {
    id: number;
    p1: string;
    p1Rating?: number;
    p2: string;
    p2Rating?: number;
    p1Score?: number;
    p2Score?: number;
    result: string;
    type: string;
    moves: number;
    date: string;
    winner?: 'first' | 'second' | 'draw';
}

interface Props {
    games: Game[];
    loading?: boolean;
}

function TypeBadge({ type }: { type: string }) {
    const t = type.toLowerCase();
    const cfg =
        t === 'rapid'  ? { label: 'Rapid',  cls: 'text-red-400',    icon: '♟️' } :
        t === 'blitz'  ? { label: 'Blitz',  cls: 'text-yellow-400', icon: '⚡' } :
        t === 'bullet' ? { label: 'Bullet', cls: 'text-green-400',  icon: '🚀' } :
                         { label: type,     cls: 'text-blue-400',   icon: '♔'  };
    return (
        <span className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${cfg.cls}`}>
            <span>{cfg.icon}</span>{cfg.label}
        </span>
    );
}

function TrophyIcon({ gold }: { gold: boolean }) {
    return (
        <svg className={`w-3.5 h-3.5 flex-shrink-0 ${gold ? 'text-yellow-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.6 1.9 4.7 4.4 5 .5 1.4 1.5 2.6 2.6 3.3V18H8v2h8v-2h-2v-1.7c1.1-.7 2.1-1.9 2.6-3.3C19.1 12.7 21 10.6 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.9C5.8 10.4 5 9.3 5 8zm14 0c0 1.3-.8 2.4-2 2.9V7h2v1z"/>
        </svg>
    );
}

export default function UpcomingGames({ games, loading }: Props) {
    return (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
                <span className="text-white font-semibold text-sm">Yakunlangan o&apos;yinlar</span>
                <Link href="/ranking/matches" className="text-[#2EA6FF] text-xs flex items-center gap-0.5 hover:underline">
                    Barchasi <ChevronRight size={12} />
                </Link>
            </div>

            {loading ? (
                <div className="flex flex-col gap-0">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="px-4 py-3 border-b border-[#111]">
                            <div className="h-10 bg-[#1A1D21] rounded-lg animate-pulse" />
                        </div>
                    ))}
                </div>
            ) : games.length === 0 ? (
                <div className="py-8 text-center text-[#555] text-xs">Ma&apos;lumot topilmadi</div>
            ) : (
                <table className="w-full text-xs border-collapse">
                    <thead>
                        <tr className="border-b border-[#1A1A1A]">
                            <th className="text-left text-[#555] font-medium px-4 py-2">O&apos;YINCHILAR</th>
                            <th className="text-center text-[#555] font-medium px-3 py-2">NATIJA</th>
                            <th className="text-left text-[#555] font-medium px-3 py-2">O&apos;YIN TURI</th>
                            <th className="text-center text-[#555] font-medium px-3 py-2">YURISHLAR</th>
                            <th className="text-left text-[#555] font-medium px-3 py-2">SANA</th>
                        </tr>
                    </thead>
                    <tbody>
                        {games.map((g) => {
                            const p1Wins = g.winner === 'first';
                            const p2Wins = g.winner === 'second';
                            return (
                                <tr key={g.id} className="border-b border-[#111] hover:bg-[#0F0F0F] transition-colors cursor-pointer">
                                    {/* O'yinchilar */}
                                    <td className="px-4 py-2.5">
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-1.5">
                                                <TrophyIcon gold={p1Wins} />
                                                <span className={`font-medium ${p1Wins ? 'text-white' : 'text-[#666]'}`}>{g.p1}</span>
                                                {g.p1Rating != null && (
                                                    <span className="text-[#444] text-[10px] ml-0.5">({g.p1Rating})</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <TrophyIcon gold={p2Wins} />
                                                <span className={`font-medium ${p2Wins ? 'text-white' : 'text-[#666]'}`}>{g.p2}</span>
                                                {g.p2Rating != null && (
                                                    <span className="text-[#444] text-[10px] ml-0.5">({g.p2Rating})</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    {/* Natija */}
                                    <td className="px-3 py-2.5 text-center">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className={`font-bold text-sm ${p1Wins ? 'text-white' : 'text-[#555]'}`}>
                                                {g.p1Score ?? g.result.split('-')[0]}
                                            </span>
                                            <span className={`font-bold text-sm ${p2Wins ? 'text-white' : 'text-[#555]'}`}>
                                                {g.p2Score ?? g.result.split('-')[1]}
                                            </span>
                                        </div>
                                    </td>
                                    {/* O'yin turi */}
                                    <td className="px-3 py-2.5">
                                        <TypeBadge type={g.type} />
                                    </td>
                                    {/* Yurishlar */}
                                    <td className="px-3 py-2.5 text-center text-[#8A8F98]">{g.moves}</td>
                                    {/* Sana */}
                                    <td className="px-3 py-2.5 text-[#8A8F98] whitespace-nowrap">{g.date}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );
}
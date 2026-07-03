'use client';

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import MatchesFilter from "@/features/ranking/components/MatchesFilter";

const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

function formatDate(s: string): string {
    try {
        const d = new Date(s);
        return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
    } catch { return s; }
}

function fmtRating(n: number | null | undefined): string {
    if (n == null) return '-';
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

interface Country { id: number; title: string; flag: string; }
interface MatchPlayer {
    id: number;
    fullName: string;
    image: string | null;
    classic: number | null;
    rapid: number | null;
    blitz: number | null;
    country?: Country;
}
interface Match {
    id: number;
    firstPlayer?: MatchPlayer;
    firstPlayerResult: number;
    secondPlayer?: MatchPlayer;
    secondPlayerResult: number;
    type: 'classic' | 'rapid' | 'blitz' | 'bullet';
    moves: number;
    date: string;
    winner: 'first' | 'second' | 'draw';
}
interface Meta { total: number; page: number; limit: number; }
type SortField = 'type' | 'moves' | 'date';
type SortOrder  = 'asc' | 'desc';

function CountryFlag({ flag, title }: { flag?: string; title?: string }) {
    if (!flag) return null;
    if (flag.startsWith('http') || flag.startsWith('/'))
        return <img src={flag} alt={title ?? ''} className="w-5 h-3.5 object-cover rounded-sm inline-block ml-1.5 flex-shrink-0" />;
    return <span className="ml-1 text-sm">{flag}</span>;
}

function TrophyIcon({ gold }: { gold: boolean }) {
    return (
        <svg className={`w-4 h-4 flex-shrink-0 ${gold ? 'text-yellow-500' : 'text-gray-600'}`} viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.6 1.9 4.7 4.4 5 .5 1.4 1.5 2.6 2.6 3.3V18H8v2h8v-2h-2v-1.7c1.1-.7 2.1-1.9 2.6-3.3C19.1 12.7 21 10.6 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.9C5.8 10.4 5 9.3 5 8zm14 0c0 1.3-.8 2.4-2 2.9V7h2v1z"/>
        </svg>
    );
}

function TypeBadge({ type }: { type: string }) {
    const map: Record<string, { label: string; cls: string; icon: string }> = {
        rapid:   { label: 'Rapid',    cls: 'text-red-400 bg-red-500/10',       icon: '♟️' },
        blitz:   { label: 'Blitz',    cls: 'text-yellow-400 bg-yellow-500/10', icon: '⚡' },
        bullet:  { label: 'Bullet',   cls: 'text-green-400 bg-green-500/10',   icon: '🚀' },
        classic: { label: 'Klassika', cls: 'text-blue-400 bg-blue-500/10',     icon: '♔'  },
    };
    const c = map[type] ?? { label: type, cls: 'text-gray-400 bg-gray-500/10', icon: '♟️' };
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap ${c.cls}`}>
            <span>{c.icon}</span>{c.label}
        </span>
    );
}

function SortBtn({ field, active, order, onClick, children }: {
    field: string; active: boolean; order: SortOrder; onClick: () => void; children: React.ReactNode;
}) {
    return (
        <button onClick={onClick} className="flex items-center gap-1 hover:text-white transition cursor-pointer group">
            {children}
            <span className={`${active ? 'text-[#2196F3]' : 'text-gray-600 group-hover:text-gray-400'}`}>
                {active ? (order === 'desc' ? '↓' : '↑') : '⇅'}
            </span>
        </button>
    );
}

function Pagination({ page, totalPages, perPage, onPage, onPerPage }: {
    page: number; totalPages: number; perPage: number;
    onPage: (p: number) => void; onPerPage: (n: number) => void;
}) {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1, 2);
        if (page > 4) pages.push('...');
        for (let i = Math.max(3, page - 1); i <= Math.min(totalPages - 2, page + 1); i++) pages.push(i);
        if (page < totalPages - 3) pages.push('...');
        pages.push(totalPages - 1, totalPages);
    }
    const uniq = pages.filter((v, i, a) => a.indexOf(v) === i);

    return (
        <div className="flex items-center justify-end gap-2 py-3 px-5 border-t border-[#232627]">
            <span className="text-[#9CA3AF] text-sm mr-1">Показать</span>
            <select value={perPage} onChange={e => onPerPage(Number(e.target.value))}
                className="bg-[#232627] border border-[#2A2F36] text-white text-sm rounded-lg px-2 py-1 outline-none cursor-pointer mr-3">
                {[10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <button onClick={() => onPage(page - 1)} disabled={page === 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#232627] text-gray-400 hover:text-white hover:border-[#2196F3] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                ‹
            </button>
            {uniq.map((p, i) => p === '...'
                ? <span key={`e${i}`} className="text-gray-600 px-0.5">...</span>
                : <button key={p} onClick={() => onPage(p as number)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition cursor-pointer ${page === p ? 'bg-[#2196F3] text-white' : 'text-gray-400 hover:text-white border border-[#232627] hover:border-[#2196F3]'}`}>
                    {p}
                  </button>
            )}
            <button onClick={() => onPage(page + 1)} disabled={page === totalPages || totalPages === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#232627] text-gray-400 hover:text-white hover:border-[#2196F3] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                ›
            </button>
        </div>
    );
}

function getRating(p: MatchPlayer, type: string): number | null {
    if (type === 'classic') return p.classic;
    if (type === 'rapid')   return p.rapid;
    return p.blitz;
}

export default function MatchesPage() {
    const [matches,   setMatches]   = useState<Match[]>([]);
    const [meta,      setMeta]      = useState<Meta>({ total: 0, page: 1, limit: 10 });
    const [loading,   setLoading]   = useState(true);
    const [page,      setPage]      = useState(1);
    const [perPage,   setPerPage]   = useState(10);
    const [sortBy,    setSortBy]    = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
    const [countryId, setCountryId] = useState('');
    const [age,       setAge]       = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3001/public/matches?page=${page}`);
            const d = res.data;
            setMatches(d.data ?? d ?? []);
            setMeta({ total: d.totalCount ?? 0, page: d.currentPage ?? page, limit: 10 });
        } catch { setMatches([]); }
        finally  { setLoading(false); }
    }, [page]);

    useEffect(() => { fetchData(); }, [fetchData]);

    function toggleSort(f: SortField) {
        if (sortBy === f) setSortOrder(o => o === 'desc' ? 'asc' : 'desc');
        else { setSortBy(f); setSortOrder('desc'); }
    }

    const totalPages = Math.max(1, meta.total > 0 ? Math.ceil(meta.total / 10) : 1);

    return (
        <div className="bg-black min-h-screen">
            <div className="w-full max-w-[1500px] mx-auto px-6 py-8 flex gap-6 items-start">
                <MatchesFilter
                    countryId={countryId}
                    setCountryId={v => { setCountryId(v); setPage(1); }}
                    age={age}
                    setAge={v => { setAge(v); setPage(1); }}
                    onClear={() => { setCountryId(''); setAge(''); setPage(1); }}
                />

                <div className="flex-1 bg-[#1A1D1F] border border-[#232627] rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#232627] bg-[#161819]">
                                <th className="text-left px-5 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider w-12">№</th>
                                <th className="text-left px-4 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">O&apos;yinchilar va Natija</th>
                                <th className="text-right px-4 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Reyting</th>
                                <th className="text-center px-4 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Natija</th>
                                <th className="text-center px-4 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                                    <SortBtn field="o'yin turi" active={sortBy === 'type'} order={sortOrder} onClick={() => toggleSort('type')}>
                                        O&apos;yin Turi
                                    </SortBtn>
                                </th>
                                <th className="text-right px-4 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                                    <SortBtn field="yurishlar" active={sortBy === 'moves'} order={sortOrder} onClick={() => toggleSort('moves')}>
                                        Yurishlar
                                    </SortBtn>
                                </th>
                                <th className="text-right px-5 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                                    <SortBtn field="sana" active={sortBy === 'date'} order={sortOrder} onClick={() => toggleSort('date')}>
                                        O&apos;yin Sanasi
                                    </SortBtn>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="border-b border-[#232627]">
                                        <td colSpan={7} className="px-5 py-3">
                                            <div className="h-14 bg-[#232627] rounded-lg animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : matches.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Image src="/Frame.png" alt="bo'sh" width={180} height={180} style={{ width: 180, height: 'auto' }} className="opacity-40" />
                                            <p className="text-gray-500 text-sm">Ma&apos;lumot topilmadi</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : matches.map((m, idx) => {
                                const rank   = (page - 1) * 10 + idx + 1;
                                const p1Wins = m.winner === 'first';
                                const p2Wins = m.winner === 'second';
                                const p1Rat  = m.firstPlayer  ? getRating(m.firstPlayer,  m.type) : null;
                                const p2Rat  = m.secondPlayer ? getRating(m.secondPlayer, m.type) : null;
                                return (
                                    <tr key={m.id} className="border-b border-[#232627] hover:bg-[#1F2225] transition">
                                        <td className="px-5 py-4 text-[#9CA3AF] text-sm align-middle">{rank}.</td>
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <TrophyIcon gold={p1Wins} />
                                                    <span className={`text-sm font-medium ${p1Wins ? 'text-white' : 'text-[#9CA3AF]'}`}>{m.firstPlayer?.fullName ?? "O'yinchi 1"}</span>
                                                    <CountryFlag flag={m.firstPlayer?.country?.flag} title={m.firstPlayer?.country?.title} />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <TrophyIcon gold={p2Wins} />
                                                    <span className={`text-sm font-medium ${p2Wins ? 'text-white' : 'text-[#9CA3AF]'}`}>{m.secondPlayer?.fullName ?? "O'yinchi 2"}</span>
                                                    <CountryFlag flag={m.secondPlayer?.country?.flag} title={m.secondPlayer?.country?.title} />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-right">
                                            <div className="flex flex-col gap-2 items-end">
                                                <span className="text-[#9CA3AF] text-sm">({fmtRating(p1Rat)})</span>
                                                <span className="text-[#9CA3AF] text-sm">({fmtRating(p2Rat)})</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex flex-col gap-2 items-center">
                                                <span className={`text-sm font-semibold ${p1Wins ? 'text-white' : 'text-[#9CA3AF]'}`}>{m.firstPlayerResult}</span>
                                                <span className={`text-sm font-semibold ${p2Wins ? 'text-white' : 'text-[#9CA3AF]'}`}>{m.secondPlayerResult}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <TypeBadge type={m.type} />
                                        </td>
                                        <td className="px-4 py-4 text-right text-white text-sm">{m.moves}</td>
                                        <td className="px-5 py-4 text-right text-[#9CA3AF] text-sm whitespace-nowrap">{formatDate(m.date)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        perPage={10}
                        onPage={setPage}
                        onPerPage={() => {}}
                    />
                </div>
            </div>
        </div>
    );
}
'use client';

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import RankingFilter from "@/features/ranking/components/RankingFilter";

function toImageUrl(p: string | null | undefined): string | null {
    if (!p) return null;
    if (p.startsWith('http')) return p;
    return `http://localhost:3001/${p.replace(/\\/g, '/')}`;
}

interface Player {
    id: number;
    fullName: string;
    image: string | null;
    countryId?: number;
    flagUrl?: string | null;
    classic: number | null;
    rapid: number | null;
    blitz: number | null;
}
interface Meta { total: number; page: number; limit: number; }
type SortField = 'classic' | 'rapid' | 'blitz';
type SortOrder = 'asc' | 'desc';

function PlayerAvatar({ image, name }: { image: string | null; name: string }) {
    if (image) return <img src={image} alt={name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />;
    return (
        <div className="w-8 h-8 rounded-full bg-[#1A3A5C] flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#2196F3]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a3 3 0 110 6 3 3 0 010-6zm0 8c3.3 0 10 1.7 10 5v2H2v-2c0-3.3 6.7-5 10-5z"/>
            </svg>
        </div>
    );
}

function SortBtn({ field, active, order, onClick }: { field: string; active: boolean; order: SortOrder; onClick: () => void }) {
    return (
        <button onClick={onClick} className="flex items-center gap-1 hover:text-white transition cursor-pointer group">
            {field}
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

export default function RankingPage() {
    const [players,  setPlayers]  = useState<Player[]>([]);
    const [meta,     setMeta]     = useState<Meta>({ total: 0, page: 1, limit: 10 });
    const [loading,  setLoading]  = useState(true);
    const [page,     setPage]     = useState(1);
    const [perPage,  setPerPage]  = useState(10);
    const [sortBy,   setSortBy]   = useState<SortField>('classic');
    const [sortOrder,setSortOrder]= useState<SortOrder>('desc');
    const [countryId,setCountryId]= useState('');
    const [category, setCategory] = useState('');

    const fetch = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:3001/public/player?page=${page}`);
            const d = res.data;
            const raw: Player[] = d.data ?? d ?? [];

            const uniqueIds = [...new Set(raw.map(p => p.countryId).filter(Boolean))] as number[];
            const countryMap = new Map<number, string | null>();
            await Promise.all(uniqueIds.map(async cid => {
                try {
                    const cr = await axios.get(`http://localhost:3001/public/country/${cid}`);
                    countryMap.set(cid, toImageUrl(cr.data?.flag));
                } catch { countryMap.set(cid, null); }
            }));

            setPlayers(raw.map(p => ({
                ...p,
                image:   toImageUrl(p.image),
                flagUrl: p.countryId ? (countryMap.get(p.countryId) ?? null) : null,
            })));
            setMeta({ total: d.totalCount ?? 0, page: d.currentPage ?? page, limit: 10 });
        } catch { setPlayers([]); }
        finally  { setLoading(false); }
    }, [page]);

    useEffect(() => { fetch(); }, [fetch]);

    function toggleSort(f: SortField) {
        if (sortBy === f) setSortOrder(o => o === 'desc' ? 'asc' : 'desc');
        else { setSortBy(f); setSortOrder('desc'); }
    }

    const sortedPlayers = [...players].sort((a, b) => {
        const av = a[sortBy] ?? 0;
        const bv = b[sortBy] ?? 0;
        return sortOrder === 'desc' ? bv - av : av - bv;
    });

    const totalPages = Math.max(1, meta.total > 0 ? Math.ceil(meta.total / 10) : 1);

    return (
        <div className="bg-black min-h-screen">
            <div className="w-full max-w-[1500px] mx-auto px-6 py-8 flex gap-6 items-start">
                <RankingFilter
                    countryId={countryId}
                    setCountryId={v => { setCountryId(v); setPage(1); }}
                    category={category}
                    setCategory={v => { setCategory(v); setPage(1); }}
                    onClear={() => { setCountryId(''); setCategory(''); setPage(1); }}
                />

                <div className="flex-1 bg-[#1A1D1F] border border-[#232627] rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#232627] bg-[#161819]">
                                <th className="text-left px-5 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider w-32">№</th>
                                <th className="text-left px-4 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">Ism Familiya</th>
                                <th className="px-6 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider text-right">
                                    <SortBtn field="Klassika" active={sortBy === 'classic'} order={sortOrder} onClick={() => toggleSort('classic')} />
                                </th>
                                <th className="px-6 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider text-right">
                                    <SortBtn field="Rapid" active={sortBy === 'rapid'} order={sortOrder} onClick={() => toggleSort('rapid')} />
                                </th>
                                <th className="px-6 py-4 text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider text-right">
                                    <SortBtn field="Blitz" active={sortBy === 'blitz'} order={sortOrder} onClick={() => toggleSort('blitz')} />
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} className="border-b border-[#232627]">
                                        <td className="px-5 py-4" colSpan={5}>
                                            <div className="h-8 bg-[#232627] rounded-lg animate-pulse" />
                                        </td>
                                    </tr>
                                ))
                            ) : players.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <Image src="/Frame.png" alt="bo'sh" width={180} height={180} style={{ width: 180, height: 'auto' }} className="opacity-40" />
                                            <p className="text-gray-500 text-sm">Ma&apos;lumot topilmadi</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : sortedPlayers.map((player, idx) => {
                                const rank = (page - 1) * 10 + idx + 1;
                                return (
                                    <tr key={player.id} className="border-b border-[#232627] hover:bg-[#1F2225] transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-white text-sm font-semibold">{rank}.</span>
                                                {rank === 1 && <span className="text-base">👑</span>}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <PlayerAvatar image={player.image} name={player.fullName} />
                                                <span className="text-white text-sm font-medium">{player.fullName}</span>
                                                {player.flagUrl && (
                                                    <img src={player.flagUrl} alt="" className="w-5 h-3.5 object-cover rounded-sm flex-shrink-0" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right text-white text-sm">{player.classic ?? '-'}</td>
                                        <td className="px-6 py-4 text-right text-white text-sm">{player.rapid ?? '-'}</td>
                                        <td className="px-6 py-4 text-right text-white text-sm">{player.blitz ?? '-'}</td>
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
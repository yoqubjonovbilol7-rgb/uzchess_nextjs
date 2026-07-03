'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface NewsItem {
    id: number;
    title: string;
    description?: string;
    date: string;
    image: string;
}

const BASE = 'http://localhost:3001';

const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

function fmtDate(raw: string): string {
    if (!raw) return '';
    const d = new Date(raw);
    if (isNaN(d.getTime())) return raw;
    return `${UZ_MONTHS[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

function normalizeImg(src?: string) {
    if (!src) return '/Frame.png';
    const s = src.replace(/\\/g, '/');
    return s.startsWith('http') ? s : `${BASE}/${s}`;
}

interface Props {
    news: NewsItem[];
    loading: boolean;
    visible: number;
    onLoadMore: () => void;
    onLoadLess: () => void;
}

const FALLBACK_NEWS: NewsItem[] = [
    { id: 1, title: "Nodirbek Abdusattorov FIDE reytingida 2700 balldan o'tdi", description: "O'zbekistonlik yosh grosmeysteri Turkiyada o'tkazilgan shaxmat chempionatida ajoyib natijalar ko'rsatdi.", date: "Sentabr 7, 2022", image: "" },
    { id: 2, title: "Sindarov Javokhir xalqaro musobaqada g'oliblik qozondi", description: "Yosh o'zbek shaxmatchi xalqaro musobaqada o'zining mahoratini yana bir bor isbotladi.", date: "Noyabr 7, 2022", image: "" },
    { id: 3, title: "O'zbekiston shaxmatchilari olimpiadada Armanistonni mag'lubiyatga uchratdi", description: "Milliy jamoamiz olimpiadadagi o'yinda kuchli raqibni yengishga muvaffaq bo'ldi.", date: "Dekabr 7, 2022", image: "" },
    { id: 4, title: "Magnus Carlsen Norvegiya chempionatida rekord o'rnatdi", description: "Jahon chempioni o'z mamlakatida yangi rekord natijasini qayd etdi.", date: "Yanvar 3, 2023", image: "" },
];

export default function NewsList({ news, loading, visible, onLoadMore, onLoadLess }: Props) {
    const items = news.length > 0 ? news : FALLBACK_NEWS;
    const shown = items.slice(0, visible);
    const allShown = visible >= items.length;

    return (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
                <span className="text-white font-semibold text-sm">Yangiliklar</span>
                <Link href="/news" className="text-[#2EA6FF] text-xs flex items-center gap-0.5 hover:underline">
                    Barchasi <ChevronRight size={12} />
                </Link>
            </div>

            <div className="flex flex-col divide-y divide-[#111]">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="flex gap-3 p-4">
                            <div className="w-[90px] h-[64px] bg-[#1A1D21] rounded-xl animate-pulse flex-shrink-0" />
                            <div className="flex-1 flex flex-col gap-2 justify-center">
                                <div className="h-3 bg-[#1A1D21] rounded animate-pulse w-1/4" />
                                <div className="h-3 bg-[#1A1D21] rounded animate-pulse" />
                                <div className="h-3 bg-[#1A1D21] rounded animate-pulse w-3/4" />
                            </div>
                        </div>
                    ))
                ) : (
                    shown.map((item) => (
                        <Link key={item.id} href={`/news/${item.id}`} className="flex gap-3 p-4 hover:bg-[#111] transition-colors group">
                            <div className="relative w-[90px] h-[64px] rounded-xl overflow-hidden flex-shrink-0 bg-[#1A1D21]">
                                <Image
                                    src={normalizeImg(item.image)}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[#8A8F98] text-[11px] mb-1">{fmtDate(item.date)}</p>
                                <p className="text-white text-xs font-semibold leading-snug line-clamp-2">{item.title}</p>
                                {item.description && (
                                    <p className="text-[#8A8F98] text-[11px] mt-1 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {!loading && items.length > 4 && (
                <div className="p-4 border-t border-[#1A1A1A] flex justify-center">
                    <button
                        onClick={allShown ? onLoadLess : onLoadMore}
                        className="px-6 py-2 bg-[#1A1D21] hover:bg-[#2196F3] text-white text-xs font-medium rounded-xl transition-colors cursor-pointer"
                    >
                        {allShown ? 'Kamroq' : "Ko'proq"}
                    </button>
                </div>
            )}
        </div>
    );
}
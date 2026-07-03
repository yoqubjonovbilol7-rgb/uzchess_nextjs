import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export interface Course {
    id: number;
    title: string;
    image: string;
    rating: number;
    author?: { fullName: string };
}

const BASE = 'http://localhost:3001';

function normalizeImg(src?: string) {
    if (!src) return '/Frame.png';
    const s = src.replace(/\\/g, '/');
    return s.startsWith('http') ? s : `${BASE}/${s}`;
}

function Stars({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <svg key={s} width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path
                        d="M6 1l1.39 2.82 3.11.45-2.25 2.19.53 3.09L6 8.02 3.22 9.55l.53-3.09L1.5 4.27l3.11-.45L6 1z"
                        fill={s <= Math.round(rating) ? '#FACC15' : '#2A2F36'}
                    />
                </svg>
            ))}
            <span className="text-[#8A8F98] text-[10px] ml-1">{Number(rating).toFixed(1)}</span>
        </div>
    );
}

interface Props {
    courses: Course[];
    loading: boolean;
}

export default function TopCourses({ courses, loading }: Props) {
    const list = courses.slice(0, 4);

    return (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-4 flex-shrink-0">
            <div className="flex items-center justify-between mb-3">
                <span className="text-white font semibold text-sm">Top kurslar</span>
                <Link href="/courses" className="text-[#2EA6FF] text-xs flex items-center gap-0.5 hover:underline">
                    Barchasi <ChevronRight size={12} />
                </Link>
            </div>
            <div className="flex flex-col gap-3">
                {loading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-3">
                            <div className="w-10 h-10 bg-[#1A1D21] rounded-lg animate-pulse flex-shrink-0" />
                            <div className="flex-1 flex flex-col gap-1.5 justify-center">
                                <div className="h-3 bg-[#1A1D21] rounded animate-pulse" />
                                <div className="h-3 bg-[#1A1D21] rounded animate-pulse w-2/3" />
                            </div>
                        </div>
                    ))
                    : list.length === 0
                        ? <p className="text-[#8A8F98] text-xs text-center py-2">Kurslar yo&apos;q</p>
                        : list.map((c) => (
                            <Link key={c.id} href={`/courses/${c.id}`} className="flex gap-3 group">
                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-[#1A1D21]">
                                    <Image
                                        src={normalizeImg(c.image)}
                                        alt={c.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                                    <p className="text-white text-xs font-medium leading-snug line-clamp-2">{c.title}</p>
                                    <Stars rating={c.rating ?? 0} />
                                </div>
                            </Link>
                        ))
                }
            </div>
        </div>
    );
}
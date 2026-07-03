'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

import DailyGame from '@/features/main/components/DailyGame';
import PlayerRating, { Player } from '@/features/main/components/PlayerRating';
import CourseBanners from '@/features/main/components/CourseBanners';
import UpcomingGames, { Game } from '@/features/main/components/UpcomingGames';
import ChessComBanner from '@/features/main/components/ChessComBanner';
import NewsList, { NewsItem } from '@/features/main/components/NewsList';
import SidebarPromo from '@/features/main/components/SidebarPromo';
import TopCourses, { Course } from '@/features/main/components/TopCourses';
import TopBooks, { Book } from '@/features/main/components/TopBooks';

const UZ_MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];

function formatDate(dateStr: string): string {
    try {
        const d = new Date(dateStr);
        return `${d.getDate()} ${UZ_MONTHS[d.getMonth()]}`;
    } catch { return dateStr; }
}

function toImageUrl(p: string | null | undefined): string | undefined {
    if (!p) return undefined;
    if (p.startsWith('http')) return p;
    return `http://localhost:3001/${p.replace(/\\/g, '/')}`;
}

interface RawPlayer {
    id: number;
    fullName: string;
    image: string | null;
    countryId?: number;
    classic?: number;
    rapid?: number;
    blitz?: number;
}

interface RawMatchPlayer {
    id: number;
    fullName: string;
    classic?: number | null;
    rapid?: number | null;
    blitz?: number | null;
    country?: { title: string; flag?: string; };
}

interface RawMatch {
    id: number;
    firstPlayer?:       RawMatchPlayer;
    firstPlayerResult:  number;
    secondPlayer?:      RawMatchPlayer;
    secondPlayerResult: number;
    type: string;
    moves: number;
    date: string;
    winner: 'first' | 'second' | 'draw';
}

function getRating(p: RawMatchPlayer, type: string): number | undefined {
    if (type === 'classic') return p.classic ?? undefined;
    if (type === 'rapid')   return p.rapid   ?? undefined;
    return p.blitz ?? undefined;
}

function matchToGame(m: RawMatch): Game {
    return {
        id:       m.id,
        p1:       m.firstPlayer?.fullName ?? "O'yinchi 1",
        p1Rating: m.firstPlayer ? getRating(m.firstPlayer,  m.type) : undefined,
        p2:       m.secondPlayer?.fullName ?? "O'yinchi 2",
        p2Rating: m.secondPlayer ? getRating(m.secondPlayer, m.type) : undefined,
        p1Score:  m.firstPlayerResult,
        p2Score:  m.secondPlayerResult,
        result:   `${m.firstPlayerResult}-${m.secondPlayerResult}`,
        type:     m.type.charAt(0).toUpperCase() + m.type.slice(1),
        moves:    m.moves,
        date:     formatDate(m.date),
        winner:   m.winner,
    };
}

function toArr<T>(data: unknown): T[] {
    if (Array.isArray((data as { data?: unknown })?.data)) return (data as { data: T[] }).data;
    if (Array.isArray(data)) return data as T[];
    return [];
}

export default function HomePage() {
    const [courses,     setCourses]     = useState<Course[]>([]);
    const [news,        setNews]        = useState<NewsItem[]>([]);
    const [books,       setBooks]       = useState<Book[]>([]);
    const [players,     setPlayers]     = useState<Player[]>([]);
    const [games,       setGames]       = useState<Game[]>([]);
    const [gamesLoading,setGamesLoading]= useState(true);
    const [loading,     setLoading]     = useState(true);
    const [newsVisible, setNewsVisible] = useState(4);

    useEffect(() => {
        (async () => {
            try {
                const [cRes, nRes, bRes] = await Promise.all([
                    api.get('/public/courses').catch(() => ({ data: [] })),
                    api.get('/public/news').catch(() => ({ data: [] })),
                    api.get('/public/book').catch(() => ({ data: [] })),
                ]);
                setCourses(toArr<Course>(cRes.data));
                const rawNews = toArr<NewsItem & { createdAt?: string }>(nRes.data);
                setNews(rawNews.map(n => ({ ...n, date: n.date || n.createdAt || '' })));
                setBooks(toArr<Book>(bRes.data));
            } catch (err) {
                console.error('Home fetch error:', err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const pRes = await api.get('/public/player');
                const pd = toArr<RawPlayer>(pRes.data).slice(0, 5);
                if (pd.length > 0) {
                    const uniqueIds = [...new Set(pd.map(p => p.countryId).filter(Boolean))] as number[];
                    const countryMap = new Map<number, string | null>();
                    await Promise.all(uniqueIds.map(async cid => {
                        try {
                            const cr = await api.get(`/public/country/${cid}`);
                            countryMap.set(cid, toImageUrl(cr.data?.flag) ?? null);
                        } catch { countryMap.set(cid, null); }
                    }));
                    setPlayers(pd.map(p => ({
                        id:       p.id,
                        fullName: p.fullName,
                        rating:   p.classic ?? p.rapid ?? p.blitz ?? 0,
                        image:    toImageUrl(p.image),
                        flagUrl:  p.countryId ? (countryMap.get(p.countryId) ?? null) : null,
                    })));
                }
            } catch {}
        })();
    }, []);

    useEffect(() => {
        (async () => {
            setGamesLoading(true);
            try {
                const mRes = await api.get('/public/matches');
                const md = toArr<RawMatch>(mRes.data);
                setGames(md.map(matchToGame));
            } catch {
                setGames([]);
            } finally {
                setGamesLoading(false);
            }
        })();
    }, []);

    return (
        <div className="bg-black overflow-hidden" style={{ height: 'calc(100vh - 108px)' }}>
            <div className="h-full overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                <div className="w-full max-w-[1700px] mx-auto px-6 py-6 flex gap-5 items-start">

                    <aside className="w-[230px] flex-shrink-0 flex flex-col gap-4">
                        <DailyGame />
                        <PlayerRating players={players} loading={loading} />
                    </aside>

                    <div className="flex-1 min-w-0 flex flex-col gap-4">
                        <CourseBanners />
                        <UpcomingGames games={games} loading={gamesLoading} />
                        <ChessComBanner />
                        <NewsList
                            news={news}
                            loading={loading}
                            visible={newsVisible}
                            onLoadMore={() => setNewsVisible(v => v + 4)}
                            onLoadLess={() => setNewsVisible(4)}
                        />
                    </div>

                    <aside className="w-[265px] flex-shrink-0 flex flex-col gap-4">
                        <SidebarPromo />
                        <TopCourses courses={courses} loading={loading} />
                        <TopBooks books={books} loading={loading} />
                    </aside>

                </div>
            </div>
        </div>
    );
}
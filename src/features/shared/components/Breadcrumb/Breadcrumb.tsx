'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import axios from 'axios';

const BASE = 'http://localhost:3001';

const STATIC_LABELS: Record<string, string> = {
    '/': 'Asosiy',
    '/news': 'Yangiliklar',
    '/courses': 'Kurslar',
    '/library': 'Kutubxona',
    '/contact': "Bog'lanish",
    '/ranking': 'Reyting',
    '/ranking/matches': "Yakunlangan o'yinlar",
    '/souvenirs': 'Suvenirlar',
};

const DYNAMIC_ROUTES = [
    { pattern: /^\/courses\/(\d+)/,   endpoint: (id: string) => `/public/courses/${id}`,  parent: 'Kurslar' },
    { pattern: /^\/news\/(\d+)/,      endpoint: (id: string) => `/public/news/${id}`,     parent: 'Yangiliklar' },
    { pattern: /^\/library\/(\d+)/,   endpoint: (id: string) => `/public/book/${id}`,     parent: 'Kutubxona' },
    { pattern: /^\/souvenirs\/(\d+)/, endpoint: (id: string) => `/public/souvenir/${id}`, parent: 'Suvenirlar' },
];

export default function Breadcrumb() {
    const pathname = usePathname() ?? '/';

    const matched = DYNAMIC_ROUTES.find(r => r.pattern.test(pathname));

    const [fetched, setFetched] = useState<{ path: string; title: string } | null>(null);

    useEffect(() => {
        const route = DYNAMIC_ROUTES.find(r => r.pattern.test(pathname));
        if (!route) return;
        let cancelled = false;
        const id = pathname.match(route.pattern)![1];
        axios.get(`${BASE}${route.endpoint(id)}`)
            .then(res => {
                if (cancelled) return;
                const data = res.data?.data ?? res.data;
                setFetched({ path: pathname, title: data?.title ?? '' });
            })
            .catch(() => {
                if (!cancelled) setFetched({ path: pathname, title: '' });
            });
        return () => { cancelled = true; };
    }, [pathname]);

    const dynamicTitle = fetched?.path === pathname ? fetched.title : '';
    const staticLabel  = STATIC_LABELS[pathname] ?? '';

    return (
        <div className="w-full max-w-[1700px] mx-auto px-8 pb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
                <Image src="/home1.png" alt="home" width={16} height={16} />
                <span>Asosiy</span>
                <Image src="/chess.png" alt="arrow" width={12} height={12} />
                {matched ? (
                    <>
                        <span className="text-white">{matched.parent}</span>
                        {dynamicTitle && (
                            <>
                                <Image src="/chess.png" alt="arrow" width={12} height={12} />
                                <span className="text-white line-clamp-1">{dynamicTitle}</span>
                            </>
                        )}
                    </>
                ) : (
                    <span className="text-white">{staticLabel}</span>
                )}
            </div>
        </div>
    );
}
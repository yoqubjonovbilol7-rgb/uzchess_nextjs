'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getSavedCourses, getSavedBooks, getSavedSouvenirs, toggleSavedCourse, toggleSavedBook, toggleSavedSouvenir, type SavedCourse, type SavedBook, type SavedSouvenir } from '@/lib/saved';

const BASE = 'http://localhost:3001';
type Tab = 'courses' | 'books' | 'souvenirs';

const TABS: { key: Tab; label: string }[] = [
    { key: 'courses',   label: 'Saqlangan kurslar' },
    { key: 'books',     label: 'Saqlangan kitoblar' },
    { key: 'souvenirs', label: 'Saqlangan suvenirlar' },
];

function norm(img?: string) {
    if (!img) return '';
    return img.startsWith('http') ? img : `${BASE}/${img.replace(/\\/g, '/')}`;
}

const EMPTY_LABELS: Record<Tab, [string, string]> = {
    courses:   ["Saqlangan kurslar yo'q",    "Kurslarni saqlang va bu yerda ko'ring"],
    books:     ["Saqlangan kitoblar yo'q",   "Kitoblarni saqlang va bu yerda ko'ring"],
    souvenirs: ["Saqlangan suvenirlar yo'q", "Suvenirlarni saqlang va bu yerda ko'ring"],
};

function Empty({ tab }: { tab: Tab }) {
    const [title, sub] = EMPTY_LABELS[tab];
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: '#0D1117', border: '1px solid #1A2030' }}>
                <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: '#374151' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
            </div>
            <p className="font-semibold text-white">{title}</p>
            <p className="text-sm text-center" style={{ color: '#6B7280' }}>{sub}</p>
        </div>
    );
}

export default function ProfileSaved() {
    const [tab, setTab] = useState<Tab>('courses');
    const [courses, setCourses]     = useState<SavedCourse[]>([]);
    const [books, setBooks]         = useState<SavedBook[]>([]);
    const [souvenirs, setSouvenirs] = useState<SavedSouvenir[]>([]);

    useEffect(() => {
        setCourses(getSavedCourses());
        setBooks(getSavedBooks());
        setSouvenirs(getSavedSouvenirs());
    }, []);

    function unsaveCourse(e: React.MouseEvent, id: number) {
        e.preventDefault();
        toggleSavedCourse({ id, title: '' });
        setCourses(getSavedCourses());
    }

    function unsaveBook(e: React.MouseEvent, id: number) {
        e.preventDefault();
        toggleSavedBook({ id, title: '' });
        setBooks(getSavedBooks());
    }

    function unsaveSouvenir(e: React.MouseEvent, id: number) {
        e.preventDefault();
        toggleSavedSouvenir({ id, title: '' });
        setSouvenirs(getSavedSouvenirs());
    }

    const items = tab === 'courses' ? courses : tab === 'books' ? books : souvenirs;

    return (
        <div className="flex flex-col gap-5">
            {/* Tabs */}
            <div className="flex gap-2">
                {TABS.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                            background: tab === t.key ? '#fff' : 'transparent',
                            color:      tab === t.key ? '#000' : '#6B7280',
                            border:     `1px solid ${tab === t.key ? '#fff' : '#1F2937'}`,
                        }}>
                        {t.label}
                    </button>
                ))}
            </div>

            {!items.length ? <Empty tab={tab} /> : (
                <div className="grid grid-cols-3 gap-4">
                    {tab === 'courses'
                        ? courses.map(course => (
                            <Link key={course.id}
                                href={`/courses/${course.id}`}
                                className="rounded-2xl overflow-hidden group transition-colors"
                                style={{ background: '#0D1117', border: '1px solid #1A2030' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D3748'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2030'; }}>

                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden"
                                    style={{ background: '#1A2030' }}>
                                    {course.image
                                        ? <Image src={norm(course.image)} alt={course.title}
                                            fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                                        : <div className="w-full h-full flex items-center justify-center text-4xl">♟</div>
                                    }
                                    {/* Heart button */}
                                    <button
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                                        style={{ background: 'rgba(0,0,0,0.5)' }}
                                        onClick={e => unsaveCourse(e, course.id)}>
                                        <svg className="w-4 h-4" fill="#10B981" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Text */}
                                <div className="p-3">
                                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug">
                                        {course.title}
                                    </h3>
                                    {course.author?.fullName && (
                                        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                                            {course.author.fullName}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))
                        : books.map(book => (
                            <Link key={book.id}
                                href={`/library/${book.id}`}
                                className="rounded-2xl overflow-hidden group transition-colors"
                                style={{ background: '#0D1117', border: '1px solid #1A2030' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D3748'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2030'; }}>

                                <div className="relative aspect-[4/3] overflow-hidden"
                                    style={{ background: '#1A2030' }}>
                                    {book.image
                                        ? <Image src={norm(book.image)} alt={book.title}
                                            fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                                        : <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                                    }
                                    <button
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                                        style={{ background: 'rgba(0,0,0,0.5)' }}
                                        onClick={e => unsaveBook(e, book.id)}>
                                        <svg className="w-4 h-4" fill="#10B981" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-3">
                                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug">
                                        {book.title}
                                    </h3>
                                    {book.author?.fullName && (
                                        <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                                            {book.author.fullName}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))
                    }
                    {tab === 'souvenirs' && souvenirs.map(s => {
                        const img = s.images?.[0]?.image;
                        return (
                            <Link key={s.id}
                                href={`/souvenirs/${s.id}`}
                                className="rounded-2xl overflow-hidden group transition-colors"
                                style={{ background: '#0D1117', border: '1px solid #1A2030' }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D3748'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2030'; }}>
                                <div className="relative aspect-[4/3] overflow-hidden" style={{ background: '#1A2030' }}>
                                    {img
                                        ? <Image src={norm(img)} alt={s.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                                        : <div className="w-full h-full flex items-center justify-center text-4xl">🏆</div>
                                    }
                                    <button
                                        className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center z-10"
                                        style={{ background: 'rgba(0,0,0,0.5)' }}
                                        onClick={e => unsaveSouvenir(e, s.id)}>
                                        <svg className="w-4 h-4" fill="#10B981" viewBox="0 0 24 24">
                                            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-3">
                                    <h3 className="text-white font-semibold text-sm line-clamp-2 leading-snug">{s.title}</h3>
                                    {s.price != null && (
                                        <p className="text-xs mt-1" style={{ color: '#84CC16' }}>
                                            {Number(s.price).toLocaleString()} UZS
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
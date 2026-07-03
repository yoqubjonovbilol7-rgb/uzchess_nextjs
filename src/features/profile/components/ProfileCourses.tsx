'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPurchasedCourses, PurchasedCourse } from '@/lib/saved';

const BASE = 'http://localhost:3001';

function norm(img?: string) {
    if (!img) return '';
    const s = img.replace(/\\/g, '/');
    return s.startsWith('http') ? s : `${BASE}/${s}`;
}

function Empty() {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
                style={{ background: '#0D1117', border: '1px solid #1A2030' }}>
                ♟
            </div>
            <div className="text-center">
                <p className="font-semibold text-white mb-1">Sotib olingan kurslar yo&apos;q</p>
                <p className="text-sm" style={{ color: '#6B7280' }}>
                    Kurslarni sotib oling va bu yerda ko&apos;ring
                </p>
            </div>
            <Link href="/courses"
                className="px-5 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: '#fff', color: '#000' }}>
                Kurslarga o&apos;tish
            </Link>
        </div>
    );
}

function CourseCard({ course }: { course: PurchasedCourse }) {
    const imgSrc = norm(course.image);

    return (
        <Link href={`/courses/${course.id}`}
            className="flex gap-4 p-5 rounded-2xl transition-colors"
            style={{ background: '#0D1117', border: '1px solid #1A2030' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#2D3748'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#1A2030'; }}>

            {/* Thumbnail */}
            <div className="relative w-[78px] h-[78px] rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: '#1A2030' }}>
                {imgSrc
                    ? <Image src={imgSrc} alt={course.title} fill
                        className="object-cover" unoptimized />
                    : <div className="w-full h-full flex items-center justify-center text-3xl">♟</div>
                }
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <h3 className="text-white font-bold text-[15px] leading-snug mb-1 line-clamp-2">
                        {course.title}
                    </h3>
                    {course.description && (
                        <p className="text-xs line-clamp-2 leading-relaxed mb-2"
                            style={{ color: '#6B7280' }}>
                            {course.description}
                        </p>
                    )}
                </div>

                <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs"
                    style={{ color: '#6B7280' }}>

                    {course.difficulty?.title && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {course.difficulty.title}
                        </span>
                    )}

                    {course.author?.fullName && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {course.author.fullName}
                        </span>
                    )}

                    {!!course.lessonsCount && (
                        <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                    d="M12 14l6.16-3.422A12.083 12.083 0 0121 13.5c0 3.866-4.03 7-9 7s-9-3.134-9-7a12.08 12.08 0 012.84-7.697" />
                            </svg>
                            {course.lessonsCount} ta dars
                        </span>
                    )}
                </div>
            </div>
        </Link>
    );
}

export default function ProfileCourses() {
    const [courses, setCourses] = useState<PurchasedCourse[]>([]);

    useEffect(() => {
        setCourses(getPurchasedCourses());
    }, []);

    if (!courses.length) return <Empty />;

    return (
        <div className="grid grid-cols-2 gap-4">
            {courses.map(course => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    );
}
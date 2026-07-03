'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LessonView from '@/features/course/components/LessonView';

const BASE = 'http://localhost:3001';

export default function LessonPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isPurchased, setIsPurchased] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const token = localStorage.getItem('token');
                const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

                const [cRes, lRes] = await Promise.all([
                    fetch(`${BASE}/public/courses/${id}`, { cache: 'no-store' }),
                    fetch(`${BASE}/public/courseLesson`, { headers }),
                ]);

                const cData = await cRes.json();
                setCourse(cData);

                const lData = await lRes.json();
                const all: any[] = Array.isArray(lData?.data) ? lData.data
                    : Array.isArray(lData?.items) ? lData.items
                    : Array.isArray(lData) ? lData : [];
                const arr = all
                    .filter((l: any) => Number(l.courseId) === Number(id))
                    .map((l: any, i: number) => ({ ...l, id: l.id ?? (l.courseSectionId * 1000 + (l.order ?? i)) }));
                setLessons(arr);

                if (token) {
                    try {
                        const pRes = await fetch(`${BASE}/public/purchasedCourse`, { headers });
                        const pData = await pRes.json();
                        const list = Array.isArray(pData?.data) ? pData.data
                            : Array.isArray(pData) ? pData : [];
                        setIsPurchased(list.some((item: any) =>
                            Number(item.courseId) === Number(id) ||
                            Number(item.course?.id) === Number(id)
                        ));
                    } catch {}
                }
            } catch {
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-white text-lg">Yuklanmoqda...</div>
        </div>
    );

    if (!lessons.length) return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center text-white">
                <p className="text-xl mb-4">Darslar mavjud emas</p>
                <button
                    onClick={() => router.push(`/courses/${id}`)}
                    className="px-6 py-2 bg-[#2196F3] rounded-xl text-sm font-semibold"
                >
                    Kursga qaytish
                </button>
            </div>
        </div>
    );

    return (
        <LessonView
            course={course}
            lessons={lessons}
            currentIdx={currentIdx}
            onPrev={() => setCurrentIdx(i => Math.max(0, i - 1))}
            onNext={() => setCurrentIdx(i => Math.min(lessons.length - 1, i + 1))}
            onSelect={setCurrentIdx}
            courseId={id}
            isPurchased={isPurchased}
        />
    );
}
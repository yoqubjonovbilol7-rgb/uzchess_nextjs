'use client';

import api from '@/lib/api';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { toggleSavedCourse, isSavedCourse } from '@/lib/saved';

interface Course {
    id: number;
    title: string;
    image: string;
    price: number;
    newPrice: number;
    rating: number;
    lessonsCount: number;
    isLiked?: boolean;

    author?: {
        fullName: string;
    };

    language?: {
        code: string;
    };

    difficulty?: {
        title: string;
        icon: string;
    };

    category?: {
        title: string;
    };
}

interface Props {
    course: Course;
}

function normalizeImageSrc(image?: string) {
    if (!image) return "";

    const normalized = image.replace(/\\/g, "/");

    return normalized.startsWith("http")
        ? normalized
        : `http://localhost:3001/${normalized}`;
}

export default function CourseCard({ course }: Props) {
    const [liked, setLiked] = useState(() => isSavedCourse(course.id) || (course.isLiked ?? false));
    const [loading, setLoading] = useState(false);
    async function handleLike(
        e: React.MouseEvent<HTMLButtonElement>
    ) {
        e.preventDefault();
        e.stopPropagation();

        if (loading) return;

        const token = localStorage.getItem('token');

        if (!token) {
            alert('Avval login qiling!');
            return;
        }

        const prevLiked = liked;

        try {
            setLoading(true);
            setLiked(!prevLiked);
            toggleSavedCourse({ id: course.id, title: course.title, image: course.image, author: course.author, rating: course.rating, lessonsCount: course.lessonsCount });
            await api.post(`/public/course-like/${course.id}`, {});
        } catch (error) {
            console.error('Like error:', error);
            setLiked(prevLiked);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Link
            href={`/courses/${course.id}`}
            className="block"
        >
            <div className="w-full bg-[#14181C] border border-[#1E2328] rounded-xl p-3 flex gap-4 hover:border-[#2196F3] transition-all">

                <div
                    className="relative flex-shrink-0 self-start rounded-lg overflow-hidden"
                    style={{ width: '160px', height: '110px' }}
                >
                    <Image
                        src={normalizeImageSrc(course.image)}
                        alt={course.title}
                        fill
                        className="object-cover"
                    />

                    <div className="absolute top-1.5 left-1.5 bg-black/70 text-yellow-400 text-[10px] px-1.5 py-0.5 rounded font-semibold backdrop-blur-sm">
                        ⭐ {course.rating}
                    </div>

                    <div className="absolute bottom-1.5 left-1.5 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur-sm font-medium">
                        {course.language?.code}
                    </div>
                </div>

                <div className="flex flex-col flex-1 justify-between py-0.5 min-w-0">

                    <div>
                        <h2 className="text-white text-sm font-bold leading-snug line-clamp-2">
                            {course.title}
                        </h2>

                        <p className="text-[#8A8F98] text-xs mt-1">
                            {course.author?.fullName}
                        </p>

                        <div className="mt-1.5">
                            {Number(course.price) > 0 &&
                                Number(course.price) !== Number(course.newPrice) && (
                                    <p className="text-gray-500 line-through text-xs">
                                        {Number(course.price).toLocaleString()} UZS
                                    </p>
                                )}

                            <p className="text-[#84CC16] font-bold text-sm">
                                {Number(course.newPrice) === 0
                                    ? 'Bepul kurs'
                                    : `${Number(course.newPrice).toLocaleString()} UZS`}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[#8A8F98] text-xs">

                            <div className="flex items-center gap-1">
                                {course.difficulty?.icon && (
                                    <Image
                                        src={normalizeImageSrc(course.difficulty.icon)}
                                        alt="difficulty"
                                        width={12}
                                        height={12}
                                    />
                                )}
                                <span>{course.difficulty?.title}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <Image
                                    src="/student_center.png"
                                    alt="lessons"
                                    width={12}
                                    height={12}
                                />
                                <span>{course.lessonsCount} ta bo&apos;lim</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <Image
                                    src="/grid1.png"
                                    alt="category"
                                    width={12}
                                    height={12}
                                />
                                <span>{course.category?.title}</span>
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-2">
                        <button
                            onClick={handleLike}
                            disabled={loading}
                            className="transition-all hover:scale-110 disabled:opacity-50"
                        >
                            <Image
                                src={liked ? '/heart-filled.png' : '/heart-outline.png'}
                                alt="heart"
                                width={18}
                                height={18}
                                style={{ width: '18px', height: '18px' }}
                            />
                        </button>
                    </div>

                </div>
            </div>
        </Link>
    );
}
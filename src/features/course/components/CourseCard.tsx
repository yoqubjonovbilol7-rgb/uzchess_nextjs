'use client';

import axios from 'axios';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    const [liked, setLiked] = useState(course.isLiked ?? false);
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

            await axios.post(
                `http://localhost:3001/public/course-like/${course.id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
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
            <div className="w-full bg-[#14181C] border border-[#1E2328] rounded-2xl p-4 flex gap-4 hover:border-[#2196F3] transition-all">

                <div
                    className="relative flex-shrink-0 self-start"
                    style={{ width: '210px', height: '150px' }}
                >
                    <Image
                        src={normalizeImageSrc(course.image)}
                        alt={course.title}
                        fill
                        className="object-cover rounded-lg"
                    />

                    <div className="absolute top-3 left-1 bg-[#111] text-yellow-400 text-[11px] px-2 py-1 rounded font-semibold">
                        ⭐ {course.rating}
                    </div>

                    <div className="absolute bottom-0 left-1 bg-[#111] text-white text-[10px] px-2 py-1 rounded">
                        {course.language?.code}
                    </div>
                </div>

                <div className="flex flex-col flex-1 justify-between">

                    <div>
                        <h2 className="text-white text-xl font-semibold">
                            {course.title}
                        </h2>

                        <p className="text-[#8A8F98] text-sm mt-1">
                            {course.author?.fullName}
                        </p>

                        <div className="mt-2">
                            {Number(course.price) > 0 &&
                                Number(course.price) !== Number(course.newPrice) && (
                                    <p className="text-gray-500 line-through text-lg">
                                        {Number(course.price).toLocaleString()} UZS
                                    </p>
                                )}

                            <p className="text-[#84CC16] font-bold text-lg">
                                {Number(course.newPrice) === 0
                                    ? 'Bepul kurs'
                                    : `${Number(course.newPrice).toLocaleString()} UZS`}
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-3 text-[#8A8F98] text-sm">

                            <div className="flex items-center gap-2">
                                {course.difficulty?.icon && (
                                    <Image
                                        src={normalizeImageSrc(course.difficulty.icon)}
                                        alt="difficulty"
                                        width={20}
                                        height={20}
                                    />
                                )}

                                <span>
                                    {course.difficulty?.title}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Image
                                    src="/student_center.png"
                                    alt="lessons"
                                    width={16}
                                    height={16}
                                />

                                <span>
                                    {course.lessonsCount} ta bo'lim
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Image
                                    src="/grid1.png"
                                    alt="category"
                                    width={16}
                                    height={16}
                                />

                                <span>
                                    {course.category?.title}
                                </span>
                            </div>

                        </div>
                    </div>

                    <div className="flex items-center justify-end mt-5">
                        <button
                            onClick={handleLike}
                            disabled={loading}
                            className="transition-all hover:scale-110 disabled:opacity-50"
                        >
                            <Image
                                src={
                                    liked
                                        ? '/heart-red.png'
                                        : '/heart-outline.png'
                                }
                                alt="heart"
                                width={22}
                                height={22}
                            />
                        </button>
                    </div>

                </div>
            </div>
        </Link>
    );
}
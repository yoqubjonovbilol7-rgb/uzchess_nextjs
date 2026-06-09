"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
    PlayCircle,
    Star,
    Heart,
    Share2,
    ChevronUp,
    ChevronDown, GraduationCap,
} from "lucide-react";

import CourseReviews from "./CourseReviews";
import YouthCard from "@/features/shared/components/YouthCard/YouthCard";

interface Props {
    course: any;
}

interface CourseItem {
    id: number;
    title: string;
    image: string;
}

function normalizeImageSrc(image?: string) {
    if (!image) return "";

    const normalized = image.replace(/\\/g, "/");

    return normalized.startsWith("http")
        ? normalized
        : `http://localhost:3001/${normalized}`;
}

export default function CourseDetail({ course }: Props) {
    const [courses, setCourses] = useState<CourseItem[]>([]);
    const [openSection, setOpenSection] = useState<number | null>(1);

    const imageUrl = normalizeImageSrc(course.image);

    const toggleSection = (id: number) => {
        setOpenSection(openSection === id ? null : id);
    };

    useEffect(() => {
        const getCourses = async () => {
            try {
                const res = await fetch(
                    "http://localhost:3001/public/courses",
                    {
                        cache: "no-store",
                    }
                );

                const data = await res.json();

                setCourses(data.data || []);
            } catch (error) {
                console.error(error);
            }
        };

        getCourses();
    }, []);

    return (
        <div className="min-h-screen bg-[#070d14] text-white">
            <div className="mx-auto max-w-7xl px-4 py-6">

                <div className="relative h-[150px] overflow-hidden rounded-lg border border-[#1d2733]">

                    <Image
                        src={imageUrl}
                        alt={course.title}
                        fill
                        priority
                        className="object-cover"
                    />

                    <div className="absolute inset-0 bg-black/70" />

                    <div className="absolute inset-0 z-10 flex items-center justify-between px-8">

                        <div>

                            <h1 className="text-3xl font-bold text-white">
                                {course.title}
                            </h1>

                            <div className="mt-2 flex items-center gap-2">
                <span className="text-xl font-bold text-white">
                    {course.newPrice} UZS
                </span>

                                <span className="text-sm text-red-400 line-through">
                    {course.price} UZS
                </span>
                            </div>

                            <div className="mt-4 flex items-center gap-5 text-xs text-slate-300">

                                <div className="flex items-center gap-1">
                                    {course.difficulty?.icon && (
                                        <Image
                                            src={`http://localhost:3001/${course.difficulty.icon.replaceAll(
                                                "\\",
                                                "/"
                                            )}`}
                                            alt={course.difficulty.title}
                                            width={14}
                                            height={14}
                                        />
                                    )}

                                    <span>{course.difficulty?.title}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <GraduationCap size={14} />
                                    <span>{course.sectionsCount} ta bo'lim</span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <PlayCircle size={14} />
                                    <span>{course.lessonsCount} ta dars</span>
                                </div>

                            </div>

                        </div>

                        <div className="flex flex-col items-end">

                            <div className="mb-3 flex items-center gap-1">

                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                        key={i}
                                        size={14}
                                        fill={
                                            i < Math.floor(Number(course.rating))
                                                ? "#FACC15"
                                                : "none"
                                        }
                                        className={
                                            i < Math.floor(Number(course.rating))
                                                ? "text-yellow-400"
                                                : "text-slate-600"
                                        }
                                    />
                                ))}

                                <span className="ml-1 text-sm font-semibold text-white">
                    {course.rating}
                </span>

                                <span className="text-xs text-slate-400">
                    ({course.reviewsCount} ta izoh)
                </span>

                            </div>

                            <div className="flex items-center gap-2">

                                <button className="rounded bg-sky-500 px-6 py-2 text-sm font-medium text-white hover:bg-sky-600">
                                    Kursni sotib olish
                                </button>

                                <button className="flex h-10 w-10 items-center justify-center rounded border border-slate-600 hover:bg-slate-800">
                                    <Heart size={40} />
                                </button>

                                <button className="flex h-10 w-10 items-center justify-center rounded border border-slate-600 hover:bg-slate-800">
                                    <Share2 size={40} />
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

                <div className="mt-6 flex flex-col gap-6 lg:flex-row">

                    <div className="flex-1">
                        <div className="overflow-hidden rounded-lg border border-[#1d2733] bg-[#121a24]">

                            <div className="border-b border-[#24303d]">
                                <button
                                    onClick={() => toggleSection(1)}
                                    className="flex w-full items-center justify-between p-4"
                                >
                                    <h2 className="font-semibold">
                                        1. Asosiy donalar
                                    </h2>

                                    {openSection === 1 ? (
                                        <ChevronUp size={18} />
                                    ) : (
                                        <ChevronDown size={18} />
                                    )}
                                </button>

                                {openSection === 1 && (
                                    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                        {courses.slice(0, 3).map((item) => (
                                            <div key={item.id}>
                                                <div className="relative h-[90px] overflow-hidden rounded border border-[#24303d]">

                                                    <Image
                                                        src={normalizeImageSrc(item.image)}
                                                        alt={item.title}
                                                        width={320}
                                                        height={90}
                                                        className="h-full w-full object-cover"
                                                    />

                                                    <div className="absolute inset-0 bg-black/40" />
                                                </div>

                                                <p className="mt-2 text-xs text-white">
                                                    {item.title}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="border-b border-[#24303d]">
                                <button
                                    onClick={() => toggleSection(2)}
                                    className="flex w-full items-center justify-between p-4"
                                >
                                    <h2 className="font-semibold">
                                        2. Eng ko‘p foydalaniladigan donalar
                                    </h2>

                                    {openSection === 2 ? (
                                        <ChevronUp size={18} />
                                    ) : (
                                        <ChevronDown size={18} />
                                    )}
                                </button>
                            </div>

                            <div>
                                <button
                                    onClick={() => toggleSection(3)}
                                    className="flex w-full items-center justify-between p-4"
                                >
                                    <h2 className="font-semibold">
                                        3. Mot qilish oson bo‘lgan donalar
                                    </h2>

                                    {openSection === 3 ? (
                                        <ChevronUp size={18} />
                                    ) : (
                                        <ChevronDown size={18} />
                                    )}
                                </button>
                            </div>

                        </div>
                    </div>

                    <div className="w-[300px] flex-shrink-0">
                        <YouthCard />
                    </div>

                </div>

                <CourseReviews />

            </div>
        </div>
    );}
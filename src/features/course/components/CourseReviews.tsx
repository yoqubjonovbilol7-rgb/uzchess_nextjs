"use client";

import { useEffect, useRef, useState } from "react";
import { MoreVertical, Star, X, TriangleAlert } from "lucide-react";
import api from "@/lib/api";

const BASE = 'http://localhost:3001';

interface ReportCategory { id: number; title: string; order?: number; }

interface CourseReview {
    id: number;
    userId: number;
    courseId: number;
    rating: string;
    comment: string;
    date: string;
    user?: { id?: number; fullName?: string; avatar?: string; };
    fullName?: string;
    avatar?: string;
}

interface ReviewResponse {
    totalCount: number;
    totalPages: number;
    previousPage: number | null;
    currentPage: number;
    nextPage: number | null;
    data: CourseReview[];
}

export default function CourseReviews() {
    const [reviews, setReviews] = useState<CourseReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [reportId, setReportId] = useState<number | null>(null);
    const [reportSent, setReportSent] = useState(false);
    const [reportStep, setReportStep] = useState<1 | 2>(1);
    const [reportCategoryId, setReportCategoryId] = useState<number | null>(null);
    const [reportText, setReportText] = useState("");
    const [reportLoading, setReportLoading] = useState(false);
    const [categories, setCategories] = useState<ReportCategory[]>([]);
    const menuRef = useRef<HTMLDivElement>(null);


    useEffect(() => {
        const getReviews = async () => {
            try {
                const res = await fetch("http://localhost:3001/public/courseReviews", { cache: "no-store" });
                const data: ReviewResponse = await res.json();
                setReviews(Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error("Reviewlarni olishda xatolik:", error);
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };
        getReviews();
    }, []);

    useEffect(() => {
        fetch(`${BASE}/public/reportCategory`)
            .then(r => r.json())
            .then(d => setCategories(Array.isArray(d) ? d : d.data ?? []))
            .catch(() => {});
    }, []);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    function openReport(id: number) {
        setOpenMenuId(null);
        setReportId(id);
        setReportSent(false);
        setReportStep(1);
        setReportCategoryId(null);
        setReportText("");
    }

    function closeReport() {
        setReportId(null);
        setReportSent(false);
        setReportStep(1);
        setReportCategoryId(null);
        setReportText("");
    }

    async function handleReportSubmit() {
        if (!reportId) return;
        setReportLoading(true);
        try {
            const body: Record<string, unknown> = { target: 'course', targetId: reportId };
            if (reportCategoryId) body.categoryId = reportCategoryId;
            if (reportText) body.description = reportText;
            await api.post('/public/report', body);
            setReportSent(true);
            setTimeout(closeReport, 1500);
        } catch {
            setReportSent(true);
            setTimeout(closeReport, 1500);
        } finally {
            setReportLoading(false);
        }
    }

    if (loading) {
        return (
            <section className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl mt-12">
                <h2 className="mb-6 text-3xl font-bold">Kurs haqida izohlar</h2>
                <div className="rounded-xl border border-[#1d2733] bg-[#121a24] p-8 text-center text-slate-400">Yuklanmoqda...</div>
            </section>
        );
    }

    if (reviews.length === 0) {
        return (
            <section className="mt-12">
                <h2 className="mb-6 text-3xl font-bold">Kurs haqida izohlar</h2>
                <div className="rounded-xl border border-[#1d2733] bg-[#121a24] p-10 text-center text-slate-400">Hozircha izohlar mavjud emas</div>
            </section>
        );
    }

    const visibleReviews = showAll ? reviews : reviews.slice(0, 3);

    return (
        <>
            <section className="mt-12">
                <h2 className="mb-6 text-3xl font-bold">Kurs haqida izohlar</h2>

                <div className="overflow-hidden rounded-xl border border-[#1d2733] bg-[#121a24]">
                    {visibleReviews.map((review, index) => {
                        const avatarUrl = review.user?.avatar ?? review.avatar;
                        const name = review.user?.fullName ?? review.fullName ?? `Foydalanuvchi ${review.userId}`;
                        const initials = name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();

                        return (
                            <div key={review.id} className={`p-5 ${index !== visibleReviews.length - 1 ? "border-b border-[#24303d]" : ""}`}>
                                <div className="flex justify-between">
                                    <div className="flex gap-3">
                                        {avatarUrl ? (
                                            <img src={avatarUrl} alt="avatar" className="w-12 h-12 rounded-full object-cover shrink-0" />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-[#2196F3] flex items-center justify-center text-white text-sm font-bold shrink-0 select-none">
                                                {initials}
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-medium">{name}</h3>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-xs text-slate-400">{new Date(review.date).toLocaleDateString("uz-UZ")}</span>
                                                <div className="flex">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={12}
                                                            fill={i < Math.floor(Number(review.rating)) ? "#FACC15" : "none"}
                                                            className={i < Math.floor(Number(review.rating)) ? "text-yellow-400" : "text-slate-600"}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-slate-400">({review.rating})</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="relative" ref={openMenuId === review.id ? menuRef : undefined}>
                                        <button onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)}>
                                            <MoreVertical size={18} className="text-slate-400 hover:text-white transition-colors" />
                                        </button>
                                        {openMenuId === review.id && (
                                            <div className="absolute right-0 top-7 w-44 bg-[#13181C] border border-[#2A2A2A] rounded-xl shadow-xl z-20 overflow-hidden">
                                                <button
                                                    onClick={() => openReport(review.id)}
                                                    className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#1E2428] transition-colors flex items-center gap-2"
                                                >
                                                    <TriangleAlert size={14} className="shrink-0 text-yellow-400" />
                                                    Shikoyat berish
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-7 text-slate-300">{review.comment}</p>
                            </div>
                        );
                    })}
                </div>

                {reviews.length > 3 && (
                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="rounded-lg bg-[#1c2530] px-8 py-3 text-sm font-medium hover:bg-[#24303d]"
                        >
                            {showAll ? "Kamroq izohlar" : "Barcha izohlar"}
                        </button>
                    </div>
                )}
            </section>

            {reportId !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 mx-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                {reportStep === 2 && !reportSent && (
                                    <button onClick={() => setReportStep(1)} className="text-gray-400 hover:text-white transition-colors">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                )}
                                <h3 className="text-white font-semibold text-lg">Shikoyat qilish</h3>
                            </div>
                            <button onClick={closeReport} className="text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {reportSent ? (
                            <div className="flex flex-col items-center gap-3 py-6">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-white font-medium">Shikoyat yuborildi!</p>
                            </div>
                        ) : reportStep === 1 ? (
                            <div className="flex flex-col divide-y divide-[#2A2A2A]">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id || cat.title}
                                        onClick={() => { setReportCategoryId(cat.id || null); setReportStep(2); }}
                                        className="flex items-center justify-between w-full px-2 py-4 text-left text-white text-sm hover:bg-[#1E2428] transition-colors"
                                    >
                                        <span>{cat.title}</span>
                                        <svg className="w-4 h-4 text-gray-400 shrink-0 ml-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Shikoyat matni <span className="text-gray-500">(ixtiyoriy)</span></label>
                                    <textarea
                                        value={reportText}
                                        onChange={e => setReportText(e.target.value)}
                                        placeholder="Shikoyatingizni yozing..."
                                        rows={4}
                                        className="w-full bg-[#1A1D1F] border border-[#2A2A2A] text-white text-sm rounded-xl px-4 py-3 outline-none resize-none placeholder:text-gray-600"
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={closeReport} className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#2A2A2A] text-white hover:bg-[#333] transition-colors">
                                        Bekor qilish
                                    </button>
                                    <button onClick={handleReportSubmit} disabled={reportLoading}
                                        className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#2196F3] text-white hover:bg-[#1976D2] disabled:opacity-60 transition-colors">
                                        {reportLoading ? 'Yuborilmoqda...' : 'Yuborish'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
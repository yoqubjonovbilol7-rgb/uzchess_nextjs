"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    Star, Bookmark, Share2,
    ChevronUp, ChevronDown, Award, Check, Play,
    User, BookOpen, PlayCircle,
} from "lucide-react";

import CourseReviews from "./CourseReviews";
import YouthCard from "@/features/shared/components/YouthCard/YouthCard";
import {toggleSavedCourse, isSavedCourse, isPurchasedCourse, addPurchasedCourse} from "@/lib/saved";

const BASE = "http://localhost:3001";

interface Props { course: any; }
interface Section { id: number; title: string; order: number | null; }
interface Lesson {
    id: number; courseSectionId: number; title: string;
    thumbnail: string | null; video: string; isFree: boolean;
    order: number | null; duration?: number;
}

function norm(image?: string) {
    if (!image) return "";
    const s = image.replace(/\\/g, "/");
    return s.startsWith("http") ? s : `${BASE}/${s}`;
}

function fmtDur(sec?: number) {
    if (!sec) return "07:20";
    return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}`;
}

function fmtPrice(val: number | string) {
    const n = Number(val);
    if (isNaN(n)) return String(val);
    return n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

type PurchaseStep = "select" | "processing" | "success" | "fail";
type PayMethod = "paylov" | "payme" | "click" | "uzum";

export default function CourseDetail({ course }: Props) {
    const router = useRouter();
    const [sections, setSections] = useState<Section[]>([]);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [openSection, setOpenSection] = useState<number | null>(null);
    const [isPurchased, setIsPurchased] = useState(false);
    const [saved, setSaved] = useState(() => isSavedCourse(course?.id));
    const [lastLesson, setLastLesson] = useState<Lesson | null>(null);
    const [watchedIds, setWatchedIds] = useState<Set<number>>(new Set());

    const [showLocked, setShowLocked] = useState(false);
    const [showPurchase, setShowPurchase] = useState(false);
    const [purchaseStep, setPurchaseStep] = useState<PurchaseStep>("select");
    const [payMethod, setPayMethod] = useState<PayMethod>("paylov");
    const [showShare, setShowShare] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = typeof window !== "undefined" ? window.location.href : `https://uzchess.uz/kurslar/${course?.id}`;

    function copyUrl() {
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    function openBuy() {
        setPurchaseStep("select");
        setPayMethod("paylov");
        setShowPurchase(true);
    }

    async function handleBuy() {
        const token = localStorage.getItem("token");
        if (!token) {
            setShowPurchase(false);
            router.push("/auth/sign-in");
            return;
        }
        setPurchaseStep("processing");
        addPurchasedCourse({
            id: course.id,
            title: course.title,
            image: course.image,
            description: course.description,
            author: course.author,
            difficulty: course.difficulty,
            lessonsCount: course.lessonsCount,
            rating: course.rating,
        });
        setIsPurchased(true);

        try {
            let userId: number | undefined;
            try { const p = JSON.parse(atob(token.split(".")[1])); userId = p.id ?? p.userId ?? p.sub; } catch {}
            await axios.post(`${BASE}/admin/purchasedCourse`,
                { courseId: course.id, userId: Number(userId), date: new Date().toISOString() },
                { headers: { Authorization: `Bearer ${token}` } });
        } catch {}

        setPurchaseStep("success");
    }

    useEffect(() => {
        if (isPurchasedCourse(course?.id)) {
            setIsPurchased(true);
            return;
        }
        const token = localStorage.getItem("token");
        if (!token) return;
        axios.get(`${BASE}/public/purchasedCourse`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => {
                const list = Array.isArray(r.data?.data) ? r.data.data
                    : Array.isArray(r.data) ? r.data : [];
                const backendPurchased = list.some((x: any) =>
                    Number(x.courseId) === Number(course.id) ||
                    Number(x.course?.id) === Number(course.id)
                );
                if (backendPurchased) setIsPurchased(true);
            }).catch(() => {});
    }, [course.id]);

    useEffect(() => {
        try {
            const stored = localStorage.getItem(`watched_${course.id}`);
            if (stored) setWatchedIds(new Set(JSON.parse(stored)));
        } catch {}
    }, [course.id]);

    function markWatched(lessonId: number) {
        setWatchedIds(prev => {
            const next = new Set(prev);
            next.add(lessonId);
            try { localStorage.setItem(`watched_${course.id}`, JSON.stringify([...next])); } catch {}
            return next;
        });
    }

    useEffect(() => {
        let ignore = false;
        Promise.all([
            fetch(`${BASE}/public/courseSection`).then(r => r.json()),
            fetch(`${BASE}/public/courseLesson`).then(r => r.json()),
        ]).then(([sd, ld]) => {
            if (ignore) return;
            const allSections: Section[] = Array.isArray(sd?.data) ? sd.data : Array.isArray(sd?.items) ? sd.items : Array.isArray(sd) ? sd : [];
            const allLessons: Lesson[] = Array.isArray(ld?.data) ? ld.data : Array.isArray(ld?.items) ? ld.items : Array.isArray(ld) ? ld : [];
            const sArr = allSections.filter((s: any) => Number(s.courseId) === Number(course.id));
            const rawLessons = allLessons.filter((l: any) => Number(l.courseId) === Number(course.id));
            const lArr = rawLessons.map((l, i) => ({ ...l, id: l.id ?? `gen-${l.courseSectionId}-${i}` }));
            setSections(sArr);
            setLessons(lArr);
            if (sArr.length > 0) setOpenSection(Number(sArr[0].id));
            if (lArr.length > 0) setLastLesson(lArr[0]);
        }).catch(() => {});
        return () => { ignore = true; };
    }, [course.id]);

    function handleSave() {
        toggleSavedCourse({ id: course.id, title: course.title, image: course.image, author: course.author, rating: course.rating, lessonsCount: course.lessonsCount });
        setSaved(v => !v);
    }

    const newPrice = Number(course.newPrice ?? course.price ?? 0);
    const oldPrice = Number(course.price ?? 0);
    const isFree = newPrice === 0;
    const hasDiscount = !isFree && course.newPrice && course.price && newPrice !== oldPrice;

    const payMethods: { id: PayMethod; logo: React.ReactNode }[] = [
        { id: "paylov", logo: <span className="text-sm font-bold text-white tracking-wide">Paylov</span> },
        { id: "payme",  logo: <span className="text-sm font-bold text-white">Pay<span className="text-green-400">me</span></span> },
        { id: "click",  logo: (
            <span className="flex items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-[#2196F3] flex items-center justify-center flex-shrink-0">
                    <svg viewBox="0 0 20 20" className="w-3 h-3 text-white" fill="currentColor"><circle cx="10" cy="10" r="4"/></svg>
                </span>
                <span className="text-sm font-bold text-white">click<sup className="text-[9px] text-blue-300">UP</sup></span>
            </span>
        )},
        { id: "uzum",   logo: (
            <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-[#1A1A2E] border border-[#333] flex items-center justify-center flex-shrink-0 text-[9px] font-bold text-white">U</span>
                <span className="text-sm font-bold text-white leading-tight">uzum<br/><span className="text-[10px] font-normal text-gray-400">bank</span></span>
            </span>
        )},
    ];

    return (
        <>
        <div className="min-h-screen text-white">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="relative overflow-hidden rounded-2xl border border-[#1d2733] mb-6" style={{ height: '180px' }}>
                    <div className="absolute inset-0">
                        {course.image && (
                            <Image src={norm(course.image)} alt={course.title} fill priority unoptimized className="object-cover" />
                        )}
                    </div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between px-6 py-4 gap-4">
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-snug">
                                {course.title}
                            </h1>

                            <div className="flex items-center gap-2 mb-4">
                                {isFree ? (
                                    <span className="text-xl font-bold text-green-400">Bepul</span>
                                ) : (
                                    <>
                                        <svg viewBox="0 0 20 20" className="w-5 h-5 flex-shrink-0" fill="none">
                                            <circle cx="10" cy="10" r="9" fill="#2196F3" opacity="0.2" stroke="#2196F3" strokeWidth="1.2"/>
                                            <circle cx="10" cy="10" r="6" fill="#2196F3" opacity="0.35"/>
                                            <text x="10" y="14" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#4FC3F7">$</text>
                                        </svg>
                                        <span className="text-lg font-bold text-white">
                                            {fmtPrice(newPrice)} UZS
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-sm text-gray-400 line-through">
                                                {fmtPrice(oldPrice)} uzs
                                            </span>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-5 text-xs text-slate-300 flex-wrap">
                                {course.difficulty?.title && (
                                    <div className="flex items-center gap-1.5">
                                        {course.difficulty?.icon
                                            ? <Image src={norm(course.difficulty.icon)} alt="" width={14} height={14} unoptimized />
                                            : <User size={13} className="text-slate-400" />
                                        }
                                        <span>{course.difficulty.title}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5">
                                    <BookOpen size={13} className="text-slate-400" />
                                    <span>{course.sectionsCount ?? sections.length} ta bo&apos;lim</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <PlayCircle size={13} className="text-slate-400" />
                                    <span>{course.lessonsCount ?? lessons.length} ta dars</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-3 flex-shrink-0">
                            <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Star key={i} size={16}
                                        fill={i < Math.round(Number(course.rating)) ? "#FACC15" : "none"}
                                        className={i < Math.round(Number(course.rating)) ? "text-yellow-400" : "text-slate-600"}
                                    />
                                ))}
                                <span className="ml-1.5 text-sm font-semibold text-white">{course.rating}</span>
                                <span className="text-xs text-slate-400 ml-0.5">({course.reviewsCount} ta izoh)</span>
                            </div>

                            <div className="flex items-center gap-2">
                                {isPurchased ? (
                                    <>
                                        <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
                                            <Check size={15} /> Sotib olingan
                                        </span>
                                        <button
                                            onClick={() => router.push(`/courses/${course.id}/certificate`)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#2196F3] text-white text-sm font-medium hover:bg-[#1976D2] transition-colors">
                                            <Award size={15} /> Sertifikat
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={openBuy}
                                        className="px-6 py-2.5 rounded-lg bg-[#2196F3] text-sm font-semibold text-white hover:bg-[#1976D2] transition-colors whitespace-nowrap">
                                        Kursni sotib olish
                                    </button>
                                )}
                                <button onClick={handleSave}
                                    className={`flex h-10 w-10 items-center justify-center rounded-lg border transition-colors ${saved ? "bg-[#2196F3] border-[#2196F3]" : "border-slate-600 hover:bg-slate-800"}`}>
                                    <Bookmark size={17} fill={saved ? "white" : "none"} />
                                </button>
                                <button onClick={() => setShowShare(true)}
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-600 hover:bg-slate-800 transition-colors">
                                    <Share2 size={17} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    <div className="flex-1 overflow-hidden rounded-xl border border-[#1d2733] bg-[#0d1117]">
                        {sections.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((sec, si) => {
                            const secLessons = lessons
                                .filter(l => Number(l.courseSectionId) === Number(sec.id))
                                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
                            const isLastSec = si === sections.length - 1;
                            return (
                                <div key={sec.id} className={!isLastSec ? "border-b border-[#24303d]" : ""}>
                                    <button
                                        onClick={() => setOpenSection(openSection === Number(sec.id) ? null : Number(sec.id))}
                                        className="flex w-full items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors">
                                        <h2 className="font-semibold text-left text-white">
                                            {si + 1}. {sec.title}
                                        </h2>
                                                        {openSection === Number(sec.id)
                                            ? <ChevronUp size={18} className="flex-shrink-0 text-slate-400" />
                                            : <ChevronDown size={18} className="flex-shrink-0 text-slate-400" />
                                        }
                                    </button>

                                    {openSection === Number(sec.id) && (
                                        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                                            {secLessons.map((lesson, li) => {
                                                const canWatch = lesson.isFree || isPurchased;
                                                const thumb = lesson.thumbnail ? norm(lesson.thumbnail) : "";
                                                const isWatched = watchedIds.has(lesson.id);
                                            const isCurrent = lastLesson?.id === lesson.id;
                                            return (
                                                    <div key={lesson.id} className="cursor-pointer group"
                                                        onClick={() => {
                                                            if (canWatch) {
                                                                if (lastLesson) markWatched(lastLesson.id);
                                                                router.push(`/courses/${course.id}/lesson`);
                                                            } else {
                                                                setShowLocked(true);
                                                            }
                                                        }}>
                                                        <div className="relative overflow-hidden rounded-xl bg-[#1d2733] aspect-square">
                                                            {thumb ? (
                                                                <Image src={thumb} alt={lesson.title} fill unoptimized className="object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-[#13213A]">
                                                                    <Play size={40} className="text-yellow-400/70" fill="rgba(250,204,21,0.7)" />
                                                                </div>
                                                            )}
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />

                                                            {!canWatch && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/55">
                                                                    <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
                                                                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-white drop-shadow">
                                                                <Play size={10} fill="white" className="text-white" />
                                                                <span>{fmtDur(lesson.duration)}</span>
                                                            </div>

                                                            {isWatched && !isCurrent && (
                                                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#22c55e]" />
                                                            )}
                                                            {isCurrent && (
                                                                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-700/60">
                                                                    <div className="h-full w-2/5 bg-[#2196F3]" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <p className="mt-2 text-xs text-white line-clamp-2 leading-snug">
                                                            {si + 1}.{li + 1} {lesson.title}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">
                        <YouthCard />
                        {isPurchased && lastLesson && (
                            <div className="bg-[#121a24] border border-[#1d2733] rounded-xl p-4">
                                <p className="text-sm text-gray-300 mb-3">Siz shu videoni ko&apos;ryotgan edingiz</p>
                                <Link href={`/courses/${course.id}/lesson`} className="relative overflow-hidden rounded-xl cursor-pointer aspect-video block">
                                    {lastLesson.thumbnail ? (
                                        <Image src={norm(lastLesson.thumbnail)} alt={lastLesson.title} fill unoptimized className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-[#1A2535] flex items-center justify-center">
                                            <Play size={28} fill="rgba(250,204,21,0.6)" className="text-yellow-400/60" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/20 hover:bg-black/10 transition-colors" />
                                    <div className="absolute bottom-1.5 left-2 flex items-center gap-1 text-xs text-white drop-shadow">
                                        <Play size={10} fill="white" className="text-white" />
                                        <span>{fmtDur(lastLesson.duration)}</span>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gray-700/60">
                                        <div className="h-full w-2/5 bg-[#2196F3]" />
                                    </div>
                                </Link>
                                <p className="mt-2 text-xs text-white line-clamp-1">{lastLesson.title}</p>
                            </div>
                        )}
                    </div>
                </div>

                <CourseReviews />

            </div>
        </div>

        {showLocked && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.75)' }}
                onClick={() => setShowLocked(false)}>
                <div className="relative flex w-full max-w-[820px] rounded-2xl overflow-hidden shadow-2xl"
                    onClick={e => e.stopPropagation()}>

                    <button onClick={() => setShowLocked(false)}
                        className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>

                    <div className="flex-1 bg-[#1C1F27] flex flex-col items-center justify-center px-10 py-12 gap-6">
                        <svg viewBox="0 0 200 160" className="w-44 h-36" fill="none">
                            <rect x="10" y="8" width="180" height="112" rx="10" fill="#2A2D35" stroke="#3A3D48" strokeWidth="2"/>
                            <rect x="22" y="20" width="156" height="88" rx="5" fill="#13151C"/>
                            <rect x="76" y="120" width="48" height="12" rx="3" fill="#2A2D35"/>
                            <rect x="50" y="132" width="100" height="8" rx="3" fill="#22252E"/>
                            <rect x="80" y="55" width="40" height="34" rx="5" fill="#3A3D48"/>
                            <path d="M88 55 C88 45 112 45 112 55" stroke="#3A3D48" strokeWidth="8" strokeLinecap="round" fill="none"/>
                            <circle cx="100" cy="68" r="5" fill="#9CA3AF"/>
                            <rect x="98" y="68" width="4" height="8" rx="2" fill="#9CA3AF"/>
                        </svg>

                        <div className="text-center">
                            <h2 className="text-white font-bold text-xl leading-snug mb-3">
                                Kursni davom ettirish uchun<br/>to&apos;lovni amalga oshirishingiz zarur.
                            </h2>
                            <p className="text-[#9CA3AF] text-sm leading-relaxed">
                                Biz bilan shaxmatni qayta kashf eting, keyingi darsliklardan ko&apos;plab ma&apos;lumotlar olishingiz mumkin.
                            </p>
                        </div>

                        <button
                            onClick={() => { setShowLocked(false); openBuy(); }}
                            className="w-full py-3.5 rounded-xl bg-[#2196F3] hover:bg-[#1976D2] text-white font-semibold text-base transition-colors">
                            Sotib olish
                        </button>
                    </div>

                    <div className="w-[360px] flex-shrink-0 relative overflow-hidden"
                        style={{ background: 'linear-gradient(145deg, #0D2A4A 0%, #1A3A60 40%, #0A1929 100%)' }}>
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: 'radial-gradient(circle at 30% 20%, #2196F3 0%, transparent 60%)' }} />

                        <div className="absolute top-8 left-6 right-6 rounded-xl overflow-hidden shadow-2xl border border-white/10"
                            style={{ background: '#0D1117' }}>
                            <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10">
                                <div className="w-2 h-2 rounded-full bg-red-500/70"/>
                                <div className="w-2 h-2 rounded-full bg-yellow-400/70"/>
                                <div className="w-2 h-2 rounded-full bg-green-500/70"/>
                                <div className="flex-1 mx-2 h-4 bg-white/5 rounded text-[8px] text-white/30 flex items-center px-2">uzchess.uz</div>
                            </div>
                            <div className="p-2">
                                <div className="h-3 bg-[#2196F3]/20 rounded mb-1.5 w-3/4"/>
                                <div className="h-2 bg-white/5 rounded mb-1 w-full"/>
                                <div className="h-2 bg-white/5 rounded mb-1 w-5/6"/>
                                <div className="grid grid-cols-3 gap-1.5 mt-2">
                                    {[...Array(6)].map((_, i) => (
                                        <div key={i} className="h-12 rounded bg-[#1A2535] border border-white/5 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-[#2196F3]/50" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M8 5v14l11-7z"/>
                                            </svg>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-6 right-6">
                            <p className="text-white font-black text-2xl leading-tight tracking-tight">
                                <span className="text-white">Shaxmatni</span>
                            </p>
                            <p className="text-[#9CA3AF] text-base font-light tracking-widest">biz bilan o&apos;rganing!</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {showPurchase && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
                <button onClick={() => setShowPurchase(false)}
                    className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#2A2D35] hover:bg-[#3A3D45] flex items-center justify-center text-white z-10 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="w-full max-w-[430px] bg-[#1C2028] rounded-2xl overflow-hidden">

                    {purchaseStep === "select" && (
                        <div className="p-8 flex flex-col items-center gap-5">
                            <div className="w-20 h-20 rounded-full bg-[#2A2D35] flex items-center justify-center">
                                <svg viewBox="0 0 56 48" fill="none" className="w-10 h-10">
                                    <rect x="1" y="1" width="54" height="37" rx="4" fill="#3A3D45" stroke="#555" strokeWidth="1.5"/>
                                    <rect x="4" y="4" width="48" height="31" rx="2" fill="#1A1D24"/>
                                    <rect x="18" y="38" width="20" height="4" rx="1.5" fill="#3A3D45"/>
                                    <rect x="10" y="42" width="36" height="3" rx="1.5" fill="#333"/>
                                    <circle cx="28" cy="19" r="9" fill="#F59E0B" opacity="0.9"/>
                                    <circle cx="28" cy="19" r="7" fill="#FBBF24"/>
                                    <text x="28" y="23" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#92400E">$</text>
                                </svg>
                            </div>

                            <div className="w-full bg-[#13151C] rounded-xl p-4 text-center">
                                <p className="text-gray-400 text-xs mb-1">Xarid qilinayotgan kurs:</p>
                                <p className="text-white font-bold text-base mb-2 line-clamp-2">{course.title}</p>
                                <div className="flex items-center justify-center gap-2">
                                    {isFree ? (
                                        <span className="text-green-400 font-bold text-lg">Bepul</span>
                                    ) : (
                                        <>
                                            <span className="text-xl">ðŸ’°</span>
                                            <span className="text-white font-bold text-lg">{fmtPrice(newPrice)} UZS</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="w-full">
                                <p className="text-white text-sm font-medium mb-3">To&apos;lov usulini tanlang</p>
                                <div className="grid grid-cols-2 gap-3">
                                    {payMethods.map(m => (
                                        <button key={m.id} onClick={() => setPayMethod(m.id)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${payMethod === m.id ? "border-[#2196F3] bg-[#2196F3]/10" : "border-[#2A2D35] bg-[#13151C]"}`}>
                                            <span>{m.logo}</span>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-2 ${payMethod === m.id ? "border-[#2196F3]" : "border-gray-500"}`}>
                                                {payMethod === m.id && <div className="w-2.5 h-2.5 rounded-full bg-[#2196F3]" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 w-full">
                                <button onClick={() => setShowPurchase(false)}
                                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#2A2D35] text-white hover:bg-[#353840] transition-colors">
                                    Bekor qilish
                                </button>
                                <button onClick={handleBuy}
                                    className="flex-1 py-3 rounded-xl text-sm font-semibold bg-[#2196F3] text-white hover:bg-[#1976D2] transition-colors">
                                    Davom etish
                                </button>
                            </div>
                        </div>
                    )}

                    {purchaseStep === "processing" && (
                        <div className="p-8 flex flex-col items-center gap-5 text-center">
                            <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                <span className="text-4xl">â³</span>
                            </div>
                            <h3 className="text-white font-bold text-2xl">Jarayonda...</h3>
                            <p className="text-gray-400 text-sm">To&apos;lov amalga oshish jarayonida</p>
                            <button onClick={() => setShowPurchase(false)}
                                className="w-full py-3 rounded-xl bg-[#2196F3] text-white font-semibold text-sm hover:bg-[#1976D2] transition-colors">
                                Tushunarli
                            </button>
                        </div>
                    )}

                    {purchaseStep === "success" && (
                        <div className="p-8 flex flex-col items-center gap-5 text-center">
                            <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-white font-bold text-2xl leading-snug">Kurs muvaffaqiyatli sotib olindi</h3>
                            <p className="text-gray-400 text-sm">Tabriklaymiz siz kursni muvaffaqiyatli sotib oldingiz!</p>
                            <button onClick={() => { setShowPurchase(false); router.push(`/courses/${course.id}/lesson`); }}
                                className="w-full py-3 rounded-xl bg-[#2196F3] text-white font-semibold text-sm hover:bg-[#1976D2] transition-colors">
                                Kursni ko&apos;rish
                            </button>
                        </div>
                    )}

                    {purchaseStep === "fail" && (
                        <div className="p-8 flex flex-col items-center gap-5 text-center">
                            <div className="w-20 h-20 rounded-full bg-red-500 flex items-center justify-center">
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h3 className="text-white font-bold text-2xl">Xatolik yuz berdi</h3>
                            <p className="text-gray-400 text-sm">Kursni sotib olish jarayonida xatolik yuz berdi. Iltimos qayta urunib ko&apos;ring</p>
                            <button onClick={() => setPurchaseStep("select")}
                                className="w-full py-3 rounded-xl bg-[#2196F3] text-white font-semibold text-sm hover:bg-[#1976D2] transition-colors">
                                Qayta urunib ko&apos;rish
                            </button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {showShare && (
            <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4"
                onClick={() => setShowShare(false)}>
                <div className="w-full max-w-[430px] bg-[#1C2028] rounded-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}>

                    <div className="flex items-center justify-between px-6 py-4 border-b border-[#2A2D35]">
                        <h3 className="text-white font-bold text-lg">Ulashish</h3>
                        <button onClick={() => setShowShare(false)}
                            className="w-8 h-8 rounded-full hover:bg-[#2A2D35] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6 flex flex-col gap-4">
                        <div className="bg-[#13151C] rounded-xl py-4 flex items-center justify-center gap-8">
                            {[
                                { label: "Instagram", icon: (<svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>) },
                                { label: "Telegram", icon: (<svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>) },
                                { label: "Twitter", icon: (<svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>) },
                                { label: "Facebook", icon: (<svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>) },
                            ].map(s => (
                                <button key={s.label} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity">
                                    {s.icon}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 bg-[#13151C] rounded-xl px-4 py-3 border border-[#2A2D35]">
                            <span className="flex-1 text-sm text-gray-300 truncate">{shareUrl}</span>
                            <button onClick={copyUrl}
                                className="flex-shrink-0 w-9 h-9 bg-[#2A2D35] hover:bg-[#3A3D45] rounded-lg flex items-center justify-center transition-colors">
                                {copied ? (
                                    <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

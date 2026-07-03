'use client';

import { useEffect, useRef, useState } from 'react';;
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Lock, Play, SkipBack, SkipForward, Settings, Maximize } from 'lucide-react';
import YouthCard from '@/features/shared/components/YouthCard/YouthCard';

const BASE = 'http://localhost:3001';

function norm(src?: string) {
    if (!src) return '';
    const s = src.replace(/\\/g, '/');
    return s.startsWith('http') ? s : `${BASE}/${s}`;
}

function fmt(sec: number) {
    if (!isFinite(sec) || isNaN(sec)) return '00:00';
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface Lesson {
    id: number; title: string; video?: string; thumbnail?: string;
    content?: string; isFree?: boolean; order?: number; duration?: number;
}

interface Props {
    course: any; lessons: Lesson[]; currentIdx: number;
    onPrev: () => void; onNext: () => void;
    onSelect: (i: number) => void; courseId: string; isPurchased?: boolean;
}

export default function LessonView({ course, lessons, currentIdx, onPrev, onNext, onSelect, courseId, isPurchased = false }: Props) {
    const router = useRouter();
    const lesson = lessons[currentIdx];
    const nextLesson = lessons[currentIdx + 1] ?? null;
    const videoRef = useRef<HTMLVideoElement>(null);

    const [completed, setCompleted] = useState<Set<number>>(new Set());
    const [videoEnded, setVideoEnded] = useState(false);
    const [countdown, setCountdown] = useState(20);
    const [showTooltip, setShowTooltip] = useState(false);
    const [curTime, setCurTime] = useState(0);
    const [dur, setDur] = useState(0);
    const [playing, setPlaying] = useState(false);

    const [showLocked, setShowLocked] = useState(false);
    const [showCert, setShowCert] = useState(false);

    const isLast = currentIdx === lessons.length - 1;
    const isFirst = currentIdx === 0;

    /* ── Backend: tugallangan darslarni yuklash ── */
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        fetch(`${BASE}/public/userLesson`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                const list: { courseLessonId: number; isCompleted: boolean; stoppedAt?: number }[] =
                    Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
                const ids = new Set<number>(
                    list
                        .filter(ul => ul.isCompleted)
                        .map(ul => Number(ul.courseLessonId))
                        .filter(Boolean)
                );
                if (ids.size) setCompleted(ids);
            })
            .catch(() => {});
    }, [courseId]);

    /* ── Backend: darsni tugallangan / to'xtatilgan joyini saqlash ── */
    async function saveUserLesson(courseLessonId: number, isCompleted: boolean, stoppedAt?: number) {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            await fetch(`${BASE}/public/userLesson`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ courseLessonId, isCompleted, stoppedAt: stoppedAt ?? 0 }),
            });
        } catch { /* silent */ }
    }

    function markLessonDone(lessonId: number) {
        setCompleted(prev => { const n = new Set(prev); n.add(lessonId); return n; });
        void saveUserLesson(lessonId, true, videoRef.current?.currentTime ?? 0);
    }

    useEffect(() => {
        if (videoRef.current) { videoRef.current.load(); }
        setVideoEnded(false);
        setCountdown(20);
        setCurTime(0);
        setDur(0);
        setPlaying(false);
    }, [lesson?.id]);

    useEffect(() => {
        if (!videoEnded || isLast) return;
        const timer = setInterval(() => {
            setCountdown(c => {
                if (c <= 1) { clearInterval(timer); goNext(); return 0; }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [videoEnded, isLast]);

    function goNext() { setVideoEnded(false); setCountdown(20); onNext(); }

    function onVideoEnded() {
        markLessonDone(lesson.id);
        if (isLast) { setShowCert(true); }
        else { setVideoEnded(true); setCountdown(20); }
    }

    function markDone() {
        markLessonDone(lesson.id);
        if (isLast) { setShowCert(true); }
        else { goNext(); }
    }

    function isLocked(l: Lesson) { return !l.isFree && !isPurchased; }

    function togglePlay() {
        if (!videoRef.current) return;
        if (videoRef.current.paused) { videoRef.current.play().catch(() => {}); }
        else { videoRef.current.pause(); }
    }

    const videoSrc = lesson?.video ? norm(lesson.video) : '';
    const thumbSrc = lesson?.thumbnail ? norm(lesson.thumbnail) : '';
    const nextThumb = nextLesson?.thumbnail ? norm(nextLesson.thumbnail) : '';

    return (
        <div className="text-white">
<div className="flex min-h-[calc(100vh-57px)]">
                {/* Left main */}
                <div className="flex-1 flex flex-col overflow-y-auto">

                    {/* Title */}
                    <div className="px-6 pt-5 pb-2">
                        <h1 className="text-xl font-bold text-white">{course?.title}</h1>
                        <p className="text-xs text-gray-500 mt-1">
                            {(() => {
                                const MONTHS = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
                                const n = new Date();
                                const h = String(n.getHours()).padStart(2,'0');
                                const mi = String(n.getMinutes()).padStart(2,'0');
                                return `${MONTHS[n.getMonth()]} ${n.getDate()}, ${n.getFullYear()} • ${h}:${mi}`;
                            })()}
                        </p>
                    </div>

                    {/* Video area + controls */}
                    <div className="mx-6 mb-1 rounded-xl overflow-hidden bg-[#0D1628] border border-[#1d2733]">

                        {/* Video / ended state */}
                        <div style={{ aspectRatio: '16/9' }} className="relative w-full">
                            {videoEnded && nextLesson ? (
                                /* Single2 - countdown */
                                <div className="w-full h-full bg-[#0D1628] flex flex-col relative">
                                    {/* Countdown — centered upper area */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <p className="text-base text-gray-300">
                                            <span className="text-[#2196F3] font-bold text-3xl mr-1">{countdown}</span>
                                            soniyada o&apos;ynaydi
                                        </p>
                                    </div>
                                    {/* Next lesson info — bottom */}
                                    <div className="flex items-end px-5 pb-4 gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs text-gray-400 mb-1">Keyingisi:</p>
                                            <p className="text-white font-bold text-sm mb-1.5 line-clamp-1">{nextLesson.title}</p>
                                            {nextLesson.content && (
                                                <p className="text-gray-400 text-xs leading-5 line-clamp-3">{nextLesson.content}</p>
                                            )}
                                        </div>
                                        <div onClick={goNext}
                                            className="relative w-32 h-[72px] rounded-xl overflow-hidden flex-shrink-0 cursor-pointer">
                                            {nextThumb
                                                ? <Image src={nextThumb} alt={nextLesson.title} fill className="object-cover" />
                                                : <div className="w-full h-full bg-[#1A2535] flex items-center justify-center">
                                                    <Play size={20} fill="rgba(250,204,21,0.6)" className="text-yellow-400/60" />
                                                  </div>
                                            }
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors">
                                                <div className="w-9 h-9 rounded-full bg-[#2196F3] flex items-center justify-center">
                                                    <Play size={16} fill="white" className="text-white ml-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : videoSrc ? (
                                <video ref={videoRef} className="w-full h-full"
                                    onEnded={onVideoEnded}
                                    onPlay={() => setPlaying(true)}
                                    onPause={() => setPlaying(false)}
                                    onTimeUpdate={() => setCurTime(videoRef.current?.currentTime ?? 0)}
                                    onLoadedMetadata={() => setDur(videoRef.current?.duration ?? 0)}>
                                    <source src={videoSrc} />
                                </video>
                            ) : thumbSrc ? (
                                <div className="relative w-full h-full">
                                    <Image src={thumbSrc} alt={lesson?.title ?? ''} fill className="object-cover" />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                            <Play size={28} fill="white" className="text-white ml-1" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Play size={48} className="text-gray-600" />
                                </div>
                            )}
                        </div>

                        <div className={`px-4 py-3 border-t border-[#1d2733] ${videoEnded ? 'opacity-30 pointer-events-none' : ''}`}>
                            <div className="w-full h-1 bg-[#2A2D35] rounded-full mb-2.5 cursor-pointer relative"
                                onClick={e => {
                                    if (!videoRef.current || !dur) return;
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    videoRef.current.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
                                }}>
                                <div className="h-full bg-[#2196F3] rounded-full"
                                    style={{ width: dur ? `${(curTime / dur) * 100}%` : '0%' }} />
                            </div>
                            <div className="flex items-center gap-3">
                                <button onClick={() => { if (videoRef.current) videoRef.current.currentTime -= 10; }}
                                    className="text-white hover:text-gray-300 transition-colors">
                                    <SkipBack size={17} />
                                </button>
                                <button onClick={togglePlay} className="text-white hover:text-gray-300 transition-colors">
                                    {playing ? (
                                        <svg className="w-5 h-5" fill="white" viewBox="0 0 24 24">
                                            <rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>
                                        </svg>
                                    ) : <Play size={18} fill="white" className="ml-0.5" />}
                                </button>
                                <button onClick={() => { if (videoRef.current) videoRef.current.currentTime += 10; }}
                                    className="text-white hover:text-gray-300 transition-colors">
                                    <SkipForward size={17} />
                                </button>
                                <span className="text-xs text-white ml-1">{fmt(curTime)} | {fmt(dur)}</span>
                                <div className="flex-1" />
                                <Settings size={15} className="text-gray-400" />
                                <button onClick={() => videoRef.current?.requestFullscreen()}
                                    className="text-gray-400 hover:text-white transition-colors">
                                    <Maximize size={15} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {lesson?.content && (
                        <div className="px-6 py-4">
                            <p className="text-gray-300 text-sm leading-7 whitespace-pre-wrap">{lesson.content}</p>
                        </div>
                    )}

                    <div className="border-t border-[#1A1A1A] px-6 py-4 flex items-center justify-between mt-auto">
                        <button onClick={onPrev} disabled={isFirst}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium disabled:opacity-40 hover:bg-[#252525] transition-colors">
                            <ChevronLeft size={16} /> Oldingi
                        </button>

                        <div className="relative"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}>
                            <button onClick={markDone}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#252525] transition-colors">
                                {isLast ? 'Kursni tugatish' : 'Keyingni'} <ChevronRight size={16} />
                            </button>

                            {showTooltip && nextLesson && (
                                <div className="absolute bottom-full right-0 mb-2 bg-[#1C2028] border border-[#2A2D35] rounded-xl p-3 w-56 shadow-2xl z-20 pointer-events-none">
                                    <div className="flex items-start gap-2.5">
                                        <div className="w-9 h-9 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-lg">🏆</div>
                                        <div className="min-w-0">
                                            <p className="text-white text-sm font-medium line-clamp-2 leading-snug">{nextLesson.title}</p>
                                            {nextLesson.duration && (
                                                <p className="text-gray-400 text-xs mt-1">{fmt(nextLesson.duration)}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right sidebar */}
                <div className="w-[260px] border-l border-[#1A1A1A] flex flex-col overflow-hidden flex-shrink-0">
                    {/* Lesson list */}
                    <div className="overflow-y-auto flex-1">
                        {lessons.map((l, i) => {
                            const isDone = completed.has(l.id);
                            const isCurrent = i === currentIdx;
                            const locked = isLocked(l);
                            return (
                                <button key={l.id}
                                    onClick={() => {
                                        if (locked) { setShowLocked(true); return; }
                                        onSelect(i);
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-[#111] ${
                                        isCurrent ? 'bg-[#0D1628]' : 'hover:bg-[#111]'
                                    }`}>
                                    <div className="flex-shrink-0">
                                        {locked ? (
                                            <div className="w-8 h-8 rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center">
                                                <Lock size={13} className="text-gray-500" />
                                            </div>
                                        ) : isDone ? (
                                            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : isCurrent ? (
                                            <div className="w-8 h-8 rounded-full bg-[#2196F3] flex items-center justify-center">
                                                <Play size={14} fill="white" className="text-white ml-0.5" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full border border-[#333] flex items-center justify-center">
                                                <Play size={13} className="text-gray-500 ml-0.5" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-xs font-semibold mb-0.5 ${isDone || isCurrent ? 'text-[#2196F3]' : 'text-gray-500'}`}>
                                            {i + 1}-dars
                                        </p>
                                        <p className={`text-sm leading-snug line-clamp-1 ${isCurrent ? 'text-[#2196F3]' : locked ? 'text-gray-500' : 'text-white'}`}>
                                            {l.title}
                                        </p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    <div className="p-4 border-t border-[#1A1A1A] flex-shrink-0">
                        <YouthCard />
                    </div>
                </div>
            </div>

            {showLocked && (
                <div className="fixed inset-0 z-50 bg-black/85 flex flex-col items-center">
                    <div className="pt-6 pb-4 flex items-center gap-0.5">
                        <span className="text-[#4EBAF7] font-bold text-2xl">Uz</span>
                        <span className="text-white font-bold text-2xl">Chess</span>
                    </div>

                    <button onClick={() => setShowLocked(false)}
                        className="absolute top-5 right-5 w-10 h-10 bg-[#1C2028] hover:bg-[#2A2D35] rounded-full flex items-center justify-center text-white transition-colors z-10">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>


                    <div className="flex w-full max-w-[860px] flex-1 mx-4 overflow-hidden rounded-xl shadow-2xl"
                        style={{ maxHeight: '500px' }}>
                        <div className="flex-1 bg-[#1C2028] flex flex-col items-center justify-center text-center px-10 py-12 gap-6">
                            <div className="w-40 h-32">
                                <svg viewBox="0 0 200 140" fill="none" className="w-full h-full">
                                    <rect x="10" y="5" width="180" height="110" rx="8" fill="#2A2D35" stroke="#3A3D45" strokeWidth="2"/>
                                    <rect x="16" y="11" width="168" height="98" rx="5" fill="#13151C"/>
                                    <rect x="75" y="115" width="50" height="8" rx="3" fill="#2A2D35"/>
                                    <rect x="55" y="122" width="90" height="6" rx="3" fill="#333"/>
                                    <rect x="25" y="20" width="150" height="6" rx="2" fill="#2A2D35"/>
                                    <rect x="25" y="30" width="120" height="5" rx="2" fill="#252830"/>
                                    <rect x="25" y="39" width="135" height="5" rx="2" fill="#252830"/>
                                    <circle cx="100" cy="73" r="26" fill="#2A2D35" stroke="#3A3D45" strokeWidth="1.5"/>
                                    <path d="M88 73 V65 a12 12 0 0 1 24 0 V73" stroke="#555" strokeWidth="3.5" strokeLinecap="round" fill="none"/>
                                    <rect x="84" y="71" width="32" height="22" rx="5" fill="#4A4D55"/>
                                    <circle cx="100" cy="80" r="4" fill="#2A2D35"/>
                                    <rect x="98" y="82.5" width="4" height="6" rx="2" fill="#2A2D35"/>
                                </svg>
                            </div>

                            <div>
                                <h2 className="text-white font-bold text-xl leading-snug mb-3">
                                    Kursni davom ettirish uchun to&apos;lovni amalga oshirishingiz zarur.
                                </h2>
                                <p className="text-gray-400 text-sm leading-6">
                                    Biz bilan shaxmatni qayta kashf eting, keyingi darsliklardan ko&apos;plab ma&apos;lumotlar olishingiz mumkin.
                                </p>
                            </div>

                            <button onClick={() => { setShowLocked(false); router.push(`/courses/${courseId}`); }}
                                className="w-full py-3 rounded-xl bg-[#2196F3] text-white font-semibold text-sm hover:bg-[#1976D2] transition-colors">
                                Sotib olish
                            </button>
                        </div>

                        <div className="w-[46%] bg-gradient-to-b from-[#0D2040] to-[#091528] flex flex-col relative overflow-hidden flex-shrink-0">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[#2196F3]/20 rounded-full blur-2xl" />
                            <div className="flex-1 flex items-center justify-center px-5 pt-8 pb-3">
                                <div className="w-full max-w-[240px] bg-[#0A0E1A] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                                    <div className="bg-[#0D1628] px-3 py-2 flex items-center justify-between border-b border-white/5">
                                        <div className="flex items-center gap-0.5">
                                            <span className="text-[#4EBAF7] text-[10px] font-bold">Uz</span>
                                            <span className="text-white text-[10px] font-bold">Chess</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {['O\'rganish','Kutubxona'].map(n => (
                                                <span key={n} className="text-[8px] text-gray-400">{n}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="bg-[#080D18] p-2 space-y-1.5">
                                        <div className="flex gap-1">
                                            {['Tamomlangan o\'yinlar'].map(t => (
                                                <div key={t} className="flex-1 bg-[#162035] rounded p-1.5">
                                                    <div className="text-[7px] text-gray-400 mb-1">{t}</div>
                                                    <div className="h-1 bg-gray-700 rounded w-3/4 mb-0.5" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-[#162035] rounded p-1.5">
                                            <div className="text-[7px] text-gray-400 mb-1">Reyting</div>
                                            {[1,2,3,4,5].map(i => (
                                                <div key={i} className="flex items-center gap-1 py-0.5">
                                                    <div className="w-3 h-1.5 bg-gray-700 rounded" />
                                                    <div className="flex-1 h-1 bg-gray-800 rounded" />
                                                    <div className="w-4 h-1 bg-gray-700 rounded" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="bg-[#162035] rounded p-1.5 flex gap-1.5">
                                            <div className="w-8 h-8 bg-[#1d2a40] rounded flex-shrink-0" />
                                            <div className="flex-1 space-y-0.5">
                                                <div className="h-1.5 bg-gray-700 rounded w-3/4" />
                                                <div className="h-1 bg-gray-800 rounded w-1/2" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div className="text-center pb-8 px-4">
                                <p className="text-white font-bold text-3xl leading-tight tracking-tight">Shaxmatni</p>
                                <p className="text-gray-400 text-sm tracking-widest mt-0.5">biz bilan o&apos;rganing!</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
                    <div className="w-full max-w-[440px] bg-[#1C2028] rounded-2xl p-8 flex flex-col items-center gap-5 text-center relative">
                        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center text-5xl shadow-lg">
                            🏁
                        </div>

                        <h2 className="text-white font-bold text-2xl">Tabriklaymiz!</h2>

                        <p className="text-gray-400 text-sm leading-6 max-w-[340px]">
                            Siz ushbu kursdagi barcha darslik videolarni muvaffaqiyatli ko&apos;rib bo&apos;ldingiz.
                            Endi esa sizga taqdim etilgan sertifikatingizni yuklab olishingiz mumkin
                        </p>

                        <button
                            onClick={() => { setShowCert(false); router.push(`/courses/${courseId}/certificate`); }}
                            className="w-full py-3.5 rounded-xl bg-[#2196F3] text-white font-semibold text-sm hover:bg-[#1976D2] transition-colors flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Sertifikatni yuklab olish
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
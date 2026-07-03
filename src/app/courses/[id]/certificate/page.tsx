'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Download, Star } from 'lucide-react';
import YouthCard from '@/features/shared/components/YouthCard/YouthCard';
import axios from 'axios';

const BASE = 'http://localhost:3001';

export default function CertificatePage() {
    const { id } = useParams<{ id: string }>();

    const [course, setCourse] = useState<{ title?: string } | null>(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        void (async () => {
            try {
                const cRes = await fetch(`${BASE}/public/courses/${id}`, { cache: 'no-store' });
                setCourse(await cRes.json());
            } catch {
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    async function handleDownload() {
        setDownloading(true);
        try {
            const res = await fetch('/Certificate.png');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${course?.title ?? 'Sertifikat'}.png`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch {
            window.open('/Certificate.png', '_blank');
        } finally {
            setDownloading(false);
        }
    }

    async function handleSubmitReview() {
        if (!rating) return;
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            await axios.post(
                `${BASE}/admin/courseReviews/${id}`,
                { rating, comment },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSubmitted(true);
        } catch {
            setSubmitted(true);
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="text-white">Yuklanmoqda...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="mx-auto max-w-7xl px-4 py-6">
                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 flex flex-col gap-6">
                        <div className="bg-[#0D1628] rounded-2xl border border-[#1d2733] px-8 py-10 flex flex-col items-center text-center gap-5">
                            <div className="w-full max-w-2xl relative">
                                <Image
                                    src="/Certificate.png"
                                    alt="Sertifikat"
                                    width={900}
                                    height={630}
                                    priority
                                    unoptimized
                                    style={{ width: '100%', height: 'auto' }}
                                    className="rounded-xl shadow-2xl"
                                />
                            </div>

                            <h1 className="text-white font-bold text-2xl leading-snug">
                                Tabriklaymiz, videodarsliklarni<br />muvaffaqiyatli tamomladingiz
                            </h1>
                            <p className="text-gray-400 text-sm">Sertifikatni olish uchun pastdagi tugmani bosing.</p>

                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-[#2196F3] text-white font-semibold text-sm hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Download size={17} />
                                {downloading ? 'Yuklanmoqda...' : 'Yuklab olish'}
                            </button>
                        </div>

                        <div className="bg-[#121a24] rounded-2xl border border-[#1d2733] p-6">
                            <h2 className="text-white font-bold text-xl mb-5">Kursga baho bering</h2>

                            {submitted ? (
                                <div className="flex items-center gap-3 text-green-400 py-4">
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span className="font-medium">Izohingiz muvaffaqiyatli yuborildi!</span>
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 mb-5">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <button
                                                key={i}
                                                onMouseEnter={() => setHoverRating(i + 1)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setRating(i + 1)}
                                                className="transition-transform hover:scale-110"
                                            >
                                                <Star
                                                    size={34}
                                                    fill={i < (hoverRating || rating) ? '#F59E0B' : '#2A2D35'}
                                                    className={i < (hoverRating || rating) ? 'text-yellow-400' : 'text-[#2A2D35]'}
                                                />
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mb-5">
                                        <label className="block text-sm text-gray-400 mb-2">Izoh</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Izoh qoldiring"
                                            rows={5}
                                            className="w-full bg-[#0D1222] border border-[#1d2733] text-white text-sm rounded-xl px-4 py-3 outline-none resize-none placeholder:text-gray-600 focus:border-[#2196F3]/50 transition-colors"
                                        />
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSubmitReview}
                                            disabled={!rating || submitting}
                                            className="px-8 py-3 rounded-xl bg-[#2196F3] text-white font-semibold text-sm hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col gap-4">
                        <YouthCard />
                            <Image
                                src="/Lenta.png"
                                alt="Lenta"
                                width={280}
                                height={386}
                                className="w-full rounded-2xl"
                                style={{ height: 'auto' }}
                                unoptimized
                            />
                    </div>
                </div>
            </div>
        </div>
    );
}
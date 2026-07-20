'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Heart, Star } from 'lucide-react';
import api from '@/lib/api';
import { toggleSavedSouvenir, isSavedSouvenir } from '@/lib/saved';

const BASE = 'http://localhost:3001';

function resolveAvatar(path?: string) {
    if (!path) return undefined;
    if (/^https?:\/\//.test(path)) return path;
    return `${BASE}/${String(path).replace(/\\/g, '/')}`;
}

interface SouvenirImage { id: number; image: string; }
interface Color { id?: number; title?: string; color?: string; }
interface SouvenirColor { id: number; souvenirId?: number; colorId?: number; colors?: Color; }
interface Review {
    id: number;
    userId: number;
    souvenirId: number;
    rating: string | number;
    comment: string;
    date?: string;
    user?: { fullName?: string; image?: string; profileImage?: string; avatar?: string };
}

interface Souvenir {
    id: number;
    title: string;
    description?: string;
    price: number;
    rating?: number;
    isLiked?: boolean;
    images?: SouvenirImage[];
    colors?: SouvenirColor[];
    reviews?: Review[];
}

function resolveColor(c: SouvenirColor | undefined): Color | null {
    if (!c?.colors?.color) return null;
    return c.colors;
}

function normalizeImg(src?: string) {
    if (!src) return '/placeholder-book.png';
    const s = src.replace(/\\/g, '/');
    return s.startsWith('http') ? s : `${BASE}/${s}`;
}

export default function SouvenirDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const numId = Number(id);

    const [souvenir, setSouvenir] = useState<Souvenir | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);
    const [activeColor, setActiveColor] = useState<number | null>(null);

    const [liked, setLiked] = useState(false);
    const [likeLoading, setLikeLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartAdded, setCartAdded] = useState(false);

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        Promise.all([
            fetch(`${BASE}/public/souvenir/${id}`).then(r => r.json()),
            fetch(`${BASE}/public/souvenir-images`).then(r => r.json()),
            fetch(`${BASE}/public/souvenir-colors`).then(r => r.json()),
            fetch(`${BASE}/public/souvenir-reviews`).then(r => r.json()),
        ]).then(([sRes, imgRes, colorRes, reviewRes]) => {
            const s = sRes?.data ?? sRes;
            const allImgs = Array.isArray(imgRes?.data) ? imgRes.data : Array.isArray(imgRes) ? imgRes : [];
            const allCols = Array.isArray(colorRes?.data) ? colorRes.data : Array.isArray(colorRes) ? colorRes : [];
            const allRevs = Array.isArray(reviewRes?.data) ? reviewRes.data : Array.isArray(reviewRes) ? reviewRes : [];

            const souvenirColors = allCols.filter((c: { souvenirId: number }) => c.souvenirId === numId);
            setSouvenir({
                ...s,
                images: allImgs.filter((i: { souvenirId: number }) => i.souvenirId === numId),
                colors: souvenirColors,
                reviews: (allRevs as Review[]).filter(r => r.souvenirId === numId),
            });
            setActiveColor(souvenirColors.length > 0 ? 0 : null);
            setLiked(isSavedSouvenir(numId) || (s?.isLiked ?? false));
        }).catch(() => setSouvenir(null))
            .finally(() => setLoading(false));
    }, [id, numId]);

    async function handleAddToCart() {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/sign-in'); return; }
        if (cartLoading) return;
        try {
            setCartLoading(true);
            await api.post('/public/cart', { target: 'souvenir', targetId: numId, quantity: 1 });
            setCartAdded(true);
            window.dispatchEvent(new Event('cart-change'));
        } catch (err) {
            console.error('Cart error:', err);
        } finally {
            setCartLoading(false);
        }
    }

    async function handleLikeToggle() {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/sign-in'); return; }
        if (likeLoading || !souvenir) return;
        const prevLiked = liked;
        try {
            setLikeLoading(true);
            setLiked(!prevLiked);
            toggleSavedSouvenir({ id: souvenir.id, title: souvenir.title, price: Number(souvenir.price), images: souvenir.images });
            await api.post(`/public/souvenir-likes/${numId}`, {});
        } catch (err) {
            console.error('Like error:', err);
            setLiked(prevLiked);
        } finally {
            setLikeLoading(false);
        }
    }

    async function refreshReviews() {
        const res = await fetch(`${BASE}/public/souvenir-reviews`);
        const data = await res.json();
        const all: Review[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const filtered = all.filter(r => r.souvenirId === numId);
        setSouvenir(prev => prev ? { ...prev, reviews: filtered } : prev);
    }

    async function handleReviewSubmit() {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/auth/sign-in'); return; }
        if (reviewLoading || !comment.trim()) return;
        try {
            setReviewLoading(true);
            await api.post('/public/souvenir-reviews', {
                souvenirId: numId, rating, comment,
            });
            setComment('');
            setRating(5);
            await refreshReviews();
        } catch (err) {
            console.error('Review error:', err);
        } finally {
            setReviewLoading(false);
        }
    }

    if (loading) {
        return <div className="py-20 text-center text-white">Yuklanmoqda...</div>;
    }

    if (!souvenir) return (
        <div className="py-20 text-center text-white">Suvenir topilmadi</div>
    );

    const images = souvenir.images ?? [];
    const colors = souvenir.colors ?? [];
    const reviews = souvenir.reviews ?? [];

    return (
        <div className="bg-black min-h-screen">
            <div className="w-full max-w-[1200px] mx-auto px-6 py-10">
                <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-3xl p-8">
                    <div className="flex flex-col lg:flex-row gap-10">
                        <div className="w-full lg:w-[360px] shrink-0 flex flex-col gap-3">
                            <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#1A1D21]">
                                <Image
                                    src={normalizeImg(images[activeImage]?.image)}
                                    fill
                                    alt={souvenir.title}
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-2">
                                    {images.map((img, i) => (
                                        <button key={img.id ?? i} onClick={() => setActiveImage(i)}
                                            className={`relative w-16 h-16 rounded-xl overflow-hidden border ${activeImage === i ? 'border-[#2196F3]' : 'border-[#1E2328]'}`}>
                                            <Image src={normalizeImg(img.image)} fill alt="" className="object-cover" unoptimized />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex-1">
                            <h1 className="text-white font-bold text-2xl leading-snug">{souvenir.title}</h1>

                            {souvenir.rating != null && (
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-yellow-400 text-sm">⭐ {Number(souvenir.rating).toFixed(1)}</span>
                                </div>
                            )}

                            <p className="text-[#8A8F98] text-sm leading-relaxed mt-4">{souvenir.description}</p>

                            {colors.length > 0 && (
                                <div className="mt-6">
                                    <p className="text-gray-400 text-sm mb-2">
                                        Rang{activeColor != null && resolveColor(colors[activeColor])?.title
                                            ? `: ${resolveColor(colors[activeColor])?.title}`
                                            : ''}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        {colors.map((c, i) => {
                                            const resolved = resolveColor(c);
                                            if (!resolved) return null;
                                            return (
                                                <button key={c.id ?? i} onClick={() => setActiveColor(i)}
                                                    title={resolved.title}
                                                    className={`w-7 h-7 rounded-full border-2 ${activeColor === i ? 'border-[#2196F3]' : 'border-[#2A2F36]'}`}
                                                    style={{ background: resolved.color }} />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-4 mt-8">
                                <span className="text-white text-3xl font-bold">
                                    {Number(souvenir.price).toLocaleString()} UZS
                                </span>
                            </div>

                            <div className="flex items-center gap-4 mt-6">
                                <button
                                    onClick={handleAddToCart}
                                    disabled={cartLoading}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50 bg-[#1A1D1F]"
                                >
                                    <Image
                                        src={cartAdded ? '/cart add.png' : '/cart.png'}
                                        alt="cart"
                                        width={20}
                                        height={20}
                                    />
                                    <span className={cartAdded ? 'text-white' : 'text-[#2196F3]'}>
                                        Savatchaga
                                    </span>
                                </button>

                                <button
                                    onClick={handleLikeToggle}
                                    disabled={likeLoading}
                                    className={`w-12 h-12 rounded-xl border flex justify-center items-center transition-all ${
                                        liked ? 'bg-red-500 border-red-500 text-white' : 'border-gray-600 text-white hover:bg-[#1A1A1A]'
                                    }`}
                                >
                                    <Heart fill={liked ? 'white' : 'none'} size={22} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <section className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl mt-8 p-6">
                    <h2 className="mb-6 text-2xl font-bold text-white">Izohlar</h2>

                    {reviews.length === 0 ? (
                        <p className="text-gray-400 text-sm text-center py-8">Hozircha izohlar mavjud emas</p>
                    ) : (
                        <div className="overflow-hidden rounded-xl border border-[#232428] bg-[#18191B]">
                            {reviews.map((review, index) => {
                                const name = review.user?.fullName ?? `Foydalanuvchi ${review.userId}`;
                                const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
                                const avatarUrl = resolveAvatar(review.user?.image ?? review.user?.profileImage ?? review.user?.avatar);
                                return (
                                    <div key={review.id} className={`p-5 ${index !== reviews.length - 1 ? 'border-b border-[#2A2B2F]' : ''}`}>
                                        <div className="flex gap-3">
                                            {avatarUrl ? (
                                                <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-[#2196F3] flex items-center justify-center text-white text-sm font-bold shrink-0">
                                                    {initials}
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-medium text-white text-sm">{name}</h3>
                                                <div className="flex mt-1">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} size={12}
                                                            fill={i < Math.floor(Number(review.rating)) ? '#FACC15' : 'none'}
                                                            className={i < Math.floor(Number(review.rating)) ? 'text-yellow-400' : 'text-gray-600'} />
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-sm leading-6 text-gray-300">{review.comment}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3">
                        <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <button key={i} onClick={() => setRating(i + 1)}>
                                    <Star size={20}
                                        fill={i < rating ? '#FACC15' : 'none'}
                                        className={i < rating ? 'text-yellow-400' : 'text-gray-600'} />
                                </button>
                            ))}
                        </div>
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            placeholder="Izohingizni yozing..."
                            rows={3}
                            className="w-full bg-[#1A1D1F] border border-[#2A2A2A] text-white text-sm rounded-xl px-4 py-3 outline-none resize-none placeholder:text-gray-600"
                        />
                        <button
                            onClick={handleReviewSubmit}
                            disabled={reviewLoading || !comment.trim()}
                            className="self-start px-6 py-2.5 rounded-xl text-sm font-semibold bg-[#2196F3] text-white hover:bg-[#1976D2] disabled:opacity-50 transition-colors"
                        >
                            {reviewLoading ? 'Yuborilmoqda...' : 'Izoh qoldirish'}
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}
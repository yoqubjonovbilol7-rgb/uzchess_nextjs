'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import api from '@/lib/api';
import { toggleSavedSouvenir, isSavedSouvenir } from '@/lib/saved';

const BASE = 'http://localhost:3001';

export interface SouvenirColorEntry {
    id?: number;
    souvenirId?: number;
    colorId?: number;
    colors?: { id?: number; title?: string; color?: string };
    title?: string;
}

export interface Souvenir {
    id: number;
    title: string;
    description?: string;
    price: number;
    rating?: number;
    isLiked?: boolean;
    images?: { id?: number; image?: string; souvenirId?: number }[];
    colors?: SouvenirColorEntry[];
}

function normalizeImg(src?: string) {
    if (!src) return '/placeholder-book.png';
    const s = src.replace(/\\/g, '/');
    return s.startsWith('http') ? s : `${BASE}/${s}`;
}

function resolveColor(c: SouvenirColorEntry): { hex: string; title: string } | null {
    const hex = c.colors?.color ?? undefined;
    const title = c.colors?.title ?? c.title ?? '';
    if (!hex) return null;
    return { hex, title };
}

export default function SouvenirCard({ souvenir }: { souvenir: Souvenir }) {
    const [liked, setLiked] = useState(() => isSavedSouvenir(souvenir.id) || (souvenir.isLiked ?? false));
    const [loading, setLoading] = useState(false);
    const [cartLoading, setCartLoading] = useState(false);
    const [cartAdded, setCartAdded] = useState(false);

    const firstImage = souvenir.images?.[0]?.image;

    async function handleLike(e: React.MouseEvent) {
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
            toggleSavedSouvenir({
                id: souvenir.id,
                title: souvenir.title,
                price: Number(souvenir.price),
                images: souvenir.images,
            });
            await api.post(`/public/souvenir-likes/${souvenir.id}`, {});
        } catch (err) {
            console.error('Like error:', err);
            setLiked(prevLiked);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddToCart(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        if (cartLoading) return;
        const token = localStorage.getItem('token');
        if (!token) { alert('Avval login qiling!'); return; }
        try {
            setCartLoading(true);
            await api.post('/public/cart', { target: 'souvenir', targetId: souvenir.id, quantity: 1 });
            setCartAdded(true);
            window.dispatchEvent(new Event('cart-change'));
        } catch (err) {
            console.error('Cart error:', err);
        } finally {
            setCartLoading(false);
        }
    }

    return (
        <Link href={`/souvenirs/${souvenir.id}`} className="block group">
            <div className="w-full bg-[#14181C] border border-[#1E2328] rounded-2xl overflow-hidden hover:border-[#2196F3] transition-all">
                <div className="relative w-full aspect-square bg-[#1A1D21]">
                    <Image
                        src={normalizeImg(firstImage)}
                        alt={souvenir.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                    />
                    <button
                        onClick={handleLike}
                        disabled={loading}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center z-10"
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

                <div className="p-4 flex flex-col gap-2">
                    <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
                        {souvenir.title}
                    </h3>

                    {souvenir.colors && souvenir.colors.length > 0 && (
                        <div className="flex items-center gap-1.5">
                            {souvenir.colors.slice(0, 5).map((c, i) => {
                                const resolved = resolveColor(c);
                                if (!resolved) return null;
                                return (
                                    <span key={c.id ?? i} title={resolved.title}
                                        className="w-4 h-4 rounded-full border border-[#2A2F36]"
                                        style={{ background: resolved.hex }} />
                                );
                            })}
                            {souvenir.colors.length > 5 && (
                                <span className="text-[#8A8F98] text-xs">+{souvenir.colors.length - 5}</span>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between mt-1">
                        <p className="text-[#84CC16] font-bold text-sm">
                            {Number(souvenir.price).toLocaleString()} UZS
                        </p>
                        {souvenir.rating != null && (
                            <span className="text-yellow-400 text-xs">⭐ {Number(souvenir.rating).toFixed(1)}</span>
                        )}
                    </div>

                    <button
                        onClick={handleAddToCart}
                        disabled={cartLoading}
                        className="mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 bg-[#1A1D1F]"
                    >
                        <Image
                            src={cartAdded ? '/cart add.png' : '/cart.png'}
                            alt="cart"
                            width={16}
                            height={16}
                        />
                        <span className={cartAdded ? 'text-white' : 'text-[#2196F3]'}>
                            Savatchaga
                        </span>
                    </button>
                </div>
            </div>
        </Link>
    );
}
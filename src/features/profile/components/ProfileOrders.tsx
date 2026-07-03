'use client';

import { useEffect, useState, useCallback, type ReactNode } from 'react';
import Image from 'next/image';
import api from '@/lib/api';

const BASE = 'http://localhost:3001';

function computeStatus(createdAt?: string): string {
    if (!createdAt) return 'pending';
    const mins = (Date.now() - new Date(createdAt).getTime()) / 60000;
    if (mins < 3) return 'pending';
    if (mins < 8) return 'processing';
    return 'delivered';
}

function norm(src?: string): string {
    if (!src) return '/Frame.png';
    const s = src.replace(/\\/g, '/');
    return s.startsWith('http') ? s : `${BASE}/${s}`;
}

interface OrderItem {
    title?: string;
    image?: string;
    category?: string;
    price?: number;
}

interface Order {
    id: number;
    orderNumber?: string;
    status?: string;
    totalPrice?: number;
    items?: OrderItem[];
    createdAt?: string;
}

interface StatusConfig {
    label: string;
    color: string;
    bg: string;
    icon: ReactNode;
}

const STATUS: Record<string, StatusConfig> = {
    delivered: {
        label: 'Yetkazib berildi',
        color: '#22C55E',
        bg: 'rgba(34,197,94,0.12)',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
        ),
    },
    pending: {
        label: "Buyurtma ko'rib chiqilmoqda",
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.12)',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    processing: {
        label: "Buyurtma ko'rib chiqilmoqda",
        color: '#F59E0B',
        bg: 'rgba(245,158,11,0.12)',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    cancelled: {
        label: 'Bekor qilingan',
        color: '#EF4444',
        bg: 'rgba(239,68,68,0.12)',
        icon: (
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
    },
};

function ImageCollage({ items }: { items?: OrderItem[] }) {
    const imgs = (items ?? []).filter(i => i.image).slice(0, 2);

    if (!imgs.length) {
        return (
            <div
                className="w-[100px] flex-shrink-0 flex items-center justify-center rounded-xl text-3xl"
                style={{ background: '#1A2030', minHeight: '120px' }}>
                ♟
            </div>
        );
    }

    if (imgs.length === 1) {
        return (
            <div className="w-[100px] flex-shrink-0 rounded-xl overflow-hidden relative"
                style={{ height: '120px', background: '#1A2030' }}>
                <Image src={norm(imgs[0].image)} alt="" fill className="object-cover" unoptimized />
            </div>
        );
    }

    return (
        <div className="w-[100px] flex-shrink-0 flex flex-col gap-1" style={{ height: '120px' }}>
            <div className="relative flex-1 rounded-lg overflow-hidden" style={{ background: '#1A2030' }}>
                <Image src={norm(imgs[0].image)} alt="" fill className="object-cover" unoptimized />
            </div>
            <div className="relative flex-1 rounded-lg overflow-hidden" style={{ background: '#1A2030' }}>
                <Image src={norm(imgs[1].image)} alt="" fill className="object-cover" unoptimized />
            </div>
        </div>
    );
}

function Empty() {
    return (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ background: '#0D1117', border: '1px solid #1A2030' }}>
                <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    style={{ color: '#374151' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            </div>
            <div className="text-center">
                <p className="font-semibold text-white mb-1">Buyurtmalar yo&apos;q</p>
                <p className="text-sm" style={{ color: '#6B7280' }}>Hali hech narsa buyurtma qilmadingiz</p>
            </div>
        </div>
    );
}

function Spinner() {
    return (
        <div className="flex items-center justify-center h-64">
            <svg className="animate-spin w-8 h-8" fill="none" viewBox="0 0 24 24" style={{ color: '#2196F3' }}>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        </div>
    );
}

export default function ProfileOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [tick, setTick] = useState(0);
    const [loading, setLoading] = useState(true);

    const loadOrders = useCallback(async () => {
        try {
            const local: Order[] = JSON.parse(localStorage.getItem('orders') ?? '[]');
            if (local.length) {
                setOrders(local);
                setLoading(false);
                return;
            }
        } catch {}
        try {
            const r = await api.get('/orders');
            const data = r.data?.data ?? r.data ?? [];
            setOrders(Array.isArray(data) ? data : []);
        } catch {
            setOrders([]);
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        void loadOrders();
    }, [loadOrders]);

    useEffect(() => {
        const id = setInterval(() => setTick(n => n + 1), 30_000);
        return () => clearInterval(id);
    }, []);

    void tick;

    if (loading) return <Spinner />;
    if (!orders.length) return <Empty />;

    return (
        <div className="grid grid-cols-2 gap-4">
            {orders.map(order => {
                const statusKey = computeStatus(order.createdAt);
                const st = STATUS[statusKey] ?? STATUS['pending'];
                const itemNames = (order.items ?? [])
                    .map(i => i.title ?? i.category)
                    .filter(Boolean)
                    .join(', ');

                return (
                    <div key={order.id}
                        className="rounded-2xl p-4 flex gap-4 items-start"
                        style={{ background: '#0E1117', border: '1px solid #1E2330' }}>

                        <ImageCollage items={order.items} />

                        <div className="flex-1 min-w-0 flex flex-col gap-2.5 pt-1">
                            <p className="text-white font-bold text-base">
                                № {order.orderNumber ?? order.id}
                            </p>

                            <span
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold w-fit"
                                style={{ color: st.color, background: st.bg }}>
                                {st.icon}
                                {st.label}
                            </span>

                            {order.totalPrice !== undefined && (
                                <div className="flex items-center gap-2 text-sm text-white">
                                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" style={{ color: '#9CA3AF' }}>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-medium">
                                        {Number(order.totalPrice).toLocaleString('ru-RU', { minimumFractionDigits: 2 })} UZS
                                    </span>
                                </div>
                            )}

                            {itemNames && (
                                <div className="flex items-start gap-2 text-xs" style={{ color: '#6B7280' }}>
                                    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span className="line-clamp-2">{itemNames}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

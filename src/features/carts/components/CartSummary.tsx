'use client';

import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { CartItemData } from './CartItem';

interface Props {
    items: CartItemData[];
    onCheckout: () => void;
    onCouponApply: (coupon: string) => void;
}

interface RowProps {
    label: string;
    value: string;
    valueColor?: string;
}

function Row({ label, value, valueColor }: RowProps) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-[#8A8F98]">{label}</span>
            <span className={valueColor ?? 'text-white'}>{value}</span>
        </div>
    );
}

export default function CartSummary({ items, onCheckout, onCouponApply }: Props) {
    const [coupon, setCoupon] = useState('');
    const [couponApplied, setCouponApplied] = useState(false);

    const subtotal  = items.reduce((sum, item) => sum + Number(item.item.price) * item.quantity, 0);
    const discount  = Math.round(subtotal * 0.1);
    const delivery: number = 0;
    const couponDiscount = couponApplied ? Math.round(subtotal * 0.05) : 0;
    const total     = subtotal - discount - couponDiscount + delivery;

    function applyCoupon() {
        if (coupon.trim()) {
            setCouponApplied(true);
            onCouponApply(coupon.trim());
        }
    }

    return (
        <div className="bg-[#14181C] border border-[#1E2328] rounded-2xl p-6 sticky top-6 flex flex-col gap-5">
            <h2 className="text-white text-lg font-bold">Buyurtma xulosasi</h2>

            <div className="flex flex-col gap-3">
                <Row
                    label="To'lov narxi"
                    value={`${subtotal.toLocaleString()} UZS`}
                />

                <Row
                    label="Chegirma 10%"
                    value={`- ${discount.toLocaleString()} UZS`}
                    valueColor="text-green-400"
                />

                <div className="flex flex-col gap-1.5">
                    <span className="text-sm text-[#8A8F98]">Kupon</span>
                    <div className="flex gap-2">
                        <input
                            value={coupon}
                            onChange={e => { setCoupon(e.target.value); setCouponApplied(false); }}
                            placeholder="Kupon kodini kiriting"
                            className="flex-1 bg-[#1A1D21] border border-[#2A2F36] text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#2196F3] transition-colors placeholder:text-[#4A5060]"
                        />
                        <button
                            onClick={applyCoupon}
                            className="px-4 py-2.5 rounded-xl bg-[#1E2328] text-sm font-medium transition-colors hover:bg-[#2196F3] hover:text-white text-[#8A8F98]"
                        >
                            {couponApplied ? '✓' : "Qo'llash"}
                        </button>
                    </div>
                    {couponApplied && (
                        <p className="text-xs text-green-400">Kupon qo&apos;llandi: -5%</p>
                    )}
                </div>

                <Row
                    label="Yetkazib berish"
                    value={delivery === 0 ? 'Bepul' : `${delivery.toLocaleString()} UZS`}
                    valueColor="text-green-400"
                />

                <div className="border-t border-[#1E2328] my-1" />

                <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-base">Jami</span>
                    <span className="text-[#84CC16] font-bold text-lg">{total.toLocaleString()} UZS</span>
                </div>
            </div>

            <button
                onClick={onCheckout}
                disabled={items.length === 0}
                className="w-full py-3 bg-[#2196F3] hover:bg-[#1976D2] text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ShoppingBag size={18} />
                Rasmiylashtirish
            </button>

            <div className="rounded-xl overflow-hidden">
                <img src="/Banners.png" alt="Banner" style={{ width: '100%', height: 'auto' }} />
            </div>
        </div>
    );
}
'use client';

import { useState } from 'react';

export interface OrderFormData {
    fullName: string;
    phone: string;
    email: string;
}

interface Props {
    onSubmit: (data: OrderFormData) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
    summary: {
        total: number;
        delivery: number | null;
        deliveryPrice: number | null;
        subtotal: number;
        discount: number;
        coupon: string;
        paymentMethod: string | null;
    };
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-2.5 border-b border-[#1E2328] last:border-b-0">
            <span className="text-[#8A8F98] text-sm">{label}</span>
            <span className="text-white text-sm font-medium">{value}</span>
        </div>
    );
}

export default function CartForm({ onSubmit, onCancel, loading, summary }: Props) {
    const [form, setForm] = useState<OrderFormData>({
        fullName: '',
        phone: '',
        email: '',
    });
    const [errors, setErrors] = useState<Partial<OrderFormData>>({});

    function validate(): boolean {
        const newErrors: Partial<OrderFormData> = {};
        if (!form.fullName.trim()) newErrors.fullName = 'To\'liq ismingizni kiriting';
        if (!form.phone.trim()) newErrors.phone = 'Telefon raqamingizni kiriting';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!validate()) return;
        await onSubmit(form);
    }

    function handleChange(field: keyof OrderFormData, value: string) {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    const fmt = (n: number) =>
        n.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' UZS';

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 items-start">
            {/* Left — form */}
            <div className="bg-[#111417] border border-[#1E2328] rounded-2xl p-7">
                <h2 className="text-white text-xl font-semibold mb-6">
                    Ma&apos;lumotlaringizni kiriting
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    {/* To'liq ism */}
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[#8A8F98] text-sm">To&apos;liq ismingiz</label>
                        <input
                            type="text"
                            value={form.fullName}
                            onChange={e => handleChange('fullName', e.target.value)}
                            placeholder="To'liq ismingizni kiriting"
                            className="w-full bg-transparent border border-[#2A2F36] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#3A4050] transition-colors placeholder:text-[#3A4050]"
                        />
                        {errors.fullName && (
                            <span className="text-red-400 text-xs">{errors.fullName}</span>
                        )}
                    </div>

                    {/* Phone + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[#8A8F98] text-sm">Telefon raqamingiz</label>
                            <div className="flex border border-[#2A2F36] rounded-xl overflow-hidden focus-within:border-[#3A4050] transition-colors">
                                <span className="bg-transparent text-white text-sm px-3 py-3 border-r border-[#2A2F36] shrink-0 flex items-center">
                                    +998
                                </span>
                                <input
                                    type="tel"
                                    value={form.phone.startsWith('+998') ? form.phone.slice(4) : form.phone}
                                    onChange={e => {
                                        const digits = e.target.value.replace(/\D/g, '').slice(0, 9);
                                        handleChange('phone', '+998' + digits);
                                    }}
                                    placeholder="-- --- -- --"
                                    className="flex-1 bg-transparent text-white text-sm px-3 py-3 outline-none placeholder:text-[#3A4050]"
                                />
                            </div>
                            {errors.phone && (
                                <span className="text-red-400 text-xs">{errors.phone}</span>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-[#8A8F98] text-sm">Elektron pochta</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={e => handleChange('email', e.target.value)}
                                placeholder="Misol: j.pulatov@uic.group"
                                className="w-full bg-transparent border border-[#2A2F36] text-white rounded-xl px-4 py-3 text-sm outline-none focus:border-[#3A4050] transition-colors placeholder:text-[#3A4050]"
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 mt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-8 py-3 rounded-xl bg-[#1A1D21] border border-[#2A2F36] text-white text-sm font-medium hover:bg-[#1E2328] transition-colors cursor-pointer"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-[#2196F3] hover:bg-[#1976D2] text-white text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {loading ? 'Yuborilmoqda...' : 'Buyurtma berish'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Right — order summary */}
            <div className="bg-[#111417] border border-[#1E2328] rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2328]">
                    <span className="text-white text-base font-semibold">Jami:</span>
                    <span className="text-white text-base font-bold">{fmt(summary.total)}</span>
                </div>

                {/* Rows */}
                <div className="px-6 py-2">
                    <SummaryRow
                        label="Yetkazib berish:"
                        value={summary.delivery !== null ? summary.delivery.toString() : '−'}
                    />
                    <SummaryRow
                        label="Yetkazib berish narxi:"
                        value={summary.deliveryPrice !== null ? fmt(summary.deliveryPrice) : '−'}
                    />
                </div>

                <div className="h-px bg-[#1E2328] mx-6" />

                <div className="px-6 py-2">
                    <SummaryRow label="To'lov narxi:" value={fmt(summary.subtotal)} />
                    <SummaryRow
                        label="Chegirma:"
                        value={`${fmt(summary.discount)} (10%)`}
                    />
                    <SummaryRow
                        label="Kupon:"
                        value={summary.coupon || '−'}
                    />
                    <SummaryRow
                        label="To'lov usuli:"
                        value={summary.paymentMethod || '−'}
                    />
                </div>

                {/* Info notice */}
                <div className="mx-4 mb-4 mt-1 bg-[#1A1D21] rounded-xl p-4 flex gap-3 items-start">
                    <div className="w-5 h-5 rounded-full border border-[#3A4050] flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-[#8A8F98] text-xs font-bold">i</span>
                    </div>
                    <p className="text-[#8A8F98] text-xs leading-relaxed">
                        Yetkazishda borishda yo&apos;l tufayli muammo tug&apos;lilatigan xolatlarda,
                        qa&apos;shimcha xaq talab qilinishi mumkin.
                    </p>
                </div>
            </div>
        </div>
    );
}
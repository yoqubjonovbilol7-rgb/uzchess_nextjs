'use client';

import { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import Link from 'next/link';

export interface OrderSuccessModalProps {
    orderCode: string;
    onClose: () => void;
}

export default function OrderSuccessModal({ orderCode, onClose }: OrderSuccessModalProps) {
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        navigator.clipboard.writeText(orderCode).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative z-10 bg-[#18191C] rounded-2xl w-full max-w-[480px] mx-4 flex flex-col items-center text-center px-8 py-10">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-[#8A8F98] transition-colors cursor-pointer"
                >
                    <X size={20} />
                </button>

                {/* Green check icon */}
                <div className="w-14 h-14 rounded-full bg-[#22C55E] flex items-center justify-center mb-6">
                    <Check size={28} strokeWidth={3} className="text-white" />
                </div>

                {/* Title */}
                <h2 className="text-white text-2xl font-bold leading-tight mb-3">
                    Buyurtma<br />rasmiylashtirildi
                </h2>

                {/* Subtitle */}
                <p className="text-[#8A8F98] text-sm leading-relaxed mb-7 max-w-[320px]">
                    Tez orada siz bilan aloqaga chiqishadi va keyingi
                    qadamlar haqida ma&apos;lumot beriladi.
                </p>

                {/* Order number box */}
                <div className="w-full bg-[#111315] rounded-xl px-5 py-4 mb-6">
                    <p className="text-[#8A8F98] text-xs font-semibold tracking-widest uppercase mb-2">
                        Buyurtma raqami
                    </p>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-white text-xl font-semibold tracking-wide">
                            {orderCode}
                        </span>
                        <button
                            onClick={handleCopy}
                            className="text-[#8A8F98] hover:text-white transition-colors cursor-pointer shrink-0"
                        >
                            {copied ? (
                                <Check size={18} className="text-green-400" />
                            ) : (
                                <Copy size={18} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Home button */}
                <Link
                    href="/"
                    className="w-full py-3.5 rounded-xl bg-[#2196F3] hover:bg-[#1976D2] text-white text-sm font-semibold transition-colors text-center"
                >
                    Asosiyga qaytish
                </Link>

            </div>
        </div>
    );
}
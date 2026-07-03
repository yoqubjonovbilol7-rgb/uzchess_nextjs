'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';

export interface CartItemData {
    id: number;
    target: string;
    targetId: number;
    quantity: number;
    item: {
        id: number;
        title: string;
        price: number;
        newPrice?: number;
        image: string;
    };
}

interface Props {
    item: CartItemData;
    onRemove: (id: number) => void;
    onQuantityChange: (id: number, qty: number) => void;
}

function normalizeImg(src?: string) {
    if (!src) return '/placeholder-book.png';
    const s = src.replace(/\\/g, '/');
    return s.startsWith('http') ? s : `http://localhost:3001/${s}`;
}

export default function CartItem({ item, onRemove, onQuantityChange }: Props) {
    const product = item.item;
    const price    = Number(product.price);
    const newPrice = product.newPrice !== undefined ? Number(product.newPrice) : price;
    const hasDiscount = newPrice < price;
    const lineTotal = newPrice * item.quantity;

    return (
        <div className="w-full bg-[#14181C] border border-[#1E2328] rounded-2xl p-4 flex gap-4 hover:border-[#2196F3] transition-all">
            <div className="relative w-[100px] h-[100px] flex-shrink-0 rounded-xl overflow-hidden">
                <Image
                    src={normalizeImg(product.image)}
                    alt={product.title}
                    fill
                    className="object-cover"
                />
            </div>

            <div className="flex flex-col flex-1 justify-between min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col gap-1 min-w-0">
                        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full w-fit ${item.target === 'souvenir' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                            {item.target === 'souvenir' ? 'Suvenir' : item.target === 'book' ? 'Kitob' : item.target}
                        </span>
                        <h3 className="text-white font-semibold text-base leading-tight line-clamp-2">
                            {product.title}
                        </h3>
                    </div>
                    <button
                        onClick={() => onRemove(item.id)}
                        className="text-[#8A8F98] hover:text-red-500 transition-colors p-1 shrink-0 self-start"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-lg bg-[#1E2328] flex items-center justify-center text-white hover:bg-[#2196F3] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Minus size={13} />
                        </button>
                        <span className="text-white font-medium w-6 text-center text-sm">
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onQuantityChange(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-lg bg-[#1E2328] flex items-center justify-center text-white hover:bg-[#2196F3] transition-colors"
                        >
                            <Plus size={13} />
                        </button>
                    </div>

                    <div className="text-right">
                        {hasDiscount && (
                            <p className="text-[#8A8F98] text-xs line-through">
                                {(price * item.quantity).toLocaleString()} UZS
                            </p>
                        )}
                        <p className="text-[#84CC16] font-bold text-base">
                            {lineTotal.toLocaleString()} UZS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
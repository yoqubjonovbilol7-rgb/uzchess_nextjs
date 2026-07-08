'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import { X } from 'lucide-react';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: Props) {
    const [mounted, setMounted] = useState(false);
    const [dismissed, setDismissed] = useState<number[]>([]);

    useEffect(() => { setMounted(true); }, []);

    useEffect(() => {
        if (!open) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!mounted) return null;

    function dismiss(id: number) {
        setDismissed(v => [...v, id]);
    }

    return createPortal(
        <>
            <div
                className={`fixed inset-0 z-[59] bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />
            <div
                className={`fixed top-0 right-0 z-[60] h-full w-full max-w-[440px] bg-[#0D0D0D] border-l border-[#1F1F1F] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                <div className="flex items-center justify-between px-6 py-5 border-b border-[#1F1F1F] shrink-0">
                    <h2 className="text-white text-xl font-bold">Xabaranoma</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition cursor-pointer">
                        <X size={22} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
                    {!dismissed.includes(1) && (
                        <Link href="/library" onClick={onClose} className="block rounded-2xl overflow-hidden hover:opacity-90 transition-opacity">
                            <Image
                                src="/Frame 427319298.png"
                                alt="Endilikda uzchess platformasidan kitoblar buyurtma qilishingiz mumkin"
                                width={475}
                                height={412}
                                style={{ width: '100%', height: 'auto' }}
                                unoptimized
                            />
                        </Link>
                    )}

                    {!dismissed.includes(2) && (
                        <button onClick={() => dismiss(2)} className="block w-full rounded-2xl overflow-hidden text-left cursor-pointer">
                            <Image
                                src="/Frame 427319300.png"
                                alt="14-yanvar muborak bo'lsin"
                                width={419}
                                height={367}
                                style={{ width: '100%', height: 'auto' }}
                                unoptimized
                            />
                        </button>
                    )}

                    {!dismissed.includes(3) && (
                        <div className="relative rounded-2xl overflow-hidden h-[140px] bg-gradient-to-br from-[#0EA5E9] to-[#1E3A5F] flex items-end px-5 pb-5">
                            <span className="absolute -top-4 -right-2 text-white/10 text-8xl font-black select-none">2022</span>
                            <p className="relative text-white text-2xl font-extrabold leading-tight">
                                Yangi yilingiz muborak bo&apos;lsin!
                            </p>
                        </div>
                    )}

                    {dismissed.length === 3 && (
                        <p className="text-gray-500 text-sm text-center py-10">Yangi xabarlar yo&apos;q</p>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}
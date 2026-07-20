'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Props {
    onClose: () => void;
}

export default function AuthModal({ onClose }: Props) {
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative z-10 w-full max-w-[620px] bg-[#0D1117] rounded-2xl overflow-hidden border border-[#1F2937] shadow-2xl">

                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2937]">
                    <Image
                        src="/uzchess.png"
                        alt="UzChess"
                        width={100}
                        height={26}
                        className="h-6 w-auto object-contain"
                    />
                    <button
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full bg-[#1A1D21] hover:bg-[#2A2D31] text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex">
                <div className="flex flex-col items-center text-center px-6 py-6 flex-1">

                    <div className="w-[100px] h-[80px] bg-[#141920] border border-[#1F2937] rounded-xl flex items-center justify-center mb-4">
                        <div className="relative">
                            <div className="w-10 h-8 bg-[#1E2530] rounded border border-[#2A3340] flex items-center justify-center">
                                <div className="w-6 h-5 bg-[#0D1117] rounded border border-[#2A3340]" />
                            </div>
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-5 h-1.5 bg-[#1E2530] rounded" />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#1E2530] rounded" />
                            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-[#2EA6FF] rounded-full w-5 h-5 flex items-center justify-center text-white text-[10px] font-bold">
                                🔒
                            </div>
                        </div>
                    </div>

                    <h2 className="text-white text-sm font-bold leading-snug mb-2">
                        UzChess platformasidan to&apos;liq foydalanish uchun tizimga kiring.
                    </h2>

                    <p className="text-[#8A8F98] text-xs leading-relaxed mb-5">
                        Platformaning barcha imkoniyatlaridan foydalanish uchun tizimga kiring.
                    </p>

                    <Link
                        href="/auth/sign-in"
                        onClick={onClose}
                        className="w-full py-2.5 bg-[#2EA6FF] hover:bg-[#1E96F0] text-white font-semibold rounded-xl transition-colors text-center text-sm block mb-3"
                    >
                        Kirish
                    </Link>

                    <Link
                        href="/auth/sign-up"
                        onClick={onClose}
                        className="text-[#8A8F98] text-xs hover:text-white transition-colors"
                    >
                        Ro&apos;yxatdan o&apos;tish
                    </Link>
                </div>

                <div className="w-[200px] flex-shrink-0 hidden md:flex items-center justify-center overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, #0e1e35 0%, #0a1525 40%, #060A0F 100%)' }}>
                    <Image
                        src="/Frame 427318502.png"
                        alt="UzChess"
                        width={200}
                        height={270}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        priority
                    />
                </div>
                </div>
            </div>
        </div>
    );
}
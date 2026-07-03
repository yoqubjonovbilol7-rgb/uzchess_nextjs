'use client';

import Link from 'next/link';
import { Play, ChevronRight } from 'lucide-react';

export default function DailyGame() {
    return (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl overflow-hidden flex-shrink-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#1A1A1A]">
                <span className="text-white font-semibold text-sm">Kun o&apos;yini</span>
                <Link href="#" className="text-[#2EA6FF] text-xs flex items-center gap-0.5 hover:underline">
                    Ko&apos;rish <ChevronRight size={12} />
                </Link>
            </div>

            <div className="relative w-full bg-[#0A0F1A] flex items-center justify-center" style={{ height: '130px' }}>
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'repeating-conic-gradient(#fff 0% 25%, transparent 0% 50%)',
                        backgroundSize: '20px 20px'
                    }}
                />
                <div className="absolute left-4 top-3 text-white/20 text-4xl select-none">♟</div>
                <div className="absolute right-4 bottom-3 text-white/20 text-4xl select-none">♔</div>

                <div className="relative z-10 w-12 h-12 rounded-full bg-black/70 border-2 border-white/30 flex items-center justify-center hover:bg-black/90 transition-colors cursor-pointer">
                    <Play size={20} fill="white" className="text-white ml-1" />
                </div>

                <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[11px] px-2 py-0.5 rounded font-mono">5:30</div>
                <div className="absolute bottom-2 right-2 bg-[#4CAF50] text-white text-[10px] px-2 py-0.5 rounded font-medium">Bullet</div>
            </div>

            <div className="px-4 py-3 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#1E3A5F] border border-[#2196F3]/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-bold">A</span>
                    </div>
                    <span className="text-white text-xs font-medium">Abduaziz</span>
                    <span className="ml-auto text-[9px] text-[#8A8F98] bg-[#1A1D21] px-1.5 py-0.5 rounded font-medium">UZ</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="flex-1 h-px bg-[#1A1D21]" />
                    <span className="text-[#555] text-[10px] font-medium">vs</span>
                    <div className="flex-1 h-px bg-[#1A1D21]" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#1A1D21] border border-[#2A2F36] flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-[8px] font-bold">M</span>
                    </div>
                    <span className="text-white text-xs font-medium">Magnus Carlsen</span>
                    <span className="ml-auto text-[9px] text-[#8A8F98] bg-[#1A1D21] px-1.5 py-0.5 rounded font-medium">NO</span>
                </div>
            </div>

            <div className="px-4 pb-4">
                <Link
                    href="#"
                    className="block w-full py-2 bg-[#4CAF50] hover:bg-[#43A047] text-white text-sm font-semibold text-center rounded-xl transition-colors"
                >
                    Ko&apos;rish
                </Link>
            </div>
        </div>
    );
}
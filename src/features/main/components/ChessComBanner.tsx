import Image from 'next/image';
import Link from 'next/link';

export default function ChessComBanner() {
    return (
        <div className="w-full rounded-2xl overflow-hidden bg-[#0A0A0A] border border-[#1A1A1A] relative">
            <Image
                src="/reklama.png"
                alt="Reklama"
                width={900}
                height={120}
                loading="eager"
                style={{ width: '100%', height: 'auto' }}
                unoptimized
            />
            <div className="absolute inset-0 flex items-center justify-end pl-6 pr-2">
                <Link
                    href="#"
                    className="bg-[#0A2041] text-white text-sm font-bold px-10 py-3 rounded-xl transition-colors whitespace-nowrap"
                >
                    Ko&apos;rish
                </Link>
            </div>
        </div>
    );
}
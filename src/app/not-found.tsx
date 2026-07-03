import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-black text-white flex items-center">
            <div className="max-w-7xl mx-auto px-6 py-16 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
                <div className="flex flex-col gap-6">
                    <h1 className="text-[120px] font-black leading-none text-white">404</h1>
                    <h2 className="text-3xl font-bold">Sahifa topilmadi</h2>
                    <p className="text-gray-400 text-base">Uups... Siz qidirayotgan sahifani topa olmadik :(</p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#2196F3] text-white font-semibold text-sm hover:bg-[#1976D2] transition-colors w-fit"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Asosiyga qaytish
                    </Link>
                </div>

                <div className="shrink-0">
                    <Image
                        src="/Board.png"
                        alt="Chess board"
                        width={500}
                        height={340}
                        priority
                        loading="eager"
                        className="rounded-2xl"
                        style={{ width: '100%', height: 'auto', maxWidth: '500px' }}
                    />
                </div>
            </div>
        </div>
    );
}
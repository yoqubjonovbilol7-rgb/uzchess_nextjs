import Image from 'next/image';
import Link from 'next/link';

export default function CourseBanners() {
    return (
        <div className="grid grid-cols-2 gap-4 flex-shrink-0">
            <Link href="/courses" className="block rounded-2xl overflow-hidden hover:opacity-90 transition-opacity">
                <div className="relative w-full" style={{ height: '110px' }}>
                    <Image
                        src="/Frame4.png"
                        alt="Kurslar"
                        fill
                        className="object-cover"
                    />
                </div>
            </Link>
            <Link href="/library" className="block rounded-2xl overflow-hidden hover:opacity-90 transition-opacity">
                <div className="relative w-full" style={{ height: '110px' }}>
                    <Image
                        src="/library-banner.png"
                        alt="Kutubxona"
                        fill
                        loading="eager"
                        className="object-cover"
                    />
                </div>
            </Link>
        </div>
    );
}
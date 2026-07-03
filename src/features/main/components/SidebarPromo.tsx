import Image from 'next/image';

export default function SidebarPromo() {
    return (
        <>
            <div className="w-full rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                    src="/Donation.png"
                    alt="Loyiha rivojiga xissa"
                    width={265}
                    height={67}
                    className="w-full h-auto block"
                    style={{ width: '100%', height: 'auto' }}
                />

            </div>

            <div className="w-full rounded-2xl overflow-hidden flex-shrink-0">
                <Image
                    src="/Banners.png"
                    alt="Yoshlar portali"
                    width={265}
                    height={156}
                    className="w-full h-auto block"
                    style={{ width: '100%', height: 'auto' }}
                />
            </div>
        </>
    );
}
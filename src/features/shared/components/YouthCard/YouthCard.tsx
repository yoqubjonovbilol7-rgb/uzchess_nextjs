'use client';

import Image from "next/image";

export default function YouthCard() {
    return (
        <div className="w-full rounded-2xl overflow-hidden shadow-xl bg-[#0052a3] border border-[#2A2F36]">
            <Image
                src="/Banners.png"
                alt="Yoshlar portali banner"
                width={300}
                height={177}
                loading="eager"
                style={{ width: '100%', height: 'auto' }}
            />
        </div>
    );
}
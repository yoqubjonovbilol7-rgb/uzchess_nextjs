'use client';

import Image from "next/image";

export default function YouthCard() {
    return (
        <div className="w-full">
            <div className="w-full relative rounded-2xl overflow-hidden shadow-xl bg-[#0052a3] border border-[#2A2F36]">
                <Image
                    src="/Banners.png"
                    alt="Yoshlar portali banner"
                    width={300}
                    height={170}
                    loading="eager"
                    className="w-full h-auto block object-contain"
                />
            </div>
        </div>
    );
}
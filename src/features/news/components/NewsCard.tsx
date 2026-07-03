import React  from "react";
import Link from "next/link";
import Image from "next/image";

interface NewsItemProps {
    id: number;
    image: string;
    date: string;
    title: React.ReactNode;
}

export default function NewsCard({id, image, date, title,}: NewsItemProps) {
    const newsDate = new Date(date);

    const months = [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentabr",
        "Oktabr",
        "Noyabr",
        "Dekabr",
    ];

    const formattedDate = !isNaN(newsDate.getTime())
        ? `${months[newsDate.getMonth()]} ${newsDate.getDate()}, ${newsDate.getFullYear()}`
        : date;

    return (
        <article className="bg-[#0D0D0D] rounded-[12px] p-3 flex flex-col gap-3 border border-[#23262F] hover:border-[#2EA6FF] transition-all duration-300">
            <div className="relative w-full rounded-[8px] overflow-hidden" style={{ height: '140px' }}>
                <Image
                    src={image}
                    alt="news"
                    fill
                    className="object-cover"
                    unoptimized
                />
            </div>

            <section className="flex flex-col gap-2">
                <p className="text-[#6F767E] text-[11px]">
                    {formattedDate}
                </p>

                <Link
                    href={`/news/${id}`}
                    className="group"
                >
                    <h2 className="text-white text-[14px] font-semibold leading-5 line-clamp-2 group-hover:text-[#2EA6FF] transition-colors">
                        {title}
                    </h2>
                </Link>

                <p className="text-[#9DA1A3] text-[12px] leading-5 line-clamp-2">
                    O‘zbekistonlik yosh grossmeyster Turkiyada o‘tkazilgan
                    shaxmat olimpiadasida ikkita g‘alabaga erishdi...
                </p>
            </section>
        </article>
    );
}
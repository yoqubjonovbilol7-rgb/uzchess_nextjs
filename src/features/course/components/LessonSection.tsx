import Image from "next/image";
import { Play } from "lucide-react";

interface LessonCardProps {
    title: string;
    duration: string;
    image: string;
}

function normalizeImageSrc(image?: string) {
    if (!image) return "";

    const normalized = image.replace(/\\/g, "/");

    return normalized.startsWith("http")
        ? normalized
        : `http://localhost:3001/${normalized}`;
}

export default function LessonCard({title, duration, image,}: LessonCardProps) {
    return (
        <div className="cursor-pointer transition-all duration-300 hover:-translate-y-1">
            <div className="relative h-[90px] overflow-hidden rounded border border-[#24303d] hover:border-sky-500 transition-all">
                <Image
                    src={normalizeImageSrc(image)}
                    alt={title}
                    fill
                    className="object-cover"
                />

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute bottom-1 left-1 flex items-center gap-1 rounded bg-black/70 px-1 py-[2px] text-[10px] text-white">
                    <Play size={10} />
                    <span>{duration}</span>
                </div>
            </div>

            <p className="mt-2 text-xs text-white">
                {title}
            </p>
        </div>
    );
}
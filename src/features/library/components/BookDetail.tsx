"use client";

import { useState } from "react";
import {
    ShoppingCart,
    Heart,
    Share2
} from "lucide-react";
import Image from "next/image";

interface Props {
    book: any;
}

export default function BookDetail({ book }: Props) {
    const [isLiked, setIsLiked] = useState<boolean>(book?.isLiked || false);
    const [loading, setLoading] = useState<boolean>(false);

    const user = null;

    const imageSrc = book?.image
        ? `http://localhost:3001/${book.image.replace(/\\/g, '/')}`
        : '/placeholder-book.png';

    const handleLikeToggle = async () => {
        if (!user) {
            alert("Iltimos, avval tizimga kiring (login qiling)!");
            return;
        }

        if (loading) return;

        try {
            setLoading(true);

            const response = await fetch(`http://localhost:3001/public/book/like`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    bookId: book.id,
                }),
            });

            if (response.ok) {
                setIsLiked(!isLiked);
            } else {
                console.error("Like amali bajarilmadi");
            }
            setLoading(false);
        } catch (error) {
            console.error("Xatolik yuz berdi:", error);
            setLoading(false);
        }
    };

    return (
        <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-3xl p-8">
            <div className="flex flex-col lg:flex-row gap-10">
                <div className="w-[190px] shrink-0">
                    <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-red-500 via-purple-500 to-blue-500 p-[1px]">
                        <Image
                            src={imageSrc}
                            alt={book.title}
                            height={300}
                            width={300}
                            loading="eager"
                            style={{ width: 'auto' }}
                            className="h-[280px] object-cover rounded-2xl"
                        />
                    </div>
                </div>

                <div className="flex-1">
                    <h1 className="text-white text-4xl font-bold mb-5">{book.title}</h1>

                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-white text-4xl font-bold">
                            {book.newPrice || book.price} UZS
                        </span>
                        {book.newPrice && (
                            <span className="line-through text-gray-500 text-xl">
                                {book.price} UZS
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 border border-[#1D2940] rounded-xl overflow-hidden mb-8">
                        <div className="p-5 border-r border-[#1D2940]">
                            <p className="text-gray-400 text-sm">Daraja</p>
                            <p className="text-white mt-1">{book.difficulty?.title}</p>
                        </div>
                        <div className="p-5 border-r border-[#1D2940]">
                            <p className="text-gray-400 text-sm">Muallif</p>
                            <p className="text-white mt-1">{book.author?.fullName}</p>
                        </div>
                        <div className="p-5 border-r border-[#1D2940]">
                            <p className="text-gray-400 text-sm">Sahifa soni</p>
                            <p className="text-white mt-1">{book.pages}</p>
                        </div>
                        <div className="p-5">
                            <p className="text-gray-400 text-sm">Chop etilgan sana</p>
                            <p className="text-white mt-1">{book.pubDate?.slice(0, 4)}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                        <button className="bg-sky-500 hover:bg-sky-600 px-8 py-3 rounded-xl flex items-center gap-3 text-white font-semibold transition-colors">
                            <ShoppingCart size={20} />
                            Savatchaga
                        </button>

                        <button
                            onClick={handleLikeToggle}
                            disabled={loading}
                            className={`w-12 h-12 rounded-xl border flex justify-center items-center transition-all ${
                                isLiked
                                    ? "bg-red-500 border-red-500 text-white"
                                    : "border-gray-600 text-white hover:bg-[#1A1A1A]"
                            }`}
                        >
                            <Heart fill={isLiked ? "white" : "none"} size={22} />
                        </button>

                        <button className="w-12 h-12 rounded-xl border border-gray-600 flex justify-center items-center text-white hover:bg-[#1A1A1A] transition-colors">
                            <Share2 size={22} />
                        </button>
                    </div>

                    <h2 className="text-white text-4xl font-bold mb-5">Kitob haqida</h2>
                    <p className="text-gray-400 leading-8">{book.description}</p>
                </div>
            </div>
        </div>
    );
}
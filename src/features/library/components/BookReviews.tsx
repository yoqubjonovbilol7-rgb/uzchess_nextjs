"use client";

import { useEffect, useState } from "react";
import { MoreVertical, Star } from "lucide-react";

interface BookReview {
    id: number;
    userId: number;
    bookId: number;
    rating: string;
    comment: string;
    date: string;
}

interface ReviewResponse {
    totalCount: number;
    totalPages: number;
    previousPage: number | null;
    currentPage: number;
    nextPage: number | null;
    data: BookReview[];
}

export default function BookReviews() {
    const [reviews, setReviews] = useState<BookReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        const getReviews = async () => {
            try {
                const res = await fetch(
                    "http://localhost:3001/public/BookReviews",
                    {
                        cache: "no-store",
                    }
                );

                const data: ReviewResponse = await res.json();

                setReviews(
                    Array.isArray(data.data)
                        ? data.data
                        : []
                );
            } catch (error) {
                console.error(
                    "Reviewlarni olishda xatolik:",
                    error
                );
                setReviews([]);
            } finally {
                setLoading(false);
            }
        };

        getReviews();
    }, []);

    if (loading) {
        return (
            <section className="mt-12">
                <h2 className="mb-6 text-3xl font-bold text-white">
                    Kitob haqida izohlar
                </h2>

                <div className="rounded-xl border border-[#232428] bg-[#18191B] p-8 text-center text-gray-400">
                    Yuklanmoqda...
                </div>
            </section>
        );
    }

    if (reviews.length === 0) {
        return (
            <section className="mt-12">
                <h2 className="mb-6 text-3xl font-bold text-white">
                    Kitob haqida izohlar
                </h2>

                <div className="rounded-xl border border-[#232428] bg-[#18191B] p-10 text-center text-gray-400">
                    Hozircha izohlar mavjud emas
                </div>
            </section>
        );
    }

    const visibleReviews = showAll
        ? reviews
        : reviews.slice(0, 3);

    return (
        <section className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl mt-12">
            <h2 className="mb-6 text-3xl font-bold text-white">
                Kitob haqida izohlar
            </h2>

            <div className="overflow-hidden rounded-xl border border-[#232428] bg-[#18191B]">
                {visibleReviews.map((review, index) => (
                    <div key={review.id} className={`p-5 ${index !== visibleReviews.length - 1 ? "border-b border-[#2A2B2F]" : ""}`}
                    >
                        <div className="flex justify-between">
                            <div className="flex gap-3">
                                <img
                                    src="/user1.png"
                                    alt="avatar"
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />

                                <div>
                                    <h3 className="font-medium text-white">
                                        User #{review.userId}
                                    </h3>

                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-xs text-gray-400">
                                            {new Date(
                                                review.date
                                            ).toLocaleDateString(
                                                "uz-UZ"
                                            )}
                                        </span>

                                        <div className="flex">
                                            {Array.from({
                                                length: 5,
                                            }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={12}
                                                    fill={
                                                        i <
                                                        Math.floor(
                                                            Number(review.rating)
                                                        )
                                                            ? "#FACC15"
                                                            : "none"
                                                    }
                                                    className={
                                                        i <
                                                        Math.floor(
                                                            Number(review.rating)
                                                        )
                                                            ? "text-yellow-400"
                                                            : "text-gray-600"
                                                    }
                                                />
                                            ))}
                                        </div>

                                        <span className="text-xs text-gray-400">
                                            ({review.rating})
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <button>
                                <MoreVertical
                                    size={18}
                                    className="text-gray-400 hover:text-white"
                                />
                            </button>
                        </div>

                        <p className="mt-4 text-sm leading-7 text-gray-300">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>

            {reviews.length > 3 && (
                <div className="mt-6 flex justify-center">
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="rounded-lg bg-[#232428] px-8 py-3 text-sm font-medium text-white transition hover:bg-[#2F3035]"
                    >
                        {showAll
                            ? "Kamroq ko'rsatish"
                            : "Barcha izohlar"}
                    </button>
                </div>
            )}
        </section>
    );
}
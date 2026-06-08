"use client";

import { Star } from "lucide-react";

interface Review {
    id: number;
    userId: number;
    bookId: number;
    rating: number;
    comment?: string;
    createdAt?: string;
    updatedAt?: string;
    date?: string;
}

interface BookReviewsProps {
    reviews: Review[];
}

export default function BookReviews({
                                        reviews,
                                    }: BookReviewsProps) {
    const formatDate = (date?: string) => {
        if (!date) return "Sana mavjud emas";

        try {
            return new Date(date).toLocaleDateString("uz-UZ", {
                day: "2-digit",
                month: "long",
                year: "numeric",
            });
        } catch {
            return "Sana mavjud emas";
        }
    };

    return (
        <section className="mt-10">
            <div className="rounded-3xl border border-zinc-800 bg-[#111111] p-6">
                <h2 className="mb-6 text-2xl font-bold text-white">
                    Sharhlar ({reviews.length})
                </h2>

                {reviews.length === 0 ? (
                    <div className="rounded-2xl border border-zinc-700 bg-zinc-900 p-6 text-center text-gray-400">
                        Hozircha sharhlar mavjud emas.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="rounded-2xl border border-zinc-700 bg-zinc-900 p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-blue-400">
                                            Foydalanuvchi #{review.userId}
                                        </h3>

                                        <div className="mt-2 flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    size={16}
                                                    className={
                                                        star <= Math.round(review.rating)
                                                            ? "fill-yellow-400 text-yellow-400"
                                                            : "text-zinc-600"
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <span className="text-sm text-gray-500">
                    {formatDate(
                        review.date ||
                        review.createdAt ||
                        review.updatedAt
                    )}
                  </span>
                                </div>

                                <p className="mt-4 whitespace-pre-line text-gray-300">
                                    {review.comment || "Sharh qoldirilmagan"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
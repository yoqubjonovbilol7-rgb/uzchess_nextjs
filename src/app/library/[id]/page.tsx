import axios from "axios";
import Link from "next/link";

import BookDetail from "@/features/library/components/BookDetail";
import BookReviews from "@/features/library/components/BookReviews";
import YouthCard from "@/features/shared/components/YouthCard/YouthCard";
import BookItem from "@/features/library/components/BookItem";

interface BookItemProps {
    id: number;
    image: string;
    title: string;
    author?: {
        fullName: string;
    };
}

interface PageProps {
    params: Promise<{
        id: string;
    }>;
}

async function getBookData(id: string) {
    try {
        const [bookRes, reviewsRes, topBooksRes] = await Promise.all([
            axios.get(`http://localhost:3001/public/book/${id}`),
            axios.get(`http://localhost:3001/public/bookReviews/`),
            axios.get("http://localhost:3001/public/book"),
        ]);

        const book = bookRes.data?.data ?? bookRes.data;

        const reviews = Array.isArray(reviewsRes.data?.data)
            ? reviewsRes.data.data
            : Array.isArray(reviewsRes.data)
                ? reviewsRes.data
                : [];

        const topBooks = Array.isArray(topBooksRes.data?.data)
            ? topBooksRes.data.data
            : Array.isArray(topBooksRes.data)
                ? topBooksRes.data
                : [];

        return {
            book,
            reviews,
            topBooks,
        };
    } catch (error) {
        console.error("API Error:", error);

        return {
            book: null,
            reviews: [],
            topBooks: [],
        };
    }
}

export default async function Page({ params }: PageProps) {
    const { id } = await params;

    const { book, reviews, topBooks } = await getBookData(id);

    if (!book) {
        return (
            <div className="py-20 text-center text-white">
                Kitob topilmadi
            </div>
        );
    }

    return (
        <div className="mx-auto flex max-w-7xl gap-8 px-5 py-10 items-start">
            <div className="flex-1">
                <BookDetail book={book} />

                <div className="mt-8">
                    <BookReviews/>
                </div>
            </div>

            <aside className="hidden lg:flex w-[320px] shrink-0 flex-col gap-6">
                <YouthCard />

                <div className="rounded-2xl border border-[#1A1A1A] bg-[#0D0D0D] p-5">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white">
                            Tavsiya
                        </h2>

                        <Link
                            href="/library"
                            className="text-sm text-gray-400 hover:text-white transition"
                        >
                            Barchasi →
                        </Link>
                    </div>

                    <div className="flex flex-col gap-5">
                        {topBooks.length > 0 ? (
                            topBooks
                                .filter((item: BookItemProps) => item.id !== Number(id))
                                .slice(0, 4)
                                .map((item: BookItemProps) => (
                                    <BookItem
                                        key={item.id}
                                        image={item.image}
                                        title={item.title}
                                        author={item.author?.fullName || "Muallif"}
                                    />
                                ))
                        ) : (
                            <p className="py-3 text-center text-sm text-gray-500">
                                Kitoblar topilmadi
                            </p>
                        )}
                    </div>
                </div>
            </aside>
        </div>
    );
}
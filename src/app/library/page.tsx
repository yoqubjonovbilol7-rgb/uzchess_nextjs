'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import SearchBar from "@/features/library/components/SearchBar";
import BookCard from "@/features/library/components/BookCard";
import BookFilter from "@/features/library/components/BookFilters";
import Image from "next/image";
import YouthCard from "@/features/shared/components/YouthCard/YouthCard";

interface Book {
    id: number;
    title: string;
    description: string;
    image: string;
    price: number;
    newPrice: number;
    rating: number;
    reviewsCount: number;
    pages: number;
    pubDate: string;

    author?: { fullName: string };
    language?: { title: string; code: string };
    difficulty?: { title: string; icon: string };
    category?: { title: string };
}

const PAGE_SIZE = 3;

export default function BookPage() {
    const [books, setBooks] = useState<Book[]>([]);
    const [search, setSearch] = useState("");

    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [selectedRating, setSelectedRating] = useState(0);

    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getBooks() {
            try {
                const res = await axios.get("http://localhost:3001/public/book");
                const data = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
                setBooks(data);
            } catch (err) {
                console.error("Book load error:", err);
                setBooks([]);
            } finally {
                setLoading(false);
            }
        }
        getBooks();
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setVisibleCount(PAGE_SIZE);
    };

    const handleLanguageChange = (value: string) => {
        setSelectedLanguage(value);
        setVisibleCount(PAGE_SIZE);
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setVisibleCount(PAGE_SIZE);
    };

    const handleDifficultyChange = (value: string) => {
        setSelectedDifficulty(value);
        setVisibleCount(PAGE_SIZE);
    };

    const handleRatingChange = (value: number) => {
        setSelectedRating(value);
        setVisibleCount(PAGE_SIZE);
    };

    const filteredBooks = (books || []).filter((book) => {
        const matchesSearch = !search || book.title?.toLowerCase().includes(search.toLowerCase());
        const matchesLanguage = !selectedLanguage || book.language?.code === selectedLanguage;
        const matchesCategory = !selectedCategory || book.category?.title === selectedCategory;
        const matchesDifficulty = !selectedDifficulty || book.difficulty?.title === selectedDifficulty;
        const matchesRating = !selectedRating || Number(book.rating) >= Number(selectedRating);
        return matchesSearch && matchesLanguage && matchesCategory && matchesDifficulty && matchesRating;
    });

    return (
        <div>
            <div className="w-full px-6 py-10 flex justify-center">
                <div className="w-full max-w-[1450px] flex gap-6 items-start justify-between">

                    <BookFilter
                        selectedLanguage={selectedLanguage}
                        setSelectedLanguage={handleLanguageChange}
                        selectedCategory={selectedCategory}
                        setSelectedCategory={handleCategoryChange}
                        selectedDifficulty={selectedDifficulty}
                        setSelectedDifficulty={handleDifficultyChange}
                        selectedRating={selectedRating}
                        setSelectedRating={handleRatingChange}
                    />

                    <div className="flex-1 flex flex-col gap-4">
                        <SearchBar search={search} setSearch={handleSearchChange} />

                        {loading ? (
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="h-[180px] bg-[#1A1D21] rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredBooks.length > 0 ? (
                            <>
                                <div className="flex flex-col gap-4">
                                    {filteredBooks.slice(0, visibleCount).map((book) => (
                                        <BookCard key={book.id} book={book} />
                                    ))}
                                </div>

                                {filteredBooks.length > 0 && (() => {
                                    const hasMore = visibleCount < filteredBooks.length;
                                    const isExpanded = visibleCount > 5;
                                    return (
                                        <div className="w-full flex justify-center mt-8">
                                            <button
                                                onClick={() => {
                                                    if (hasMore) {
                                                        setVisibleCount((prev) => prev + 5);
                                                    } else if (isExpanded) {
                                                        setVisibleCount(PAGE_SIZE);
                                                        window.scrollTo({ top: 0, behavior: "smooth" });
                                                    }
                                                }}
                                                className="px-6 py-2.5 bg-[#1A1D21] border border-[#2A2F36] text-[#B1B5C3] text-sm font-medium rounded-lg hover:bg-[#23262F] hover:text-white hover:border-[#2196F3] transition-all duration-300 cursor-pointer block"
                                            >
                                                {hasMore || !isExpanded ? "Ko‘proq" : "Kamroq"}
                                            </button>
                                        </div>
                                    );
                                })()}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Image src="/Frame.png" alt="not found" width={300} height={300} style={{ width: '300px', height: '300px' }} className="opacity-40" />
                            </div>
                        )}
                    </div>

                    <div className="w-[300px] flex flex-col gap-4 flex-shrink-0">
                        <YouthCard />
                        <Image
                            src="/Lenta.png"
                            alt="Loyiha rivojiga hissa"
                            width={300}
                            height={414}
                            loading="eager"
                            className="w-full h-auto object-cover cursor-pointer"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
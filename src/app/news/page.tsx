'use client';

import axios from "axios";
import React, { useEffect, useState } from "react";

import Search from "@/features/news/components/Search";
import NewsCard from "@/features/news/components/NewsCard";
import NewsBook from "@/features/news/components/NewsBook";
import YouthCard from "@/features/shared/components/YouthCard/YouthCard";
import Image from "next/image";
import Link from "next/link";

interface News {
    id: number;
    title: string;
    date: string;
    image: string;
}

interface Book {
    id: number;
    title: string;
    author: {
        fullName : string
    };
    image: string;
}

export default function NewsPage() {
    const [news, setNews] = useState<News[]>([]);
    const [books, setBooks] = useState<Book[]>([]);
    const [search, setSearch] = useState("");
    const [visibleCount, setVisibleCount] = useState(6);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const newsResponse = await axios.get("http://localhost:3001/public/news");
                const newsData = Array.isArray(newsResponse.data?.data)
                    ? newsResponse.data.data
                    : [];

                const fixedNews = newsData.map((item: News) => ({
                    id: item.id,
                    title: item.title,
                    date: item.date,
                    image: item.image,
                }));
                setNews(fixedNews);

                const booksResponse = await axios.get("http://localhost:3001/public/book");
                const booksData = Array.isArray(booksResponse.data)
                    ? booksResponse.data
                    : Array.isArray(booksResponse.data?.data)
                        ? booksResponse.data.data
                        : [];

                setBooks(booksData);
                setLoading(false);
            } catch (error) {
                console.error("Ma'lumotlarni yuklashda xatolik yuz berdi:", error);
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const filteredNews = news.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
    );



    return (
        <div className="container mx-auto flex flex-col lg:flex-row gap-6 px-4 py-6 flex-1">

            <section className="flex-1">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white">
                        Yangiliklar
                    </h1>
                    <Search search={search} setSearch={setSearch} />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="h-[320px] rounded-2xl bg-[#1A1D21] animate-pulse" />
                        ))}
                    </div>
                ) : filteredNews.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {filteredNews.slice(0, visibleCount).map((item) => (
                                <NewsCard
                                    key={item.id}
                                    id={item.id}
                                    date={item.date}
                                    image={item.image}
                                    title={item.title}
                                />
                            ))}
                        </div>

                        {filteredNews.length > 6 && (
                            <div className="w-full flex justify-center mt-8">
                                <button
                                    onClick={() => {
                                        if (visibleCount >= filteredNews.length) {
                                            setVisibleCount(6);
                                            window.scrollTo({ top: 0, behavior: "smooth" });
                                        } else {
                                            setVisibleCount((prev) => prev + 6);
                                        }
                                    }}
                                    className="px-6 py-2 bg-[#1A1D21] text-[#B1B5C3] text-sm rounded-md hover:bg-[#23262F] hover:text-white transition-all duration-300"
                                >
                                    {visibleCount >= filteredNews.length ? "Kamroq" : "Ko‘proq"}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Image src="/Frame.png" alt="not found"
                               width={300} height={300}
                               className="w-[250px] sm:w-[300px] h-auto object-contain"
                               style={{ width: 'auto', height: 'auto' }} />
                    </div>
                )}

            </section>


            <aside className="hidden lg:flex lg:w-[320px] flex-col gap-6 shrink-0">
                <div className="w-full">
                    <YouthCard />
                </div>

                <div className="bg-[#0D0D0D] border border-[#1A1A1A] rounded-2xl p-5 w-full">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-semibold text-xl text-white">Top kitoblar</h2>
                        <Link  href="/library" className="text-sm text-gray-400 hover:text-white transition cursor-pointer">
                            Barchasi ›
                        </Link>
                    </div>

                    <div className="flex flex-col gap-5">
                        {loading ? (
                            <p className="text-sm text-gray-400 text-center py-4">Yuklanmoqda...</p>
                        ) : books && books.length > 0 ? (
                            books.slice(0, 4).map((book) => (
                                <NewsBook
                                    key={book.id}
                                    image={book.image}
                                    title={book.title}
                                    author={book.author?.fullName}
                                />
                            ))
                        ) : null }
                    </div>
                </div>
            </aside>

        </div>
    );
}
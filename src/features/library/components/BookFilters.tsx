'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

interface Category {
    id: number;
    title: string;
}

interface Difficulty {
    id: number;
    title: string;
}

interface Language {
    id: number;
    title: string;
    code: string;
}

interface Props {
    selectedLanguage: string;
    setSelectedLanguage: (value: string) => void;

    selectedCategory: string;
    setSelectedCategory: (value: string) => void;

    selectedDifficulty: string;
    setSelectedDifficulty: (value: string) => void;

    selectedRating: number;
    setSelectedRating: (value: number) => void;
}

export default function BookFilter({
                                       selectedLanguage,
                                       setSelectedLanguage,
                                       selectedCategory,
                                       setSelectedCategory,
                                       selectedDifficulty,
                                       setSelectedDifficulty,
                                       selectedRating,
                                       setSelectedRating,
                                   }: Props) {

    const [categories, setCategories] = useState<Category[]>([]);
    const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);

    useEffect(() => {
        async function getData() {
            try {
                const [categoryRes, difficultyRes, languageRes] = await Promise.all([
                    axios.get("http://localhost:3001/public/bookCategory"),
                    axios.get("http://localhost:3001/public/difficulty"),
                    axios.get("http://localhost:3001/public/language"),
                ]);

                setCategories(categoryRes.data.data || []);
                setDifficulties(difficultyRes.data.data || []);
                setLanguages(languageRes.data.data || []);
            } catch (err) {
                console.log("Filtrlarni yuklashda xatolik:", err);
            }
        }

        getData();
    }, []);

    function clearFilters() {
        setSelectedLanguage("");
        setSelectedCategory("");
        setSelectedDifficulty("");
        setSelectedRating(0);
    }

    return (
        <div className="w-[300px] flex flex-col gap-5">
            <Image
                src="/library-banner.png"
                alt="Kutubxona"
                width={300}
                height={100}
                className="w-full h-[100px] object-cover rounded-2xl border border-[#1F2937]"
            />

            <div className="bg-[#1A1D1F] border border-[#232627] rounded-2xl p-5">
                <div className="flex justify-between mb-6">
                    <h2 className="text-[28px] font-semibold text-white">Filter</h2>
                    <button onClick={clearFilters} className="text-[#2196F3] hover:underline text-sm font-medium">
                        Tozalash
                    </button>
                </div>

                <div className="flex flex-col gap-5">

                    <div>
                        <p className="text-sm text-[#9CA3AF] uppercase mb-3  tracking-wider font-semibold">
                            Darajani tanlang:
                        </p>
                        <select
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                            className="w-full h-[52px] bg-[#232627] rounded-xl px-4 text-white border border-transparent focus:border-[#2196F3] focus:outline-none cursor-pointer"
                        >
                            <option value="">Barchasi</option>
                            {difficulties.map((difficulty) => (
                                <option key={difficulty.id} value={difficulty.title}>
                                    {difficulty.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p className="text-sm text-[#9CA3AF] uppercase mb-3 tracking-wider font-semibold">
                            Kategoriya:
                        </p>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full h-[52px] bg-[#232627] rounded-xl px-4 text-white border border-transparent focus:border-[#2196F3] focus:outline-none cursor-pointer"
                        >
                            <option value="">Barchasi</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.title}>
                                    {category.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p className="text-sm text-[#9CA3AF] uppercase mb-3 tracking-wider font-semibold">
                            Kitob tili:
                        </p>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            className="w-full h-[52px] bg-[#232627] rounded-xl px-4 text-white border border-transparent focus:border-[#2196F3] focus:outline-none cursor-pointer"
                        >
                            <option value="">Barchasi</option>
                            {languages.map((language) => (
                                <option key={language.id} value={language.code}>
                                    {language.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <p className="text-sm text-[#9CA3AF] uppercase mb-3 tracking-wider font-semibold">
                            Reyting:
                        </p>
                        <div className="h-[60px] bg-[#232627] rounded-xl flex justify-center items-center gap-2 border border-transparent">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setSelectedRating(star)}
                                    className="text-3xl transition-transform active:scale-90"
                                >
                  <span className={star <= selectedRating ? "text-yellow-400" : "text-gray-600"}>★</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
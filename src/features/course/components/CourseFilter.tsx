'use client';

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";

interface Category { id: number; title: string; }
interface Difficulty { id: number; title: string; }
interface Language { id: number; title: string; code: string; }

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

export default function CourseFilter({
                                         selectedLanguage, setSelectedLanguage,
                                         selectedCategory, setSelectedCategory,
                                         selectedDifficulty, setSelectedDifficulty,
                                         selectedRating, setSelectedRating,
                                     }: Props) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [difficulties, setDifficulties] = useState<Difficulty[]>([]);
    const [languages, setLanguages] = useState<Language[]>([]);

    useEffect(() => {
        async function getData() {
            try {
                const [categoryRes, difficultyRes, languageRes] = await Promise.all([
                    axios.get("http://localhost:3001/public/courseCategory"),
                    axios.get("http://localhost:3001/public/difficulty"),
                    axios.get("http://localhost:3001/public/language")
                ]);

                setCategories(categoryRes.data.data || []);
                setDifficulties(difficultyRes.data.data || []);
                setLanguages(languageRes.data.data || []);
            } catch (error) {
                console.log(error);
            }
        }
        getData();
    }, []);

    return (
        <div className="w-[300px] flex flex-col gap-5">
            <Image
                src="/Frame4.png"
                alt="kurslar"
                width={300}
                height={100}
                className="w-full h-[100px] object-cover rounded-2xl border border-[#1F2937]"
            />

            <div className="bg-[#1A1D1F] border border-[#232627] rounded-2xl p-5">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white text-[28px] font-semibold">Filter</h2>
                    <button
                        onClick={() => { setSelectedLanguage(""); setSelectedCategory(""); setSelectedDifficulty(""); setSelectedRating(0); }}
                        className="text-[#2196F3] text-base hover:text-blue-400"
                    >
                        Tozalash
                    </button>
                </div>

                <div className="flex flex-col gap-5">
                    <div>
                        <p className="text-[#9CA3AF] text-sm uppercase mb-3">Darajani tanlang:</p>
                        <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)} className="w-full h-[52px] bg-[#232627] border border-[#232627] rounded-xl px-4 text-white outline-none">
                            <option value="">Barchasi</option>
                            {difficulties.map((d) => <option key={d.id} value={d.title}>{d.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <p className="text-[#9CA3AF] text-sm uppercase mb-3">Kategoriya:</p>
                        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full h-[52px] bg-[#232627] border border-[#232627] rounded-xl px-4 text-white outline-none">
                            <option value="">Barchasi</option>
                            {categories.map((c) => <option key={c.id} value={c.title}>{c.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <p className="text-[#9CA3AF] text-sm uppercase mb-3">Darslik tili:</p>
                        <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="w-full h-[52px] bg-[#232627] border border-[#232627] rounded-xl px-4 text-white outline-none">
                            <option value="">Barchasi</option>
                            {languages.map((l) => <option key={l.id} value={l.code}>{l.title}</option>)}
                        </select>
                    </div>

                    <div>
                        <p className="text-[#9CA3AF] text-sm uppercase mb-3">Reyting:</p>
                        <div className="w-full h-[60px] bg-[#232627] border border-[#1F2937] rounded-xl flex items-center justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button type="button" key={star} onClick={() => setSelectedRating(star)} className="text-3xl hover:scale-110 transition-all">
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
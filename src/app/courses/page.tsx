'use client';

import axios from "axios";
import { useEffect, useState } from "react";
import SearchBar from "@/features/library/components/SearchBar";
import CourseCard from "@/features/course/components/CourseCard";
import CourseFilter from "@/features/course/components/CourseFilter";
import Image from "next/image";
import YouthCard from "@/features/shared/components/YouthCard/YouthCard";

interface Course {
    id: number;
    title: string;
    image: string;
    price: number;
    newPrice: number;
    rating: number;
    lessonsCount: number;
    author?: { fullName: string; };
    language?: { title: string; code: string; };
    difficulty?: { title: string; icon: string; };
    category?: { title: string; };
}

export default function CoursePage() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [search, setSearch] = useState("");
    const [selectedLanguage, setSelectedLanguage] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("");
    const [selectedRating, setSelectedRating] = useState(0);

    const [visibleCount, setVisibleCount] = useState(4);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function getCourses() {
            try {
                const response = await axios.get("http://localhost:3001/public/courses");
                setCourses(response.data.data || []);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        getCourses();
    }, []);

    const handleSearchChange = (value: string) => {
        setSearch(value);
        setVisibleCount(4);
    };

    const handleLanguageChange = (value: string) => {
        setSelectedLanguage(value);
        setVisibleCount(4);
    };

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        setVisibleCount(4);
    };

    const handleDifficultyChange = (value: string) => {
        setSelectedDifficulty(value);
        setVisibleCount(4);
    };

    const handleRatingChange = (value: number) => {
        setSelectedRating(value);
        setVisibleCount(4);
    };

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title?.toLowerCase().includes(search.toLowerCase());
        const matchesLanguage = selectedLanguage === "" || course.language?.code === selectedLanguage;
        const matchesCategory = selectedCategory === "" || course.category?.title === selectedCategory;
        const matchesDifficulty = selectedDifficulty === "" || course.difficulty?.title === selectedDifficulty;
        const matchesRating = selectedRating === 0 || Number(course.rating) >= Number(selectedRating);

        return matchesSearch && matchesLanguage && matchesCategory && matchesDifficulty && matchesRating;
    });

    return (
        <div className="min-h-screen bg-[#0F1113]">
            <div className="w-full px-6 py-10 flex justify-center">
                <div className="w-full max-w-[1450px] flex gap-6 items-start justify-between">

                    <CourseFilter
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
                                {Array.from({ length: 4}).map((_, i) => (
                                    <div key={i} className="h-[180px] bg-[#1A1D21] rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredCourses.length > 0 ? (
                            <>
                                <div className="flex flex-col gap-4">
                                    {filteredCourses.slice(0, visibleCount).map((course) => (
                                        <CourseCard key={course.id} course={course} />
                                    ))}
                                </div>

                                <div className="w-full flex justify-center mt-8">
                                    <button
                                        onClick={() => {
                                            if (visibleCount >= filteredCourses.length && visibleCount > 5) {
                                                setVisibleCount(4);
                                                window.scrollTo({ top: 0, behavior: "smooth" });
                                            } else {
                                                setVisibleCount((prev) => prev + 4);
                                            }
                                        }}
                                        className="px-6 py-2.5 bg-[#1A1D21] border border-[#2A2F36] text-[#B1B5C3] text-sm font-medium rounded-lg hover:bg-[#23262F] hover:text-white hover:border-[#2196F3] transition-all duration-300 cursor-pointer block"
                                    >
                                        {visibleCount >= filteredCourses.length && visibleCount > 4 ? "Kamroq" : "Ko‘proq"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Image
                                    src="/Frame.png"
                                    alt="not found"
                                    width={300}
                                    height={300}
                                    className="h-auto opacity-40"
                                />
                            </div>
                        )}
                    </div>

                    <div className="w-[300px] flex flex-col gap-4 flex-shrink-0">
                        <YouthCard />

                        <Image
                            src="/Donation.png"
                            alt="Loyiha rivojiga hissa"
                            width={300}
                            height={300}
                            loading="eager"
                            className="w-full h-auto object-cover rounded-2xl"
                            style={{ width: '100%', height: 'auto' }}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
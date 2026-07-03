import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import NewsCard from "@/features/news/components/NewsCard";
import YouthCard from "@/features/shared/components/YouthCard/YouthCard";
import React from "react";

interface News {
    id: number;
    title: string;
    image: string;
    createdAt: string;
    date?: string;
    views?: number;
    count?: number;
    author?: string;
}

interface Props { params: Promise<{ id: number }>; }

async function getNewsData(newsId: number) {
    try {
        const [newsViewsRes, newsDetailsRes, allNewsRes] = await Promise.all([
            axios.get(`http://localhost:3001/public/newsViews`),
            axios.get(`http://localhost:3001/public/news/${newsId}`),
            axios.get(`http://localhost:3001/public/news`)
        ]);

        const newsDetails = newsDetailsRes.data?.data || newsDetailsRes.data;
        const viewsListData = newsViewsRes.data?.data || newsViewsRes.data || [];
        const currentNewsView = Array.isArray(viewsListData)
            ? viewsListData.find((v) => v.newsId === newsId)
            : null;

        const news: News = {
            ...newsDetails,
            views: currentNewsView ? currentNewsView.count : (newsDetails?.views || 0)
        };

        const allNews: News[] = Array.isArray(allNewsRes.data?.data)
            ? allNewsRes.data.data
            : Array.isArray(allNewsRes.data) ? allNewsRes.data : [];

        const relatedNews = allNews
            .filter((item) => item.id !== newsId)
            .slice(0, 3);

        return { news, relatedNews };
    } catch (error) {
        console.error("Ma'lumot olishda xatolik:", error);
        return null;
    }
}

export default async function NewsDetailPage({ params }: Props) {
    const { id } = await params;
    const newsId = Number(id);

    if (isNaN(newsId)) {
        return (
            <div className="py-10 text-center text-red-500">
                Noto‘g‘ri ID: {id}
            </div>
        );
    }

    const data = await getNewsData(newsId);

    if (!data || !data.news) {
        return (
            <div className="py-10 text-center text-red-500">
                Yangilikni yuklashda xatolik yuz berdi. Backend API yo'nalishlarini tekshiring.
            </div>
        );
    }

    const { news, relatedNews } = data;

    const formattedDate = news.createdAt
        ? new Date(news.createdAt).toLocaleDateString("uz-UZ", {
            day: "numeric",
            month: "long",
            year: "numeric",
        })
        : "4-iyun, 2026";

    const formattedTime = news.createdAt
        ? new Date(news.createdAt).toLocaleTimeString("uz-UZ", {
            hour: "2-digit",
            minute: "2-digit",
        })
        : "09:41";

    const viewCount = (news.views ?? news.count ?? 0).toLocaleString("uz-UZ");

    const mainImageUrl = news?.image
        ? `http://localhost:3001/${news.image.replace(/\\/g, '/')}`
        : null;

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 py-6 flex gap-8 items-start">
                <div className="w-full max-w-3xl mx-auto">

                    <h1 className="text-2xl md:text-[28px] font-bold text-white mb-2">
                        {news.title || "Sarlavha topilmadi"}
                    </h1>

                    <div className="flex items-center gap-2 text-[#8B8FA8] text-sm mb-5">
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{formattedTime}</span>
                    </div>

                    {mainImageUrl ? (
                        <div className="rounded-xl overflow-hidden mb-6">
                            <Image
                                src={mainImageUrl}
                                alt={news.title || "Yangilik rasmi"}
                                width={1200}
                                height={650}
                                className="w-full h-auto object-cover"
                                priority
                            />
                        </div>
                    ) : (
                        <div className="w-full h-[350px] bg-[#161922] rounded-xl flex items-center justify-center text-[#555975] mb-6">
                            Backenddan rasm topilmadi (`news.image` bo'sh)
                        </div>
                    )}

                    <div className="text-[#B1B5C4] text-[15px] leading-relaxed space-y-4 mb-6">
                        <h3 className="text-lg font-bold text-white mt-4">Qonun nima haqida</h3>

                        <p>
                            <strong>Bugun Hindistonda shaxmat bo‘yicha olimpiadada to‘qqizinchi tur o‘yinlari bo‘lib o‘tdi. Tanlov 10 avgustga qadar davom etadi.</strong>
                        </p>

                        <p>
                            TOSHKENT, 7 avgust — <span className="text-[#0066FF] cursor-pointer">Sputnik.</span> 44-Jahon shaxmat olimpiadasida O‘zbekiston erkaklar terma jamoasi Armanistonlik raqiblarini mag‘lub etdi, bu haqda O‘zbekiston sportni rivojlantirish vazirligi matbuot xizmati xabar berdi.
                        </p>

                        <p>
                            Ikki davlat jamoalari o‘rtasidagi bahs 3:1 hisobida O‘zbekiston foydasiga hal bo‘ldi. Shu tariqa, hech qachon mag‘lubiyatga uchramagan respublika terma jamoasi 188 ta jamoadan iborat turnir jadvalida birinchi o‘rinni egalladi. Umumiy hisobda sportchilar 16 ochko jamg‘ardi. Turnirda ikkinchi o‘rinni Hindiston, uchinchi o‘rinni Armaniston terma jamoasi egalladi. Shu bilan birga, O‘zbekiston ayollar terma jamoasi o‘yinda Isroillik raqiblariga imkoniyatni boy berdi.
                        </p>

                        <p>
                            Bungacha o‘zbekistonlik badmintonchilar <span className="text-[#0066FF] underline cursor-pointer">"Oshiq bolalar"</span> xalqaro sport o‘yinlarida turli nomdagi to‘rtta medalni qo‘lga kiritgan edi.
                        </p>
                    </div>

                    <div className="bg-[#142A4A] border-l-4 border-[#0066FF] rounded-r-xl p-5 my-6">
                        <p className="text-[#D1E4FF] text-[15px] italic font-medium leading-relaxed mb-4">
                            "Hujjat bilan favqulodda vaziyatlardan muhofaza qilishga oid axborotni yashirish, o‘z vaqtida taqdim etmaslik yoki bila turib yolg‘on axborot taqdim etish taqiqlanishi belgilandi"
                        </p>
                        <div>
                            <p className="text-white text-[14px] font-bold">
                                {news.author || "Shohruh Baxtiyorov"}
                            </p>
                            <p className="text-[#6C7A9C] text-[12px]">
                                Favqulodda vaziyatlar vazirligi mas'ul xodimi
                            </p>
                        </div>
                    </div>

                    <div className="my-6">
                        {mainImageUrl && (
                            <Image
                                src={mainImageUrl}
                                alt={news.title || "Yangilik rasmi"}
                                width={1200}
                                height={600}
                                className="rounded-xl w-full h-auto object-cover mb-4"
                            />
                        )}
                        <ul className="list-disc pl-5 text-[#8B8FA8] text-[14px] space-y-2">
                            <li>Bugun Hindistonda shaxmat bo‘yicha olimpiadada to‘qqizinchi tur o‘yinlari bo‘lib o‘tdi. Tanlov 10 avgustga qadar davom etadi.</li>
                            <li>TOSHKENT, 7 avgust — Sputnik. 44-Jahon shaxmat olimpiadasida O‘zbekiston erkaklar terma jamoasi Armanistonlik raqiblarini mag‘lub etdi. Bu haqda O‘zbekiston Sportni rivojlantirish vazirligi matbuot xizmati xabar berdi!</li>
                            <li>Ikki davlat jamoalari o‘rtasidagi bahs 3:1 hisobida O‘zbekiston foydasiga hal bo‘ldi. Shu tariqa, hech qachon mag‘lubiyatga uchramagan respublika terma jamoasi 188 ta jamoadan iborat turnir jadvalida birinchi o‘rinni egalladi...</li>
                        </ul>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#23262F] mt-8 pt-4">
                        <div className="flex items-center gap-4">
                            <Link href="https://twitter.com" target="_blank"><Image src="/twitter.png" alt="Twitter" width={18} height={18} /></Link>
                            <Link href="https://facebook.com" target="_blank"><Image src="/facebook.png" alt="Facebook" width={18} height={18} /></Link>
                            <Link href="https://telegram.org" target="_blank"><Image src="/telegram.png" alt="Telegram" width={18} height={18} /></Link>
                            <Image src="/link.png" alt="Link" width={18} height={18} className="cursor-pointer" />
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-[#8B8FA8] text-[13px]">
                                <Image src="/Ellipse.png" alt="Views" width={16} height={16} />
                                <span>{viewCount}</span>
                            </div>

                            <button className="flex items-center gap-2 bg-[#1E2130] hover:bg-[#262A3E] border border-[#2E3248] text-white text-[12px] px-4 py-1.5 rounded-lg transition-colors">
                                <Image src="/share.png" alt="Share" width={14} height={14} />
                                <span>Поделиться</span>
                            </button>
                        </div>
                    </div>

                    {relatedNews.length > 0 && (
                        <div className="mt-10">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-[17px] font-bold text-white">O‘xshash yangiliklar</h2>
                                <Link href="/news" className="text-[12px] text-[#8B8FA8] hover:text-white transition-colors">
                                    Barcha yangiliklar →
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {relatedNews.map((item) => (
                                    <NewsCard
                                        key={item.id}
                                        id={item.id}
                                        title={item.title}
                                        image={item.image}
                                        date={item.date || new Date(item.createdAt).toLocaleDateString("uz-UZ")}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="hidden lg:flex w-[320px] flex-col gap-6 shrink-0">
                    <Image
                        src="/Donation.png"
                        alt="Loyiha rivojiga hissa"
                        width={300}
                        height={75}
                        loading="eager"
                        style={{ width: '100%', height: 'auto' }}
                        className="object-cover rounded-2xl"
                    />
                    <YouthCard />
                </div>

            </div>
        </div>
    );
}
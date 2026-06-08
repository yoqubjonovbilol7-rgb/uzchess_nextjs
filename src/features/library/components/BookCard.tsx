'use client';

import Image from 'next/image';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

interface Book {
    id: number;
    title: string;
    image: string;
    rating: number;
    price: number;
    newPrice: number;
    isLiked?: boolean;

    language?: {
        code: string;
    };

    difficulty?: {
        title: string;
        icon?: string;
    };

    category?: {
        title: string;
    };

    author?: {
        fullName: string;
    };
}

interface BookCardProps {
    book: Book;
}

export default function BookCard({book,}: BookCardProps) {

    const imgSrc = book.image
        ? (book.image.startsWith('http')
            ? book.image.replace(/\\/g, '/')
            : `http://localhost:3001/${book.image.replace(/\\/g, '/')}`)
        : '/placeholder-book.png';

    const [liked, setLiked] =
        useState(book.isLiked ?? false);

    const [loading, setLoading] =
        useState(false);

    async function handleLike(
        e: React.MouseEvent
    ) {

        e.preventDefault();

        if (loading) return;

        const token =
            localStorage.getItem('token');

        if (!token) {
            alert('Avval login qiling!');
            return;
        }

        const prevLiked = liked;

        try {

            setLoading(true);

            setLiked(!prevLiked);

            await axios.post(
                `http://localhost:3001/public/book-like/${book.id}`,
                {},
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

        } catch (err) {

            console.log(err);

            setLiked(prevLiked);

        } finally {

            setLoading(false);
        }
    }

    return (

        <Link
            href={`/library/${book.id}`}
            className="block"
        >

            <div className="w-full bg-[#14181C] border border-[#1E2328] rounded-2xl p-4 flex gap-4 hover:border-[#2196F3] transition-all">
                <div className="relative w-[100px] h-[150px] shrink-0">

                    <Image
                        src={imgSrc}
                        alt={book.title}
                        fill
                        className="object-cover rounded-lg"
                    />

                    <div className="absolute top-1 left-1 bg-[#111] text-yellow-400 text-[11px] px-2 py-1 rounded">
                        ⭐ {book.rating}
                    </div>

                    <div className="absolute bottom-1 left-1 bg-[#111] text-white text-[10px] px-2 py-1 rounded">
                        {book.language?.code}
                    </div>

                </div>

                <div className="flex flex-col flex-1 justify-between">

                    <div>

                        <h2 className="text-white text-xl font-semibold">
                            {book.title}
                        </h2>

                        <div className="mt-2">

                            {Number(book.price) !== Number(book.newPrice) && (
                                <p className="line-through text-gray-500">
                                    {Number(book.price).toLocaleString()} UZS
                                </p>

                            )}

                            <p className="text-[#84CC16] font-bold">

                                {Number(book.newPrice) === 0
                                    ? 'Bepul'
                                    : `${Number(book.newPrice).toLocaleString()} UZS`}

                            </p>

                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-[#8A8F98] text-sm">
                            <span>{book.difficulty?.title}</span>
                            <span>{book.category?.title}</span>
                            <span>{book.author?.fullName}</span>
                        </div>

                    </div>

                    <div className="flex items-center justify-between mt-5">

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                            className="bg-[#2196F3] text-white px-5 py-2 rounded-lg"
                        >
                            Savatchaga
                        </button>

                        <button
                            onClick={handleLike}
                            disabled={loading}
                        >

                            <Image
                                src={
                                    liked
                                        ? '/heart-filled.png'
                                        : '/heart-outline.png'
                                }
                                alt="heart"
                                width={22}
                                height={22}
                            />

                        </button>

                    </div>

                </div>

            </div>

        </Link>

    );
}
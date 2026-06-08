'use client';

import Image from "next/image";

interface Props {
    search: string;
    setSearch: (value: string) => void;
}

export default function SearchBar({ search, setSearch }: Props) {
    return ( <div className="relative w-full h-[70px] bg-[#232627] border border-[#1F2937] rounded-2xl px-6 flex items-center">
            <Image
        src="/icon.jpg"
        alt="search"
        width={20}
        height={20}
        className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50"
    />

        <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Izlash"
            className="bg-transparent w-full outline-none text-white text-xl placeholder:text-gray-500 pl-10 pr-10"
        />

        {search && (
            <button
                onClick={() => setSearch("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-2xl transition-all"
            >
                ×
            </button>
        )}
    </div>


);
}

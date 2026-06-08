import Image from "next/image";

interface SearchProps {
    search: string;
    setSearch: (value: string) => void;
}

export default function Search({ search, setSearch }: SearchProps) {
    return ( <div className="relative w-[280px]"> <Image
        src="/icon.jpg"
        alt="search"
        width={20}
        height={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-50"
    />

        <input
            type="text"
            placeholder="Izlash"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-[52px] bg-[#0D0D0D] border border-[#23262F] rounded-xl pl-12 pr-10 text-sm text-white placeholder:text-[#6F767E] outline-none focus:border-[#2EA6FF] transition"
        />

        {search && (
            <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6F767E] hover:text-white text-xl transition-all"
            >
                ×
            </button>
        )}
    </div>

)}

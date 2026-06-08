interface Props {
    search: string;
    setSearch: (value: string) => void;
}

export default function SearchBar({ search, setSearch }: Props) {
    return (
        <div className="w-full h-[70px] bg-[#232627] border border-[#1F2937] rounded-2xl px-6 flex items-center gap-4">
            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Izlash"
                className="bg-transparent flex-1 outline-none text-white text-xl placeholder:text-gray-500"
            />
        </div>
    );
}
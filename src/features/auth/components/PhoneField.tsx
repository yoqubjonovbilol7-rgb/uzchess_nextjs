'use client';

interface Props {
    value: string;
    onChange: (v: string) => void;
    error?: boolean;
    autoFocus?: boolean;
}

function formatPhone(val: string) {
    const d = val.replace(/\D/g, '').slice(0, 9);
    return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ');
}

export default function PhoneField({ value, onChange, error, autoFocus }: Props) {
    return (
        <div>
            <label className="block text-xs mb-1.5 text-[#9CA3AF]">Telefon raqam</label>
            <div className={`flex items-stretch rounded-xl overflow-hidden bg-[#0D1117] border ${error ? 'border-red-500' : 'border-[#1F2937]'}`}>
                <span className="flex items-center px-3 text-sm border-r border-[#1F2937] select-none whitespace-nowrap text-[#6B7280]">
                    +998
                </span>
                <input
                    type="tel"
                    value={value}
                    onChange={e => onChange(formatPhone(e.target.value))}
                    placeholder="__ ___ __ __"
                    autoFocus={autoFocus}
                    className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 outline-none placeholder:text-[#4B5563]"
                />
            </div>
        </div>
    );
}

export { formatPhone };
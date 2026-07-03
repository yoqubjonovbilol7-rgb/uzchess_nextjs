'use client';

interface Props {
    value: 'phone' | 'email';
    onChange: (v: 'phone' | 'email') => void;
}

export default function AuthTabs({ value, onChange }: Props) {
    return (
        <div className="flex rounded-xl p-1 gap-1 mb-4 bg-[#0D1117]">
            {(['phone', 'email'] as const).map(t => (
                <button
                    key={t}
                    type="button"
                    onClick={() => onChange(t)}
                    className={`flex-1 py-2 text-sm rounded-lg transition-colors font-medium ${
                        value === t ? 'bg-[#1F2937] text-white' : 'bg-transparent text-[#6B7280]'
                    }`}
                >
                    {t === 'phone' ? 'Telefon raqam orqali' : 'E-mail orqali'}
                </button>
            ))}
        </div>
    );
}
'use client';

import { useState } from 'react';

interface Props {
    value: string;
    onChange: (v: string) => void;
    label?: string;
    placeholder?: string;
    error?: boolean;
    matchState?: 'none' | 'match' | 'mismatch';
    autoFocus?: boolean;
}

function EyeOpen() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    );
}

function EyeOff() {
    return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
    );
}

function borderColor(error?: boolean, matchState?: 'none' | 'match' | 'mismatch') {
    if (error) return 'border-red-500';
    if (matchState === 'match') return 'border-green-500';
    if (matchState === 'mismatch') return 'border-red-500';
    return 'border-[#1F2937]';
}

export default function PasswordField({ value, onChange, label = 'Parol', placeholder = 'Parolni kiriting', error, matchState = 'none', autoFocus }: Props) {
    const [show, setShow] = useState(false);
    return (
        <div>
            {label && <label className="block text-xs mb-1.5 text-[#9CA3AF]">{label}</label>}
            <div className={`flex items-stretch rounded-xl overflow-hidden bg-[#0D1117] border ${borderColor(error, matchState)}`}>
                <input
                    type={show ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    className="flex-1 bg-transparent text-white text-sm px-3 py-2.5 outline-none placeholder:text-[#4B5563]"
                />
                <button
                    type="button"
                    onClick={() => setShow(v => !v)}
                    className="px-3 flex-shrink-0 text-[#6B7280] hover:text-white transition-colors"
                >
                    {show ? <EyeOff /> : <EyeOpen />}
                </button>
            </div>
        </div>
    );
}
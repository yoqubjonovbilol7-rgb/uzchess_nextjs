'use client';

import { useRef } from 'react';

const OTP_LEN = 6;

interface Props {
    digits: string[];
    onChange: (digits: string[]) => void;
    onError?: () => void;
    disabled?: boolean;
    state?: 'idle' | 'error' | 'success';
}

export { OTP_LEN };

export default function OtpBoxes({ digits, onChange, onError, disabled, state = 'idle' }: Props) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    function boxBorder(d: string) {
        if (state === 'success') return 'border-green-500';
        if (state === 'error') return 'border-red-500';
        return d ? 'border-[#2EA6FF]' : 'border-[#1F2937]';
    }
    function boxBg(d: string) {
        if (state === 'success') return 'bg-green-500/10';
        if (state === 'error') return 'bg-red-500/10';
        return d ? 'bg-[#2EA6FF]/10' : 'bg-[#0D1117]';
    }
    function boxText() {
        if (state === 'success') return 'text-green-400';
        if (state === 'error') return 'text-red-300';
        return 'text-white';
    }

    const latestDigits = useRef(digits);
    latestDigits.current = digits;

    function handleChange(i: number, val: string) {
        onError?.();
        const d = val.replace(/\D/g, '').slice(-1);
        const n = [...latestDigits.current]; n[i] = d;
        latestDigits.current = n;
        onChange(n);
        if (d) refs.current[i + 1]?.focus();
    }

    function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace') {
            if (latestDigits.current[i]) {
                const n = [...latestDigits.current]; n[i] = '';
                latestDigits.current = n; onChange(n);
            } else refs.current[i - 1]?.focus();
        }
        if (e.key === 'ArrowLeft') refs.current[i - 1]?.focus();
        if (e.key === 'ArrowRight') refs.current[i + 1]?.focus();
    }

    function handlePaste(e: React.ClipboardEvent) {
        e.preventDefault();
        const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
        if (!txt) return;
        const n = Array(OTP_LEN).fill('');
        txt.split('').forEach((c, idx) => { n[idx] = c; });
        latestDigits.current = n;
        onChange(n);
        refs.current[Math.min(txt.length, OTP_LEN - 1)]?.focus();
    }

    return (
        <div className="flex gap-2" onPaste={handlePaste}>
            {digits.map((d, i) => (
                <input
                    key={i}
                    ref={el => { refs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKey(i, e)}
                    disabled={disabled}
                    autoFocus={i === 0}
                    className={`w-full aspect-square text-center font-bold text-lg rounded-xl outline-none transition-all border ${boxBorder(d)} ${boxBg(d)} ${boxText()}`}
                />
            ))}
        </div>
    );
}
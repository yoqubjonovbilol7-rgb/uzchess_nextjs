'use client';

import { useRouter } from 'next/navigation';
import AuthRightPanel from '@/features/shared/components/AuthPanel/AuthRightPanel';

interface Props {
    children: React.ReactNode;
    onClose?: () => void;
}

export default function AuthCard({ children, onClose }: Props) {
    const router = useRouter();
    function handleClose() {
        if (onClose) onClose();
        else router.push('/');
    }
    return (
        <div className="w-full max-w-[780px] rounded-2xl overflow-hidden shadow-2xl border border-[#1F2937] flex relative bg-[#141920]">
            <button
                onClick={handleClose}
                className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-[#1F2937] text-[#6B7280] hover:text-white transition-colors text-base"
            >
                ✕
            </button>
            <div className="flex-1 px-8 py-7 min-w-0">
                {children}
            </div>
            <AuthRightPanel />
        </div>
    );
}
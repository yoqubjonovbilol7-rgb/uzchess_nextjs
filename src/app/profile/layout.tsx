'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface UserProfile {
    fullName?: string;
    avatar?: string;
    login?: string;
}

const NAV = [
    {
        href: '/profile/courses',
        label: 'Sotib olingan kurslar',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M8 6.5h8M8 10.5h8M8 14.5h5M4 4a1 1 0 011-1h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4 8h2M4 12h2M4 16h2" />
            </svg>
        ),
    },
    {
        href: '/profile/orders',
        label: 'Buyurtmalar',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
        ),
    },
    {
        href: '/profile/saved',
        label: 'Saqlanganlar',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        ),
    },
    {
        href: '/profile/settings',
        label: 'Umumiy sozlamalar',
        icon: (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
    const router   = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<UserProfile | null>(null);

    useEffect(() => {
        function loadUser() {
            const token = localStorage.getItem('token');
            if (!token) { router.push('/auth/sign-in'); return; }
            try {
                const raw = localStorage.getItem('user');
                if (raw) { setUser(JSON.parse(raw)); return; }
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({ login: payload.login ?? '' });
            } catch {
                router.push('/auth/sign-in');
            }
        }
        loadUser();
        window.addEventListener('auth-change', loadUser);
        return () => window.removeEventListener('auth-change', loadUser);
    }, [router]);

    const initials = user?.fullName
        ? user.fullName.trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
        : null;

    const avatarContent = user?.avatar
        ? <Image src={user.avatar} alt="avatar" width={64} height={64} className="w-full h-full object-cover" unoptimized />
        : initials
            ? <span>{initials}</span>
            : <svg className="w-8 h-8 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>;

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8">
            <div className="flex gap-5">
                <aside className="flex-shrink-0 flex flex-col gap-3 w-[268px]">

                    <div className="rounded-2xl flex items-center gap-4 px-5 py-5 bg-[#0D1117] border border-[#1A2030]">
                        <div className={`w-16 h-16 rounded-full overflow-hidden flex items-center justify-center font-bold text-xl text-white flex-shrink-0 ${user?.avatar ? '' : 'bg-blue-600'}`}>
                            {avatarContent}
                        </div>
                        <div>
                            <p className="font-bold leading-snug text-white text-[17px]">
                                {user?.fullName ?? user?.login ?? '...'}
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl overflow-hidden bg-[#0D1117] border border-[#1A2030]">
                        {NAV.map(item => {
                            const active = pathname === item.href;
                            return (
                                <Link key={item.href} href={item.href}
                                    className={`flex items-center gap-3 py-4 pr-4 transition-colors border-l-[3px] ${
                                        active
                                            ? 'pl-[17px] border-l-[#2196F3] text-white bg-white/[0.05]'
                                            : 'pl-5 border-l-transparent text-[#6B7280] hover:text-white hover:bg-white/[0.03]'
                                    }`}>
                                    {item.icon}
                                    <span className="text-sm font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                <main className="flex-1 min-w-0">
                    {children}
                </main>
            </div>
        </div>
    );
}
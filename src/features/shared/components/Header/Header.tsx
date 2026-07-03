'use client';

import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import AuthModal from "@/features/shared/components/AuthModal/AuthModal";
import Breadcrumb from "@/features/shared/components/Breadcrumb/Breadcrumb";
import { X, GraduationCap, BookOpen } from "lucide-react";
import api from "@/lib/api";

interface CartItemLite {
  quantity: number;
}

interface Language {
  id: number;
  title: string;
  code: string;
}

interface UserProfile {
  fullName?: string;
  avatar?: string;
  login?: string;
}

interface SearchResult {
  id: number;
  title: string;
  type: 'course' | 'book';
  href: string;
}

function highlight(text: string, query: string) {
  if (!query.trim()) return <span>{text}</span>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <span>{text}</span>;
  return (
    <span>
      {text.slice(0, idx)}
      <span className="text-[#2196F3] font-semibold">{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </span>
  );
}

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [allResults, setAllResults] = useState<SearchResult[]>([]);
  const [resultsLoaded, setResultsLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [cartCount, setCartCount] = useState(0);

  const pathname = usePathname() || "";
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    async function getLanguages() {
      try {
        const res = await axios.get("http://localhost:3001/public/language");
        setLanguages(res.data.data);
        if (res.data.data.length > 0) setSelectedLanguage(res.data.data[0]);
      } catch {}
    }
    getLanguages();
  }, []);

  useEffect(() => {
    function getProfile() {
      const token = localStorage.getItem('token');
      if (!token) { setUser(null); return; }
      try {
        const raw = localStorage.getItem('user');
        if (raw) { setUser(JSON.parse(raw)); return; }
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ login: payload.login ?? '' });
      } catch { setUser(null); }
    }
    getProfile();
    window.addEventListener('auth-change', getProfile);
    return () => window.removeEventListener('auth-change', getProfile);
  }, [pathname]);

  useEffect(() => {
    function getCartCount() {
      const token = localStorage.getItem('token');
      if (!token) { setCartCount(0); return; }
      api.get('/public/cart')
        .then(res => {
          const data: CartItemLite[] = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
          setCartCount(data.reduce((sum, item) => sum + (item.quantity ?? 1), 0));
        })
        .catch(() => setCartCount(0));
    }
    getCartCount();
    window.addEventListener('cart-change', getCartCount);
    window.addEventListener('auth-change', getCartCount);
    return () => {
      window.removeEventListener('cart-change', getCartCount);
      window.removeEventListener('auth-change', getCartCount);
    };
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { closeSearch(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Fetch courses + books once when search opens
  useEffect(() => {
    if (!searchOpen || resultsLoaded) return;
    async function load() {
      try {
        const [coursesRes, booksRes] = await Promise.allSettled([
          axios.get('http://localhost:3001/public/courses'),
          axios.get('http://localhost:3001/public/book'),
        ]);
        const courses: SearchResult[] = [];
        const books: SearchResult[] = [];
        if (coursesRes.status === 'fulfilled') {
          const data = coursesRes.value.data?.data ?? coursesRes.value.data ?? [];
          data.forEach((c: { id: number; title: string }) =>
            courses.push({ id: c.id, title: c.title, type: 'course', href: `/courses/${c.id}` })
          );
        }
        if (booksRes.status === 'fulfilled') {
          const data = booksRes.value.data?.data ?? booksRes.value.data ?? [];
          data.forEach((b: { id: number; title: string }) =>
            books.push({ id: b.id, title: b.title, type: 'book', href: `/library/${b.id}` })
          );
        }
        setAllResults([...courses, ...books]);
        setResultsLoaded(true);
      } catch {}
    }
    load();
  }, [searchOpen, resultsLoaded]);

  useEffect(() => {
    if (!searchOpen) return;
    const t = setTimeout(() => searchInputRef.current?.focus(), 50);
    return () => clearTimeout(t);
  }, [searchOpen]);

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery('');
  }

  const filtered = searchQuery.trim().length > 0
    ? allResults.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 6)
    : [];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim();
    setSearchOpen(false);
    setSearchQuery('');
    const first = allResults.find(r => r.title.toLowerCase().includes(q.toLowerCase()));
    if (first) {
      router.push(first.href);
    } else {
      router.push(`/courses?search=${encodeURIComponent(q)}`);
    }
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfileOpen(false);
    router.push('/');
  }

  const initials = user?.fullName
    ? user.fullName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase()
    : '';

  return (
    <>
      <header className="w-full bg-black border-b border-[#1A1A1A]">
        <div className="w-full max-w-[1700px] mx-auto px-8 py-4">
          <div className="h-[70px] bg-[#0D0D0D] rounded-lg px-6 flex items-center gap-6 border border-[#1F1F1F]">

            {/* Logo + lang (always visible) */}
            <div className="flex items-center gap-4 shrink-0">
              <div className="relative h-10 w-[120px] shrink-0">
                <Image src="/uzchess.png" alt="logo" fill priority style={{ objectFit: 'contain', objectPosition: 'left' }} />
              </div>
              <div className="w-px h-6 bg-[#2A2A2A]" />
              <div className="relative">
                <button
                  onClick={() => setOpen(!open)}
                  className="flex items-center gap-2 text-white text-sm"
                >
                  <span>{selectedLanguage?.title}</span>
                  <Image src={open ? "/chevron-2.png" : "/chevron-1.png"} alt="arrow" width={16} height={16} />
                </button>
                {open && (
                  <div className="absolute top-10 left-0 w-[170px] bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl overflow-hidden z-50 shadow-2xl">
                    {languages.map(lang => (
                      <button
                        key={lang.id}
                        onClick={() => { setSelectedLanguage(lang); setOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#1A1A1A] transition"
                      >
                        {lang.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Middle: nav yoki search */}
            <div className="flex-1 flex items-center justify-center min-w-0">
              {searchOpen ? (
                <div className="relative w-full" ref={searchRef}>
                  <form onSubmit={handleSearchSubmit}>
                    <div className="flex items-center bg-[#1A1D21] border border-[#2A2F36] rounded-xl px-4 py-2.5 gap-3">
                      <Image src="/search.png" alt="search" width={16} height={16} className="opacity-60 shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder="Kurs yoki kitob qidiring..."
                        className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#4A5060] min-w-0"
                      />
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-[#8A8F98] hover:text-white text-xs font-medium transition cursor-pointer shrink-0"
                        >
                          Tozalash
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Dropdown */}
                  {searchQuery.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0D0D0D] border border-[#1F1F1F] rounded-2xl overflow-hidden shadow-2xl z-10">
                      {filtered.length > 0 ? (
                        filtered.map(item => (
                          <Link
                            key={`${item.type}-${item.id}`}
                            href={item.href}
                            onClick={closeSearch}
                            className="flex items-center gap-3 px-5 py-3 hover:bg-[#1A1A1A] transition"
                          >
                            <div className="w-7 h-7 rounded-lg bg-[#1A1D21] flex items-center justify-center shrink-0">
                              {item.type === 'course'
                                ? <GraduationCap size={15} className="text-[#2196F3]" />
                                : <BookOpen size={15} className="text-[#2196F3]" />
                              }
                            </div>
                            <span className="text-white text-sm">
                              {highlight(item.title, searchQuery)}
                            </span>
                          </Link>
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                          <Image src="/Frame.png" alt="not found" width={208} height={208} style={{ width: '208px', height: '208px' }} className="opacity-90" />
                          <p className="text-[#4A5060] text-sm">Hech qanday ma&apos;lumot topilmadi</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <nav className="flex items-center gap-8 text-[15px]">
                  {[
                    { href: '/', label: 'Asosiy' },
                    { href: '/news', label: 'Yangiliklar' },
                    { href: '/courses', label: 'Kurslar' },
                    { href: '/library', label: 'Kutubxona' },
                    { href: '/souvenirs', label: 'Suvenirlar' },
                    { href: '/contact', label: "Bog'lanish" },
                  ].map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      className={`relative pb-2 transition ${pathname === href ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                      {label}
                      {pathname === href && (
                        <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#2EA6FF]" />
                      )}
                    </Link>
                  ))}
                </nav>
              )}
            </div>

            {/* Right: icons + auth */}
            <div className="flex items-center gap-5 shrink-0">
              {/* Search toggle */}
              {!searchOpen ? (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="opacity-80 hover:opacity-100 transition cursor-pointer"
                >
                  <Image src="/search.png" alt="search" width={20} height={20} />
                </button>
              ) : (
                <button
                  onClick={() => { closeSearch(); }}
                  className="text-white opacity-80 hover:opacity-100 transition cursor-pointer z-30"
                >
                  <X size={20} />
                </button>
              )}

              <Link href="/carts" className="relative">
                <Image src="/cart.png" alt="cart" width={20} height={20} className="opacity-80 hover:opacity-100 transition" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-[#2EA6FF] text-white text-[10px] font-semibold flex items-center justify-center">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              <Link href="/notifications">
                <Image src="/bell.png" alt="bell" width={20} height={20} className="opacity-80 hover:opacity-100 transition" />
              </Link>

              <div className="w-px h-6 bg-[#2A2A2A]" />

              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(v => !v)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    {user.fullName && (
                      <span className="text-white text-sm font-medium max-w-[120px] truncate">
                        {user.fullName}
                      </span>
                    )}
                    {user.avatar ? (
                      <Image src={user.avatar!} alt="avatar" width={36} height={36} className="rounded-full object-cover border-2 border-[#2EA6FF]" />
                    ) : initials ? (
                      <div className="w-9 h-9 rounded-full bg-[#2EA6FF] flex items-center justify-center text-white text-sm font-bold border-2 border-[#2EA6FF] select-none">
                        {initials}
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#1F2937] flex items-center justify-center border-2 border-[#2EA6FF]">
                        <svg className="w-5 h-5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                  </button>
                  {profileOpen && (
                    <div className="absolute right-0 top-12 w-48 bg-[#0D0D0D] border border-[#1F1F1F] rounded-xl overflow-hidden shadow-2xl z-50">
                      <div className="px-4 py-3 border-b border-[#1F1F1F]">
                        <p className="text-white text-sm font-medium truncate">{user.fullName ?? 'Foydalanuvchi'}</p>
                        <p className="text-gray-500 text-xs truncate mt-0.5">{user.login ?? ''}</p>
                      </div>
                      <Link href="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#1A1A1A] hover:text-white transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                        Profil
                      </Link>
                      <button onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#1A1A1A] hover:text-red-300 transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        Chiqish
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="bg-[#2EA6FF] hover:bg-[#1E96F0] transition px-7 py-2.5 rounded-xl font-medium flex items-center gap-2 text-white cursor-pointer"
                >
                  <span>Kirish</span>
                  <Image src="/login.png" alt="login" width={16} height={16} style={{ width: '16px', height: '16px' }} />
                </button>
              )}
            </div>
          </div>
        </div>

        <Breadcrumb />
      </header>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {/* Sahifani hira qiluvchi orqa fon — portal orqali sticky div tashqarisida */}
      {searchOpen && mounted && createPortal(
        <div
          className="fixed inset-0 z-[49] bg-black/60 backdrop-blur-sm"
          onClick={closeSearch}
        />,
        document.body
      )}
    </>
  );
}
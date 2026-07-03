'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/api';
import Image from 'next/image';

const BASE = 'http://localhost:3001';
const OTP_LEN = 6;
const RESEND_SEC = 120;

interface UserProfile { fullName?: string; avatar?: string; login?: string; phone?: string; email?: string; birthDate?: string; }

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
            <div className="relative z-10 w-full max-w-[500px] rounded-2xl shadow-2xl bg-[#1C2333] border border-[#2A3040]">
                {children}
            </div>
        </div>
    );
}

function ModalHead({ title, onClose }: { title: string; onClose: () => void }) {
    return (
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-[#2A3040]">
            <h3 className="font-bold text-white text-lg">{title}</h3>
            <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full text-sm bg-[#2A3040] text-[#9CA3AF] hover:text-white transition-colors">
                ✕
            </button>
        </div>
    );
}

function PwdInput({ label, value, onChange, placeholder, autoFocus }: {
    label: string; value: string; onChange: (v: string) => void; placeholder?: string; autoFocus?: boolean;
}) {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label className="block text-sm mb-2 text-[#9CA3AF]">{label}</label>
            <div className="flex items-stretch rounded-xl overflow-hidden bg-[#0D1117] border-2 border-[#2A3040] focus-within:border-white transition-colors">
                <input type={show ? 'text' : 'password'} value={value} onChange={e => onChange(e.target.value)}
                    placeholder={placeholder} autoFocus={autoFocus}
                    className="flex-1 bg-transparent text-sm px-4 py-3 outline-none placeholder:text-[#4B5563] text-white" />
                <button type="button" onClick={() => setShow(v => !v)} className="px-3 text-[#6B7280]">
                    {show
                        ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                        : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                </button>
            </div>
        </div>
    );
}

function SecCard({ icon, title, sub, onClick }: { icon: React.ReactNode; title: string; sub: string; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className="flex-1 flex items-center gap-4 p-4 rounded-xl text-left transition-all bg-[#0D1117] border border-[#1F2937] hover:border-white">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-white bg-[#1F2937]">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold mb-0.5 text-white text-[13px]">{title}</p>
                <p className="text-xs text-[#6B7280]">{sub}</p>
            </div>
            <svg className="w-4 h-4 flex-shrink-0 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
        </button>
    );
}

function OtpModal({ title, target, login, isEmail, onClose, onSuccess }: {
    title: string; target: string; login?: string; isEmail: boolean; onClose: () => void; onSuccess: () => void;
}) {
    const [digits, setDigits] = useState<string[]>(Array(OTP_LEN).fill(''));
    const [timer, setTimer] = useState(RESEND_SEC);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const otp = digits.join('');

    useEffect(() => {
        if (timer <= 0) return;
        const id = setTimeout(() => setTimer(t => t - 1), 1000);
        return () => clearTimeout(id);
    }, [timer]);

    function change(i: number, val: string) {
        const d = val.replace(/\D/g, '').slice(-1);
        setDigits(prev => { const n = [...prev]; n[i] = d; return n; });
        if (d) refs.current[i + 1]?.focus();
    }
    function kdown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Backspace') {
            if (digits[i]) { setDigits(prev => { const n = [...prev]; n[i] = ''; return n; }); }
            else refs.current[i - 1]?.focus();
        }
    }
    function paste(e: React.ClipboardEvent) {
        e.preventDefault();
        const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
        if (!txt) return;
        setDigits(prev => { const n = [...prev]; txt.split('').forEach((c, idx) => { n[idx] = c; }); return n; });
        refs.current[Math.min(txt.length, OTP_LEN - 1)]?.focus();
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        if (otp.length < OTP_LEN) { setError("Kodni to'liq kiriting"); return; }
        setLoading(true); setError('');
        try {
            const token = localStorage.getItem('token');
            await api.post('/auth/verify-otp', { login: login || target, code: otp });
            onSuccess();
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? "Noto'g'ri kod");
        } finally { setLoading(false); }
    }

    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(timer % 60).padStart(2, '0');

    return (
        <Modal onClose={onClose}>
            <ModalHead title={title} onClose={onClose} />
            <div className="px-6 py-5 flex flex-col gap-4">
                <p className="font-semibold text-white text-sm">
                    Tasdiqlash uchun maxsus kod {isEmail ? 'elektron pochtaga' : 'quyidagi raqamga'} yuborildi
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#0D1117] border border-[#2A3040] w-fit">
                    <span className="text-sm text-white">{target}</span>
                    <svg className="w-3.5 h-3.5 text-[#6B7280]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                </div>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <p className="text-sm mb-3 text-[#9CA3AF]">Maxsus kodni kiriting</p>
                        <div className="flex gap-2" onPaste={paste}>
                            {digits.map((d, i) => (
                                <input key={i} ref={el => { refs.current[i] = el; }}
                                    type="text" inputMode="numeric" maxLength={1} value={d}
                                    onChange={e => change(i, e.target.value)} onKeyDown={e => kdown(i, e)}
                                    autoFocus={i === 0}
                                    className={`w-full aspect-square text-center font-bold rounded-xl outline-none text-xl text-white bg-[#0D1117] border-2 ${d ? 'border-white' : 'border-[#2A3040]'}`} />
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                            <span className="text-sm text-[#6B7280]">Qayta yuborish:</span>
                            {timer > 0
                                ? <span className="text-sm font-medium text-[#F59E0B]">{mm}:{ss}</span>
                                : <button type="button" className="text-sm font-medium text-white"
                                    onClick={() => { setTimer(RESEND_SEC); setDigits(Array(OTP_LEN).fill('')); }}>
                                    Qayta yuborish
                                </button>}
                        </div>
                    </div>
                    {error && <p className="text-sm text-[#EF4444]">{error}</p>}
                    <button type="submit" disabled={otp.length < OTP_LEN || loading}
                        className="w-full py-3 rounded-xl font-semibold text-sm bg-white text-black disabled:bg-[#2A3040] disabled:text-[#4B5563] transition-colors">
                        {loading ? 'Tekshirilmoqda...' : 'Tasdiqlash'}
                    </button>
                </form>
            </div>
        </Modal>
    );
}

function PwdOtpBoxes({ digits, onChange, timer, setTimer, onResend }: {
    digits: string[]; onChange: (d: string[]) => void;
    timer: number; setTimer: (n: number) => void; onResend: () => void;
}) {
    const refs = useRef<(HTMLInputElement | null)[]>([]);
    const latest = useRef(digits); latest.current = digits;
    useEffect(() => {
        if (timer <= 0) return;
        const id = setTimeout(() => setTimer(timer - 1), 1000);
        return () => clearTimeout(id);
    }, [timer, setTimer]);
    function change(i: number, val: string) {
        const d = val.replace(/\D/g, '').slice(-1);
        const n = [...latest.current]; n[i] = d; latest.current = n; onChange(n);
        if (d) refs.current[i + 1]?.focus();
    }
    function kdown(i: number, e: React.KeyboardEvent) {
        if (e.key === 'Backspace') {
            if (latest.current[i]) { const n = [...latest.current]; n[i] = ''; latest.current = n; onChange(n); }
            else refs.current[i - 1]?.focus();
        }
    }
    function paste(e: React.ClipboardEvent) {
        e.preventDefault();
        const txt = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LEN);
        if (!txt) return;
        const n = [...latest.current]; txt.split('').forEach((c, i) => { n[i] = c; }); latest.current = n; onChange(n);
        refs.current[Math.min(txt.length, OTP_LEN - 1)]?.focus();
    }
    const mm = String(Math.floor(timer / 60)).padStart(2, '0');
    const ss = String(timer % 60).padStart(2, '0');
    return (
        <div className="flex flex-col gap-3">
            <div className="flex gap-2" onPaste={paste}>
                {digits.map((d, i) => (
                    <input key={i} ref={el => { refs.current[i] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={d}
                        onChange={e => change(i, e.target.value)} onKeyDown={e => kdown(i, e)}
                        autoFocus={i === 0}
                        className={`w-full aspect-square text-center font-bold rounded-xl outline-none text-xl text-white bg-[#0D1117] border-2 ${d ? 'border-[#2196F3]' : 'border-[#2A3040]'}`} />
                ))}
            </div>
            <div className="flex items-center gap-2">
                <span className="text-sm text-[#6B7280]">Qayta yuborish:</span>
                {timer > 0
                    ? <span className="text-sm font-medium text-[#F59E0B]">{mm}:{ss}</span>
                    : <button type="button" onClick={onResend} className="text-sm font-medium text-[#2196F3] hover:underline">Qayta yuborish</button>}
            </div>
        </div>
    );
}

export default function ProfileSettings() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    const [showLogout,   setShowLogout]   = useState(false);
    const [showEdit,     setShowEdit]     = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showPhone,    setShowPhone]    = useState(false);
    const [showEmail,    setShowEmail]    = useState(false);
    const [showOtp,      setShowOtp]      = useState(false);
    const [otpTarget,    setOtpTarget]    = useState('');
    const [otpLogin,     setOtpLogin]     = useState('');
    const [otpTitle,     setOtpTitle]     = useState('');
    const [otpIsEmail,   setOtpIsEmail]   = useState(false);

    const [pwdStep, setPwdStep] = useState<1|2>(1);
    const [curPwd, setCurPwd] = useState(''); const [showCur, setShowCur] = useState(false);
    const [newPwd, setNewPwd] = useState(''); const [cfmPwd, setCfmPwd] = useState('');
    const [showNew, setShowNew] = useState(false); const [showCfm, setShowCfm] = useState(false);
    const [pwdDigits, setPwdDigits] = useState<string[]>(Array(OTP_LEN).fill(''));
    const [pwdTimer, setPwdTimer] = useState(120);
    const [pwdErr, setPwdErr] = useState(''); const [pwdLoad, setPwdLoad] = useState(false);

    const [editName,   setEditName]   = useState('');
    const [editBirth,  setEditBirth]  = useState('');
    const [editAvatar, setEditAvatar] = useState<string | undefined>(undefined);
    const [editErr,    setEditErr]    = useState('');
    const [editLoad,   setEditLoad]   = useState(false);
    const avatarRef = useRef<HTMLInputElement>(null);

    function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => setEditAvatar(ev.target?.result as string);
        reader.readAsDataURL(file);
    }

    const [phonePwd,  setPhonePwd]  = useState(''); const [newPhone,  setNewPhone]  = useState('');
    const [phoneErr,  setPhoneErr]  = useState(''); const [phoneLoad, setPhoneLoad] = useState(false);

    const [emailPwd,  setEmailPwd]  = useState(''); const [newEmail,  setNewEmail]  = useState('');
    const [emailErr,  setEmailErr]  = useState(''); const [emailLoad, setEmailLoad] = useState(false);

    function tok() { return localStorage.getItem('token') ?? ''; }
    function fmtPhone(v: string) {
        const d = v.replace(/\D/g, '').slice(0, 9);
        return [d.slice(0,2),d.slice(2,5),d.slice(5,7),d.slice(7,9)].filter(Boolean).join(' ');
    }

    useEffect(() => {
        const token = tok();
        if (!token) { router.push('/auth/sign-in'); return; }
        try {
            const raw = localStorage.getItem('user');
            setUser(raw ? JSON.parse(raw) : { login: JSON.parse(atob(token.split('.')[1])).login ?? '' });
        } catch { router.push('/auth/sign-in'); }
        setLoading(false);
    }, [router]);

    const isEmail = user?.login?.includes('@') ?? false;
    const initials = user?.fullName
        ? user.fullName.trim().split(/\s+/).map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()
        : (user?.login?.[0]?.toUpperCase() ?? '?');

    function logout() {
        localStorage.removeItem('token'); localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth-change')); router.push('/');
    }

    function saveProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!editName.trim()) { setEditErr('Ism-sharifingizni kiriting'); return; }
        setEditLoad(true);
        const updated: UserProfile = { ...(user ?? {}), fullName: editName.trim(), birthDate: editBirth || undefined, avatar: editAvatar };
        localStorage.setItem('user', JSON.stringify(updated));
        setUser(updated); window.dispatchEvent(new Event('auth-change'));
        setShowEdit(false); setEditLoad(false);
    }

    async function sendPwdOtp(e: React.FormEvent) {
        e.preventDefault();
        if (!curPwd) { setPwdErr('Hozirgi parolni kiriting'); return; }
        if (newPwd !== cfmPwd) { setPwdErr('Parollar mos kelmayapti'); return; }
        if (newPwd.length < 6) { setPwdErr("Kamida 6 ta belgi bo'lishi kerak"); return; }
        const login = user?.login || user?.phone || user?.email || '';
        if (!login) { setPwdErr('Login topilmadi'); return; }
        setPwdLoad(true); setPwdErr('');
        try {
            await api.post('/auth/sign-in', { login, password: curPwd });
            const loginType = login.includes('@') ? 'email' : 'number';
            await api.post('/auth/resend-otp', { login, loginType });
            setPwdDigits(Array(OTP_LEN).fill('')); setPwdTimer(120); setPwdStep(2);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setPwdErr(err.response?.data?.message ?? 'Xatolik yuz berdi');
        } finally { setPwdLoad(false); }
    }

    async function confirmPwdOtp(e: React.FormEvent) {
        e.preventDefault();
        const code = pwdDigits.join('');
        if (code.length < OTP_LEN) { setPwdErr("Kodni to'liq kiriting"); return; }
        const login = user?.login || user?.phone || user?.email || '';
        setPwdLoad(true); setPwdErr('');
        try {
            await api.post('/auth/set-password', { login, code, password: newPwd });
            setShowPassword(false); setNewPwd(''); setCfmPwd(''); setPwdStep(1);
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setPwdErr(err.response?.data?.message ?? 'Xatolik yuz berdi');
        } finally { setPwdLoad(false); }
    }

    async function updatePhone(e: React.FormEvent) {
        e.preventDefault();
        const raw = newPhone.replace(/\D/g, '');
        if (raw.length < 9) { setPhoneErr("Raqamni to'liq kiriting"); return; }
        if (!phonePwd) { setPhoneErr('Parolni kiriting'); return; }
        setPhoneLoad(true); setPhoneErr('');
        try {
            const currentLogin = user?.login || '';
            await api.post('/auth/sign-in', { login: currentLogin, password: phonePwd });
            const fullPhone = '+998' + raw;
            const updated = { ...(user ?? {}), phone: fullPhone, login: fullPhone };
            localStorage.setItem('user', JSON.stringify(updated));
            setUser(updated as UserProfile);
            setShowPhone(false); setNewPhone(''); setPhonePwd('');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setPhoneErr(err.response?.data?.message ?? 'Xatolik');
        } finally { setPhoneLoad(false); }
    }

    async function updateEmail(e: React.FormEvent) {
        e.preventDefault();
        if (!newEmail.trim()) { setEmailErr('Elektron pochtani kiriting'); return; }
        if (!emailPwd) { setEmailErr('Parolni kiriting'); return; }
        setEmailLoad(true); setEmailErr('');
        try {
            const currentLogin = user?.login || '';
            const email = newEmail.trim();
            await api.post('/auth/sign-in', { login: currentLogin, password: emailPwd });
            const updated: UserProfile = { ...(user ?? {}), email, login: isEmail ? email : currentLogin };
            localStorage.setItem('user', JSON.stringify(updated));
            setUser(updated);
            window.dispatchEvent(new Event('auth-change'));
            setShowEmail(false); setNewEmail(''); setEmailPwd('');
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) setEmailErr(err.response?.data?.message ?? 'Xatolik');
        } finally { setEmailLoad(false); }
    }

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <svg className="animate-spin w-8 h-8 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        </div>
    );

    return (
        <>
            <div className="flex flex-col gap-5">
                <div className="rounded-2xl p-6 bg-[#0D1117] border border-[#1A2030]">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold text-white text-[22px]">Foydalanovchi ma&apos;lumotlari</h2>
                        <button onClick={() => setShowLogout(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Chiqish
                        </button>
                    </div>
                    <button onClick={() => { setEditName(user?.fullName ?? ''); setEditBirth(user?.birthDate ?? ''); setEditAvatar(user?.avatar); setEditErr(''); setShowEdit(true); }}
                        className="w-full text-left flex rounded-xl overflow-hidden bg-[#0D1117] border border-[#1F2937] hover:border-white transition-colors">
                        {isEmail ? (
                            <>
                                <div className="flex-1 px-5 py-4">
                                    <p className="text-xs mb-1 text-[#6B7280]">Ism</p>
                                    <p className="font-semibold text-white text-sm">{user?.fullName?.trim().split(/\s+/)[0] ?? '—'}</p>
                                </div>
                                <div className="w-px bg-[#1F2937]" />
                                <div className="flex-1 px-5 py-4">
                                    <p className="text-xs mb-1 text-[#6B7280]">Familiya</p>
                                    <p className="font-semibold text-white text-sm">{user?.fullName?.trim().split(/\s+/).slice(1).join(' ') || '—'}</p>
                                </div>
                                <div className="w-px bg-[#1F2937]" />
                                <div className="flex-1 px-5 py-4">
                                    <p className="text-xs mb-1 text-[#6B7280]">Tug&apos;ilgan sana</p>
                                    <p className="font-semibold text-white text-sm">{user?.birthDate ?? '—'}</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex-1 px-5 py-4">
                                    <p className="text-xs mb-1 text-[#6B7280]">Ism-sharifingiz</p>
                                    <p className="font-semibold text-white text-sm">{user?.fullName ?? '—'}</p>
                                </div>
                                <div className="w-px bg-[#1F2937]" />
                                <div className="flex-1 px-5 py-4">
                                    <p className="text-xs mb-1 text-[#6B7280]">Tug&apos;ilgan sana</p>
                                    <p className="font-semibold text-white text-sm">{user?.birthDate ?? '—'}</p>
                                </div>
                            </>
                        )}
                    </button>
                </div>

                <div className="rounded-2xl p-6 bg-[#0D1117] border border-[#1A2030]">
                    <h2 className="font-bold text-white mb-5 text-[22px]">Xavfsizlik</h2>
                    <div className="flex gap-4">
                        <SecCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>}
                            title="Parolni yangilash"
                            sub="Esda qoluvchi va murakkab parol qo'ying"
                            onClick={() => { setShowPassword(true); setPwdErr(''); setCurPwd(''); setNewPwd(''); setCfmPwd(''); setShowCur(false); setShowNew(false); setShowCfm(false); setPwdStep(1); }}
                        />
                        <SecCard
                            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                            title="Elektron pochtani yangilash"
                            sub="Elektron pochtangizni yangilang"
                            onClick={() => { setShowEmail(true); setEmailErr(''); setEmailPwd(''); setNewEmail(''); }}
                        />
                    </div>
                </div>
            </div>

            {showLogout && (
                <Modal onClose={() => setShowLogout(false)}>
                    <ModalHead title="Tizimdan chiqish" onClose={() => setShowLogout(false)} />
                    <div className="px-6 py-6 flex flex-col items-center text-center gap-5">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#EF4444]">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                        </div>
                        <p className="font-semibold text-white text-base">Rostan ham tizimdan chiqishni tasdiqlaysizmi?</p>
                        <div className="flex gap-3 w-full">
                            <button onClick={() => setShowLogout(false)}
                                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-[#2A3040] text-[#9CA3AF] hover:bg-[#333D50] transition-colors">
                                Bekor qilish
                            </button>
                            <button onClick={logout}
                                className="flex-1 py-3 rounded-xl font-semibold text-sm bg-white text-black">
                                Davom etish
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {showEdit && (
                <Modal onClose={() => setShowEdit(false)}>
                    <ModalHead title="Ma'lumotlarni tahrirlash" onClose={() => setShowEdit(false)} />
                    <div className="px-6 py-5">
                        <div className="flex flex-col items-center mb-6">
                            <div className="relative">
                                <div className={`w-20 h-20 rounded-full overflow-hidden flex items-center justify-center font-bold text-2xl text-white flex-shrink-0 ${editAvatar ? '' : 'bg-blue-600'}`}>
                                    {editAvatar
                                        ? <Image src={editAvatar} alt="avatar" width={80} height={80} className="w-full h-full object-cover" unoptimized />
                                        : initials}
                                </div>
                                <button type="button" onClick={() => avatarRef.current?.click()}
                                    className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center bg-[#2A3040] border-2 border-[#1C2333]">
                                    <svg className="w-3.5 h-3.5 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>
                                <input ref={avatarRef} type="file" accept="image/*" className="hidden"
                                    onChange={handleAvatarChange} />
                            </div>
                            {editAvatar && (
                                <button type="button"
                                    className="text-xs mt-2 text-[#6B7280] hover:text-[#EF4444] transition-colors"
                                    onClick={() => { setEditAvatar(undefined); if (avatarRef.current) avatarRef.current.value = ''; }}>
                                    O&apos;chirish
                                </button>
                            )}
                        </div>
                        <form onSubmit={saveProfile} className="flex flex-col gap-3">
                            <div>
                                <label className="block text-sm mb-2 text-[#9CA3AF]">Ism-sharifingiz</label>
                                <input value={editName} onChange={e => setEditName(e.target.value)}
                                    placeholder="Ism-sharifingizni kiriting"
                                    className="w-full text-sm px-4 py-3 rounded-xl outline-none placeholder:text-[#4B5563] bg-[#0D1117] border-2 border-[#2A3040] text-white focus:border-white transition-colors" />
                            </div>
                            <div>
                                <label className="block text-sm mb-2 text-[#9CA3AF]">Tug&apos;ilgan sana</label>
                                <input
                                    type="date"
                                    value={editBirth}
                                    onChange={e => setEditBirth(e.target.value)}
                                    className="w-full text-sm px-4 py-3 rounded-xl outline-none bg-[#0D1117] border-2 border-[#2A3040] text-white focus:border-white transition-colors [color-scheme:dark]" />
                            </div>
                            {editErr && <p className="text-sm text-[#EF4444]">{editErr}</p>}
                            <div className="flex justify-end mt-2">
                                <button type="submit" disabled={editLoad}
                                    className="px-10 py-2.5 rounded-xl font-semibold text-sm bg-white text-black disabled:opacity-70 transition-opacity">
                                    {editLoad ? 'Saqlanmoqda...' : 'Saqlash'}
                                </button>
                            </div>
                        </form>
                    </div>
                </Modal>
            )}

            {showPassword && (
                <Modal onClose={() => { setShowPassword(false); setPwdStep(1); }}>
                    <ModalHead title="Parolni yangilash" onClose={() => { setShowPassword(false); setPwdStep(1); }} />
                    <div className="px-6 py-5">
                        {pwdStep === 1 ? (
                            <form onSubmit={sendPwdOtp} className="flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-white text-sm">Hozirgi parol</label>
                                    <div className="flex items-center bg-[#0D1117] border border-[#2A3040] rounded-xl px-4 py-3 gap-2 focus-within:border-[#3A4050]">
                                        <input type={showCur ? 'text' : 'password'} value={curPwd} autoFocus
                                            onChange={e => { setCurPwd(e.target.value); setPwdErr(''); }}
                                            placeholder="Hozirgi parolni kiriting"
                                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#4B5563]" />
                                        <button type="button" onClick={() => setShowCur(v => !v)} className="text-[#6B7280] hover:text-white transition-colors shrink-0">
                                            {showCur ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-white text-sm">Yangi parol</label>
                                    <div className="flex items-center bg-[#0D1117] border border-[#2A3040] rounded-xl px-4 py-3 gap-2 focus-within:border-[#3A4050]">
                                        <input type={showNew ? 'text' : 'password'} value={newPwd} autoFocus
                                            onChange={e => { setNewPwd(e.target.value); setPwdErr(''); }}
                                            placeholder="Yangi parolni kiriting"
                                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#4B5563]" />
                                        <button type="button" onClick={() => setShowNew(v => !v)} className="text-[#6B7280] hover:text-white transition-colors shrink-0">
                                            {showNew ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-white text-sm">Yangi parolni tasdiqlang</label>
                                    <div className="flex items-center bg-[#0D1117] border border-[#2A3040] rounded-xl px-4 py-3 gap-2 focus-within:border-[#3A4050]">
                                        <input type={showCfm ? 'text' : 'password'} value={cfmPwd}
                                            onChange={e => { setCfmPwd(e.target.value); setPwdErr(''); }}
                                            placeholder="Yangi parolni kiriting"
                                            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-[#4B5563]" />
                                        <button type="button" onClick={() => setShowCfm(v => !v)} className="text-[#6B7280] hover:text-white transition-colors shrink-0">
                                            {showCfm ? <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>}
                                        </button>
                                    </div>
                                </div>
                                {pwdErr && <p className="text-sm text-[#EF4444] -mt-1">{pwdErr}</p>}
                                <button type="submit" disabled={!curPwd || !newPwd || !cfmPwd || pwdLoad}
                                    className="w-full py-3 rounded-xl font-semibold text-sm bg-[#2196F3] text-white hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors mt-1">
                                    {pwdLoad ? 'Yuborilmoqda...' : 'Davom etish'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={confirmPwdOtp} className="flex flex-col gap-4">
                                <p className="text-sm text-[#9CA3AF]">Tasdiqlash kodi {user?.login || user?.phone || user?.email} ga yuborildi</p>
                                <PwdOtpBoxes digits={pwdDigits} onChange={setPwdDigits} timer={pwdTimer} setTimer={setPwdTimer}
                                    onResend={async () => {
                                        const login = user?.login || user?.phone || user?.email || '';
                                        const loginType = login.includes('@') ? 'email' : 'number';
                                        try { await api.post('/auth/resend-otp', { login, loginType }); setPwdTimer(120); setPwdDigits(Array(OTP_LEN).fill('')); } catch { /* ignore */ }
                                    }} />
                                {pwdErr && <p className="text-sm text-[#EF4444] -mt-1">{pwdErr}</p>}
                                <button type="submit" disabled={pwdDigits.join('').length < OTP_LEN || pwdLoad}
                                    className="w-full py-3 rounded-xl font-semibold text-sm bg-[#2196F3] text-white hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    {pwdLoad ? 'Yangilanmoqda...' : 'Yangilash'}
                                </button>
                            </form>
                        )}
                    </div>
                </Modal>
            )}

            {showEmail && (
                <Modal onClose={() => setShowEmail(false)}>
                    <ModalHead title="Elektron pochtani yangilash" onClose={() => setShowEmail(false)} />
                    <div className="px-6 py-5">
                        <form onSubmit={updateEmail} className="flex flex-col gap-4">
                            <PwdInput label="Parol" value={emailPwd} onChange={v => { setEmailPwd(v); setEmailErr(''); }} placeholder="Parolni kiriting" autoFocus />
                            <div>
                                <label className="block text-sm mb-2 text-[#9CA3AF]">Yangi elektron pochtangizni kiriting</label>
                                <input type="email" value={newEmail} onChange={e => { setNewEmail(e.target.value); setEmailErr(''); }}
                                    placeholder="example@uzchess.uz"
                                    className="w-full text-sm px-4 py-3 rounded-xl outline-none placeholder:text-[#4B5563] bg-[#0D1117] border-2 border-[#2A3040] text-white focus:border-white transition-colors" />
                            </div>
                            {emailErr && <p className="text-sm text-[#EF4444]">{emailErr}</p>}
                            <button type="submit" disabled={!emailPwd || !newEmail || emailLoad}
                                className="w-full py-3 rounded-xl font-semibold text-sm bg-[#2196F3] text-white hover:bg-[#1976D2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                {emailLoad ? 'Yuklanmoqda...' : 'Saqlash'}
                            </button>
                        </form>
                    </div>
                </Modal>
            )}

        </>
    );
}
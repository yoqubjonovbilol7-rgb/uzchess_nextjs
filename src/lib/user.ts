export interface StoredUser {
    fullName?: string;
    login?: string;
    avatar?: string;
}

export function getStoredUser(): StoredUser | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function setStoredUser(u: StoredUser) {
    localStorage.setItem('user', JSON.stringify(u));
}

export function clearStoredUser() {
    localStorage.removeItem('user');
    localStorage.removeItem('user_pending');
}

export function getLoginFromToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
        const token = localStorage.getItem('token');
        if (!token) return null;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.login ?? null;
    } catch { return null; }
}
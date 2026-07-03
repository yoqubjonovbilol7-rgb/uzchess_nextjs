export interface SavedCourse {
    id: number;
    title: string;
    image?: string;
    author?: { fullName?: string };
    level?: string;
    lessonsCount?: number;
    rating?: number;
}

export interface SavedBook {
    id: number;
    title: string;
    image?: string;
    author?: { fullName?: string };
    level?: string;
    rating?: number;
}

export function getSavedCourses(): SavedCourse[] {
    try {
        return JSON.parse(localStorage.getItem('saved_courses') ?? '[]');
    } catch { return []; }
}

export function getSavedBooks(): SavedBook[] {
    try {
        return JSON.parse(localStorage.getItem('saved_books') ?? '[]');
    } catch { return []; }
}

export function toggleSavedCourse(course: SavedCourse): boolean {
    const list = getSavedCourses();
    const idx = list.findIndex(c => c.id === course.id);
    if (idx >= 0) {
        list.splice(idx, 1);
        localStorage.setItem('saved_courses', JSON.stringify(list));
        return false;
    } else {
        list.push(course);
        localStorage.setItem('saved_courses', JSON.stringify(list));
        return true;
    }
}

export function toggleSavedBook(book: SavedBook): boolean {
    const list = getSavedBooks();
    const idx = list.findIndex(b => b.id === book.id);
    if (idx >= 0) {
        list.splice(idx, 1);
        localStorage.setItem('saved_books', JSON.stringify(list));
        return false;
    } else {
        list.push(book);
        localStorage.setItem('saved_books', JSON.stringify(list));
        return true;
    }
}

export function isSavedCourse(id: number): boolean {
    return getSavedCourses().some(c => c.id === id);
}

export function isSavedBook(id: number): boolean {
    return getSavedBooks().some(b => b.id === id);
}

export interface SavedSouvenir {
    id: number;
    title: string;
    price?: number;
    images?: { image?: string }[];
}

export function getSavedSouvenirs(): SavedSouvenir[] {
    try { return JSON.parse(localStorage.getItem('saved_souvenirs') ?? '[]'); }
    catch { return []; }
}

export function toggleSavedSouvenir(souvenir: SavedSouvenir): boolean {
    const list = getSavedSouvenirs();
    const idx = list.findIndex(s => s.id === souvenir.id);
    if (idx >= 0) {
        list.splice(idx, 1);
        localStorage.setItem('saved_souvenirs', JSON.stringify(list));
        return false;
    } else {
        list.push(souvenir);
        localStorage.setItem('saved_souvenirs', JSON.stringify(list));
        return true;
    }
}

export function isSavedSouvenir(id: number): boolean {
    return getSavedSouvenirs().some(s => s.id === id);
}

export interface PurchasedCourse {
    id: number;
    title: string;
    image?: string;
    description?: string;
    author?: { fullName?: string };
    difficulty?: { title?: string; icon?: string };
    lessonsCount?: number;
    rating?: number;
}

export function getPurchasedCourses(): PurchasedCourse[] {
    try { return JSON.parse(localStorage.getItem('purchased_courses') ?? '[]'); }
    catch { return []; }
}

export function addPurchasedCourse(course: PurchasedCourse): void {
    const list = getPurchasedCourses();
    if (!list.some(c => c.id === course.id)) {
        list.push(course);
        localStorage.setItem('purchased_courses', JSON.stringify(list));
    }
}

export function isPurchasedCourse(id: number): boolean {
    return getPurchasedCourses().some(c => c.id === id);
}
// store/telegram-store.js
const BACKEND_URL = 'http://localhost:3000/api/news';
const CACHE_KEY = 'ebs_global_news';

export async function syncNews() {
    try {
        const response = await fetch(BACKEND_URL);
        const freshNews = await response.json();

        localStorage.setItem(CACHE_KEY, JSON.stringify({
            lastUpdated: Date.now(),
            data: freshNews
        }));

        return freshNews;
    } catch (err) {
        console.warn("Using cached data.");
        return getLocalNews();
    }
}

export function getLocalNews() {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached).data : [];
}
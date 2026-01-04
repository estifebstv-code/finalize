/**
 * EBS News - Frontend Controller
 * Connects to a secure Node.js backend to fetch Telegram data
 */

const BACKEND_URL = 'http://localhost:3000/api/news';
const CACHE_KEY = 'news_portal_cache';
const ITEMS_PER_PAGE = 10;

// State Management
let allNews = [];
let currentPageItems = [];
let currentPage = 1;
let currentModalIndex = 0;
let oldestPostId = null;
let isLoading = false;
let currentCategory = 'all';

/**
 * Initialization
 */
async function init() {
    // 1. Load from cache for instant UI feedback
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
        allNews = JSON.parse(cache);
        if (allNews.length > 0) {
            oldestPostId = Math.min(...allNews.map(i => i.postId));
            hideSkeleton();
            renderPage(1);
            updateTicker();
        }
    }

    // 2. Fetch fresh data from server
    await fetchNews();
    setupEventListeners();
}

/**
 * Fetch Data from Secure Backend
 */
async function fetchNews(isLoadMore = false) {
    if (isLoading) return;
    isLoading = true;

    try {
        let url = BACKEND_URL;
        // If we are loading more, tell the backend which post ID to start before
        if (isLoadMore && oldestPostId) {
            url += `?before=${oldestPostId}`;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');

        const freshNews = await response.json();

        if (freshNews && freshNews.length > 0) {
            // Update tracking for the oldest post
            const batchOldest = Math.min(...freshNews.map(i => i.postId));
            if (!oldestPostId || batchOldest < oldestPostId) {
                oldestPostId = batchOldest;
            }

            // Merge and remove duplicates based on postId
            const combined = isLoadMore ? [...allNews, ...freshNews] : [...freshNews, ...allNews];
            allNews = Array.from(new Map(combined.map(item => [item.postId, item])).values())
                .sort((a, b) => b.postId - a.postId); // Keep newest first

            // Save a snapshot to cache
            localStorage.setItem(CACHE_KEY, JSON.stringify(allNews.slice(0, 50)));

            hideSkeleton();
            renderPage(currentPage);
            updateTicker();
        }
    } catch (err) {
        console.error("Backend connection error:", err);
        const ticker = document.getElementById('ticker-scroll');
        if (ticker && allNews.length === 0) ticker.innerText = "Offline: Unable to reach news server.";
    } finally {
        isLoading = false;
    }
}

/**
 * UI Rendering Logic
 */
function renderPage(page) {
    currentPage = page;

    // Filter by category if one is selected
    const filteredNews = currentCategory === 'all'
        ? allNews
        : allNews.filter(item => item.full.toLowerCase().includes(`#${currentCategory.toLowerCase()}`));

    const start = (page - 1) * ITEMS_PER_PAGE;
    currentPageItems = filteredNews.slice(start, start + ITEMS_PER_PAGE);

    // Auto-fetch more if we reach the end of current local data
    if (currentPageItems.length === 0 && page > 1 && !isLoading) {
        fetchNews(true);
        return;
    }

    const heroArea = document.getElementById('hero-area');
    const grid = document.getElementById('news-grid');

    if (currentPageItems.length > 0) {
        // First item is the Hero
        heroArea.innerHTML = createCardHTML(currentPageItems[0], 0, true);

        // Others go in the grid
        const gridItems = currentPageItems.slice(1);
        grid.innerHTML = gridItems.map((item, i) => createCardHTML(item, i + 1, false)).join('');
    } else {
        grid.innerHTML = "<p style='padding:20px;'>No news found in this category.</p>";
        heroArea.innerHTML = "";
    }

    updatePaginationUI(filteredNews.length);
}

function createCardHTML(item, index, isHero) {
    return `
        <div class="${isHero ? 'hero-card' : 'news-card'}">
            <img src="${item.img}" onerror="this.src='https://via.placeholder.com/800x400?text=News+Image'">
            <div class="card-body">
                <h2>${item.title}</h2>
                <button class="read-more-btn" onclick="openModal(${index})">Read Full Story</button>
            </div>
        </div>
    `;
}

/**
 * Modal Logic
 */
window.openModal = function (index) {
    currentModalIndex = index;
    updateModalContent();
    const modal = document.getElementById('news-modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
};

function updateModalContent() {
    const item = currentPageItems[currentModalIndex];
    if (!item) return;

    document.getElementById('modal-body').innerHTML = `
        <img src="${item.img}" onerror="this.src='https://via.placeholder.com/800x400?text=Image+Unavailable'">
        <h2>${item.title}</h2>
        <div class="modal-text" style="font-size:1.1rem; line-height:1.7; color:#333;">
            ${item.full}
        </div>
    `;

    document.getElementById('modal-prev').disabled = (currentModalIndex === 0);
    document.getElementById('modal-next').disabled = (currentModalIndex === currentPageItems.length - 1);
}

/**
 * Ticker and Helpers
 */
function updateTicker() {
    const ticker = document.getElementById('ticker-scroll');
    if (!ticker || allNews.length === 0) return;

    const headlines = allNews.slice(0, 10).map(n => n.title);
    const content = headlines.map(h => `<span class="ticker-item">● ${h}</span>`).join('');
    ticker.innerHTML = content + content; // Double for seamless loop
}

function hideSkeleton() {
    const skeleton = document.getElementById('skeleton-screen');
    const content = document.getElementById('main-content');
    if (skeleton) skeleton.style.display = 'none';
    if (content) content.style.display = 'block';
}

function updatePaginationUI(totalFilteredCount) {
    const pgNum = document.getElementById('page-number');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');

    if (pgNum) pgNum.innerText = `Page ${currentPage}`;
    if (prevBtn) prevBtn.disabled = (currentPage === 1);
    // Enable "Next" if there are more items in current array OR if we can fetch more from server
    if (nextBtn) nextBtn.disabled = (currentPage * ITEMS_PER_PAGE >= totalFilteredCount && allNews.length > 100);
}

/**
 * Event Listeners
 */
function setupEventListeners() {
    // Modal Navigation
    document.getElementById('modal-next').onclick = () => { currentModalIndex++; updateModalContent(); };
    document.getElementById('modal-prev').onclick = () => { currentModalIndex--; updateModalContent(); };
    document.getElementById('close-modal').onclick = () => {
        document.getElementById('news-modal').style.display = 'none';
        document.body.style.overflow = 'auto';
    };

    // Pagination
    document.getElementById('next-btn').onclick = () => renderPage(currentPage + 1);
    document.getElementById('prev-btn').onclick = () => renderPage(currentPage - 1);

    // Refresh
    document.getElementById('refresh-btn').onclick = () => {
        localStorage.removeItem(CACHE_KEY);
        location.reload();
    };

    // Categories
    document.querySelectorAll('.cat-link').forEach(link => {
        link.onclick = (e) => {
            document.querySelectorAll('.cat-link').forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.getAttribute('data-category');
            renderPage(1);
        };
    });
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

// const ITEMS_PER_PAGE = 10;
// let allNews = [];
// let currentPage = 1;

// async function init() {
//     const res = await fetch('/api/news');
//     allNews = await res.json();
//     hideSkeleton();
//     renderPage(1);
// }

// async function init() {
//     try {
//         const res = await fetch('/api/news'); // This now works because Express serves it
//         allNews = await res.json();
//         hideSkeleton();
//         renderPage(1);
//     } catch (err) {
//         console.error("Failed to fetch news:", err);
//     }
// }


// function renderPage(page) {
//     currentPage = page;
//     const start = (page - 1) * ITEMS_PER_PAGE;
//     const currentItems = allNews.slice(start, start + ITEMS_PER_PAGE);

//     const heroArea = document.getElementById('hero-area');
//     const grid = document.getElementById('news-grid');

//     if (currentItems.length > 0) {
//         heroArea.innerHTML = createCardHTML(currentItems[0], 0, true);
//         grid.innerHTML = currentItems.slice(1).map((item, i) => createCardHTML(item, i + 1, false)).join('');
//     }

//     updatePaginationUI();
// }

// function createCardHTML(item, index, isHero) {
//     return `
//         <div class="${isHero ? 'hero-card' : 'news-card'}">
//             <img src="${item.img}" onerror="this.src='https://via.placeholder.com/800x400?text=News+Image'">
//             <div class="card-body">
//                 <h2>${item.title}</h2>
//                 <button class="read-more-btn" onclick="openModal(${index})">Read More</button>
//             </div>
//         </div>
//     `;
// }

// // ... modal & pagination functions remain mostly the same ...

// // document.addEventListener('DOMContentLoaded', init);


// function openModal(index) {
//     currentModalIndex = index;
//     updateModalContent();
//     document.getElementById('news-modal').style.display = 'block';
//     document.body.style.overflow = 'hidden';
// }

// function updateModalContent() {
//     const item = currentPageItems[currentModalIndex];
//     if (!item) return;
//     document.getElementById('modal-body').innerHTML = `
//         <img src="${item.img}">
//         <h2>${item.title}</h2>
//         <div style="font-size:1.1rem; line-height:1.7;">${item.full}</div>
//     `;
//     document.getElementById('modal-prev').disabled = (currentModalIndex === 0);
//     document.getElementById('modal-next').disabled = (currentModalIndex === currentPageItems.length - 1);
// }

// document.getElementById('modal-next').onclick = () => { currentModalIndex++; updateModalContent(); };
// document.getElementById('modal-prev').onclick = () => { currentModalIndex--; updateModalContent(); };
// document.getElementById('close-modal').onclick = () => {
//     document.getElementById('news-modal').style.display = 'none';
//     document.body.style.overflow = 'auto';
// };

// document.getElementById('next-btn').onclick = () => {
//     if ((currentPage * ITEMS_PER_PAGE) >= allNews.length) {
//         fetchWithRetry(true).then(() => renderPage(currentPage + 1));
//     } else {
//         renderPage(currentPage + 1);
//     }
// };

// document.getElementById('prev-btn').onclick = () => renderPage(currentPage - 1);

// document.getElementById('refresh-btn').onclick = () => {
//     localStorage.removeItem(CACHE_KEY);
//     location.reload();
// };

// function hideSkeleton() {
//     const skeleton = document.getElementById('skeleton-screen');
//     const content = document.getElementById('main-content');
//     if (skeleton) skeleton.style.display = 'none';
//     if (content) content.style.display = 'block';
// }

// function updatePaginationUI() {
//     const pgNum = document.getElementById('page-number');
//     const prevBtn = document.getElementById('prev-btn');
//     if (pgNum) pgNum.innerText = `Page ${currentPage}`;
//     if (prevBtn) prevBtn.disabled = (currentPage === 1);
// }

// function updateTicker() {
//     const ticker = document.getElementById('ticker-scroll');
//     if (!ticker || allNews.length === 0) return;
//     const headlines = allNews.slice(0, 8).map(n => n.title);
//     ticker.innerHTML = headlines.map(h => `<span class="ticker-item">● ${h}</span>`).join('') +
//         headlines.map(h => `<span class="ticker-item">● ${h}</span>`).join('');
// }

// document.addEventListener('DOMContentLoaded', init);
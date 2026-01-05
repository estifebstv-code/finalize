// store/news-service.js

const CONFIG = {
    SERVER_URL: 'http://localhost:3000/api/news',
    CACHE_KEY: 'ebs_news_cache',
    DEFAULT_IMG: 'https://via.placeholder.com/1200x600?text=EBS+News'
};

/**
 * Main function to fetch and display news
 */
export async function displayNews(containerId, limit = 5) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. Try to load from LocalStorage first (for speed)
    const cached = JSON.parse(localStorage.getItem(CONFIG.CACHE_KEY) || '[]');
    if (cached.length > 0) render(container, cached.slice(0, limit));

    // 2. Fetch fresh data from your server
    try {
        const response = await fetch(CONFIG.SERVER_URL);
        const newsData = await response.json();

        localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(newsData));
        render(container, newsData.slice(0, limit));
    } catch (err) {
        console.error("News Fetch Error:", err);
    }
}

/**
 * Generates the HTML based on your specific structure
 */
function render(container, newsItems) {
    container.innerHTML = newsItems.map(item => `
        <div class="top-story card" style="margin-bottom: 30px;">
          <img
            src="${item.img || CONFIG.DEFAULT_IMG}"
            alt="${item.title}"
            onerror="this.src='${CONFIG.DEFAULT_IMG}'"
          />
          <div class="card-body">
            <h2>TOP STORIES: ${item.title}</h2>
            <p class="text-collapse">
              ${item.intro}
              <span id="more-${item.postId}" class="hidden" style="display: none;">
                ${item.full || ''}
              </span>
            </p>
            <button class="btn-read" onclick="toggleReadMore(${item.postId})">
              Read More
            </button>
          </div>
        </div>
    `).join('');
}

/**
 * Global function to handle the "Read More" click
 * We attach it to 'window' so the HTML 'onclick' can find it.
 */
window.toggleReadMore = function (postId) {
    const moreText = document.getElementById(`more-${postId}`);
    const btnText = event.target;

    if (moreText.style.display === "none" || moreText.classList.contains("hidden")) {
        moreText.style.display = "inline";
        moreText.classList.remove("hidden");
        btnText.innerHTML = "Read Less";
    } else {
        moreText.style.display = "none";
        moreText.classList.add("hidden");
        btnText.innerHTML = "Read More";
    }
};
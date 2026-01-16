
const API_KEY = 'AIzaSyC7yaIulYFJM8FxGVPrRlk00LJ9VqJVhMk';
const CHANNEL_ID = 'UCVcc_sbg3AcXLV9vVufJrGg';;

let currentPlaylistId = '';
let nextPageToken = '';

// --- Navigation Logic ---

function showPlaylistsView() {
    document.getElementById('playlistsGrid').style.display = 'grid';
    document.getElementById('videosView').style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';
    document.getElementById('mainTitle').innerText = "Channel Playlists";
}

function showVideosView(playlistId, playlistTitle) {
    currentPlaylistId = playlistId;
    nextPageToken = ''; // Reset pagination
    document.getElementById('videosGrid').innerHTML = ''; // Clear old videos

    document.getElementById('playlistsGrid').style.display = 'none';
    document.getElementById('videosView').style.display = 'block';
    document.getElementById('backBtn').style.display = 'inline-block';
    document.getElementById('mainTitle').innerText = playlistTitle;

    fetchVideos();
}

// --- API Logic ---

// 1. Fetch all playlists for the channel
async function fetchPlaylists() {
    const url = `https://www.googleapis.com/youtube/v3/playlists?part=snippet&channelId=${CHANNEL_ID}&maxResults=50&key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        renderPlaylists(data.items);
    } catch (e) { console.error("Error fetching playlists", e); }
}

function renderPlaylists(playlists) {
    const grid = document.getElementById('playlistsGrid');
    playlists.forEach(pl => {
        const card = document.createElement('div');
        card.className = 'card show-card';
        card.onclick = () => showVideosView(pl.id, pl.snippet.title);
        card.innerHTML = `
            <div class="media-container show-card">
                <img src="${pl.snippet.thumbnails.high.url}">
            </div>
            <div class="card-header show-content">${pl.snippet.title}</div>
        `;
        grid.appendChild(card);
    });
}

// 2. Fetch videos inside a specific playlist (10 at a time)
async function fetchVideos() {
    let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${currentPlaylistId}&maxResults=10&key=${API_KEY}`;
    if (nextPageToken) url += `&pageToken=${nextPageToken}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        nextPageToken = data.nextPageToken || '';

        renderVideos(data.items);
        document.getElementById('loadMoreBtn').style.display = nextPageToken ? 'block' : 'none';
    } catch (e) { console.error("Error fetching videos", e); }
}

function renderVideos(items) {
    const grid = document.getElementById('videosGrid');
    items.forEach(item => {
        // Skip private videos
        if (item.snippet.title === "Private video") return;

        const vId = item.snippet.resourceId.videoId;
        const title = item.snippet.title;
        const desc = item.snippet.description.substring(0, 100) + "...";
        const thumb = item.snippet.thumbnails.high.url;

        const card = document.createElement('div');
        card.className = 'card show-card';
        card.innerHTML = `
            <div class="card-header">${title}</div>
            <div class="media-container" id="vid-ctx-${vId}" onclick="playInline('${vId}')">
                <img src="${thumb}" id="img-${vId}">
                <div id="player-${vId}"></div>
            </div>
            <div class="card-body">${desc}</div>
        `;
        grid.appendChild(card);
    });
}

// 
if (window.gapi && gapi.ytsubscribe) {
    gapi.ytsubscribe.go();
}

// 3. Inline Player Logic
function playInline(vId) {
    const container = document.getElementById(`player-${vId}`);
    const img = document.getElementById(`img-${vId}`);

    // Inject Iframe with Autoplay and Fullscreen enabled
    container.innerHTML = `
        <iframe 
            src="https://www.youtube.com/embed/${vId}?autoplay=1&rel=0" 
            allow="autoplay; fullscreen; picture-in-picture" 
            allowfullscreen>
        </iframe>`;
    img.style.display = 'none';
}

function filterContent() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        // We look for the title text inside the card header
        const title = card.querySelector('.card-header').innerText.toLowerCase();

        if (title.includes(searchTerm)) {
            card.style.display = "flex"; // Show card
        } else {
            card.style.display = "none"; // Hide card
        }
    });
}

function setCategory(catName) {
    document.getElementById('searchInput').value = catName;
    filterContent(); // Run the filter
}

// Initialize
window.onload = fetchPlaylists;
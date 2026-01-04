// server.js
require('dotenv').config();
const token = process.env.TELEGRAM_BOT_TOKEN;
const port = process.env.PORT || 3000;
const express = require('express');
const axios = require('axios');
const { JSDOM } = require('jsdom');
const cors = require('cors');

const app = express();
app.use(cors());

// Use environment variables for your token!
const BOT_TOKEN = process.env.BOT_TOKEN || token;
const CHANNEL_NAME = "ebstvnews";

app.get('/api/news', async (req, res) => {
    try {
        const { before } = req.query;
        let url = `https://t.me/s/${CHANNEL_NAME}`;
        if (before) url += `?before=${before}`;

        // 1. Fetch the Telegram Web Preview (Server-side scrape)
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const dom = new JSDOM(response.data);
        const doc = dom.window.document;
        const posts = Array.from(doc.querySelectorAll('.tgme_widget_message_wrap'));

        const newsItems = posts.reverse().map(el => {
            const textEl = el.querySelector('.tgme_widget_message_text');
            const photoEl = el.querySelector('.tgme_widget_message_photo_wrap');
            const dateLink = el.querySelector('.tgme_widget_message_date');

            if (!textEl || !dateLink) return null;

            const postLink = dateLink.getAttribute('href');
            const postId = postLink.split('/').pop();

            let img = `https://picsum.photos/seed/${postId}/800/400`;
            if (photoEl) {
                const style = photoEl.getAttribute('style');
                const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match) img = match[1];
            }

            return {
                postId: parseInt(postId),
                title: textEl.textContent.split('\n')[0].substring(0, 70) + "...",
                intro: textEl.textContent.substring(0, 130) + "...",
                full: textEl.innerHTML,
                img: img,
                date: dateLink.textContent
            };
        }).filter(item => item !== null);

        res.json(newsItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch news" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Secure Backend running on port ${PORT}`));

// // import express from "express";
// // import fetch from "node-fetch";
// // import cors from "cors";

// // const app = express();
// // app.use(cors());

// // const BOT_TOKEN = "8503812223:AAH3K89m8-CDdn026fEF5NXiHYLQ9cbYF_I";
// // const CHANNEL_ID = "-1003684280254"; // numeric channel ID

// // app.get("/news", async (req, res) => {
// //     try {
// //         const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
// //         const r = await fetch(url);
// //         const data = await r.json();

// //         const messages = data.result
// //             .map(u => u.channel_post)
// //             .filter(Boolean)
// //             .reverse()
// //             .map(msg => ({
// //                 postId: msg.message_id,
// //                 text: msg.text || "",
// //                 html: msg.text?.replace(/\n/g, "<br>") || "",
// //                 img: msg.photo
// //                     ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${msg.photo.at(-1).file_id}`
// //                     : null
// //             }));

// //         res.json(messages);
// //     } catch (e) {
// //         res.status(500).json({ error: "Telegram fetch failed" });
// //     }
// // });

// // app.listen(3000, () =>
// //     console.log("✅ Server running on http://localhost:3000")
// // );

// // const express = require('express');
// // const fetch = require('node-fetch');
// // const app = express();
// // const PORT = 3000;

// // // Telegram Bot config
// // const BOT_TOKEN = '8503812223:AAH3K89m8-CDdn026fEF5NXiHYLQ9cbYF_I'; // safe on server
// // const CHANNEL_ID = '-1003684280254';      // numeric channel ID
// const express = require('express');
// const fetch = require('node-fetch'); // npm i node-fetch
// const app = express();

// const BOT_TOKEN = '8503812223:AAH3K89m8-CDdn026fEF5NXiHYLQ9cbYF_I';
// const CHANNEL_USERNAME = 'ebsnewsdisplayer'; // without @

// // const express = require('express');
// // const fetch = require('node-fetch'); // npm i node-fetch
// const cors = require('cors');

// // const app = express();
// app.use(cors());
// app.use(express.static('public')); // Serve your HTML/CSS/JS

// // const BOT_TOKEN = '8503812223:AAH3K89m8-CDdn026fEF5YLQ9cbYF_I';
// // const CHANNEL_USERNAME = 'ebsnewsdisplayer'; // without @

// app.get('/api/news', async (req, res) => {
//     try {
//         const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
//         const response = await fetch(url);
//         const data = await response.json();

//         if (!data.ok) return res.status(500).json({ error: 'Telegram API error' });

//         const news = data.result
//             .filter(u => u.channel_post && u.channel_post.chat.username === CHANNEL_USERNAME)
//             .map(u => {
//                 const post = u.channel_post;
//                 return {
//                     postId: post.message_id,
//                     title: post.text ? post.text.split('\n')[0].substring(0, 70) + "..." : "News Update",
//                     intro: post.text ? post.text.substring(0, 130) + "..." : "Tap to read more",
//                     full: post.text || "Media post",
//                     img: post.photo
//                         ? `https://via.placeholder.com/800x400?text=Photo+${post.message_id}` // Simplified placeholder
//                         : `https://via.placeholder.com/800x400?text=No+Image`,
//                     date: post.date
//                 };
//             })
//             .reverse();

//         res.json(news);
//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// const PORT = 3000;
// app.listen(PORT, () => {
//     console.log(`Server running at http://localhost:${PORT}`);
// });


// // app.get('/api/news', async (req, res) => {
// //     try {
// //         const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
// //         const response = await fetch(url);
// //         const data = await response.json();

// //         if (!data.ok) return res.status(500).json({ error: 'Telegram API error' });

// //         const news = data.result
// //             .filter(u => u.channel_post && u.channel_post.chat.username === CHANNEL_USERNAME)
// //             .map(u => {
// //                 const post = u.channel_post;
// //                 return {
// //                     postId: post.message_id,
// //                     title: post.text ? post.text.split('\n')[0].substring(0, 70) + "..." : "News Update",
// //                     intro: post.text ? post.text.substring(0, 130) + "..." : "Tap to read more",
// //                     full: post.text || "Media post",
// //                     img: post.photo
// //                         ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${post.photo[post.photo.length - 1].file_id}`
// //                         : `https://via.placeholder.com/800x400?text=No+Image`,
// //                     date: post.date
// //                 };
// //             })
// //             .reverse();

// //         res.json(news);

// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ error: 'Server error' });
// //     }
// // });

// // app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// // // const CACHE_LIMIT = 50;                   // max posts to store

// // // let newsCache = []; // in-memory cache for simplicity

// // // app.use(express.json());

// // // // Serve static frontend files (index.html, style.css, script.js)
// // // app.use(express.static('public'));

// // // // Endpoint to get news as JSON
// // // app.get('/api/news', async (req, res) => {
// // //     try {
// // //         // Get latest updates (bot must be admin)
// // //         const url = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;

// // //         const response = await fetch(url);
// // //         const data = await response.json();

// // //         if (!data.ok) return res.json({ ok: false, result: [] });

// // //         // Filter channel posts from your channel
// // //         const channelMessages = data.result
// // //             .filter(update => update.channel_post && update.channel_post.chat.id.toString() === CHANNEL_ID)
// // //             .map(update => {
// // //                 const post = update.channel_post;
// // //                 return {
// // //                     postId: post.message_id,
// // //                     title: post.text ? post.text.split('\n')[0].substring(0, 70) : "News Update",
// // //                     content: post.text || "Media post",
// // //                     img: post.photo
// // //                         ? `https://api.telegram.org/file/bot${BOT_TOKEN}/${post.photo[post.photo.length - 1].file_id}`
// // //                         : `https://picsum.photos/seed/${post.message_id}/800/400`,
// // //                     date: post.date
// // //                 };
// // //             });

// // //         if (channelMessages.length > 0) {
// // //             // Keep newest first, limit cache
// // //             newsCache = [...channelMessages.reverse(), ...newsCache]
// // //                 .slice(0, CACHE_LIMIT);
// // //         }

// // //         res.json({ ok: true, result: newsCache });
// // //     } catch (err) {
// // //         console.error(err);
// // //         res.status(500).json({ ok: false, result: [] });
// // //     }
// // // });

// // // app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

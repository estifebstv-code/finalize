// // store/NewsComponent.js
// import { getLocalNews, syncNews } from './telegram-store.js';

// export default class NewsComponent {
//     constructor(containerId, limit = 5) {
//         this.container = document.getElementById(containerId);
//         this.limit = limit;
//     }

//     async render() {
//         if (!this.container) return;

//         let news = getLocalNews();
//         this.display(news);

//         news = await syncNews();
//         this.display(news);
//     }

//     display(news) {
//         if (!news || news.length === 0) {
//             this.container.innerHTML = "<p>Loading EBS News...</p>";
//             return;
//         }

//         this.container.innerHTML = news.slice(0, this.limit).map(item => `
//             <div class="news-card-mini" style="margin-bottom: 20px; border-radius: 8px; overflow: hidden; background: #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
//                 <img src="${item.img}" 
//                      alt="News Image" 
//                      style="width: 100%; height: 150px; object-fit: cover;"
//                      onerror="this.src='https://via.placeholder.com/400x200?text=EBS+News'">
                
//                 <div style="padding: 12px;">
//                     <h4 style="margin: 0 0 8px 0; font-size: 1.1rem; color: #1a1a1a; line-height: 1.3;">
//                         ${item.title}
//                     </h4>
//                     <p style="margin: 0; font-size: 0.85rem; color: #555; line-height: 1.4;">
//                         ${item.intro || 'Read the latest updates from our channel.'}
//                     </p>
//                 </div>
//             </div>
//         `).join('');
//     }
// }
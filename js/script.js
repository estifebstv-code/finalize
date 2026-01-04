// 1. BANNER AUTO-SLIDE DATA
const slides = [
    { title: "YOUR NUMBER ONE CHOISE", desc: "From Addis Ababa, the biggest celebrities join us.", img: "/images/ebsimages/ebsnewmini/banneranime.jpg" },
    { title: "Sitcom Weekly", desc: "Catch all the episodes .", img: "/images/ebsimages/besentu.jpeg" },
    { title: "Where to watch ", desc: "Watch anytime anywhere.", img: "/images/ebsimages/Roku.jpeg" }
];

let slideIndex = 0;
function updateBanner() {
    const banner = document.getElementById('banner');
    const title = document.getElementById('banner-title');
    const desc = document.getElementById('banner-desc');

    banner.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('${slides[slideIndex].img}')`;
    title.innerText = slides[slideIndex].title;
    desc.innerText = slides[slideIndex].desc;
}

function nextSlide() { slideIndex = (slideIndex + 1) % slides.length; updateBanner(); }
function prevSlide() { slideIndex = (slideIndex - 1 + slides.length) % slides.length; updateBanner(); }

// Auto-play banner every 5 seconds
setInterval(nextSlide, 5000);

// 2. LOGO CAROUSEL LOGIC
const logos = [
    { big: "TV", small: "S1", list: ["HD Quality", "Live Chat", "Exclusive"] },
    { big: "SP", small: "S2", list: ["Pro Sports", "Real-time", "4K Feed"] },
    { big: "NW", small: "S3", list: ["Global News", "24/7", "Local"] }
];

let logoIndex = 0;
let logoInterval = setInterval(nextLogo, 3000);

const logoBox = document.getElementById('logo-carousel');
logoBox.addEventListener('mouseenter', () => clearInterval(logoInterval));
logoBox.addEventListener('mouseleave', () => logoInterval = setInterval(nextLogo, 3000));

function updateLogo() {
    document.getElementById('big-logo').innerText = logos[logoIndex].big;
    document.getElementById('small-logo').innerText = logos[logoIndex].small;
    const list = document.getElementById('logo-list');
    list.innerHTML = logos[logoIndex].list.map(item => `<li>${item}</li>`).join('');
}

function nextLogo() { logoIndex = (logoIndex + 1) % logos.length; updateLogo(); }
function prevLogo() { logoIndex = (logoIndex - 1 + logos.length) % logos.length; updateLogo(); }

// 3. READ MORE FUNCTION
function toggleReadMore() {
    const moreText = document.getElementById('more-text');
    const btn = document.querySelector('.btn-read');
    if (moreText.classList.contains('hidden')) {
        moreText.classList.remove('hidden');
        btn.innerText = "Read Less";
    } else {
        moreText.classList.add('hidden');
        btn.innerText = "Read More";
    }
}

// Styles for hidden text
document.head.insertAdjacentHTML('beforeend', '<style>.hidden { display: none; }</style>');

// Initial load
updateBanner();
updateLogo();
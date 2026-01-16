const elements = document.querySelectorAll('.fade-in');

const reveal = () => {
    const trigger = window.innerHeight * 0.9;

    elements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < trigger) el.classList.add('visible');
    });
};

window.addEventListener('scroll', reveal);
window.addEventListener('load', reveal);
// PARTNERS CAROUSEL (RIGHT → LEFT AUTOPLAY + PAUSE ON HOVER)

const carousel = document.getElementById("partnerCarousel");
const track = document.querySelector(".partners-track");

let scrollAmount = 0;
let speed = 1.2; // slide speed
let autoSlide;

// duplicate logos to allow seamless infinite sliding
function duplicatePartners() {
    const logos = track.innerHTML;
    track.innerHTML = logos + logos; // duplicate once
}
duplicatePartners();

// autoplay function (left slide)
function startAutoSlide() {
    autoSlide = setInterval(() => {
        scrollAmount -= speed;
        track.style.transform = `translateX(${scrollAmount}px)`;

        // reset when half track is scrolled
        if (Math.abs(scrollAmount) >= track.scrollWidth / 2) {
            scrollAmount = 0;
        }
    }, 16); // ~60fps
}

function stopAutoSlide() {
    clearInterval(autoSlide);
}

// Start autoplay on load
startAutoSlide();

// Stop on hover
carousel.addEventListener("mouseenter", stopAutoSlide);

// Resume on mouse leave
carousel.addEventListener("mouseleave", startAutoSlide);

// Buttons manually shift left/right
document.querySelector(".carousel-btn.next").onclick = () => {
    scrollAmount -= 200;
};

document.querySelector(".carousel-btn.prev").onclick = () => {
    scrollAmount += 200;
};


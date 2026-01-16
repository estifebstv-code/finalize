// Scroll reveal animation
const elements = document.querySelectorAll('.fade-in');

function reveal() {
    const trigger = window.innerHeight * 0.9;

    elements.forEach(el => {
        const top = el.getBoundingClientRect().top;
        if (top < trigger) el.classList.add('visible');
    });
}

window.addEventListener("scroll", reveal);
window.addEventListener("load", reveal);

// Simple form handler
document.getElementById("contactForm").addEventListener("submit", function (e) {
    e.preventDefault();
    document.getElementById("formStatus").textContent =
        "✔️ Your message has been received!";
    this.reset();
});

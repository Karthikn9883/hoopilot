// upload.js
document.addEventListener('DOMContentLoaded', (e) => {
    const bg = document.querySelector('body'); // Assuming you want to apply the gradient to the body
    bg.className = 'interactive-background';

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        bg.style.background = `linear-gradient(${x * 360}deg, #333333, #1a1a1a)`;
    });
});

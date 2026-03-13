// Simple zoom functionality for the menu image
const menuImage = document.getElementById('menu-image');
if (menuImage) {
    let isZoomed = false;

    menuImage.addEventListener('click', () => {
        if (isZoomed) {
            menuImage.style.transform = 'scale(1)';
            isZoomed = false;
        } else {
            menuImage.style.transform = 'scale(1.5)';
            isZoomed = true;
        }
    });

    // Add touch support for mobile devices
    menuImage.addEventListener('touchstart', (e) => {
        e.preventDefault();
        menuImage.click();
    });
}

// QR code image is now displayed as a static image in the HTML

// Contact info modal toggle
function toggleContactInfo(event) {
    if (event) {
        event.preventDefault();
    }
    const modal = document.getElementById('contact-modal');
    if (modal.style.display === 'none') {
        modal.style.display = 'flex';
    } else {
        modal.style.display = 'none';
    }
}

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    const modal = document.getElementById('contact-modal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

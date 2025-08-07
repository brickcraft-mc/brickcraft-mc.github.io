async function loadGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    galleryGrid.innerHTML = '<div class="loading">Loading gallery...</div>';

    try {
        const response = await fetch('/data/gallery.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const text = await response.text();
        
        const data = JSON.parse(text);
        if (!data.images || !Array.isArray(data.images)) {
            throw new Error('Invalid gallery data format');
        }

        galleryGrid.innerHTML = data.images.map(image => `
            <div class="gallery-item">
                <img src="${image.src}" alt="${image.alt}" loading="lazy" title="${image.description}">
            </div>
        `).join('');

        initializeImageViewer();
    } catch (error) {
        console.error('Error loading gallery:', error);
        console.error('Error details:', error.message);
        galleryGrid.innerHTML = '<div class="error">Failed to load gallery images. Please try again later.</div>';
    }
}

function initializeImageViewer() {
    const imageViewer = document.querySelector('.image-viewer');
    const viewerImage = imageViewer.querySelector('img');
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            viewerImage.src = img.src;
            viewerImage.alt = img.alt;
            imageViewer.classList.add('active');
        });
    });

    imageViewer.addEventListener('click', () => {
        imageViewer.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            imageViewer.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', loadGallery);

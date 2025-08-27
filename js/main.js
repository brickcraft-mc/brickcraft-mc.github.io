document.addEventListener('DOMContentLoaded', function () {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // remove .html from the URL if the domain is on github.io
    if (window.location.href.includes('github.io') && window.location.href.includes('.html')) {
        const newUrl = window.location.href.replace(/\.html/g, '');
        window.history.replaceState({}, document.title, newUrl);
    }

    // Mobile menu toggle
    const nav = document.querySelector('nav');
    const menuButton = document.createElement('button');
    menuButton.classList.add('menu-toggle');
    menuButton.setAttribute('aria-label', 'Toggle menu');
    menuButton.innerHTML = `
        <svg viewBox="0 0 24 24" width="24" height="24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
    `;

    nav.insertBefore(menuButton, nav.firstChild);

    menuButton.addEventListener('click', () => {
        nav.classList.toggle('open');
    });

    // Image viewer functionality
    const imageViewer = document.querySelector('.image-viewer');
    if (imageViewer) {
        const viewerImage = imageViewer.querySelector('img');

        // Handle clicks on setting images
        document.querySelectorAll('.setting, img[data-fullsize]').forEach(element => {
            element.addEventListener('click', () => {
                const imagePath = element.dataset.image || element.dataset.fullsize || (element.tagName === 'IMG' ? element.src : null);
                if (imagePath) {
                    viewerImage.src = imagePath;
                    viewerImage.alt = element.querySelector('img')?.alt || element.alt || '';
                    imageViewer.classList.add('active');
                }
            });
        });

        // Close viewer on click
        imageViewer.addEventListener('click', () => {
            imageViewer.classList.remove('active');
        });

        // Close viewer on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                imageViewer.classList.remove('active');
            }
        });
    }

    // Load appropriate nav based on screen size
    function loadNav() {
        const isMobile = window.innerWidth <= 768;
        // Determine if we're in a subdirectory (like tools/)
        const isInSubdirectory = window.location.pathname.includes('/tools/');
        const pathPrefix = isInSubdirectory ? '../' : '/';
        const navPath = isMobile ? `${pathPrefix}components/nav-mobile.html` : `${pathPrefix}components/nav.html`;
        
        const xhr = new XMLHttpRequest();
        xhr.open('GET', navPath, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const existingNav = document.querySelector('nav');
                if (existingNav) existingNav.remove();

                document.body.insertAdjacentHTML('afterbegin', xhr.responseText);

                // Adjust nav links if we're in a subdirectory
                if (isInSubdirectory) {
                    const navLinks = document.querySelectorAll('nav a[href]:not([href^="http"]):not([href^="/"]):not([href^="#"])');
                    navLinks.forEach(link => {
                        if (!link.href.startsWith('../') && !link.href.includes('://')) {
                            const currentHref = link.getAttribute('href');
                            link.setAttribute('href', '../' + currentHref);
                        }
                    });
                    
                    // Fix image sources too
                    const navImages = document.querySelectorAll('nav img[src]:not([src^="http"]):not([src^="../"])');
                    navImages.forEach(img => {
                        const currentSrc = img.getAttribute('src');
                        img.setAttribute('src', '../' + currentSrc);
                    });
                }

                // set active class on current page
                const currentPage = window.location.pathname.split('/').pop() || 'index.html';
                const navLinks = document.querySelectorAll('nav a');
                navLinks.forEach(link => {
                    if (link.href.includes(currentPage)) {
                        link.classList.add('active');
                    }
                });

                // Add mobile menu toggle listener if mobile nav
                if (isMobile) {
                    const menuToggle = document.querySelector('.menu-toggle');
                    const navList = document.getElementById('nav-list');
                    if (menuToggle && navList) {
                        menuToggle.addEventListener('click', () => {
                            navList.classList.toggle('collapsed');
                        });
                    }
                }
            }
        };
        xhr.send();
    }

    // Initial nav load
    loadNav();

    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            loadNav();
        }, 250);
    });

    // Load footer
    const isInSubdirectory = window.location.pathname.includes('/tools/');
    const footerPath = isInSubdirectory ? '../components/footer.html' : '/components/footer.html';
    
    fetch(footerPath)
        .then(response => response.text())
        .then(data => {
            // if a footer already exists, remove it
            const footer = document.querySelector('footer');
            if (footer) footer.remove();

            document.body.insertAdjacentHTML('beforeend', data);
            
            // Adjust footer links if we're in a subdirectory
            if (isInSubdirectory) {
                const footerLinks = document.querySelectorAll('footer a[href]:not([href^="http"]):not([href^="/"]):not([href^="#"])');
                footerLinks.forEach(link => {
                    if (!link.href.startsWith('../') && !link.href.includes('://')) {
                        const currentHref = link.getAttribute('href');
                        link.setAttribute('href', '../' + currentHref);
                    }
                });
                
                // Fix image sources too
                const footerImages = document.querySelectorAll('footer img[src]:not([src^="http"]):not([src^="../"])');
                footerImages.forEach(img => {
                    const currentSrc = img.getAttribute('src');
                    img.setAttribute('src', '../' + currentSrc);
                });
            }
            
            initializeThemeToggle();
        });

    // Initialize theme toggle
    function initializeThemeToggle() {
        const themeSwitch = document.getElementById('theme-switch');
        if (!themeSwitch) return;

        themeSwitch.checked = localStorage.getItem('theme') === 'dark';

        themeSwitch.addEventListener('change', () => {
            document.body.classList.toggle('dark');
            if (document.body.classList.contains('dark')) {
                localStorage.setItem('theme', 'dark');
            } else {
                localStorage.removeItem('theme');
            }
        });
    }

});

const loadedTheme = localStorage.getItem('theme');
if (loadedTheme === 'dark') {
    document.body.classList.add('dark');
}
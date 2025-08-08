async function loadCredits() {
    const contentDiv = document.getElementById('loaded-content');
    contentDiv.innerHTML = '<div class="loading">Loading credits...</div>';

    try {
        const response = await fetch('/data/credits.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Build the HTML structure
        let html = `
            <div class="credits-container">
                <div class="credits-header">
                    <h2>${data.title}</h2>
                    <p class="credits-description">${data.description}</p>
                </div>
                <hr class="credits-divider">
                <div class="contributors-grid">
        `;
        
        // Add each contributor (robust against missing/invalid links)
        data.contributors.forEach(contributor => {
            const linksHtml = (Array.isArray(contributor.links) ? contributor.links : []).map(link => 
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="contributor-link">
                    ${link.name}
                    <box-icon name="link-external" class="external-icon" size="xs"></box-icon>
                </a>`
            ).join('');
            
            html += `
                <div class="contributor-card">
                    <div class="contributor-header">
                        <div class="contributor-image">
                            <img src="images/logos/${contributor.image}" alt="${contributor.name}" loading="lazy">
                        </div>
                        <div class="contributor-title">
                            <h3 class="contributor-name">${contributor.name}</h3>
                            <p class="contributor-role">${contributor.role}</p>
                        </div>
                    </div>
                    <div class="contributor-body">
                        ${linksHtml ? `<div class="contributor-links">${linksHtml}</div>` : ''}
                        <p class="contributor-description">${contributor.description}</p>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
        
        contentDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading credits:', error);
        contentDiv.innerHTML = '<div class="error">Failed to load credits. Please try again later.</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadCredits);
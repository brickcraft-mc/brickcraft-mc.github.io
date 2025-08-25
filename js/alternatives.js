async function loadAlternatives() {
    const contentDiv = document.getElementById('loaded-content');
    contentDiv.innerHTML = '<div class="loading">Loading alternatives...</div>';

    try {
        const response = await fetch('/data/alternatives.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Build the HTML structure
        let html = `
            <div class="alternatives-container">
        `;
        
        // Add each contributor (robust against missing/invalid links)
        data.alternatives.forEach(alternative => {
            // card structure:
            /*
                card
                    header
                        title
                        creators
                            image
                            name (link if possible for whole creator container)
                    body
                        description
                        links
                    image (taking up 1/3 of the card width on large screens, full width on small screens)
            */
           // data structure:
            /*
            {
            "name": "Plasticraft",
            "creators": [
                {
                    "name": "Inferno31415",
                    "image": "inferno31415.webp",
                    "url": "https://modrinth.com/user/Inferno31415"
                }
            ],
            "image": "plasticraft.webp",
            "description": "Turns your world into Lego bricks, block-accurate and tiled off!",
            "links": [
                {
                    "name": "Modrinth",
                    "url": "https://modrinth.com/resourcepack/plasticraft"
                }
            ]
        }
            */

            const linksHtml = (Array.isArray(alternative.links) ? alternative.links : []).map(link => 
                `<a href="${link.url}" target="_blank" rel="noopener noreferrer" class="alternative-link">
                    ${link.name}
                    <box-icon name="link-external" class="external-icon" size="xs"></box-icon>
                </a>`
            ).join('');

            const logoBlock = alternative.logo ? `
                <div class="alternative-logo">
                    <img src="images/alternatives/logos/${alternative.logo}" alt="${alternative.name} Logo" class="logo-image" loading="lazy">
                </div>
            ` : '';

            const tagBlock = (Array.isArray(alternative.tags) ? alternative.tags : []).map(tag =>
                `<span class="alternative-tag">${tag}</span>`
            ).join(' ');
            
            html += `
                <div class="alternative-card">
                    <div class="alternative-header">
                        <div class="alternative-header">
                            <div class="alternative-image-container">
                                <img src="images/alternatives/${alternative.image}" alt="${alternative.name}" loading="lazy">
                            </div>
                            <h3 class="alternative-name">${alternative.name}</h3>
                            ${logoBlock}
                        </div>
                    </div>
                    <div class="alternative-body">
                        <div class="alternative-creators">
                            ${Array.isArray(alternative.creators) ? alternative.creators.map(creator => `
                                <a href="${creator.url}" target="_blank" rel="noopener noreferrer" class="creator-link">
                                    <img src="images/alternatives/creators/${creator.image}" alt="${creator.name}" class="creator-image" loading="lazy">
                                    <span class="creator-name">${creator.name}</span>
                                </a>
                            `).join('') : ''}
                        </div>
                        <p class="alternative-description">${alternative.description}</p>
                        ${linksHtml ? `<div class="alternative-links">${linksHtml}</div>` : ''}
                        ${tagBlock ? `<div class="alternative-tags">${tagBlock}</div>` : ''}
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
        `;
        
        contentDiv.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading akternatives:', error);
        contentDiv.innerHTML = '<div class="error">Failed to load alternatives. Please try again later.</div>';
    }
}

document.addEventListener('DOMContentLoaded', loadAlternatives);
async function loadDownloadTiers() {
    try {
        const res = await fetch('/data/download.json');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const container = document.querySelector('.download-section');
        if (!container) return;

        const tiersWrapper = container.querySelector('.download-tiers') || document.createElement('div');
        tiersWrapper.className = 'download-tiers';
        tiersWrapper.innerHTML = '';

        data.tiers.forEach(tier => {
            const tierEl = document.createElement('div');
            tierEl.className = `download-tier${tier.popular ? ' most-popular' : ''}`;

            tierEl.innerHTML = `
                <div class="download-tier-header">
                    <img src="images/${tier.image}" alt="${tier.title} Pack">
                </div>
                <div class="download-tier-details">
                    <h3>${tier.title} <span class="tier-price"><span class="currency">${tier.currency}</span>${tier.price}</span></h3>
                    <p class="tier-description">${tier.description}</p>
                    <ul class="tier-features">
                        ${tier.features.map(f => {
                            if (typeof f === 'string') {
                                const icon = f.includes('PBR') ? 'check' : f.includes('No PBR') ? 'x-circle' : 'cube';
                                return `<li><box-icon name='${icon}'></box-icon> ${f}</li>`;
                            }
                            const icon = f.icon || 'cube';
                            return `<li><box-icon name='${icon}'></box-icon> ${f.text}</li>`;
                        }).join('')}
                    </ul>
                    <div class="tier-download">
                        <a href="${tier.downloadUrl}" class="button primary">${tier.buttonText}</a>
                    </div>
                </div>
            `;

            tiersWrapper.appendChild(tierEl);
        });

        // Replace or append
        const existing = container.querySelector('.download-tiers');
        if (existing) existing.replaceWith(tiersWrapper);
        else container.appendChild(tiersWrapper);

    } catch (err) {
        console.error('Error loading download tiers:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadDownloadTiers);

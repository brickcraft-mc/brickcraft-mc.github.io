async function loadFeatures() {
    try {
        const res = await fetch('/data/features.json');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();

        const root = document.querySelector('#feature-container');
        if (!root) return;

        if (window._featuresLoaded) return;
        root.innerHTML = '';

        const sectionOrder = ['Features', 'Supporting', 'Add-Ons'];
        const sectionEls = {};

        sectionOrder.forEach(name => {
            const sec = document.createElement('div');
            sec.className = 'features-section';
            sec.id = name.toLowerCase().replace(/\s+/g, '-');

            const header = document.createElement('div');
            header.className = 'section-header';
            header.innerHTML = `<h2>${name}</h2>`;

            const list = document.createElement('div');
            list.className = 'features-list';
            list.dataset.section = name;

            sec.appendChild(header);
            sec.appendChild(list);
            root.appendChild(sec);

            sectionEls[name] = list;
        });

        data.features.forEach(feature => {
            const target = sectionEls[feature.group] || sectionEls['Features'];
            if (!target) return;

            const featureEl = document.createElement('div');
            featureEl.className = 'feature';

            const creatorsHTML = (Array.isArray(feature.creators) ? feature.creators.map(c => `
                <div class="creator">
                    <div class="image">
                        <img src="images/logos/${c.image}" alt="${c.name}" class="creator-logo">
                    </div>
                    <div class="creator-details">
                        <span>${c.role || ''}</span>
                        <span class="creator-name">${c.name}</span>
                    </div>
                </div>
            `).join('') : '');

            const creatorsBlock = creatorsHTML ? `<div class="creators">${creatorsHTML}</div>` : '';

            // const descriptionBlock = feature.description ? `<div class="description">${feature.description.trim().replace(/\n/g, '<br>')}</div>` : '';
            // same as above, but each line is wrapped in a <p> tag for better spacing, and <br> are removed
            const descriptionBlock = feature.description ? `<div class="description">${feature.description.trim().split('\n').map(line => `<p>${line.trim()}</p>`).join('')}</div>` : '';
            
            const requirementsBlock = (Array.isArray(feature.requirements) && feature.requirements.length) ? `
                <div class="requirements">
                    <span>Requirements</span>
                    <ul>
                        ${feature.requirements.map(r => `
                            <li class="${r.required ? 'yes' : 'no'}"><box-icon name="${r.required ? 'check-circle' : 'x-circle'}" ${r.required ? 'type="solid"' : ''}></box-icon>${r.text}</li>
                        `).join('')}
                    </ul>
                </div>
            ` : '';

            const buttonsBlock = (Array.isArray(feature.buttons) && feature.buttons.length) ? `
                <div class="further-actions">
                    ${feature.buttons.map(b => `
                        <a href="${b.url}" ${b.external ? 'target="_blank" rel="noopener noreferrer"' : ''} class="button ${b.primary ? 'primary' : ''}">${b.text}${b.external ? "<box-icon name='right-arrow-alt'></box-icon>" : ''}</a>
                    `).join('')}
                </div>
            ` : '';

            featureEl.innerHTML = `
                <div class="feature-media">
                    <img src="images/features/${feature.image}" alt="${feature.name}" class="feature-image">
                </div>
                <div class="feature-details">
                    <h3>${feature.name}</h3>
                    ${creatorsBlock}
                    ${descriptionBlock}
                    ${requirementsBlock}
                    ${buttonsBlock}
                </div>
            `;

            target.appendChild(featureEl);
        });

        // After rendering, run the small layout adjustment that the page expects.
        const featuresEls = document.querySelectorAll('.feature');
        featuresEls.forEach((feature, index) => {
            if (index % 2 !== 0) feature.classList.add('shifted');

            const featureDetails = feature.querySelector('.feature-details');
            const featureMedia = feature.querySelector('.feature-media');
            if (featureDetails && featureMedia) {
                if (featureMedia.offsetHeight > featureDetails.offsetHeight - 1) {
                    featureMedia.style.maxHeight = `${featureDetails.offsetHeight}px`;
                }
            }
        });

        window._featuresLoaded = true;

    } catch (err) {
        console.error('Error loading features:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadFeatures);

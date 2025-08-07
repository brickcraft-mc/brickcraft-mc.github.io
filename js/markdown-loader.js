async function loadMarkdownContent(markdownPath, contentId='loaded-content', replacements = {}) {
    const contentDiv = document.getElementById(contentId);
    contentDiv.innerHTML = '<div class="loading">Loading content...</div>';

    try {
        const response = await fetch(markdownPath);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        
        if (!text.trim()) {
            throw new Error('Empty markdown content');
        }

        // Setup custom renderer
        const renderer = new marked.Renderer();
        
        // Custom blockquote rendering
        renderer.blockquote = (quote) => {
            // Strip HTML tags that marked adds
            quote = quote.replace(/<\/?p>/g, '');
            
            // Check for special prefixes
            const match = quote.match(/^!(\w+):\s*/);
            if (match) {
                const type = match[1].toLowerCase();
                const content = quote.replace(/^!(\w+):\s*/, '');
                return `<div class="callout ${type}">${content}</div>`;
            }
            
            // Default blockquote handling
            return `<blockquote>${quote}</blockquote>`;
        };

        // Pre-process the markdown to handle foldouts before marked parsing
        function preprocessFoldouts(text) {
            let processedText = text;
            // Look for foldout blocks and replace with details/summary elements
            // A foldout block is defined as 
            // ?[Title]
            // Content
            // /? 
            // where Title is the summary and Content is the foldout content
            // const foldoutRegex = /\?\[(.*?)\]([^]*?)\/\?/g;
            // updated regex to allow for a ! to denote a foldout that is open by default
            const foldoutRegex = /\?\[(!?)(.*?)\]([^]*?)\/\?/g;

            processedText = processedText.replace(foldoutRegex, (match, open, title, content) => {
                const processedContent = marked.parse(content.trim());
                return `<details class="foldout" ${open ? 'open' : ''}>
                    <summary style="user-select: none;">${title}</summary>
                    <div class="foldout-content">${processedContent}</div>
                </details>`;
            });

            return processedText;
        }

        // Process custom replacement tags
        function processReplacements(text, replacements) {
            let processedText = text;
            
            // Default replacements
            const defaultReplacements = {
                'OFFICIAL_SERVER': '<a class="discord" href="https://discord.gg/uBhFaBG">official Discord server</a>',
                'KEYWORD_START': '<span class="keyword">',
                'KEYWORD_END': '</span>',
                ...replacements
            };

            // Process custom tags with format <TAG>content</TAG>
            Object.entries(defaultReplacements).forEach(([tag, replacement]) => {
                if (tag.startsWith('/')) {
                    // Handle closing tags
                    const openTag = tag.substring(1);
                    const regex = new RegExp(`<${openTag}>(.*?)</${openTag}>`, 'g');
                    processedText = processedText.replace(regex, (match, content) => {
                        const openReplacement = defaultReplacements[openTag] || `<${openTag}>`;
                        return `${openReplacement}${content}${replacement}`;
                    });
                }
            });

            // Process single tags with format <TAG>
            Object.entries(defaultReplacements).forEach(([tag, replacement]) => {
                if (!tag.startsWith('/')) {
                    const regex = new RegExp(`<${tag}>`, 'g');
                    processedText = processedText.replace(regex, replacement);
                }
            });

            return processedText;
        }

        marked.setOptions({
            renderer: renderer, 
            breaks: true,
        });

        // First apply custom replacements
        const replacedText = processReplacements(text, replacements);
        
        // Then pre-process the markdown
        const processedText = preprocessFoldouts(replacedText);
        
        // Finally parse with marked
        const content = marked.parse(processedText);
        contentDiv.innerHTML = content;
        
    } catch (error) {
        console.error('Error loading content:', error);
        contentDiv.innerHTML = `<div class="error">Failed to load content: ${error.message}</div>`;
    }
}

async function loadMarkdownIntoElement(markdownPath, targetElementId, replacements = {}) {
    const originalContentDiv = document.getElementById('loaded-content');
    
    // Temporarily change the target element
    const tempDiv = document.createElement('div');
    tempDiv.id = 'loaded-content';
    document.body.appendChild(tempDiv);
    
    try {
        await loadMarkdownContent(markdownPath, replacements);
        
        // Move the content to the target element
        const targetDiv = document.getElementById(targetElementId);
        if (targetDiv) {
            targetDiv.innerHTML = tempDiv.innerHTML;
        }
    } finally {
        // Restore the original element
        document.body.removeChild(tempDiv);
        if (originalContentDiv) {
            originalContentDiv.id = 'loaded-content';
        }
    }
}



// █ █ █▀ ▄▀█ █▀▀ █▀▀ 
// █▄█ ▄█ █▀█ █▄█ ██▄ 

// In your HTML, create a div with the id 'loaded-content' where the markdown content will be loaded:
// <div id="loaded-content"></div>

// Then create a script tag to load the markdown content:
// <script>
//     loadMarkdownContent('path/to/your/markdown.md');
// </script>

// Or use the convenience functions:
// <script>
//     loadInstallationInstructions('target-element-id');
//     loadShaderSettings('lux', 'target-element-id');
//     loadMarkdownIntoElement('path/to/markdown.md', 'target-element-id', {customReplacements});
// </script>



// █▀▀ ▀▄▀ ▀█▀ █▀█ ▄▀█ 
// ██▄ █ █  █  █▀▄ █▀█ 

// This loader supports several custom features:
//
// Callouts: Add a special prefix to a blockquote to create a callout. This will support any type you define, as long as you have the CSS for it. Examples:
//   - !info: Information callout
//   - !warning: Warning callout
//   - !danger: Danger callout
//   - !success: Success callout
//   - !note: Note callout
//
// Foldouts: Use a special block syntax to create foldouts in your markdown content. 
// These look like:
//   ?[Title]
//   Content (can include markdown)
//   /?
// The title will be the summary, and the content will be hidden until the user clicks to expand it. You can add a ! before the title to make the foldout open by default:
//   ?[!Title]
//   Content
//   /?
//
// Custom Replacement Tags: Use custom HTML-like tags in your markdown that get replaced with HTML content:
//   <OFFICIAL_SERVER>Discord server</OFFICIAL_SERVER> → <a class="discord" href="https://discord.gg/uBhFaBG">Discord server</a>
//   <DOWNLOAD_PAGE>Download page</DOWNLOAD_PAGE> → <a href="download.html">Download page</a>
//   <PATREON_LINK>Patreon</PATREON_LINK> → <a href="https://patreon.com">Patreon</a>
//   <KEYWORD_START>Optifine<KEYWORD_END> → <span class="keyword">Optifine</span>
//
// You can also define custom replacements by passing them as the second parameter to loadMarkdownContent().

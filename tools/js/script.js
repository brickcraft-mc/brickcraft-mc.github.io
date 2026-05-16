class ResourcePackProcessor {
    constructor() {
        this.selectedFile = null;
        this.scalePercent = 50;
        this.outputBlob = null;
        
        this.enabledSections = {
            resize: false,
            format: false
        };

        this.stats = {
            resize: { processed: 0, skipped: 0, errors: 0 },
            format: { processed: 0, errors: 0 }
        };
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        // Main containers
        this.dropzone = document.getElementById('dropzone');
        this.fileInput = document.getElementById('fileInput');
        this.fileStatus = document.getElementById('fileStatus');
        this.fileName = document.getElementById('fileName');
        this.clearFile = document.getElementById('clearFile');
        this.processBtn = document.getElementById('processBtn');
        this.progressSection = document.getElementById('progressSection');
        this.progressFill = document.getElementById('progressFill');
        this.progressText = document.getElementById('progressText');
        this.processLog = document.getElementById('processLog');
        this.results = document.getElementById('results');
        this.resultStats = document.getElementById('resultStats');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.resetBtn = document.getElementById('resetBtn');

        // Section toggles
        this.resizeToggle = document.getElementById('resizeToggle');
        this.formatToggle = document.getElementById('formatToggle');

        // Scale controls
        this.scaleSlider = document.getElementById('scaleSlider');
        this.scaleValue = document.getElementById('scaleValue');
    }

    bindEvents() {
        // Scale slider
        this.scaleSlider.addEventListener('input', (e) => {
            this.scalePercent = parseInt(e.target.value);
            this.scaleValue.textContent = this.scalePercent;
        });

        // Section toggles
        this.resizeToggle.addEventListener('change', (e) => {
            this.enabledSections.resize = e.target.checked;
            this.updateProcessButtonState();
        });

        this.formatToggle.addEventListener('change', (e) => {
            this.enabledSections.format = e.target.checked;
            this.updateProcessButtonState();
        });

        // Foldout headers
        document.querySelectorAll('.fix-section-header').forEach(header => {
            const toggleSection = () => {
                const targetId = header.getAttribute('data-target');
                const content = document.getElementById(targetId);
                const titleButton = header.querySelector('.fix-section-title');
                if (!content || !titleButton) {
                    return;
                }

                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                const nextExpanded = String(!isExpanded);

                header.setAttribute('aria-expanded', nextExpanded);
                titleButton.setAttribute('aria-expanded', nextExpanded);
                content.classList.toggle('collapsed', isExpanded);
            };

            header.addEventListener('click', (event) => {
                if (event.target.closest('.fix-toggle-switch')) {
                    return;
                }

                toggleSection();
            });

            header.addEventListener('keydown', (event) => {
                if (event.target.closest('.fix-toggle-switch')) {
                    return;
                }

                if (event.key !== 'Enter' && event.key !== ' ') {
                    return;
                }

                event.preventDefault();
                toggleSection();
            });
        });

        // File selection
        this.fileInput.addEventListener('change', (e) => {
            if (e.target.files[0]) {
                this.handleFileSelect(e.target.files[0]);
            }
        });

        // Drag and drop
        this.dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.dropzone.classList.add('dragover');
        });

        this.dropzone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.dropzone.classList.remove('dragover');
        });

        this.dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.dropzone.classList.remove('dragover');
            
            const files = Array.from(e.dataTransfer.files);
            const zipFile = files.find(file => file.name.toLowerCase().endsWith('.zip'));
            
            if (zipFile) {
                this.handleFileSelect(zipFile);
            } else {
                this.showError('Please drop a ZIP file containing a Minecraft resource pack.');
            }
        });

        this.dropzone.addEventListener('click', () => {
            this.fileInput.click();
        });

        // Control buttons
        this.clearFile.addEventListener('click', () => {
            this.clearSelectedFile();
        });

        this.processBtn.addEventListener('click', () => {
            this.processResourcePack();
        });

        this.downloadBtn.addEventListener('click', () => {
            this.downloadProcessedFile();
        });

        this.resetBtn.addEventListener('click', () => {
            this.reset();
        });
    }

    updateProcessButtonState() {
        const hasFile = this.selectedFile !== null;
        const hasSectionEnabled = this.enabledSections.resize || this.enabledSections.format;
        this.processBtn.disabled = !(hasFile && hasSectionEnabled);
    }

    handleFileSelect(file) {
        if (!file.name.toLowerCase().endsWith('.zip')) {
            this.showError('Please select a ZIP file.');
            return;
        }

        this.selectedFile = file;
        this.fileName.textContent = file.name;
        this.fileStatus.classList.add('visible');
        this.fileStatus.classList.remove('hidden');
        this.dropzone.style.display = 'none';
        this.updateProcessButtonState();
    }

    clearSelectedFile() {
        this.selectedFile = null;
        this.fileStatus.classList.remove('visible');
        this.fileStatus.classList.add('hidden');
        this.dropzone.style.display = 'flex';
        this.fileInput.value = '';
        this.updateProcessButtonState();
    }

    async processResourcePack() {
        if (!this.selectedFile) return;

        this.processBtn.disabled = true;
        this.progressSection.classList.add('visible');
        this.progressSection.classList.remove('hidden');
        this.processLog.innerHTML = '';
        this.resetStats();

        try {
            const arrayBuffer = await this.selectedFile.arrayBuffer();
            const zipData = await JSZip.loadAsync(arrayBuffer);
            const outputZip = new JSZip();

            // Copy all files from input to output
            let totalFiles = Object.keys(zipData.files).length;
            let processedIndex = 0;

            for (const [fileName, file] of Object.entries(zipData.files)) {
                processedIndex++;
                const percent = Math.round((processedIndex / totalFiles) * 30);
                this.updateProgress(percent, `Preparing files... ${percent}%`);

                if (file.dir) {
                    outputZip.folder(fileName);
                } else {
                    const content = await file.async('arraybuffer');
                    outputZip.file(fileName, content);
                }
            }

            // Process resize if enabled
            if (this.enabledSections.resize) {
                await this.processResize(zipData, outputZip);
            }

            // Process format if enabled
            if (this.enabledSections.format) {
                await this.processFormat(outputZip);
            }

            this.updateProgress(100, 'Finalizing...');
            this.outputBlob = await outputZip.generateAsync({ type: 'blob' });
            this.showResults();
        } catch (error) {
            console.error('Error processing pack:', error);
            this.log(`Error: ${error.message}`, 'error');
        } finally {
            this.processBtn.disabled = false;
        }
    }

    async processResize(zipData, outputZip) {
        this.log('Starting texture resize...', 'info');
        const packRoot = await this.findResourcePackRoot(zipData);

        if (packRoot === null) {
            this.log('Could not find resource pack root', 'error');
            this.stats.resize.errors++;
            return;
        }

        const textureFiles = this.getTextureFiles(zipData, packRoot);
        this.log(`Found ${textureFiles.length} texture files`, 'info');

        let processed = 0;
        for (const filePath of textureFiles) {
            processed++;
            const percent = 30 + Math.round((processed / textureFiles.length) * 60);
            this.updateProgress(percent, `Resizing textures... ${processed}/${textureFiles.length}`);

            await this.processTextureFile(zipData, filePath, outputZip);
        }

        this.log(`Resize complete: ${this.stats.resize.processed} processed, ${this.stats.resize.skipped} skipped`, 'success');
    }

    async processFormat(outputZip) {
        this.log('Fixing pack format...', 'info');

        try {
            let packMetaFile = null;
            for (const fileName of Object.keys(outputZip.files)) {
                if (fileName.toLowerCase() === 'pack.mcmeta') {
                    packMetaFile = fileName;
                    break;
                }
            }

            if (!packMetaFile) {
                this.log('pack.mcmeta not found', 'warning');
                return;
            }

            const content = await outputZip.file(packMetaFile).async('text');
            const metadata = JSON.parse(content);

            if (metadata.overlays && metadata.overlays.entries) {
                let modified = false;

                for (const entry of metadata.overlays.entries) {
                    if (entry.formats && typeof entry.formats === 'object' && entry.formats.min_inclusive !== undefined) {
                        // Old format: { "min_inclusive": X, "max_inclusive": Y }
                        const minVal = entry.formats.min_inclusive;
                        const maxVal = entry.formats.max_inclusive;

                        // Convert to new format
                        entry.formats = [minVal, maxVal];
                        entry.min_format = minVal;
                        entry.max_format = maxVal;

                        modified = true;
                        this.log(`Fixed format for overlay: ${entry.directory}`, 'success');
                        this.stats.format.processed++;
                    }
                }

                if (modified) {
                    outputZip.file(packMetaFile, JSON.stringify(metadata, null, 4));
                    this.log('pack.mcmeta updated successfully', 'success');
                }
            }
        } catch (error) {
            this.log(`Format fix error: ${error.message}`, 'error');
            this.stats.format.errors++;
        }
    }

    async findResourcePackRoot(zipData) {
        // Log all files for debugging
        console.log('ZIP file contents:', Object.keys(zipData.files));
        
        // Check if assets/minecraft/textures exists directly (look for any file in that path)
        for (const fileName of Object.keys(zipData.files)) {
            if (fileName.startsWith('assets/minecraft/textures/')) {
                this.log(`Found textures at root level: ${fileName}`, 'info');
                return '';
            }
        }

        // Check in subdirectories - look for any file that contains the path
        for (const fileName of Object.keys(zipData.files)) {
            if (fileName.includes('assets/minecraft/textures/')) {
                const parts = fileName.split('/');
                const assetsIndex = parts.indexOf('assets');
                if (assetsIndex > 0) {
                    const rootPath = parts.slice(0, assetsIndex).join('/') + '/';
                    this.log(`Found textures in subdirectory: ${rootPath}`, 'info');
                    return rootPath;
                }
            }
        }

        // Additional check - look for common resource pack folder patterns
        for (const fileName of Object.keys(zipData.files)) {
            // Check if we have a pack.mcmeta file and look for assets nearby
            if (fileName.endsWith('pack.mcmeta')) {
                const basePath = fileName.replace('pack.mcmeta', '');
                const texturesPath = basePath + 'assets/minecraft/textures/';
                
                // Check if any file exists in the textures path
                for (const otherFile of Object.keys(zipData.files)) {
                    if (otherFile.startsWith(texturesPath)) {
                        this.log(`Found textures via pack.mcmeta: ${basePath}`, 'info');
                        return basePath;
                    }
                }
            }
        }

        this.log('Available files in ZIP:', 'info');
        Object.keys(zipData.files).slice(0, 20).forEach(file => {
            this.log(`  ${file}`, 'info');
        });
        if (Object.keys(zipData.files).length > 20) {
            this.log(`  ... and ${Object.keys(zipData.files).length - 20} more files`, 'info');
        }

        return null;
    }

    getTextureFiles(zipData, packRoot) {
        const texturesPath = packRoot + 'assets/minecraft/textures/';
        const pngFiles = [];

        for (const fileName of Object.keys(zipData.files)) {
            if (fileName.startsWith(texturesPath) && 
                fileName.toLowerCase().endsWith('.png') &&
                !zipData.files[fileName].dir) {
                pngFiles.push(fileName);
            }
        }

        return pngFiles;
    }

    async processTextureFile(zipData, filePath, outputZip) {
        try {
            const file = zipData.files[filePath];
            const fileName = this.getFileName(filePath);

            // Skip colormap files
            if (filePath.toLowerCase().includes('/colormap/')) {
                this.log(`SKIPPED: ${fileName} - File is in colormap folder`, 'skipped');
                this.stats.resize.skipped++;
                return;
            }

            // Get the file data
            const imageData = await file.async('arraybuffer');
            
            // Create an image to get dimensions
            const img = await this.loadImage(imageData);
            const width = img.width;
            const height = img.height;

            // Check if we should process this image
            if (!this.shouldProcessImage(width, height)) {
                this.log(`SKIPPED: ${fileName} - ${width}x${height} - Not power of 2 and not large enough`, 'skipped');
                this.stats.resize.skipped++;
                return;
            }

            // Calculate new dimensions
            const newWidth = Math.round(width * this.scalePercent / 100);
            const newHeight = Math.round(height * this.scalePercent / 100);

            // Process the image
            const resizedImageData = await this.resizeImage(img, newWidth, newHeight);
            
            // Update the output ZIP file with the resized image
            outputZip.file(filePath, resizedImageData);

            this.log(`SUCCESS: ${fileName} - ${width}x${height} → ${newWidth}x${newHeight}`, 'success');
            this.stats.resize.processed++;

        } catch (error) {
            this.log(`ERROR: Failed to resize ${this.getFileName(filePath)} - ${error.message}`, 'error');
            this.stats.resize.errors++;
        }
    }

    shouldProcessImage(width, height) {
        // Check if both dimensions are power of 2
        const isPowerOfTwo = (n) => n > 0 && (n & (n - 1)) === 0;
        
        if (isPowerOfTwo(width) && isPowerOfTwo(height)) {
            return true;
        }

        // Check if either dimension is over 500px
        if (width > 500 || height > 500) {
            return true;
        }

        return false;
    }

    loadImage(arrayBuffer) {
        return new Promise((resolve, reject) => {
            const blob = new Blob([arrayBuffer], {type: 'image/png'});
            const img = new Image();
            
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            
            img.src = URL.createObjectURL(blob);
        });
    }

    async resizeImage(img, newWidth, newHeight) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Use nearest neighbor for pixel art
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/png');
        });
    }

    getFileName(filePath) {
        return filePath.split('/').pop();
    }

    updateProgress(percent, text) {
        this.progressFill.style.width = `${percent}%`;
        this.progressText.textContent = text;
    }

    log(message, type = 'info') {
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = message;
        this.processLog.appendChild(logEntry);
        this.processLog.scrollTop = this.processLog.scrollHeight;
    }

    showResults() {
        this.progressSection.classList.remove('visible');
        this.progressSection.classList.add('hidden');
        this.results.classList.add('visible');
        this.results.classList.remove('hidden');

        let resultHTML = '';

        if (this.enabledSections.resize) {
            resultHTML += `
                <div class="stat-section">
                    <h4>Texture Resize</h4>
                    <div class="stat-row"><span>Processed:</span> <strong>${this.stats.resize.processed}</strong></div>
                    <div class="stat-row"><span>Skipped:</span> <strong>${this.stats.resize.skipped}</strong></div>
                    <div class="stat-row"><span>Errors:</span> <strong>${this.stats.resize.errors}</strong></div>
                    <div class="stat-row"><span>Scale:</span> <strong>${this.scalePercent}%</strong></div>
                </div>
            `;
        }

        if (this.enabledSections.format) {
            resultHTML += `
                <div class="stat-section">
                    <h4>Format Fix</h4>
                    <div class="stat-row"><span>Entries Fixed:</span> <strong>${this.stats.format.processed}</strong></div>
                    <div class="stat-row"><span>Errors:</span> <strong>${this.stats.format.errors}</strong></div>
                </div>
            `;
        }

        this.resultStats.innerHTML = resultHTML;
    }

    downloadProcessedFile() {
        if (!this.outputBlob) return;

        const originalName = this.selectedFile.name.replace('.zip', '');
        const features = [];
        if (this.enabledSections.resize) features.push('RESIZED');
        if (this.enabledSections.format) features.push('FIXED');
        const outputName = `[${features.join('+')}] ${originalName}.zip`;

        const url = URL.createObjectURL(this.outputBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = outputName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    reset() {
        this.selectedFile = null;
        this.outputBlob = null;
        this.resetStats();

        this.resizeToggle.checked = false;
        this.formatToggle.checked = false;
        this.enabledSections.resize = false;
        this.enabledSections.format = false;

        // Reset foldout states
        document.querySelectorAll('.fix-section-content').forEach(content => {
            content.classList.add('collapsed');
        });
        document.querySelectorAll('.fix-section-header').forEach(header => {
            header.setAttribute('aria-expanded', 'false');
            const titleButton = header.querySelector('.fix-section-title');
            if (titleButton) {
                titleButton.setAttribute('aria-expanded', 'false');
            }
        });

        this.fileStatus.classList.remove('visible');
        this.fileStatus.classList.add('hidden');
        this.progressSection.classList.remove('visible');
        this.progressSection.classList.add('hidden');
        this.results.classList.remove('visible');
        this.results.classList.add('hidden');
        this.dropzone.style.display = 'flex';

        this.fileInput.value = '';
        this.updateProcessButtonState();
    }

    resetStats() {
        this.stats.resize = { processed: 0, skipped: 0, errors: 0 };
        this.stats.format = { processed: 0, errors: 0 };
    }

    showError(message) {
        alert(message);
    }
}

// Global functions for scale presets
function setScale(value) {
    const slider = document.getElementById('scaleSlider');
    const display = document.getElementById('scaleValue');
    
    slider.value = value;
    display.textContent = value;
    
    if (window.processor) {
        window.processor.scalePercent = value;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.processor = new ResourcePackProcessor();
});

// Load JSZip library if not already loaded
if (typeof JSZip === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
    script.onload = () => {
        console.log('JSZip library loaded');
    };
    document.head.appendChild(script);
}
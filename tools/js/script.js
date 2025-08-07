class ResourcePackProcessor {
    constructor() {
        this.selectedFile = null;
        this.scalePercent = 50;
        this.processedCount = 0;
        this.skippedCount = 0;
        this.errorCount = 0;
        this.outputBlob = null;
        
        this.initializeElements();
        this.bindEvents();
    }

    initializeElements() {
        this.dropzone = document.getElementById('dropzone');
        this.fileInput = document.getElementById('fileInput');
        this.scaleSlider = document.getElementById('scaleSlider');
        this.scaleValue = document.getElementById('scaleValue');
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
    }

    bindEvents() {
        // Scale slider
        this.scaleSlider.addEventListener('input', (e) => {
            this.scalePercent = parseInt(e.target.value);
            this.scaleValue.textContent = this.scalePercent;
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
        this.processBtn.disabled = false;
    }

    clearSelectedFile() {
        this.selectedFile = null;
        this.fileStatus.classList.remove('visible');
        this.fileStatus.classList.add('hidden');
        this.dropzone.style.display = 'flex';
        this.fileInput.value = '';
        this.processBtn.disabled = true;
    }

    async processResourcePack() {
        if (!this.selectedFile) return;

        this.processBtn.disabled = true;
        this.progressSection.classList.add('visible');
        this.progressSection.classList.remove('hidden');
        this.processLog.innerHTML = '';
        this.resetCounters();

        try {
            this.updateProgress(0, 'Loading ZIP file...');
            this.log('Starting resource pack processing...', 'info');

            // Load the ZIP file
            const zip = new JSZip();
            const zipData = await zip.loadAsync(this.selectedFile);

            this.updateProgress(10, 'Analyzing resource pack structure...');
            
            // Find the resource pack structure
            const packRoot = await this.findResourcePackRoot(zipData);
            if (packRoot === null) {
                throw new Error('Could not find a valid resource pack structure (assets/minecraft/textures/)');
            }

            this.log(`Found resource pack structure at: ${packRoot}`, 'info');

            // Get all PNG files in textures folder
            const textureFiles = this.getTextureFiles(zipData, packRoot);
            this.log(`Found ${textureFiles.length} PNG texture files`, 'info');

            if (textureFiles.length === 0) {
                throw new Error('No PNG texture files found in the resource pack');
            }

            this.updateProgress(20, 'Processing texture files...');

            // Process each texture file
            let processed = 0;
            for (const filePath of textureFiles) {
                const progress = 20 + (processed / textureFiles.length) * 70;
                this.updateProgress(progress, `Processing: ${this.getFileName(filePath)}`);

                await this.processTextureFile(zipData, filePath);
                processed++;
            }

            this.updateProgress(95, 'Creating output ZIP file...');
            
            // Generate the output ZIP
            const outputBlob = await zipData.generateAsync({type: 'blob'});
            this.outputBlob = outputBlob;

            this.updateProgress(100, 'Processing complete!');
            this.showResults();

        } catch (error) {
            this.showError(`Processing failed: ${error.message}`);
            this.log(`ERROR: ${error.message}`, 'error');
        } finally {
            this.processBtn.disabled = false;
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

    async processTextureFile(zipData, filePath) {
        try {
            const file = zipData.files[filePath];
            const fileName = this.getFileName(filePath);

            // Skip colormap files
            if (filePath.toLowerCase().includes('/colormap/')) {
                this.log(`SKIPPED: ${fileName} - File is in colormap folder`, 'skipped');
                this.skippedCount++;
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
                this.skippedCount++;
                return;
            }

            // Calculate new dimensions
            const newWidth = Math.round(width * this.scalePercent / 100);
            const newHeight = Math.round(height * this.scalePercent / 100);

            // Process the image
            const resizedImageData = await this.resizeImage(img, newWidth, newHeight);
            
            // Update the ZIP file with the resized image
            zipData.file(filePath, resizedImageData);

            this.log(`SUCCESS: ${fileName} - ${width}x${height} → ${newWidth}x${newHeight}`, 'success');
            this.processedCount++;

        } catch (error) {
            this.log(`ERROR: Failed to resize ${this.getFileName(filePath)} - ${error.message}`, 'error');
            this.errorCount++;
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

        const stats = [
            { label: 'Files processed successfully', value: this.processedCount },
            { label: 'Files skipped', value: this.skippedCount },
            { label: 'Files with errors', value: this.errorCount },
            { label: 'Scale percentage used', value: `${this.scalePercent}%` }
        ];

        this.resultStats.innerHTML = stats.map(stat => 
            `<div class="stat-row">
                <span>${stat.label}:</span>
                <strong>${stat.value}</strong>
            </div>`
        ).join('');
    }

    downloadProcessedFile() {
        if (!this.outputBlob) return;

        const originalName = this.selectedFile.name.replace('.zip', '');
        const outputName = `[RESIZED] ${originalName}.zip`;
        
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
        this.resetCounters();
        
        this.fileStatus.classList.remove('visible');
        this.fileStatus.classList.add('hidden');
        this.progressSection.classList.remove('visible');
        this.progressSection.classList.add('hidden');
        this.results.classList.remove('visible');
        this.results.classList.add('hidden');
        this.dropzone.style.display = 'flex';
        
        this.fileInput.value = '';
        this.processBtn.disabled = true;
    }

    resetCounters() {
        this.processedCount = 0;
        this.skippedCount = 0;
        this.errorCount = 0;
    }

    showError(message) {
        alert(message); // In a real app, you might want a better error display
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
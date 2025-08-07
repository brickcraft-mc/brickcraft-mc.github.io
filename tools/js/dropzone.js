// Dropzone courtesy of https://jsfiddle.net/oL2akhtz/
// Modified in a few places

const dropZone = document.getElementById('dropzone');
var visible = false;

function setDropZoneVisibility(vis) {
    dropZone.style.visibility = vis ? "visible" : "hidden";
    visible = vis;
}

function allowDrag(e) {
    if (true) {  // Test that the item being dragged is a valid one
        e.dataTransfer.dropEffect = 'copy';
        e.preventDefault();
    }
}

function handleDrop(e) {
    e.preventDefault();
    dropZone.style.visibility = 'hidden';
    dropZone.style.opacity = 0;

    // get all dropped files
    let files = [...e.dataTransfer.files];
    
    // filter for only valid file types
    const validFiles = files.filter(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        return validFileTypes.includes(ext);
    });
    
    if (validFiles.length === 0) {
        viewer.innerHTML = '<h1>No valid files found</h1>';
        showToast('Invalid file type. Please select a .cbv, .cbz, or .zip file.', 'error', 5000);
        showInitialMessage(); // Show initial message again for invalid files
        return;
    }

    // if there are multiple files, but there's a .CBV among them, error out with a message
    if (validFiles.length > 1 && validFiles.some(file => file.name.toLowerCase().endsWith('.cbv'))) {
        viewer.innerHTML = '<h1>Multiple files detected, but .CBV files cannot be combined.</h1>';
        showToast('Multiple files detected, but .CBV files cannot be combined with other files.', 'error', 5000);
        showInitialMessage(); // Show initial message again for errors
        return;
    }
    
    // Clear any existing table of contents
    const tocContent = document.querySelector('.tableOfContents .sidebarContent');
    if (tocContent) tocContent.innerHTML = '';
    
    if (validFiles.length === 1) {
        // Single file handling
        loadVolume(validFiles[0]).then((vol) => {
            if (vol) {
                displayVolumeWithCurrentMode(vol);
            }
        });
    } else {
        // Multiple files handling - sort alphabetically
        const sortedFiles = validFiles.sort((a, b) => a.name.localeCompare(b.name));
        loadMultipleVolumes(sortedFiles).then((vol) => {
            if (vol) {
                displayVolumeWithCurrentMode(vol);
            }
        });
    }
}

// 1
window.addEventListener('dragenter', function (e) {
    // if a drag does not originate from the dropzone, show it
    var showDropzone = true;
    
    setDropZoneVisibility(showDropzone);
});

// 2
dropZone.addEventListener('dragenter', allowDrag);
dropZone.addEventListener('dragover', allowDrag);

// 3
dropZone.addEventListener('dragleave', function (e) {
    // if dragleave results in entering a child element, ignore it
    if (!e.relatedTarget || !this.contains(e.relatedTarget))
        setDropZoneVisibility(false);
});

// 4
dropZone.addEventListener('drop', handleDrop);
// Create a container for toast messages
function createToastContainer() {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    return document.getElementById('toast-container');
}

// spawn a toast in the bottom right corner of the screen
function spawnToast(message, duration = 3000) {
    const container = createToastContainer();
    
    // Create the toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Append the toast to the container
    container.appendChild(toast);

    // Set a timeout to remove the toast after the specified duration
    setTimeout(() => {
        toast.classList.add('toast-fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, duration);
}

// Add styles for the toast container and toasts
const style = document.createElement('style');
style.id = 'toast-style';
style.textContent = `
    #toast-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column-reverse;
        gap: 10px;
        z-index: 1000;
        max-height: 80vh;
        overflow-y: auto;
        padding-right: 5px;
    }
    
    .toast {
        background-color: #333;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: opacity 0.3s ease-in-out;
    }
    
    .toast-fade-out {
        opacity: 0;
    }
`;

// Ensure the toast style is applied when the script runs
if (!document.getElementById('toast-style')) {
    document.head.appendChild(style);
}

// Create the container when the script loads
createToastContainer();
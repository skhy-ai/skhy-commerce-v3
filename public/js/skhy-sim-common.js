/**
 * SKHY Common Simulator Utilities
 * This file handles the dynamic injection of shared UI components like 
 * security overlays, loading screens, and communication with the parent app.
 */

const SKHY_UTILS = (function() {
    
    /**
     * Injects the Security Overlay with watermark and tiled background.
     * Sidebars are excluded per latest design requirements.
     */
    function injectSecurityOverlay() {
        if (document.querySelector('.skhy-security-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'skhy-security-overlay';
        overlay.innerHTML = `
            <div class="skhy-watermark-tiled"></div>
            <div class="skhy-center-watermark">
                <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="50,0 61,39 100,50 61,61 50,100 39,61 0,50 39,39" fill="#00ffff"></polygon>
                </svg>
                <h1>SKHY</h1>
            </div>
        `;
        document.body.prepend(overlay);
    }

    /**
     * Injects the Loading Overlay HTML.
     * @param {string} title - The title for the loader.
     * @param {string} subtitle - The subtitle for the loader.
     */
    function injectLoadingOverlay(title = "Initializing Simulator", subtitle = "Loading environment...") {
        if (document.getElementById('loadingOverlay')) return;
        
        const loader = document.createElement('div');
        loader.id = 'loadingOverlay';
        loader.innerHTML = `
            <div id="loadingContent">
                <div class="loading-header">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect width="16" height="16" x="4" y="4" rx="2" />
                        <rect width="6" height="6" x="9" y="9" rx="1" />
                        <path d="M15 2v2" />
                        <path d="M15 20v2" />
                        <path d="M2 15h2" />
                        <path d="M2 9h2" />
                        <path d="M20 15h2" />
                        <path d="M20 9h2" />
                        <path d="M9 2v2" />
                        <path d="M9 20v2" />
                    </svg>
                    <h2>${title}</h2>
                    <div class="loading-subtitle">${subtitle}</div>
                </div>
                <div class="loading-bar-container">
                    <div id="loadingBar"></div>
                </div>
                <div class="loading-text-row">
                    <span id="loadingPercent">0%</span>
                    <span>SYSTEM BOOT</span>
                </div>
            </div>
        `;
        document.body.prepend(loader);
    }

    /**
     * Starts the loading animation and hides the overlay when finished.
     * @param {function} callback - Function to call after loading finishes.
     * @param {number} speed - Multiplier for loading speed (default 1).
     */
    function startLoading(callback, speed = 1) {
        const overlay = document.getElementById("loadingOverlay");
        const bar = document.getElementById("loadingBar");
        const text = document.getElementById("loadingPercent");
        
        if (!overlay || !bar || !text) {
            console.warn("Loading elements not found. Skipping animation.");
            if (callback) callback();
            return;
        }

        let progress = 0;
        const interval = setInterval(() => {
            progress += (2 * speed);
            if (progress > 100) progress = 100;
            
            bar.style.width = progress + "%";
            text.innerText = progress + "%";
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    overlay.style.opacity = "0";
                    setTimeout(() => {
                        overlay.style.display = "none";
                        // Completely remove to prevent any interaction blocking
                        overlay.remove();
                        if (callback) callback();
                    }, 500);
                }, 200);
            }
        }, 30);
    }

    /**
     * Standardized messaging to the parent application.
     */
    function notifyParentSelection(tab, productId, modelName) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'SKHY_SIMULATOR_SELECTION',
                tab: tab,
                productId: productId,
                modelName: modelName
            }, '*');
        }
    }

    /**
     * Notifies parent to trigger BOM/Buy flow.
     */
    function notifyParentBOM(payload) {
        if (window.parent && window.parent !== window) {
            window.parent.postMessage({
                type: 'SKHY_ROVER_BOM_TRIGGER',
                payload: payload
            }, '*');
        }
    }

    return {
        injectSecurityOverlay,
        injectLoadingOverlay,
        startLoading,
        notifyParentSelection,
        notifyParentBOM
    };

})();

// Auto-inject security overlay on document start
document.addEventListener('DOMContentLoaded', () => {
    SKHY_UTILS.injectSecurityOverlay();
    
    // Initialize Lucide icons if the library is loaded
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});

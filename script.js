// Application Entry Point
// Initializes the components and view router
(function initApp() {
    if (typeof window.loadComponents === "function") {
        window.loadComponents();
    } else {
        // Fallback: Dynamically load modular scripts if not directly included
        const scripts = [
            "src/components/scripts/config.js",
            "src/components/scripts/modal_options.js",
            "src/components/scripts/image_uploader.js",
            "src/components/scripts/modal.js",
            "src/components/scripts/overview.js",
            "src/components/scripts/catalog.js",
            "src/components/scripts/branches.js",
            "src/components/scripts/router.js"
        ];

        function loadScriptSequentially(index) {
            if (index >= scripts.length) {
                if (typeof window.loadComponents === "function") {
                    window.loadComponents();
                }
                return;
            }

            const scriptEl = document.createElement("script");
            scriptEl.src = scripts[index];
            scriptEl.onload = () => loadScriptSequentially(index + 1);
            scriptEl.onerror = (e) => console.error("Error loading modular script:", scripts[index], e);
            document.body.appendChild(scriptEl);
        }

        loadScriptSequentially(0);
    }
})();
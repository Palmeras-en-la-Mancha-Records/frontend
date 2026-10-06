// Application Entry Point
// Initializes the components and view router
(function initApp() {
    if (typeof window.loadComponents === "function") {
        window.loadComponents();
    } else {
        // Fallback: Dynamically load modular scripts if not directly included
        const scripts = [
            "components/scripts/config.js",
            "components/scripts/modal_options.js",
            "components/scripts/image_uploader.js",
            "components/scripts/modal.js",
            "components/scripts/overview.js",
            "components/scripts/catalog.js",
            "components/scripts/router.js"
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
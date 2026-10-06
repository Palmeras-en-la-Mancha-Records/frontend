// Component Injection
function loadComponents() {
    // Inject Header Component
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
        axios.get("components/header_component.html")
            .then((response) => {
                headerContainer.outerHTML = response.data;
            })
            .catch((error) => console.error("Error loading header component:", error));
    }

    // Inject Sidebar Component
    const sidebarContainer = document.getElementById("sidebar-container");
    if (sidebarContainer) {
        axios.get('components/sidebar_component.html')
            .then(response => {
                sidebarContainer.outerHTML = response.data;
                initRouter();
            })
            .catch(error => console.error('Error loading sidebar component:', error));
    }
}

// Router & View Management
function loadView(viewName) {
    const mainView = document.getElementById('main-view');
    if (!mainView) return;

    mainView.innerHTML = '<div style="display:flex; justify-content:center; padding: 40px;"><i class="material-symbols-rounded" style="font-size: 48px; opacity: 0.5;">sync</i></div>';
    
    axios.get(`views/${viewName}.html`)
        .then(response => {
            mainView.innerHTML = response.data;

            // Initialize view-specific features
            if (viewName === 'overview') {
                if (typeof window.bindOverviewModal === "function") window.bindOverviewModal();
                if (typeof window.loadOverviewAlbums === "function") window.loadOverviewAlbums();
            } else if (viewName === 'catalog') {
                if (typeof window.loadCatalogAlbums === "function") window.loadCatalogAlbums();
            } else if (viewName === 'branches') {
                if (typeof window.initBranches === "function") window.initBranches();
            }
        })
        .catch(error => {
            console.error('Error loading view:', error);
            mainView.innerHTML = `
                <div class="empty-state">
                    <i class="material-symbols-rounded empty-state-icon">error</i>
                    <h3 class="empty-state-title">Error al cargar la vista</h3>
                </div>`;
        });
}

function initRouter() {
    const menuItems = document.querySelectorAll('.menu-item');
    
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Update active menu state
            menuItems.forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Determine which view to load
            const text = e.currentTarget.innerText.trim();
            
            if (text.includes('Visión General')) {
                loadView('overview');
            } else if (text.includes('Catálogo Físico Master')) {
                loadView('catalog');
            } else if (text.includes('Filiales')) {
                loadView('branches');
            } else {
                // Fallback view for under construction sections
                document.getElementById('main-view').innerHTML = `
                    <div class="empty-state">
                        <i class="material-symbols-rounded empty-state-icon">construction</i>
                        <h3 class="empty-state-title">Vista en construcción</h3>
                        <p class="empty-state-desc">La sección "${text}" estará disponible próximamente.</p>
                    </div>`;
            }
        });
    });
    
    // Default initial view
    const initialItem = Array.from(menuItems).find(i => i.innerText.includes('Visión General'));
    if (initialItem) {
        menuItems.forEach(i => i.classList.remove('active'));
        initialItem.classList.add('active');
    }
    loadView('overview');
}

window.loadComponents = loadComponents;
window.loadView = loadView;
window.initRouter = initRouter;

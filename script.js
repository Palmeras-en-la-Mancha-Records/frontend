// Fetch and inject Header Component
fetch("src/components/header_component.html")
  .then((response) => response.text())
  .then((data) => {
    document.getElementById("header-container").outerHTML = data;
  })
  .catch((error) => console.error("Error loading header component:", error));

// Fetch and inject Sidebar Component
fetch('src/components/sidebar_component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar-container').outerHTML = data;
        initRouter(); // Initialize router once sidebar is loaded
    })
    .catch(error => console.error('Error loading sidebar component:', error));

// Routing logic (SPA)
function loadView(viewName) {
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = '<div style="display:flex; justify-content:center; padding: 40px;"><i class="material-symbols-rounded" style="font-size: 48px; opacity: 0.5;">sync</i></div>';

    fetch(`src/views/${viewName}.html`)
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.text();
        })
        .then(data => {
            mainView.innerHTML = data;

            // --- Initialize View Features ---
            if (viewName === 'overview') {
                loadOverviewAlbums();
            } else if (viewName === 'catalogue') {
                initAlbums();
            } else if (viewName === 'branches' && typeof initBranches === 'function') {
                initBranches();
            }
            // ---------------------------------------------
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

            // Update active state
            menuItems.forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');

            // Determine which view to load
            const text = e.currentTarget.innerText.trim();

            if (text.includes('Visión General')) {
                loadView('overview');
            } else if (text.includes('Catálogo Físico Master')) {
                loadView('catalogue');
            } else if (text.includes('Filiales')) {
                loadView('branches');
            } else {
                // Under construction view for other links
                document.getElementById('main-view').innerHTML = `
                    <div class="empty-state">
                        <i class="material-symbols-rounded empty-state-icon">construction</i>
                        <h3 class="empty-state-title">Vista en construcción</h3>
                        <p class="empty-state-desc">La sección "${text}" estará disponible próximamente.</p>
                    </div>`;
            }
        });
    });

    // Load the default view upon entering the app (Overview)
    const initialItem = Array.from(menuItems).find(i => i.innerText.includes('Visión General'));
    if (initialItem) {
        menuItems.forEach(i => i.classList.remove('active'));
        initialItem.classList.add('active');
    }
    loadView('overview');
}

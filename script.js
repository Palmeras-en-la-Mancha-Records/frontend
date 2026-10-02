// Fetch and inject Header Component
fetch('components/header_component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('header-container').outerHTML = data;
    })
    .catch(error => console.error('Error loading header component:', error));

// Fetch and inject Sidebar Component
fetch('components/sidebar_component.html')
    .then(response => response.text())
    .then(data => {
        document.getElementById('sidebar-container').outerHTML = data;
        initRouter(); // Iniciar el router una vez cargado el sidebar
    })
    .catch(error => console.error('Error loading sidebar component:', error));

// Lógica de enrutamiento (SPA)
function loadView(viewName) {
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = '<div style="display:flex; justify-content:center; padding: 40px;"><i class="material-symbols-rounded" style="font-size: 48px; opacity: 0.5;">sync</i></div>';
    
    fetch(`views/${viewName}.html`)
        .then(response => response.text())
        .then(data => {
            mainView.innerHTML = data;
        })
        .catch(error => {
            console.error('Error cargando la vista:', error);
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
            
            // Actualizar estilo activo
            menuItems.forEach(i => i.classList.remove('active'));
            e.currentTarget.classList.add('active');
            
            // Determinar qué vista cargar
            const text = e.currentTarget.innerText.trim();
            
            if (text.includes('Visión General')) {
                loadView('overview');
            } else if (text.includes('Catálogo Físico Master')) {
                loadView('catalog');
            } else {
                // Vista en construcción para los demás enlaces
                document.getElementById('main-view').innerHTML = `
                    <div class="empty-state">
                        <i class="material-symbols-rounded empty-state-icon">construction</i>
                        <h3 class="empty-state-title">Vista en construcción</h3>
                        <p class="empty-state-desc">La sección "${text}" estará disponible próximamente.</p>
                    </div>`;
            }
        });
    });
    
    // Cargar la vista por defecto al entrar a la app (Visión General)
    const initialItem = Array.from(menuItems).find(i => i.innerText.includes('Visión General'));
    if (initialItem) {
        menuItems.forEach(i => i.classList.remove('active'));
        initialItem.classList.add('active');
    }
    loadView('overview');
}

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
        initRouter(); // Initialize router once sidebar is loaded
    })
    .catch(error => console.error('Error loading sidebar component:', error));

// Routing logic (SPA)
function loadView(viewName) {
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = '<div style="display:flex; justify-content:center; padding: 40px;"><i class="material-symbols-rounded" style="font-size: 48px; opacity: 0.5;">sync</i></div>';
    
    fetch(`views/${viewName}.html`)
        .then(response => response.text())
        .then(data => {
            mainView.innerHTML = data;

            // --- Initialize View Features ---
            if (viewName === 'overview') {
                bindOverviewModal();
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
                loadView('catalog');
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

// Add album modal
function bindOverviewModal() {
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const discModal = document.getElementById("discModal");
    const discForm = document.getElementById("discForm");

    if (!openModalBtn || !closeModalBtn || !discModal || !discForm) {
        return;
    }

    openModalBtn.addEventListener("click", () => {
        discModal.style.display = "flex";
    });

    closeModalBtn.addEventListener("click", () => {
        discModal.style.display = "none";
    });

    discModal.addEventListener("click", (event) => {
        if (event.target === discModal) {
            discModal.style.display = "none";
        }
    });

    discForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const disc = {
            title: document.getElementById("title").value,
            artist: document.getElementById("artist").value,
            release_year: document.getElementById("release_year").value,
            genre: document.getElementById("genre").value,
            cover_image_url: document.getElementById("cover_image_url") ? document.getElementById("cover_image_url").value : '',
            record_labels: document.getElementById("record_labels.id").value,
            price: document.getElementById("price").value,
        };

        console.log(disc);

        discModal.style.display = "none";
        discForm.reset();
        
        // Reset image to placeholder
        const coverPreview = document.getElementById("coverPreview");
        const imageUploadBox = document.getElementById("imageUploadBox");
        if(coverPreview) {
            coverPreview.src = "src/img/dvd_placeholder.png";
        }
        if(imageUploadBox) {
            imageUploadBox.classList.remove("has-file");
        }
    });

    // Local image preview logic
    const coverInput = document.getElementById("cover_image_file");
    const coverPreview = document.getElementById("coverPreview");
    const imageUploadBox = document.getElementById("imageUploadBox");
    
    if (coverInput && coverPreview) {
        coverInput.addEventListener("change", function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    coverPreview.src = e.target.result;
                    if(imageUploadBox) imageUploadBox.classList.add("has-file");
                }
                reader.readAsDataURL(file);
            } else {
                coverPreview.src = "src/img/dvd_placeholder.png";
                if(imageUploadBox) imageUploadBox.classList.remove("has-file");
            }
        });
    }
}
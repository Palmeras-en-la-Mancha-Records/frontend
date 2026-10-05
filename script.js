// Component Injection
// Inject Header Component
axios.get("components/header_component.html")
  .then((response) => {
    document.getElementById("header-container").outerHTML = response.data;
  })
  .catch((error) => console.error("Error loading header component:", error));

// Inject Sidebar Component
axios.get('components/sidebar_component.html')
    .then(response => {
        document.getElementById('sidebar-container').outerHTML = response.data;
        initRouter();
    })
    .catch(error => console.error('Error loading sidebar component:', error));

// Router & View Management
function loadView(viewName) {
    const mainView = document.getElementById('main-view');
    mainView.innerHTML = '<div style="display:flex; justify-content:center; padding: 40px;"><i class="material-symbols-rounded" style="font-size: 48px; opacity: 0.5;">sync</i></div>';
    
    axios.get(`views/${viewName}.html`)
        .then(response => {
            mainView.innerHTML = response.data;

            // Initialize view-specific features
            if (viewName === 'overview') {
                bindOverviewModal();
            } else if (viewName === 'branches') {
                initBranches();
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

// Album Modal & Form Management
let editingAlbumId = null;

function bindOverviewModal() {
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const discModal = document.getElementById("discModal");
    const discForm = document.getElementById("discForm");

    if (!openModalBtn || !closeModalBtn || !discModal || !discForm) {
        return;
    }

    const modalTitle = document.getElementById("modalTitle");
    const submitButton = discForm.querySelector('button[type="submit"]');

    // Open modal in create or edit mode
    window.openAlbumModal = function (album = null) {
        editingAlbumId = album ? album.id : null;

        discForm.reset();

        const coverPreview = document.getElementById("coverPreview");
        const imageUploadBox = document.getElementById("imageUploadBox");

        if (album) {
            modalTitle.textContent = "Editar disco";
            submitButton.textContent = "Guardar cambios";

            document.getElementById("title").value = album.title ?? "";
            document.getElementById("artist").value = album.artist ?? "";
            document.getElementById("release_year").value = album.release_year ?? "";
            document.getElementById("genre").value = album.genre ?? "";
            document.getElementById("label_id").value = album.label_id ?? "";
            document.getElementById("format_id").value = album.format_id ?? "";
            document.getElementById("price").value = album.price ?? "";
            document.getElementById("stock").value = album.stock ?? "";

            if (album.cover_image_url) {
                coverPreview.src = album.cover_image_url;
                imageUploadBox.classList.add("has-file");
            } else {
                coverPreview.src = "src/img/dvd_placeholder.png";
                imageUploadBox.classList.remove("has-file");
            }
        } else {
            modalTitle.textContent = "Añadir disco";
            submitButton.textContent = "Añadir disco";

            coverPreview.src = "src/img/dvd_placeholder.png";
            imageUploadBox.classList.remove("has-file");
        }

        discModal.showModal();
    };

    openModalBtn.addEventListener("click", () => {
        window.openAlbumModal();
    });

    closeModalBtn.addEventListener("click", () => {
        discModal.close();
    });

    discModal.addEventListener("click", (event) => {
        if (event.target === discModal) {
            discModal.close();
        }
    });

    discForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const disc = {
            id: editingAlbumId,
            title: document.getElementById("title").value,
            artist: document.getElementById("artist").value,
            release_year: document.getElementById("release_year").value,
            genre: document.getElementById("genre").value,
            label_id: document.getElementById("label_id").value,
            format_id: document.getElementById("format_id").value,
            price: document.getElementById("price").value,
            stock: document.getElementById("stock").value,
            cover_image_file: document.getElementById("cover_image_file").files[0] || null
        };

        console.log(disc);

        discModal.close();
        discForm.reset();

        const coverPreview = document.getElementById("coverPreview");
        const imageUploadBox = document.getElementById("imageUploadBox");

        coverPreview.src = "src/img/dvd_placeholder.png";
        imageUploadBox.classList.remove("has-file");

        editingAlbumId = null;
    });

    // Image Preview Handler
    const coverInput = document.getElementById("cover_image_file");
    const coverPreview = document.getElementById("coverPreview");
    const imageUploadBox = document.getElementById("imageUploadBox");

    if (coverInput && coverPreview) {
        coverInput.addEventListener("change", (event) => {
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();

                reader.onload = (e) => {
                    coverPreview.src = e.target.result;
                    imageUploadBox.classList.add("has-file");
                };

                reader.readAsDataURL(file);
            } else {
                coverPreview.src = "src/img/dvd_placeholder.png";
                imageUploadBox.classList.remove("has-file");
            }
        });
    }
}
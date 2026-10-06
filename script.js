// Configuration
const ALBUMS_API_URL = "http://127.0.0.1:8000/albums/";
const DISCS_API_URL = ALBUMS_API_URL;
const FORMATS_API_URL = "http://127.0.0.1:8000/formats/";

// Utilities
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

// Component Injection
// Inject Header Component
axios.get("components/header_component.html")
  .then((response) => {
    document.getElementById("header-container").outerHTML = response.data;

    const searchForm = document.querySelector(".search-container");

    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
      });
    }
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
                loadOverviewAlbums();
                loadBranchesSummary();
            } else if (viewName === 'catalog') {
                loadCatalogAlbums();
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

async function loadFormatOptions() {
    const formatSelect = document.getElementById("format_id");
    if (!formatSelect) return;

    const defaultFormats = [
        { id: 1, name: "Vinilo LP" },
        { id: 2, name: "CD Digipak" },
        { id: 3, name: "Cassette" },
        { id: 4, name: "Vinilo 7\" Single" }
    ];

    try {
        const response = await axios.get(FORMATS_API_URL);
        const formats = response.data;
        formatSelect.innerHTML = '<option value="">Selecciona un formato</option>';

        const listToUse = (formats && formats.length > 0) ? formats : defaultFormats;
        listToUse.forEach((format) => {
            const opt = document.createElement("option");
            opt.value = format.id;
            opt.textContent = format.name;
            formatSelect.appendChild(opt);
        });
    } catch (error) {
        console.error("Error loading formats, using defaults:", error);
        formatSelect.innerHTML = '<option value="">Selecciona un formato</option>';
        defaultFormats.forEach((format) => {
            const opt = document.createElement("option");
            opt.value = format.id;
            opt.textContent = format.name;
            formatSelect.appendChild(opt);
        });
    }
}

function loadLabelOptions() {
    const labelSelect = document.getElementById("label_id");
    if (!labelSelect) return;

    const defaultLabels = [
        "Warner Music Spain",
        "Sony Music Entertainment",
        "Universal Music",
        "Columbia Records",
        "Mushroom Pillow",
        "Elefant Records",
        "Sub Pop",
        "Autoeditado"
    ];

    labelSelect.innerHTML = '<option value="">Selecciona una discográfica</option>';
    defaultLabels.forEach((label) => {
        const opt = document.createElement("option");
        opt.value = label;
        opt.textContent = label;
        labelSelect.appendChild(opt);
    });
}

function bindOverviewModal() {
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const discModal = document.getElementById("discModal");
    const discForm = document.getElementById("discForm");

    if (!openModalBtn || !closeModalBtn || !discModal || !discForm) {
        return;
    }

    // Populate dropdown options
    loadFormatOptions();
    loadLabelOptions();

    const modalTitle = document.getElementById("modalTitle");
    const submitButton = discForm.querySelector('button[type="submit"]');
    const coverPreview = document.getElementById("coverPreview");
    const imageUploadBox = document.getElementById("imageUploadBox");

    // Open modal in create or edit mode
    window.openAlbumModal = async function (album = null) {
        editingAlbumId = album ? album.id : null;

        await loadFormatOptions();
        loadLabelOptions();

        discForm.reset();

        if (album) {
            modalTitle.textContent = "Editar álbum";
            submitButton.textContent = "Guardar cambios";

            document.getElementById("title").value = album.title ?? "";
            document.getElementById("artist").value = album.artist ?? "";
            document.getElementById("release_year").value = album.release_year ?? "";
            document.getElementById("genre").value = album.genre ?? "";
            document.getElementById("label_id").value = album.record_label ?? album.label_id ?? "";
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
            modalTitle.textContent = "Añadir álbum";
            submitButton.textContent = "Añadir álbum";

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

    discForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const title = document.getElementById("title").value.trim();
        const artist = document.getElementById("artist").value.trim();
        const releaseYearValue = document.getElementById("release_year").value;
        const release_year = releaseYearValue ? parseInt(releaseYearValue, 10) : null;
        const genre = document.getElementById("genre").value.trim() || null;
        const record_label = document.getElementById("label_id").value.trim() || null;
        const formatIdValue = document.getElementById("format_id").value;
        const format_id = formatIdValue ? parseInt(formatIdValue, 10) : null;
        const price = parseFloat(document.getElementById("price").value) || 0.0;
        const stock = parseInt(document.getElementById("stock").value, 10) || 0;

        let cover_image_url = null;
        if (coverPreview && coverPreview.src && !coverPreview.src.includes("dvd_placeholder.png")) {
            cover_image_url = coverPreview.src;
        }

        const payload = {
            title,
            artist,
            release_year,
            genre,
            record_label,
            format_id,
            price,
            stock,
            cover_image_url
        };

        try {
            if (editingAlbumId) {
                await axios.put(`${ALBUMS_API_URL}${editingAlbumId}`, payload);
            } else {
                await axios.post(ALBUMS_API_URL, payload);
            }

            discModal.close();
            discForm.reset();

            coverPreview.src = "src/img/dvd_placeholder.png";
            imageUploadBox.classList.remove("has-file");
            editingAlbumId = null;

            loadOverviewAlbums();
        } catch (error) {
            console.error("Error saving album:", error);
            const detail = error.response?.data?.detail;
            const message = Array.isArray(detail)
                ? detail.map((d) => d.msg).join(", ")
                : (detail || error.message);
            alert(`Error al guardar el álbum: ${message}`);
        }
    });

    // Image Preview Handler
    const coverInput = document.getElementById("cover_image_file");
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

    if (imageUploadBox && coverInput) {
        imageUploadBox.addEventListener("click", (event) => {
            if (event.target !== coverInput) {
                coverInput.click();
            }
        });
    }

    // Overview Link to Catalog
    const catalogLink = document.querySelector(".vg-link");
    if (catalogLink && catalogLink.innerText.includes("Ver catálogo")) {
        catalogLink.addEventListener("click", (e) => {
            e.preventDefault();
            const catalogMenuItem = Array.from(document.querySelectorAll('.menu-item')).find(i => i.innerText.includes('Catálogo Físico Master'));
            if (catalogMenuItem) {
                catalogMenuItem.click();
            } else {
                loadView('catalog');
            }
        });
    }
}

// Overview Albums Read & Render Operations
async function loadOverviewAlbums() {
    const card = document.querySelector(".vg-col .filter-card.vg-card");
    if (!card) return;

    const emptyState = card.querySelector(".vg-empty");
    let listContainer = document.getElementById("overview-discs-list");

    if (!listContainer && emptyState) {
        listContainer = document.createElement("div");
        listContainer.id = "overview-discs-list";
        emptyState.parentNode.insertBefore(listContainer, emptyState.nextSibling);
    }

    try {
        const response = await axios.get(ALBUMS_API_URL);
        const albums = response.data;

        if (!albums || albums.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            if (listContainer) listContainer.style.display = "none";
            return;
        }

        if (emptyState) emptyState.style.display = "none";
        if (listContainer) {
            listContainer.style.display = "flex";
            listContainer.style.flexDirection = "column";
            listContainer.style.gap = "12px";
            listContainer.style.marginTop = "16px";

            listContainer.innerHTML = albums.slice(0, 5).map((album) => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid var(--border); border-radius: 12px; background-color: #ffffff; gap: 16px;">
                    <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
                        <img src="${album.cover_image_url || 'src/img/dvd_placeholder.png'}" alt="${escapeHtml(album.title)}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); background-color: #f9fafb; flex-shrink: 0;">
                        <div style="min-width: 0;">
                            <div style="font-weight: 700; font-size: 14px; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(album.title)}</div>
                            <div style="font-size: 12px; color: var(--text-gray); margin-top: 2px;">
                                ${escapeHtml(album.artist)} ${album.release_year ? '· ' + album.release_year : ''} ${album.genre ? '· <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 11px;">' + escapeHtml(album.genre) + '</span>' : ''}
                            </div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 12px; flex-shrink: 0;">
                        <div style="text-align: right;">
                            <div style="font-weight: 700; font-size: 14px; color: var(--text-dark);">${Number(album.price).toFixed(2)} €</div>
                            <div style="font-size: 11px; color: ${album.stock > 0 ? 'var(--emerald-text)' : 'var(--red-text)'}; font-weight: 600;">
                                ${album.stock > 0 ? album.stock + ' uds' : 'Sin stock'}
                            </div>
                        </div>
                        <button class="btn btn-outline" style="padding: 6px 10px; font-size: 12px;" onclick="window.editAlbumById(${album.id})" title="Editar álbum">
                            <i class="material-symbols-rounded" style="font-size: 16px;">edit</i>
                        </button>
                        <button class="btn btn-outline" style="padding: 6px 10px; font-size: 12px; color: var(--red-text);" onclick="window.deleteAlbumById(${album.id})" title="Eliminar álbum">
                            <i class="material-symbols-rounded" style="font-size: 16px;">delete</i>
                        </button>
                    </div>
                </div>
            `).join("");
        }
    } catch (error) {
        console.error("Error loading overview albums:", error);
    }
}

// Global Operations for Overview Albums
window.editAlbumById = async function (albumId) {
    try {
        const response = await axios.get(`${ALBUMS_API_URL}${albumId}`);
        window.openAlbumModal(response.data);
    } catch (error) {
        console.error("Error fetching album for editing:", error);
        alert("No se pudo obtener el álbum para editar.");
    }
};

window.deleteAlbumById = async function (albumId) {
    if (!confirm("¿Seguro que deseas eliminar este álbum?")) return;
    try {
        await axios.delete(`${ALBUMS_API_URL}${albumId}`);
        loadOverviewAlbums();
    } catch (error) {
        console.error("Error deleting album:", error);
        alert("Error al eliminar el álbum.");
    }
};

// Aliases for backwards compatibility
const loadOverviewDiscs = loadOverviewAlbums;
window.editDiscById = window.editAlbumById;
window.deleteDiscById = window.deleteAlbumById;

// Catalog Albums Read & Render Operations
async function loadCatalogAlbums() {
    const catalogGrid = document.getElementById("catalog-grid");
    const emptyState = document.querySelector("#main-view .empty-state");
    const badge = document.querySelector(".badge-dark");
    if (!catalogGrid) return;

    try {
        const response = await axios.get(ALBUMS_API_URL);
        const albums = response.data;

        if (badge) {
            badge.textContent = `${albums.length} ediciones activas`;
        }

        if (!albums || albums.length === 0) {
            if (emptyState) emptyState.style.display = "block";
            catalogGrid.innerHTML = "";
            return;
        }

        if (emptyState) emptyState.style.display = "none";

        catalogGrid.innerHTML = albums.map((album) => `
            <div class="card" data-id="${album.id}">
                <div class="card-image-wrap">
                    <img class="card-image" src="${album.cover_image_url || 'src/img/dvd_placeholder.png'}" alt="${escapeHtml(album.title)}">
                    <span class="card-id">#${album.id}</span>
                    <span class="card-tag-bottom-right">${album.format_id ? 'Formato #' + album.format_id : 'Físico'}</span>
                </div>
                <div class="card-tags">
                    ${album.genre ? `<span class="c-tag c-tag-blue">${escapeHtml(album.genre)}</span>` : ''}
                    ${album.release_year ? `<span class="c-tag c-tag-outline">${album.release_year}</span>` : ''}
                </div>
                <h3 class="card-title">${escapeHtml(album.title)}</h3>
                <p class="card-subtitle">${escapeHtml(album.artist)}</p>
                <div class="disco-box">
                    <div class="disco-left">
                        <i class="material-symbols-rounded">domain</i>
                        <span class="disco-label">${escapeHtml(album.record_label || 'Sello independiente')}</span>
                    </div>
                </div>
                <div class="stock-section">
                    <div class="stock-header">
                        <span>Disponibilidad</span>
                        <span>Precio</span>
                    </div>
                    <div class="stock-item">
                        <span class="s-stock ${album.stock > 0 ? 'stock-green' : 'stock-red'}">${album.stock ?? 0} unidades</span>
                        <div class="stock-price-col">
                            <span class="s-price">${Number(album.price).toFixed(2)} €</span>
                        </div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="card-btn btn-edit" onclick="window.editAlbumFromCatalog(${album.id})">
                        <i class="material-symbols-rounded">edit</i> Editar
                    </button>
                    <button class="card-btn btn-delete" onclick="window.deleteAlbumFromCatalog(${album.id})">
                        <i class="material-symbols-rounded">delete</i> Eliminar
                    </button>
                </div>
            </div>
        `).join("");

        // Handle Add Album button in catalog
        const addDiscBtn = document.querySelector("#main-view .filter-actions .btn-yellow");
        if (addDiscBtn) {
            addDiscBtn.addEventListener("click", () => {
                const overviewItem = Array.from(document.querySelectorAll('.menu-item')).find(i => i.innerText.includes('Visión General'));
                if (overviewItem) {
                    overviewItem.click();
                    setTimeout(() => {
                        if (window.openAlbumModal) window.openAlbumModal();
                    }, 150);
                }
            });
        }
    } catch (error) {
        console.error("Error loading catalog albums:", error);
    }
}

window.editAlbumFromCatalog = async function (albumId) {
    const overviewItem = Array.from(document.querySelectorAll('.menu-item')).find(i => i.innerText.includes('Visión General'));
    if (overviewItem) {
        overviewItem.click();
        setTimeout(async () => {
            await window.editAlbumById(albumId);
        }, 150);
    }
};

window.deleteAlbumFromCatalog = async function (albumId) {
    if (!confirm("¿Seguro que deseas eliminar este álbum?")) return;
    try {
        await axios.delete(`${ALBUMS_API_URL}${albumId}`);
        loadCatalogAlbums();
    } catch (error) {
        console.error("Error deleting album:", error);
        alert("Error al eliminar el álbum.");
    }
};

// Aliases for backwards compatibility
const loadCatalogDiscs = loadCatalogAlbums;
window.editDiscFromCatalog = window.editAlbumFromCatalog;
window.deleteDiscFromCatalog = window.deleteAlbumFromCatalog;
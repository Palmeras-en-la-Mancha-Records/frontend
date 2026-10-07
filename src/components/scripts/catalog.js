// Catalog Albums Read, Render & Filter Operations
let catalogAlbumsList = [];
let selectedGenre = "";

function renderCatalogCards(albums) {
    const grid = document.getElementById("catalog-grid");
    const emptyState = document.querySelector("#main-view .empty-state");
    const badge = document.querySelector(".badge-dark");
    const counter = document.getElementById("catalog-filter-count");
    if (!grid) return;

    const escape = window.escapeHtml || ((t) => t ?? "");
    if (badge) badge.textContent = `${albums.length} ediciones activas`;
    if (counter) counter.textContent = `${albums.length} Títulos Filtrados`;

    if (!albums || albums.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        grid.innerHTML = "";
        return;
    }

    if (emptyState) emptyState.style.display = "none";
    grid.innerHTML = albums.map((album) => `
        <div class="card" data-id="${album.id}">
            <div class="card-image-wrap">
                <img class="card-image" src="${album.cover_image_url || 'src/img/dvd_placeholder.png'}" alt="${escape(album.title)}">
                <span class="card-id">#${album.id}</span>
                <span class="card-tag-bottom-right">${album.format_id ? 'Formato #' + album.format_id : 'Físico'}</span>
            </div>
            <div class="card-tags">
                ${album.genre ? `<span class="c-tag c-tag-blue">${escape(album.genre)}</span>` : ''}
                ${album.release_year ? `<span class="c-tag c-tag-outline">${album.release_year}</span>` : ''}
            </div>
            <h3 class="card-title">${escape(album.title)}</h3>
            <p class="card-subtitle">${escape(album.artist)}</p>
            <div class="disco-box">
                <div class="disco-left">
                    <i class="material-symbols-rounded">domain</i>
                    <span class="disco-label">${escape(album.record_label || 'Sello independiente')}</span>
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
}

function filterCatalog() {
    const search = (document.getElementById("filter-search-input")?.value || "").toLowerCase().trim();
    const label = document.getElementById("filter-label-select")?.value || "";
    const store = document.getElementById("filter-store-select")?.value || "";

    const filtered = catalogAlbumsList.filter((a) => {
        const matchesSearch = !search || (a.title || "").toLowerCase().includes(search) || (a.artist || "").toLowerCase().includes(search);
        const matchesLabel = !label || a.record_label === label;
        const matchesGenre = !selectedGenre || (a.genre || "").toLowerCase().includes(selectedGenre.toLowerCase());
        const matchesStore = !store || store === "1" || a.stock > 0;
        return matchesSearch && matchesLabel && matchesGenre && matchesStore;
    });

    renderCatalogCards(filtered);
}

async function loadCatalogStores() {
    const storeSelect = document.getElementById("filter-store-select");
    if (!storeSelect) return;
    try {
        const branchesApi = window.BRANCHES_API_URL || "http://127.0.0.1:8000/branches/";
        const res = await axios.get(branchesApi);
        const branches = res.data || [];
        const escape = window.escapeHtml || ((t) => t ?? "");
        storeSelect.innerHTML = '<option value="">Todas las tiendas</option>' + branches.map((b) => `<option value="${b.id}">${escape(b.name)}</option>`).join("");
    } catch (e) {
        console.error("Error cargando filiales en el filtro:", e);
    }
}

function setupCatalogEvents() {
    document.getElementById("filter-search-input")?.addEventListener("input", filterCatalog);
    document.getElementById("filter-label-select")?.addEventListener("change", filterCatalog);
    document.getElementById("filter-store-select")?.addEventListener("change", filterCatalog);
    document.getElementById("filter-btn-apply")?.addEventListener("click", filterCatalog);

    const tags = document.querySelectorAll("#catalog-genres-row .tag");
    tags.forEach((tag) => {
        tag.addEventListener("click", () => {
            tags.forEach((t) => t.className = "tag inactive");
            tag.className = "tag active";
            selectedGenre = tag.getAttribute("data-genre") || "";
            filterCatalog();
        });
    });

    document.getElementById("filter-btn-clear")?.addEventListener("click", () => {
        const searchInput = document.getElementById("filter-search-input");
        const labelSelect = document.getElementById("filter-label-select");
        const storeSelect = document.getElementById("filter-store-select");
        if (searchInput) searchInput.value = "";
        if (labelSelect) labelSelect.value = "";
        if (storeSelect) storeSelect.value = "";
        selectedGenre = "";
        tags.forEach((t) => t.className = t.getAttribute("data-genre") === "" ? "tag active" : "tag inactive");
        renderCatalogCards(catalogAlbumsList);
    });

    // Nuevo Disco: reusa window.openAlbumModal de modal.js
    document.getElementById("filter-btn-add")?.addEventListener("click", () => {
        if (typeof window.openAlbumModal === "function") window.openAlbumModal();
    });
}

async function loadCatalogAlbums() {
    const grid = document.getElementById("catalog-grid");
    if (!grid) return;

    const apiUrl = window.ALBUMS_API_URL || "http://127.0.0.1:8000/albums/";
    try {
        const response = await axios.get(apiUrl);
        catalogAlbumsList = response.data || [];
        renderCatalogCards(catalogAlbumsList);
        setupCatalogEvents();
        loadCatalogStores();
    } catch (error) {
        console.error("Error loading catalog albums:", error);
    }
}

// Reutiliza métodos globales de overview.js y modal.js
window.editAlbumFromCatalog = (id) => (window.editAlbumById ? window.editAlbumById(id) : null);
window.deleteAlbumFromCatalog = async (id) => {
    if (window.deleteAlbumById) {
        await window.deleteAlbumById(id);
        loadCatalogAlbums();
    }
};

window.loadCatalogAlbums = loadCatalogAlbums;
window.loadCatalogDiscs = loadCatalogAlbums;
window.editDiscFromCatalog = window.editAlbumFromCatalog;
window.deleteDiscFromCatalog = window.deleteAlbumFromCatalog;

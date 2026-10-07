// Catalog Albums State & Filter Operations
let allCatalogAlbums = [];
let activeGenreFilter = "";

function normalizeText(str) {
    return (str || "")
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function renderCatalogGrid(albums) {
    const catalogGrid = document.getElementById("catalog-grid");
    const emptyState = document.querySelector("#main-view .empty-state");
    const badge = document.querySelector(".badge-dark");
    const filterCountText = document.getElementById("catalog-filter-count");
    if (!catalogGrid) return;

    const escape = window.escapeHtml || ((t) => t ?? "");

    if (badge) {
        badge.textContent = `${albums.length} ediciones activas`;
    }
    if (filterCountText) {
        filterCountText.textContent = `${albums.length} Títulos Filtrados`;
    }

    if (!albums || albums.length === 0) {
        if (emptyState) {
            emptyState.style.display = "block";
            const titleEl = emptyState.querySelector(".empty-state-title");
            const descEl = emptyState.querySelector(".empty-state-desc");
            if (titleEl) {
                titleEl.textContent = allCatalogAlbums.length === 0 ? "El catálogo está vacío" : "No hay resultados para estos filtros";
            }
            if (descEl) {
                descEl.textContent = allCatalogAlbums.length === 0
                    ? "No hay ediciones físicas registradas en la base de datos."
                    : "Prueba a cambiar el término de búsqueda o pulsa en Limpiar filtros.";
            }
        }
        catalogGrid.innerHTML = "";
        return;
    }

    if (emptyState) emptyState.style.display = "none";

    catalogGrid.innerHTML = albums.map((album) => `
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

function applyCatalogFilters() {
    const searchInput = document.getElementById("filter-search-input");
    const labelSelect = document.getElementById("filter-label-select");

    const query = normalizeText(searchInput ? searchInput.value : "");
    const selectedLabel = labelSelect ? labelSelect.value.trim() : "";
    const activeGenre = normalizeText(activeGenreFilter);

    const filtered = allCatalogAlbums.filter((album) => {
        // Search filter (matches title, artist, genre or record_label)
        if (query) {
            const title = normalizeText(album.title);
            const artist = normalizeText(album.artist);
            const genre = normalizeText(album.genre);
            const label = normalizeText(album.record_label);
            const matchesQuery = title.includes(query) || artist.includes(query) || genre.includes(query) || label.includes(query);
            if (!matchesQuery) return false;
        }

        // Record label filter
        if (selectedLabel) {
            if ((album.record_label || "").trim() !== selectedLabel) {
                return false;
            }
        }

        // Genre tag filter (exact or contains match)
        if (activeGenre) {
            const albumGenre = normalizeText(album.genre);
            if (!albumGenre.includes(activeGenre)) {
                return false;
            }
        }

        return true;
    });

    renderCatalogGrid(filtered);
}

function setupCatalogFilters() {
    const searchInput = document.getElementById("filter-search-input");
    const labelSelect = document.getElementById("filter-label-select");
    const storeSelect = document.getElementById("filter-store-select");
    const clearBtn = document.getElementById("filter-btn-clear");
    const applyBtn = document.getElementById("filter-btn-apply");
    const addDiscBtn = document.getElementById("filter-btn-add");
    const exportBtn = document.getElementById("catalog-btn-export");
    const genresContainer = document.getElementById("catalog-genres-row");

    // Populate record labels dynamically from albums
    if (labelSelect) {
        const existingVal = labelSelect.value;
        const albumLabels = Array.from(new Set(allCatalogAlbums.map(a => (a.record_label || "").trim()).filter(Boolean))).sort();
        labelSelect.innerHTML = '<option value="">Todos los sellos</option>' + albumLabels.map(l => `<option value="${l}">${l}</option>`).join("");
        labelSelect.value = existingVal;

        labelSelect.onchange = () => applyCatalogFilters();
    }

    // Populate stores dynamically from branches endpoint
    if (storeSelect && storeSelect.children.length <= 1) {
        const branchesApi = window.BRANCHES_API_URL || "http://127.0.0.1:8000/branches/";
        axios.get(branchesApi).then(res => {
            if (res.data && res.data.length > 0) {
                storeSelect.innerHTML = '<option value="">Todas las tiendas</option>' + res.data.map(b => `<option value="${b.id}">${b.name}</option>`).join("");
            }
        }).catch(() => {});
    }

    // Dynamic genre pills
    if (genresContainer) {
        const defaultGenres = ["Indie Rock", "Pop Alternativo", "Flamenco Urbano", "Shoegaze / Dream Pop", "Electrónica"];
        const albumGenres = allCatalogAlbums.map(a => (a.genre || "").trim()).filter(Boolean);
        const combinedGenres = Array.from(new Set([...defaultGenres, ...albumGenres]));

        genresContainer.innerHTML = `
            <span class="genres-label">
                <i class="material-symbols-rounded">tune</i>
                GÉNEROS:
            </span>
            <span class="tag ${activeGenreFilter === '' ? 'active' : 'inactive'}" data-genre="">Todos</span>
            ${combinedGenres.map(g => `
                <span class="tag ${normalizeText(activeGenreFilter) === normalizeText(g) ? 'active' : 'inactive'}" data-genre="${g}">${g}</span>
            `).join("")}
        `;

        const tags = genresContainer.querySelectorAll(".tag");
        tags.forEach(tag => {
            tag.onclick = () => {
                const genre = tag.getAttribute("data-genre") || "";
                if (activeGenreFilter === genre && genre !== "") {
                    activeGenreFilter = "";
                } else {
                    activeGenreFilter = genre;
                }

                tags.forEach(t => {
                    const tGenre = t.getAttribute("data-genre") || "";
                    if ((activeGenreFilter === "" && tGenre === "") || (activeGenreFilter !== "" && normalizeText(tGenre) === normalizeText(activeGenreFilter))) {
                        t.className = "tag active";
                    } else {
                        t.className = "tag inactive";
                    }
                });

                applyCatalogFilters();
            };
        });
    }

    // Real-time search on input
    if (searchInput) {
        searchInput.oninput = () => applyCatalogFilters();
    }

    // Clear filters button
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (searchInput) searchInput.value = "";
            if (labelSelect) labelSelect.value = "";
            if (storeSelect) storeSelect.value = "";
            activeGenreFilter = "";
            if (genresContainer) {
                const tags = genresContainer.querySelectorAll(".tag");
                tags.forEach(t => {
                    t.className = t.getAttribute("data-genre") === "" ? "tag active" : "tag inactive";
                });
            }
            applyCatalogFilters();
        };
    }

    // Apply filters button
    if (applyBtn) {
        applyBtn.onclick = () => applyCatalogFilters();
    }

    // New album button (opens modal directly like in Overview)
    if (addDiscBtn) {
        addDiscBtn.onclick = () => {
            if (typeof window.openAlbumModal === "function") {
                window.openAlbumModal();
            }
        };
    }

    // Export CSV button
    if (exportBtn) {
        exportBtn.onclick = () => {
            if (!allCatalogAlbums.length) return;
            const headers = ["ID", "Título", "Artista", "Año", "Género", "Sello", "Precio", "Stock", "Formato"];
            const rows = allCatalogAlbums.map(a => [
                a.id,
                `"${(a.title || '').replace(/"/g, '""')}"`,
                `"${(a.artist || '').replace(/"/g, '""')}"`,
                a.release_year || '',
                `"${(a.genre || '').replace(/"/g, '""')}"`,
                `"${(a.record_label || '').replace(/"/g, '""')}"`,
                a.price,
                a.stock,
                a.format_id || ''
            ]);
            const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "catalogo_palmeras_records.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
    }
}

// Catalog Albums Read & Render Operations
async function loadCatalogAlbums() {
    const catalogGrid = document.getElementById("catalog-grid");
    if (!catalogGrid) return;

    const apiUrl = window.ALBUMS_API_URL || "http://127.0.0.1:8000/albums/";

    try {
        if (typeof window.initAlbumModal === "function") {
            window.initAlbumModal();
        }

        const response = await axios.get(apiUrl);
        allCatalogAlbums = Array.isArray(response.data) ? response.data : [];

        setupCatalogFilters();
        applyCatalogFilters();
    } catch (error) {
        console.error("Error loading catalog albums:", error);
        allCatalogAlbums = [];
        renderCatalogGrid([]);
    }
}

window.editAlbumFromCatalog = async function (albumId) {
    const apiUrl = window.ALBUMS_API_URL || "http://127.0.0.1:8000/albums/";
    try {
        const response = await axios.get(`${apiUrl}${albumId}`);
        if (typeof window.openAlbumModal === "function") {
            window.openAlbumModal(response.data);
        }
    } catch (error) {
        console.error("Error fetching album for editing:", error);
        alert("No se pudo obtener el álbum para editar.");
    }
};

window.deleteAlbumFromCatalog = async function (albumId) {
    if (!confirm("¿Seguro que deseas eliminar este álbum?")) return;
    const apiUrl = window.ALBUMS_API_URL || "http://127.0.0.1:8000/albums/";
    try {
        await axios.delete(`${apiUrl}${albumId}`);
        loadCatalogAlbums();
    } catch (error) {
        console.error("Error deleting album:", error);
        alert("Error al eliminar el álbum.");
    }
};

// Aliases for backwards compatibility
window.loadCatalogAlbums = loadCatalogAlbums;
window.loadCatalogDiscs = loadCatalogAlbums;
window.editDiscFromCatalog = window.editAlbumFromCatalog;
window.deleteDiscFromCatalog = window.deleteAlbumFromCatalog;

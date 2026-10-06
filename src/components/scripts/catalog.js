// Catalog Albums Read & Render Operations
async function loadCatalogAlbums() {
    const catalogGrid = document.getElementById("catalog-grid");
    const emptyState = document.querySelector("#main-view .empty-state");
    const badge = document.querySelector(".badge-dark");
    if (!catalogGrid) return;

    const apiUrl = window.ALBUMS_API_URL || "http://127.0.0.1:8000/albums/";
    const escape = window.escapeHtml || ((t) => t ?? "");

    try {
        const response = await axios.get(apiUrl);
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
            if (window.editAlbumById) await window.editAlbumById(albumId);
        }, 150);
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

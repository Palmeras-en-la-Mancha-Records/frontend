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

    const apiUrl = window.ALBUMS_API_URL || "http://127.0.0.1:8000/albums/";
    const escape = window.escapeHtml || ((t) => t ?? "");

    try {
        const response = await axios.get(apiUrl);
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
                        <img src="${album.cover_image_url || 'src/img/dvd_placeholder.png'}" alt="${escape(album.title)}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border); background-color: #f9fafb; flex-shrink: 0;">
                        <div style="min-width: 0;">
                            <div style="font-weight: 700; font-size: 14px; color: var(--text-dark); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escape(album.title)}</div>
                            <div style="font-size: 12px; color: var(--text-gray); margin-top: 2px;">
                                ${escape(album.artist)} ${album.release_year ? '· ' + album.release_year : ''} ${album.genre ? '· <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 11px;">' + escape(album.genre) + '</span>' : ''}
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

window.deleteAlbumById = async function (albumId) {
    if (!confirm("¿Seguro que deseas eliminar este álbum?")) return;
    const apiUrl = window.ALBUMS_API_URL || "http://127.0.0.1:8000/albums/";
    try {
        await axios.delete(`${apiUrl}${albumId}`);
        loadOverviewAlbums();
    } catch (error) {
        console.error("Error deleting album:", error);
        alert("Error al eliminar el álbum.");
    }
};

// Aliases for backwards compatibility
window.loadOverviewAlbums = loadOverviewAlbums;
window.loadOverviewDiscs = loadOverviewAlbums;
window.editDiscById = window.editAlbumById;
window.deleteDiscById = window.deleteAlbumById;

// Album Modal & Form Management
let editingAlbumId = null;

function fillAlbumForm(album = null) {
    const form = document.getElementById("discForm");
    const titleEl = document.getElementById("modalTitle");
    const submitBtn = form?.querySelector('button[type="submit"]');
    if (!form) return;

    form.reset();

    if (album) {
        if (titleEl) titleEl.textContent = "Editar álbum";
        if (submitBtn) submitBtn.textContent = "Guardar cambios";

        const fields = ["title", "artist", "release_year", "genre", "format_id", "price", "stock"];
        fields.forEach((field) => {
            const el = document.getElementById(field);
            if (el) el.value = album[field] ?? "";
        });

        const labelEl = document.getElementById("label_id");
        if (labelEl) labelEl.value = album.record_label ?? album.label_id ?? "";

        if (window.setImagePreview) window.setImagePreview(album.cover_image_url);
    } else {
        if (titleEl) titleEl.textContent = "Añadir álbum";
        if (submitBtn) submitBtn.textContent = "Añadir álbum";
        if (window.setImagePreview) window.setImagePreview(null);
    }
}

async function openAlbumModal(album = null) {
    editingAlbumId = album ? album.id : null;

    if (window.loadFormatOptions) await window.loadFormatOptions();
    if (window.loadLabelOptions) window.loadLabelOptions();

    fillAlbumForm(album);

    const discModal = document.getElementById("discModal");
    if (discModal) discModal.showModal();
}

function bindOverviewModal() {
    const openModalBtn = document.getElementById("openModal");
    const closeModalBtn = document.getElementById("closeModal");
    const discModal = document.getElementById("discModal");
    const discForm = document.getElementById("discForm");

    if (!discModal || !discForm) return;

    if (window.loadFormatOptions) window.loadFormatOptions();
    if (window.loadLabelOptions) window.loadLabelOptions();
    if (window.setupImageUploader) window.setupImageUploader();

    window.openAlbumModal = openAlbumModal;

    if (openModalBtn) openModalBtn.onclick = () => openAlbumModal();
    if (closeModalBtn) closeModalBtn.onclick = () => discModal.close();

    discModal.onclick = (e) => {
        if (e.target === discModal) discModal.close();
    };

    discForm.onsubmit = async (event) => {
        event.preventDefault();

        const payload = {
            title: document.getElementById("title")?.value.trim() || "",
            artist: document.getElementById("artist")?.value.trim() || "",
            release_year: parseInt(document.getElementById("release_year")?.value, 10) || null,
            genre: document.getElementById("genre")?.value.trim() || null,
            record_label: document.getElementById("label_id")?.value.trim() || null,
            format_id: parseInt(document.getElementById("format_id")?.value, 10) || null,
            price: parseFloat(document.getElementById("price")?.value) || 0.0,
            stock: parseInt(document.getElementById("stock")?.value, 10) || 0,
            cover_image_url: window.getImagePreviewUrl ? window.getImagePreviewUrl() : null
        };

        const apiUrl = window.ALBUMS_API_URL || "http://127.0.0.1:8000/albums/";

        try {
            if (editingAlbumId) {
                await axios.put(`${apiUrl}${editingAlbumId}`, payload);
            } else {
                await axios.post(apiUrl, payload);
            }

            discModal.close();
            discForm.reset();
            if (window.setImagePreview) window.setImagePreview(null);
            editingAlbumId = null;

            if (typeof window.loadOverviewAlbums === "function") {
                window.loadOverviewAlbums();
            }
        } catch (error) {
            console.error("Error saving album:", error);
            const detail = error.response?.data?.detail;
            const message = Array.isArray(detail) ? detail.map((d) => d.msg).join(", ") : (detail || error.message);
            alert(`Error al guardar el álbum: ${message}`);
        }
    };

    // Overview link to catalog
    const catalogLink = document.querySelector(".vg-link");
    if (catalogLink && catalogLink.innerText.includes("Ver catálogo")) {
        catalogLink.onclick = (e) => {
            e.preventDefault();
            const menuItem = Array.from(document.querySelectorAll('.menu-item')).find(i => i.innerText.includes('Catálogo Físico Master'));
            if (menuItem) menuItem.click();
            else if (typeof window.loadView === "function") window.loadView('catalog');
        };
    }
}

window.openAlbumModal = openAlbumModal;
window.bindOverviewModal = bindOverviewModal;

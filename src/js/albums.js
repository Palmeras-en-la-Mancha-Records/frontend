const ALBUMS_API_URL = "http://127.0.0.1:8000/albums/";

let albumsData = [];
let editingAlbumId = null;

function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

function formatPrice(value) {
    const n = Number(value);
    return isNaN(n)
        ? "-"
        : n.toLocaleString("es-ES", { style: "currency", currency: "EUR" });
}

const LOADING_HTML = `
    <div style="grid-column: 1 / -1; display:flex; justify-content:center; padding:40px;">
        <i class="material-symbols-rounded" style="font-size:48px; opacity:0.4;">sync</i>
    </div>`;

// ===================== CATALOGUE (GET /albums/) =====================

function getCatalogueFilters() {
    const params = {};
    const search = (document.getElementById("filter-search")?.value || "").trim();
    const genre = document.getElementById("filter-genre")?.value || "";
    if (search) params.search = search;
    if (genre) params.genre = genre;
    return params;
}

// GET http://127.0.0.1:8000/albums/?search=...&genre=...
async function loadAlbums() {
    const grid = document.getElementById("catalog-grid");
    const empty = document.getElementById("catalog-empty");
    if (!grid) return;

    grid.innerHTML = LOADING_HTML;
    if (empty) empty.style.display = "none";

    try {
        const response = await axios.get(ALBUMS_API_URL, {
        params: getCatalogueFilters(),
        });
        albumsData = response.data;
        renderCatalogue();
    } catch (error) {
        console.error("Error cargando álbumes:", error);
        grid.innerHTML = "";
        if (empty) {
        empty.style.display = "";
        const title = document.getElementById("catalog-empty-title");
        const desc = document.getElementById("catalog-empty-desc");
        if (title) title.textContent = "No se pudo conectar con el backend";
        if (desc)
            desc.textContent =
            "Arranca el backend (uvicorn main:app --reload) y vuelve a cargar la vista.";
        }
    }
}

function visibleCatalogueAlbums() {
    const label = (document.getElementById("filter-label")?.value || "").trim();
    return label
        ? albumsData.filter((a) => a.record_label === label)
        : albumsData;
}

function albumCardTemplate(album) {
    const stock = Number(album.stock ?? 0);
    const stockClass = stock > 0 ? "stock-green" : "stock-red";
    return `
        <div class="card" data-id="${album.id}">
            <div class="card-image-wrap">
                <img class="card-image" src="${escapeHtml(coverSrc(album.cover_image_url))}"
                    alt="${escapeHtml(album.title)}"
                    onerror="this.onerror=null;this.src='${PLACEHOLDER_COVER}'">
                <span class="card-id">ID ${String(album.id).padStart(3, "0")}</span>
                <span class="card-tag-bottom-right ${stockClass}">${stock} en stock</span>
            </div>
            <div class="card-tags">
                ${album.release_year ? `<span class="c-tag c-tag-blue">${album.release_year}</span>` : ""}
                ${album.genre ? `<span class="c-tag c-tag-green">${escapeHtml(album.genre)}</span>` : ""}
                ${album.record_label ? `<span class="c-tag c-tag-outline">${escapeHtml(album.record_label)}</span>` : ""}
            </div>
            <h4 class="card-title">${escapeHtml(album.title)}</h4>
            <p class="card-subtitle">${escapeHtml(album.artist)}</p>
            <div class="disco-box">
                <div class="disco-left">
                <i class="material-symbols-rounded">sell</i>
                <span class="disco-label">Precio<br>unitario</span>
                </div>
                <div class="disco-count">${formatPrice(album.price)}</div>
            </div>
            <div class="card-actions">
                <button class="card-btn btn-edit album-btn-edit">
                <i class="material-symbols-rounded">edit</i> Editar
                </button>
                <button class="card-btn btn-delete album-btn-delete">
                <i class="material-symbols-rounded">delete</i> Eliminar
                </button>
            </div>
        </div>`;
}

function renderCatalogue() {
    const grid = document.getElementById("catalog-grid");
    const empty = document.getElementById("catalog-empty");
    if (!grid) return;

    const list = visibleCatalogueAlbums();
    grid.innerHTML = list.map(albumCardTemplate).join("");

    const count = document.getElementById("catalog-count");
    if (count) count.textContent = `${list.length} ediciones activas`;

    const filtered = document.getElementById("filtered-count");
    if (filtered) filtered.textContent = String(list.length);

    if (empty) {
        empty.style.display = list.length ? "none" : "";
        const title = document.getElementById("catalog-empty-title");
        const desc = document.getElementById("catalog-empty-desc");
        if (title) title.textContent = "El catálogo está vacío";
        if (desc)
        desc.textContent =
            "No hay ediciones físicas para mostrar con los filtros actuales.";
    }
}

function initAlbums() {
  const grid = document.getElementById("catalog-grid");
  if (!grid) return;

  // Edit / delete buttons inside the grid (event delegation)
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = Number(card.dataset.id);
    const album = albumsData.find((a) => a.id === id);

    if (e.target.closest(".album-btn-edit") && album) {
      openAlbumModal(album);
    } else if (e.target.closest(".album-btn-delete")) {
      deleteAlbum(id);
    }
  });

  // Apply / clear filters
  document.getElementById("filter-apply")?.addEventListener("click", loadAlbums);
  document.getElementById("filter-clear")?.addEventListener("click", () => {
    const search = document.getElementById("filter-search");
    const genre = document.getElementById("filter-genre");
    const label = document.getElementById("filter-label");
    if (search) search.value = "";
    if (genre) genre.value = "";
    if (label) label.value = "";
    document.querySelectorAll(".genres-row .tag").forEach((t) => {
      t.classList.remove("active");
      t.classList.add("inactive");
    });
    loadAlbums();
  });
  document.getElementById("filter-search")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loadAlbums();
  });

  // Genre quick tags
  document.querySelectorAll(".genres-row .tag").forEach((tag) => {
    tag.addEventListener("click", () => {
      document.querySelectorAll(".genres-row .tag").forEach((t) => {
        t.classList.toggle("active", t === tag);
        t.classList.toggle("inactive", t !== tag);
      });
      const select = document.getElementById("filter-genre");
      if (select) select.value = tag.textContent.trim();
      loadAlbums();
    });
  });

  loadAlbums();
}

// ===================== OVERVIEW (latest albums) =====================

function latestAlbumCardTemplate(album) {
  return `
    <div class="card mini-card" data-id="${album.id}">
      <div class="card-image-wrap">
        <img class="card-image" src="${escapeHtml(coverSrc(album.cover_image_url))}"
             alt="${escapeHtml(album.title)}"
             onerror="this.onerror=null;this.src='${PLACEHOLDER_COVER}'">
        <span class="card-id">ID ${String(album.id).padStart(3, "0")}</span>
      </div>
      <h4 class="card-title mini-title">${escapeHtml(album.title)}</h4>
      <p class="card-subtitle mini-subtitle">${escapeHtml(album.artist)}</p>
      <span class="mini-price">${formatPrice(album.price)}</span>
    </div>`;
}

async function loadOverviewAlbums() {
  const grid = document.getElementById("latest-albums-grid");
  const empty = document.getElementById("latest-albums-empty");
  if (!grid) return;

  grid.innerHTML = LOADING_HTML;
  if (empty) empty.style.display = "none";

  try {
    const response = await axios.get(ALBUMS_API_URL);
    albumsData = response.data;
    const latest = albumsData.slice(0, 4); // backend returns newest first
    grid.innerHTML = latest.map(latestAlbumCardTemplate).join("");
    if (empty) empty.style.display = latest.length ? "none" : "";
  } catch (error) {
    console.error("Error cargando los últimos discos:", error);
    grid.innerHTML = "";
    if (empty) empty.style.display = "";
  }
}

// ===================== CREATE / EDIT MODAL =====================

function openAlbumModal(album = null) {
  const modal = document.getElementById("discModal");
  if (!modal) return;

  editingAlbumId = album ? album.id : null;
  document.getElementById("album-modal-title").textContent = album
    ? "Editar disco"
    : "Añadir disco";

  const set = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  };
  set("title", album?.title);
  set("artist", album?.artist);
  set("release_year", album?.release_year);
  set("genre", album?.genre);
  set("record_label", album?.record_label);
  set("price", album?.price);
  set("stock", album?.stock);
  set("cover_image_url", album?.cover_image_url);

  const preview = document.getElementById("coverPreview");
  if (preview) preview.src = coverSrc(album?.cover_image_url);
  const box = document.getElementById("imageUploadBox");
  if (box) box.classList.toggle("has-file", Boolean(album?.cover_image_url));

  modal.style.display = "flex";
  document.getElementById("title")?.focus();
}

function closeAlbumModal() {
  const modal = document.getElementById("discModal");
  if (modal) modal.style.display = "none";
  const form = document.getElementById("discForm");
  if (form) form.reset();
  editingAlbumId = null;

  const preview = document.getElementById("coverPreview");
  if (preview) preview.src = PLACEHOLDER_COVER;
  const box = document.getElementById("imageUploadBox");
  if (box) box.classList.remove("has-file");
}

// POST /albums/  (new)  |  PUT /albums/{id}  (edit)
async function saveAlbum(event) {
  event.preventDefault();

  const payload = {
    title: document.getElementById("title").value.trim(),
    artist: document.getElementById("artist").value.trim(),
    release_year: Number(document.getElementById("release_year").value),
    genre: document.getElementById("genre").value.trim() || null,
    record_label: document.getElementById("record_label").value.trim() || null,
    price: Number(document.getElementById("price").value) || 0,
    stock: Number(document.getElementById("stock").value) || 0,
    cover_image_url:
      document.getElementById("cover_image_url").value.trim() || null,
  };

  const isEdit = editingAlbumId !== null;
  try {
    await axios({
      url: isEdit ? `${ALBUMS_API_URL}${editingAlbumId}` : ALBUMS_API_URL,
      method: isEdit ? "put" : "post",
      data: payload,
    });
    closeAlbumModal();
    refreshAlbumViews();
  } catch (error) {
    console.error("Error guardando el disco:", error);
    alert(
      "No se pudo guardar el disco. Mira la consola (F12) para más detalles."
    );
  }
}

async function deleteAlbum(id) {
    const album = albumsData.find((a) => a.id === id);
    const title = album ? album.title : "este disco";
    if (!confirm(`¿Seguro que quieres eliminar "${title}"?`)) return;

    try {
        await axios.delete(`${ALBUMS_API_URL}${id}`);
        refreshAlbumViews();
    } catch (error) {
        console.error("Error eliminando el disco:", error);
        alert("No se pudo eliminar el disco. Mira la consola (F12).");
    }
}

function refreshAlbumViews() {
    if (document.getElementById("catalog-grid")) loadAlbums();
    if (document.getElementById("latest-albums-grid")) loadOverviewAlbums();
}

// Modal bindings (the modal lives in index.html, so it is always available)
function bindAlbumModal() {
    const modal = document.getElementById("discModal");
    const form = document.getElementById("discForm");
    if (!modal || !form || form.dataset.bound) return;
    form.dataset.bound = "true";

    // The "+ Añadir Disco" / "Nuevo Disco Físico" buttons appear inside views
    document.addEventListener("click", (e) => {
        if (e.target.closest("#openModal")) openAlbumModal();
    });

    document.getElementById("closeModal")?.addEventListener(
        "click",
        closeAlbumModal
    );
    modal.addEventListener("click", (e) => {
        if (e.target === modal) closeAlbumModal();
    });
    form.addEventListener("submit", saveAlbum);

    // Local image preview (the file itself is not uploaded, only the URL is saved)
    const coverInput = document.getElementById("cover_image_file");
    const preview = document.getElementById("coverPreview");
    const box = document.getElementById("imageUploadBox");
    coverInput?.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) {
        preview.src = PLACEHOLDER_COVER;
        box?.classList.remove("has-file");
        return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
        preview.src = e.target.result;
        box?.classList.add("has-file");
        };
        reader.readAsDataURL(file);
    });
}

bindAlbumModal();

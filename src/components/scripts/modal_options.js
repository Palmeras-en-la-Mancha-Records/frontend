// Modal Form Dropdown Options
function populateSelect(selectEl, items, defaultPlaceholder) {
    if (!selectEl) return;
    selectEl.innerHTML = `<option value="">${defaultPlaceholder}</option>`;
    items.forEach((item) => {
        const opt = document.createElement("option");
        opt.value = item.id ?? item;
        opt.textContent = item.name ?? item;
        selectEl.appendChild(opt);
    });
}

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
        const apiUrl = window.FORMATS_API_URL || "http://127.0.0.1:8000/formats/";
        const response = await axios.get(apiUrl);
        const formats = response.data && response.data.length > 0 ? response.data : defaultFormats;
        populateSelect(formatSelect, formats, "Selecciona un formato");
    } catch (error) {
        console.error("Error loading formats, using defaults:", error);
        populateSelect(formatSelect, defaultFormats, "Selecciona un formato");
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

    populateSelect(labelSelect, defaultLabels, "Selecciona una discográfica");
}

function loadGenreOptions() {
    const genreSelect = document.getElementById("genre");
    if (!genreSelect) return;

    const defaultGenres = [
        "Indie Rock",
        "Pop Alternativo",
        "Flamenco Urbano",
        "Flamenco Fusión",
        "Cumbia Psicodélica",
        "Post-Punk / Synthpop",
        "Dream Pop",
        "Shoegaze",
        "Synthwave",
        "Garage Rock",
        "Electrónica",
        "Ambient / Lo-Fi",
        "Perruno"
    ];

    populateSelect(genreSelect, defaultGenres, "Selecciona un género");
}

window.loadFormatOptions = loadFormatOptions;
window.loadLabelOptions = loadLabelOptions;
window.loadGenreOptions = loadGenreOptions;

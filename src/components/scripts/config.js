// Configuration
const ALBUMS_API_URL = "http://127.0.0.1:8000/albums/";
const DISCS_API_URL = ALBUMS_API_URL;
const FORMATS_API_URL = "http://127.0.0.1:8000/formats/";

window.ALBUMS_API_URL = ALBUMS_API_URL;
window.DISCS_API_URL = DISCS_API_URL;
window.FORMATS_API_URL = FORMATS_API_URL;

// Utilities
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text ?? "";
    return div.innerHTML;
}

window.escapeHtml = escapeHtml;

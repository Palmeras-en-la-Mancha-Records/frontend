// Image Upload & Preview Handler
const DEFAULT_PLACEHOLDER = "src/img/dvd_placeholder.png";

function setImagePreview(url) {
    const preview = document.getElementById("coverPreview");
    const box = document.getElementById("imageUploadBox");
    if (!preview || !box) return;

    if (url && !url.includes("dvd_placeholder.png")) {
        preview.src = url;
        box.classList.add("has-file");
    } else {
        preview.src = DEFAULT_PLACEHOLDER;
        box.classList.remove("has-file");
    }
}

function getImagePreviewUrl() {
    const preview = document.getElementById("coverPreview");
    if (!preview || !preview.src || preview.src.includes("dvd_placeholder.png")) {
        return null;
    }
    return preview.src;
}

function setupImageUploader() {
    const coverInput = document.getElementById("cover_image_file");
    const preview = document.getElementById("coverPreview");
    const box = document.getElementById("imageUploadBox");

    if (!coverInput || !box) return;

    // File selection listener
    coverInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setImagePreview(e.target.result);
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    });

    // Click on box triggers file input
    box.addEventListener("click", (event) => {
        if (event.target !== coverInput) {
            coverInput.click();
        }
    });
}

window.setImagePreview = setImagePreview;
window.getImagePreviewUrl = getImagePreviewUrl;
window.setupImageUploader = setupImageUploader;

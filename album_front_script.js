const albums = [
    {
        id: 1,
        name: "Nombre del Álbum",
        artist: "Nombre del Artista",
        price: 19.99,
        category: "Categoría",
        genre: "Género",
        format: "Formato",
    }
]

function displayAlbums() {
    const albumContainer = document.getElementById("album-container");
    albumContainer.innerHTML = "";

    albums.forEach(album => {
        const albumCard = document.createElement("div");
        albumCard.classList.add("album-card");

        const albumName = document.createElement("h3");
        albumName.textContent = album.name;

        const albumArtist = document.createElement("p");
        albumArtist.textContent = `Artista: ${album.artist}`;

        const albumPrice = document.createElement("p");
        albumPrice.textContent = `Precio: $${album.price.toFixed(2)}`;

        const albumCategory = document.createElement("p");
        albumCategory.textContent = `Categoría: ${album.category}`;

        const albumGenre = document.createElement("p");
        albumGenre.textContent = `Género: ${album.genre}`;

        const albumFormat = document.createElement("p");
        albumFormat.textContent = `Formato: ${album.format}`;

        albumCard.appendChild(albumName);
        albumCard.appendChild(albumArtist);
        albumCard.appendChild(albumPrice);
        albumCard.appendChild(albumCategory);
        albumCard.appendChild(albumGenre);
        albumCard.appendChild(albumFormat);

        albumContainer.appendChild(albumCard);
    });
}

document.addEventListener("DOMContentLoaded", displayAlbums);
const BRANCHES_API_URL = "http://127.0.0.1:8000/branches/";

let branchesData = [];

// Prevents text containing special characters (< > &) from breaking the HTML
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text ?? "";
  return div.innerHTML;
}

// ---------- LISTAR ----------
async function loadBranches() {
  try {
    const response = await axios.get(BRANCHES_API_URL);
    branchesData = response.data;
    renderBranches();
  } catch (error) {
    console.error("Error cargando filiales:", error);
    alert(
      "No se pudieron cargar las filiales. Revisa que el backend esté encendido.",
    );
  }
}

function renderBranches() {
  const grid = document.getElementById("branches-grid");
  const empty = document.getElementById("branches-empty");
  const count = document.getElementById("branches-count");
  const badge = document.getElementById("branches-badge");

  grid.innerHTML = "";

  branchesData.forEach((branch) => {
    const card = document.createElement("div");
    card.className = "branch-card";
    card.dataset.id = branch.id;
    card.innerHTML = `
            <h3 class="branch-name">${escapeHtml(branch.name)}</h3>
            <div class="branch-info">
                <i class="material-symbols-rounded">location_on</i> ${escapeHtml(branch.address)}
            </div>
            <div class="branch-info">
                <i class="material-symbols-rounded">call</i> ${escapeHtml(branch.phone)}
            </div>
            <div class="branch-actions">
                <button class="branch-btn branch-btn-edit">
                    <i class="material-symbols-rounded">edit</i> Editar
                </button>
                <button class="branch-btn branch-btn-delete">
                    <i class="material-symbols-rounded">delete</i> Eliminar
                </button>
            </div>`;
    grid.appendChild(card);
  });

  count.textContent = branchesData.length;
  badge.textContent = branchesData.length;
  empty.style.display = branchesData.length ? "none" : "";
}

// ---------- CREATE / EDIT WINDOW ----------
function openBranchModal(branch = null) {
  document.getElementById("branch-modal-title").textContent = branch
    ? "Editar filial"
    : "Nueva filial";
  document.getElementById("branch-input-id").value = branch ? branch.id : "";
  document.getElementById("branch-input-name").value = branch
    ? branch.name
    : "";
  document.getElementById("branch-input-address").value = branch
    ? branch.address
    : "";
  document.getElementById("branch-input-phone").value = branch
    ? branch.phone
    : "";
  document.getElementById("branch-modal").classList.add("open");
  document.getElementById("branch-input-name").focus();
}

function closeBranchModal() {
  document.getElementById("branch-modal").classList.remove("open");
}

// ---------- CREATE / EDIT  ----------
async function saveBranch(event) {
  event.preventDefault();

  const id = document.getElementById("branch-input-id").value;
  const payload = {
    name: document.getElementById("branch-input-name").value.trim(),
    address: document.getElementById("branch-input-address").value.trim(),
    phone: document.getElementById("branch-input-phone").value.trim(),
  };

  // If there is an id, it's an edit (PUT /branches/{id}); otherwise, it's a new branch (POST /branches/)
  const url = id ? `${BRANCHES_API_URL}${id}` : BRANCHES_API_URL;
  const method = id ? "PUT" : "POST";

  const saveBtn = document.getElementById("branch-save-btn");
  saveBtn.disabled = true; // evita duplicados por doble clic

  try {
    await axios({
      url: url,
      method: method,
      data: payload,
    });

    closeBranchModal();
    await loadBranches();
  } catch (error) {
    console.error("Error guardando filial:", error);
    alert("No se pudo guardar la filial. Mira la consola para más detalles.");
  } finally {
    saveBtn.disabled = false;
  }
}

// ---------- DELETE ----------
async function deleteBranch(id) {
  const branch = branchesData.find((b) => b.id === id);
  const name = branch ? branch.name : "esta filial";

  if (!confirm(`¿Seguro que quieres eliminar "${name}"?`)) return;

  try {
    await axios.delete(`${BRANCHES_API_URL}${id}`);
    await loadBranches();
  } catch (error) {
    console.error("Error eliminando filial:", error);
    alert(
      "No se pudo eliminar la filial. Mira la consola para más detalles.",
    );
  }
}

// ---------- STARTUP (script.js calls this when the view loads) ----------
function initBranches() {
  const grid = document.getElementById("branches-grid");
  const modal = document.getElementById("branch-modal");

  // Botones Editar / Eliminar de cada tarjeta
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".branch-card");
    if (!card) return;
    const id = Number(card.dataset.id);

    if (e.target.closest(".branch-btn-edit")) {
      const branch = branchesData.find((b) => b.id === id);
      if (branch) openBranchModal(branch);
    } else if (e.target.closest(".branch-btn-delete")) {
      deleteBranch(id);
    }
  });

  document
    .getElementById("branches-new-btn")
    .addEventListener("click", () => openBranchModal());
  document
    .getElementById("branch-cancel-btn")
    .addEventListener("click", closeBranchModal);
  document.getElementById("branch-form").addEventListener("submit", saveBranch);

  // Close when clicking the dark background
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeBranchModal();
  });

  loadBranches();
}

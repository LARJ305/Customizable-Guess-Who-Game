// Logic for the board builder page.
// Handles file input, character naming, randomization, and saving/downloading board data.

import {
  createBoardId,
  downloadJsonFile,
  initThemeToggle,
  saveBoardToLocalStorage,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  setupBuilder();
  setupImageEditor();
});

let currentEditIndex = -1;
let editorConfig = { zoom: 1, x: 50, y: 50 };
let slotsRef = []; // To access slots from editor
let renderCallback = null;

function setupImageEditor() {
  const modalHTML = `
<div id="image-editor-modal" class="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/50">
  <div class="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
    <h3 class="mb-4 text-lg font-semibold">Adjust Image</h3>
    
    <div class="relative mb-4 h-64 w-full overflow-hidden rounded border bg-slate-100">
      <img id="editor-preview" class="h-full w-full object-cover" />
    </div>

    <div class="space-y-3">
      <div>
        <label class="mb-1 block text-xs font-medium text-slate-700">Zoom</label>
        <input id="editor-zoom" type="range" min="1" max="3" step="0.1" class="w-full" />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-slate-700">Position X</label>
        <input id="editor-x" type="range" min="0" max="100" step="1" class="w-full" />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-slate-700">Position Y</label>
        <input id="editor-y" type="range" min="0" max="100" step="1" class="w-full" />
      </div>
    </div>

    <div class="mt-6 flex justify-end gap-2">
      <button id="editor-cancel" type="button" class="rounded border px-3 py-2 text-sm hover:bg-slate-50">Cancel</button>
      <button id="editor-save" type="button" class="rounded bg-blue-600 px-3 py-2 text-sm text-white hover:bg-blue-700">Save</button>
    </div>
  </div>
</div>
`;
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  const modal = document.getElementById("image-editor-modal");
  const preview = document.getElementById("editor-preview");
  const zoomInput = document.getElementById("editor-zoom");
  const xInput = document.getElementById("editor-x");
  const yInput = document.getElementById("editor-y");
  const cancelBtn = document.getElementById("editor-cancel");
  const saveBtn = document.getElementById("editor-save");

  const updatePreview = () => {
    preview.style.transform = `scale(${zoomInput.value})`;
    preview.style.objectPosition = `${xInput.value}% ${yInput.value}%`;
  };

  [zoomInput, xInput, yInput].forEach((input) => {
    input.addEventListener("input", updatePreview);
  });

  cancelBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
  });

  saveBtn.addEventListener("click", () => {
    if (currentEditIndex > -1 && slotsRef[currentEditIndex]) {
      slotsRef[currentEditIndex].zoom = parseFloat(zoomInput.value);
      slotsRef[currentEditIndex].x = parseFloat(xInput.value);
      slotsRef[currentEditIndex].y = parseFloat(yInput.value);
      if (renderCallback) renderCallback();
    }
    modal.classList.add("hidden");
  });
}

function openEditor(index, slots, onRender) {
  currentEditIndex = index;
  slotsRef = slots;
  renderCallback = () =>
    renderTiles(document.getElementById("uploader-grid"), slots, onRender);

  const slot = slots[index];
  if (!slot || !slot.image) return;

  const modal = document.getElementById("image-editor-modal");
  const preview = document.getElementById("editor-preview");
  const zoomInput = document.getElementById("editor-zoom");
  const xInput = document.getElementById("editor-x");
  const yInput = document.getElementById("editor-y");

  preview.src = slot.image;

  const zoom = slot.zoom || 1;
  const x = slot.x !== undefined ? slot.x : 50;
  const y = slot.y !== undefined ? slot.y : 50;

  zoomInput.value = zoom;
  xInput.value = x;
  yInput.value = y;

  preview.style.transform = `scale(${zoom})`;
  preview.style.objectPosition = `${x}% ${y}%`;

  modal.classList.remove("hidden");
}

/**
 * Initialize event listeners for the builder UI.
 */
function setupBuilder() {
  const titleInput = document.getElementById("board-title");
  const uploaderGrid = document.getElementById("uploader-grid");
  const characterList = document.getElementById("character-list");
  const randomizeBtn = document.getElementById("randomize-btn");
  const saveLocalBtn = document.getElementById("save-local-btn");
  const downloadJsonBtn = document.getElementById("download-json-btn");
  const statusEl = document.getElementById("builder-status");

  /** @type {Array<{id: string, name: string, image: string}>} */
  let characters = [];
  const slots = new Array(20).fill(null);

  if (!uploaderGrid || !characterList) return;

  renderTiles(uploaderGrid, slots, () => {
    characters = slots.filter(Boolean).map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image,
      zoom: c.zoom || 1,
      x: c.x !== undefined ? c.x : 50,
      y: c.y !== undefined ? c.y : 50,
    }));
    renderCharacters(characterList, characters);
    setStatus(statusEl, `${characters.length} character(s) ready.`);
  });

  if (randomizeBtn) {
    randomizeBtn.addEventListener("click", () => {
      characters = shuffle(characters);
      renderCharacters(characterList, characters);
    });
  }

  if (saveLocalBtn) {
    saveLocalBtn.addEventListener("click", () => {
      const board = buildBoard(titleInput?.value, characters);
      if (!board) {
        setStatus(statusEl, "Add at least one character before saving.", true);
        return;
      }
      saveBoardToLocalStorage(board);
      setStatus(statusEl, "Board saved to this browser.", false);
    });
  }

  if (downloadJsonBtn) {
    downloadJsonBtn.addEventListener("click", () => {
      const board = buildBoard(titleInput?.value, characters);
      if (!board) {
        setStatus(
          statusEl,
          "Add at least one character before downloading.",
          true
        );
        return;
      }
      const safeTitle = (board.title || "board")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      downloadJsonFile(board, `${safeTitle || "board"}.json`);
      setStatus(statusEl, "JSON file downloaded.", false);
    });
  }

  // TODO: Add manual drag-and-drop reordering if desired.
}

function renderTiles(container, slots, onChange) {
  container.innerHTML = "";
  for (let i = 0; i < slots.length; i += 1) {
    const wrapper = document.createElement("div");
    wrapper.className = "flex flex-col items-center gap-1";

    const tile = document.createElement("div");
    // tile.type = "button";
    tile.className =
      "relative h-24 w-24 rounded-xl bg-slate-200 border border-slate-300 hover:bg-slate-100 overflow-hidden flex items-center justify-center cursor-pointer";

    const plus = document.createElement("span");
    plus.textContent = "+";
    plus.className = "pointer-events-none text-4xl text-slate-400";

    // We preview the selected image by setting it as the tile's background-image.
    // This avoids absolute positioning quirks across browsers.

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.className = "hidden";

    if (slots[i]?.image) {
      const img = document.createElement("img");
      img.src = slots[i].image;
      img.className = "h-full w-full object-cover pointer-events-none";

      const zoom = slots[i].zoom || 1;
      const x = slots[i].x !== undefined ? slots[i].x : 50;
      const y = slots[i].y !== undefined ? slots[i].y : 50;

      img.style.transform = `scale(${zoom})`;
      img.style.objectPosition = `${x}% ${y}%`;

      tile.appendChild(img);

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.type = "button";
      editBtn.className =
        "absolute bottom-1 right-1 bg-white/90 hover:bg-white text-slate-700 rounded p-1 shadow-sm z-10";
      editBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>`;
      editBtn.title = "Adjust image";

      editBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        openEditor(i, slots, onChange);
      });

      tile.appendChild(editBtn);
    } else {
      tile.appendChild(plus);
    }

    input.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        slots[i] = {
          id: `${Date.now()}-${i}`,
          name: `Person ${i + 1}`,
          image: String(reader.result || ""),
        };
        renderTiles(container, slots, onChange);
        onChange();
      };
      reader.readAsDataURL(file);
    });

    tile.addEventListener("click", () => input.click());

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className =
      "text-center text-xs font-medium rounded border px-2 py-1 w-24";
    nameInput.placeholder = `Person ${i + 1}`;
    nameInput.value = slots[i]?.name || "";
    nameInput.disabled = !slots[i]?.image;

    nameInput.addEventListener("click", (ev) => {
      ev.stopPropagation();
    });
    nameInput.addEventListener("keydown", (ev) => {
      ev.stopPropagation();
    });
    nameInput.addEventListener("input", () => {
      if (!slots[i]) return;
      slots[i].name = nameInput.value || `Person ${i + 1}`;
      onChange();
    });

    wrapper.appendChild(tile);
    wrapper.appendChild(nameInput);
    wrapper.appendChild(input);
    container.appendChild(wrapper);
  }
}

/**
 * Render the current list of characters with editable names.
 */
function renderCharacters(container, characters) {
  container.innerHTML = "";

  if (!characters.length) {
    container.textContent = "No characters yet. Choose files above.";
    return;
  }

  const grid = document.createElement("div");
  grid.className = "grid gap-3 sm:grid-cols-2";

  characters.forEach((character, index) => {
    const row = document.createElement("div");
    row.className = "flex items-center gap-3 rounded border bg-white px-3 py-2";

    const label = document.createElement("span");
    label.className = "text-xs text-slate-500";
    label.textContent = String(index + 1);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = character.name;
    nameInput.className = "flex-1 rounded border px-2 py-1 text-sm";

    nameInput.addEventListener("input", () => {
      character.name = nameInput.value;
    });

    const imageNote = document.createElement("span");
    imageNote.className = "hidden text-[10px] text-slate-400 sm:inline";
    imageNote.textContent = character.image;

    row.appendChild(label);
    row.appendChild(nameInput);
    row.appendChild(imageNote);
    grid.appendChild(row);
  });

  container.appendChild(grid);
}

/**
 * Build a board object from the current form values.
 */
function buildBoard(titleValue, characters) {
  if (!characters.length) return null;

  const now = new Date();
  const title = (titleValue || "").trim() || "Untitled board";

  return {
    // Extra id field to make selecting boards easier.
    id: createBoardId(title),
    title,
    created_at: now.toISOString(),
    characters: characters.map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image,
      zoom: c.zoom,
      x: c.x,
      y: c.y,
    })),
  };
}

/**
 * Simple array shuffle for randomizing character order.
 */
function shuffle(items) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function setStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("text-red-600", !!isError);
}

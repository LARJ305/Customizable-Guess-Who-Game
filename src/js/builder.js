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
});

/**
 * Initialize event listeners for the builder UI.
 */
function setupBuilder() {
  const titleInput = document.getElementById("board-title");
  const fileInput = document.getElementById("image-input");
  const characterList = document.getElementById("character-list");
  const randomizeBtn = document.getElementById("randomize-btn");
  const saveLocalBtn = document.getElementById("save-local-btn");
  const downloadJsonBtn = document.getElementById("download-json-btn");
  const statusEl = document.getElementById("builder-status");

  /** @type {Array<{id: string, name: string, image: string}>} */
  let characters = [];

  if (!fileInput || !characterList) return;

  // When the user selects images, create character entries.
  fileInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []);

    characters = files.map((file, index) => {
      const baseName = file.name.replace(/\.[^.]+$/, "");
      return {
        id: `${Date.now()}-${index}`,
        name: baseName,
        // For now we only store the filename. Place the real image files
        // into /public/images and keep the same filenames.
        image: `images/${file.name}`,
      };
    });

    renderCharacters(characterList, characters);
    setStatus(
      statusEl,
      `${characters.length} character(s) loaded. Edit the names and save the board.`
    );
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

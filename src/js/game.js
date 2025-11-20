// Logic for the game board page.
// Loads a board (local or example) and lets the user flip cards to mark eliminations.

import {
  getAllBoardsFromLocalStorage,
  getBoardById,
  initThemeToggle,
  playFlipSound,
} from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  setupGame();
});

/**
 * Initialize the game UI and load available boards.
 */
function setupGame() {
  const select = document.getElementById("board-select");
  const loadButton = document.getElementById("load-board-btn");
  const grid = document.getElementById("game-grid");
  const statusEl = document.getElementById("game-status");

  if (!select || !grid) return;

  const localBoards = getAllBoardsFromLocalStorage();
  populateBoardSelect(select, localBoards);

  // Auto-load a board if boardId is present in the URL.
  const url = new URL(window.location.href);
  const boardIdFromUrl = url.searchParams.get("boardId");
  if (boardIdFromUrl) {
    const board = getBoardById(boardIdFromUrl);
    if (board) {
      renderBoard(grid, board);
      setStatus(
        statusEl,
        `Loaded board "${board.title || "Untitled"}" from this browser.`
      );
    }
  }

  if (loadButton) {
    loadButton.addEventListener("click", () => {
      const value = select.value;
      if (!value) {
        setStatus(statusEl, "Choose a board first.", true);
        return;
      }

      if (value === "example:default") {
        loadExampleBoard()
          .then((board) => {
            renderBoard(grid, board);
            setStatus(statusEl, "Loaded example board from bundled JSON.");
          })
          .catch((error) => {
            console.error(error);
            setStatus(statusEl, "Could not load example board.", true);
          });
        return;
      }

      const board = getBoardById(value);
      if (!board) {
        setStatus(statusEl, "Selected board could not be found.", true);
        return;
      }

      renderBoard(grid, board);
      setStatus(statusEl, `Loaded board "${board.title || "Untitled"}".`);
    });
  }
}

/**
 * Fill the select element with local boards plus a bundled example.
 */
function populateBoardSelect(select, boards) {
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a board…";
  select.appendChild(placeholder);

  boards.forEach((board) => {
    const option = document.createElement("option");
    option.value = board.id || "";
    const count = (board.characters && board.characters.length) || 0;
    option.textContent = `${
      board.title || "Untitled board"
    } (${count} characters)`;
    select.appendChild(option);
  });

  const exampleOption = document.createElement("option");
  exampleOption.value = "example:default";
  exampleOption.textContent = "Example board (bundled)";
  select.appendChild(exampleOption);
}

/**
 * Load the example board shipped with the project.
 */
async function loadExampleBoard() {
  const response = await fetch("../src/data/example-board.json");
  if (!response.ok) {
    throw new Error("Failed to fetch example board");
  }
  return response.json();
}

/**
 * Render the board as a grid of clickable cards.
 */
function renderBoard(grid, board) {
  grid.innerHTML = "";

  const characters = (board && board.characters) || [];
  if (!characters.length) {
    grid.textContent = "This board has no characters yet.";
    return;
  }

  characters.forEach((character) => {
    const card = document.createElement("button");
    card.type = "button";
    card.dataset.characterId = character.id;
    card.className = [
      "relative flex flex-col items-center justify-center",
      "rounded border bg-white px-2 py-3 text-xs",
      "hover:bg-slate-50 transition-colors",
    ].join(" ");
    const imageBox = document.createElement("div");
    imageBox.className = [
      "mb-2 h-20 w-20 overflow-hidden",
      "rounded border bg-slate-100",
    ].join(" ");
    if (character.image) {
      const img = document.createElement("img");
      img.src = character.image;
      img.alt = character.name || "Character";
      img.className = "h-full w-full object-cover pointer-events-none";

      // Support legacy boards (default to top alignment) and new adjustable boards
      const zoom = character.zoom || 1;
      const x = character.x !== undefined ? character.x : 50;
      const y = character.y !== undefined ? character.y : 0;

      img.style.transform = `scale(${zoom})`;
      img.style.objectPosition = `${x}% ${y}%`;
      imageBox.appendChild(img);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className =
        "flex h-full w-full items-center justify-center text-xs";
      placeholder.textContent =
        (character.name && character.name.charAt(0).toUpperCase()) || "?";
      imageBox.appendChild(placeholder);
    }

    const name = document.createElement("span");
    name.className = "text-center text-xs font-medium";
    name.textContent = character.name || "Unknown";

    card.appendChild(imageBox);
    card.appendChild(name);

    card.addEventListener("click", () => {
      card.classList.toggle("is-eliminated");
      // TODO: Hook up a real flip sound effect.
      playFlipSound();
    });

    grid.appendChild(card);
  });
}

function setStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.classList.toggle("text-red-600", !!isError);
}

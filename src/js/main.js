// Entry script for the home (index) page.
// Handles navigation and listing saved boards.

import { getAllBoardsFromLocalStorage, initThemeToggle } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  setupNavigation();
  renderBoardList();
});

/**
 * Wire up the main buttons on the home page.
 */
function setupNavigation() {
  const createButton = document.getElementById("create-board-btn");
  const playButton = document.getElementById("play-board-btn");
  const base = window.location.pathname.replace(/[^/]+$/, ""); // current directory ending with '/'

  if (createButton) {
    createButton.addEventListener("click", () => {
      window.location.href = base + "create.html";
    });
  }

  if (playButton) {
    playButton.addEventListener("click", () => {
      window.location.href = base + "play.html";
    });
  }
}

/**
 * Show a basic list of saved boards in this browser.
 */
function renderBoardList() {
  const container = document.getElementById("board-list");
  if (!container) return;

  const boards = getAllBoardsFromLocalStorage();

  if (!boards.length) {
    container.textContent = "No boards saved yet. Create one to get started.";
    return;
  }

  const list = document.createElement("ul");
  list.className = "space-y-1";

  boards.forEach((board) => {
    const item = document.createElement("li");
    const button = document.createElement("button");

    button.type = "button";
    button.className = "text-sm text-blue-600 hover:underline";
    button.textContent = `${board.title || "Untitled board"} – ${
      (board.characters && board.characters.length) || 0
    } characters`;

    button.addEventListener("click", () => {
      const url = new URL(base + "play.html", window.location.origin + "");
      if (board.id) {
        url.searchParams.set("boardId", board.id);
      }
      window.location.href = url.toString();
    });

    item.appendChild(button);
    list.appendChild(item);
  });

  container.innerHTML = "";
  container.appendChild(list);
}

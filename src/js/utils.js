// Shared utilities for the Guess Who scaffold.
// Handles localStorage, JSON download, theme toggle, and sound placeholders.

const STORAGE_KEY = "guess-who-boards";

/**
 * Read all saved boards from localStorage.
 * Each board has the shape:
 * {
 *   id: string,
 *   title: string,
 *   created_at: string,
 *   characters: [{ id, name, image }]
 * }
 */
export function getAllBoardsFromLocalStorage() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading boards from localStorage", error);
    return [];
  }
}

/**
 * Save or update a board in localStorage.
 */
export function saveBoardToLocalStorage(board) {
  const boards = getAllBoardsFromLocalStorage();
  const index = boards.findIndex((b) => b.id === board.id);
  if (index !== -1) {
    boards[index] = board;
  } else {
    boards.push(board);
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boards));
}

/**
 * Get a single board by id.
 */
export function getBoardById(id) {
  return (
    getAllBoardsFromLocalStorage().find((board) => board.id === id) || null
  );
}

/**
 * Create a simple unique board id based on the title and current time.
 */
export function createBoardId(title) {
  const slug = (title || "board")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${slug}-${Date.now()}`;
}

/**
 * Trigger a download of a JSON file containing the given data.
 */
export function downloadJsonFile(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Attach a simple dark mode toggle to any element with [data-theme-toggle].
 *
 * TODO: Persist the user preference in localStorage and add Tailwind `dark:` classes
 * or custom CSS as you expand the design.
 */
export function initThemeToggle() {
  const toggle = document.querySelector("[data-theme-toggle]");
  if (!toggle) return;

  toggle.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
  });
}

/**
 * Placeholder for initializing sound effects.
 *
 * TODO: Load audio files (flip, selection, confirm) and wire them into playFlipSound.
 */
export function initSoundEffects() {
  // No-op for now.
}

/**
 * Placeholder for playing a flip sound.
 *
 * TODO: Implement using the Web Audio API or HTMLAudioElement.
 */
export function playFlipSound() {
  // No-op for now.
}

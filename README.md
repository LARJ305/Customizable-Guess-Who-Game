# Guess Who – Vanilla JS Starter

A minimal, scalable starter project for a Guess Who–style web game. Built with:

- **Vanilla JavaScript** (ES modules)
- **HTML** + **TailwindCSS via CDN**
- **JSON** data files
- No frameworks (no React/Next.js)

This scaffold focuses on a clear structure you can expand while learning JavaScript.

## Project structure

```text
/public
  /images           # Place character images here
  index.html        # Home ("Create" / "Play")
  create.html       # Board builder
  play.html         # Game board

/src
  /js
    main.js         # Home page logic
    builder.js      # Board creation logic
    game.js         # Game board logic
    utils.js        # Shared helpers (localStorage, theme, JSON download, sounds TODO)
  /data
    example-board.json
  /css
    styles.css      # Small shared styles (flip state, dark tweaks)

index.html          # Redirects to /public/index.html for static hosting
package.json        # Optional, for running a local static server
README.md
```

## Data format

Boards use a simple JSON shape:

```json
{
  "title": "",
  "created_at": "",
  "characters": [{ "id": "", "name": "", "image": "" }]
}
```

The builder adds an extra top-level `id` field to make selecting boards easier when playing.

Boards can be:

- **Saved to localStorage** (for this browser only)
- **Downloaded as a JSON file** (you can commit or share it)

## Pages overview

- **Home (`/public/index.html`)**

  - Buttons to **Create New Board** and **Play Existing Board**
  - Simple list of boards saved in this browser

- **Create (`/public/create.html`)**

  - Upload images (filenames are stored in JSON)
  - Edit character names
  - Randomize character order
  - Save board to localStorage
  - Download board as a `.json` file
  - TODO hooks for manual arrangement and richer validation

- **Play (`/public/play.html`)**
  - Choose a board from localStorage or the bundled `example-board.json`
  - Renders a responsive grid of character cards
  - Click a card to mark it as eliminated (simple visual flip state)
  - TODO hooks for sound effects and richer game rules

All pages share a simple header/footer and a **Dark mode** toggle button wired in `utils.js`.

## Running locally

No build step is required; the project is just static files.

- **Option 1: Open in the browser**

  - Open `public/index.html` directly in your browser.

- **Option 2: Use a simple static server** (recommended)

  - If you have Node.js installed, from the project root:
    - `npx serve .`
    - Then open the URL it prints (usually `http://localhost:3000`).

- **Option 3: VS Code Live Server**
  - Open the folder in VS Code.
  - Use the Live Server extension on `public/index.html`.

## Deploying to Vercel

This project is ready for static hosting on Vercel:

- Push this folder to a Git repository (GitHub, GitLab, etc.).
- Import the repo in Vercel.
- Choose **"Other"** (no framework) or let Vercel auto-detect.
- No build command is required.
- Vercel will serve `index.html` at the root, which immediately redirects to `/public/index.html`.

All paths in HTML and JS are relative, so the app works as a plain static site.

## Where to extend

- **Styling**: Add Tailwind utility classes or custom CSS in `styles.css`.
- **Dark mode**: Extend `initThemeToggle` in `utils.js` and add `dark:` variants or more CSS.
- **Sounds**: Implement `initSoundEffects` and `playFlipSound` in `utils.js`, then call them from `game.js`.
- **Mobile improvements**: Tweak Tailwind grid classes in `play.html` and layout spacing.
- **Game rules**: Add more state and UI in `game.js` (e.g., tracking the chosen character, resets, etc.).

# ComfyUI-Arrow-Key-Canvas-Navigation

This custom "node" for ComfyUI enables pan navigation of the canvas using the arrow keys, with a customizable pan speed (and a Shift-key speed multiplier) in ComfyUI's Settings, under the "codecringebinge" subsection of the Settings Dialog's left panel.

**Note:**

-   There are specific cases in which the arrow keys intentionally will not pan the canvas, such as when a node with more than one image is selected (as the arrow keys should retain their standard behavior of cycling through said images), or when the canvas is blocked by another UI window (e.g. the Comfy Manager, Comfy Settings, the pythongosssss Image Gallery, modals, etc.). Text inputs and text areas are also excluded so typing still works as expected.
-   Blocking UI windows are detected automatically in most cases (ARIA dialogs, native `<dialog>` elements, PrimeVue overlay masks, and full-viewport high-z-index overlays). If you encounter a scenario where the arrow keys are panning the canvas when they shouldn't (e.g. a custom node opens a UI window that isn't being detected), you can report this in the GitHub Issues section of this repo, or for a faster fix, identify a CSS selector for the window in question (e.g. via your browser's Developer Tools) and add it to the "Manual Overlay CSS Selectors (to Disable Panning)" setting (comma-separated list) — no restart required.

# Installation

## If using ComfyUI Manager:

1. Look for `ComfyUI-Arrow-Key-Canvas-Navigation`, confirm the author is `codecringebinge`, and install it.

## If installing manually:

1. Clone this repo into the `custom_nodes` folder.

# Thanks and cheers! 🍻

import { app } from '../../../scripts/app.js';

const BASE_ARROW_KEY_NAV_SETTINGS = 'codecringebinge.Arrow Key Canvas Navigation';
const PAN_SPEED_SETTING = `${BASE_ARROW_KEY_NAV_SETTINGS}.Pan Speed`;
const SHIFT_MULTIPLIER_SETTING = `${BASE_ARROW_KEY_NAV_SETTINGS}.Shift Multiplier`;
const MANUAL_OVERLAY_SELECTORS_SETTING = `${BASE_ARROW_KEY_NAV_SETTINGS}.Manual Overlay CSS Selectors (to Disable Panning)`;
const DEFAULT_PAN_SPEED = 60;
const DEFAULT_SHIFT_MULTIPLIER = 3;

app.registerExtension({
    name: 'codecringebinge.arrow.key.canvas.navigation',
    settings: [
        {
            id: MANUAL_OVERLAY_SELECTORS_SETTING,
            name: 'Manual Overlay CSS Selectors (to Disable Panning)',
            type: 'string',
            defaultValue: '',
            tooltip: `Disables panning when comma-separated CSS selectors find open overlays`
                + ` (e.g. .some-custom-node-lightbox, .another-node-backdrop)`
        },
        {
            id: SHIFT_MULTIPLIER_SETTING,
            name: 'Pan Speed Multiplier (Shift + Arrow Key)',
            type: 'number',
            defaultValue: DEFAULT_SHIFT_MULTIPLIER,
            tooltip: 'Multiplies pan speed by the provided multiplier when holding the shift key'
        },
        {
            id: PAN_SPEED_SETTING,
            name: 'Pan Speed',
            type: 'number',
            defaultValue: DEFAULT_PAN_SPEED,
            tooltip: 'Sets pan speed by pixels per step'
        }
    ],
    async setup() {
        const ARROW_KEYS = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

        /** Check if a text-like element currently has focus. */
        function isInputFocused() {
            const el = document.activeElement;
            if (!el) return false;
            if (['INPUT', 'TEXTAREA'].includes(el.tagName)) return true;
            if (el.contentEditable === 'true') return true;
            if (el.tagName === 'SPAN' && el.classList.contains('property_value')) return true;
            return false;
        }

        function isDialogOpen() {
            const active = document.activeElement;
            // If focus is inside a dialog (ARIA-compliant or native), disable panning
            if (active?.closest('[role="dialog"], [aria-modal="true"], .p-dialog, dialog')) return true;

            // PrimeVue renders an overlay mask backdrop when any modal dialog is open.
            const mask = document.querySelector('.p-overlay-mask[style*="display: flex"]');
            if (mask) return true;

            // Native HTML <dialog> elements that haven't been closed
            const nativeDialogs = document.querySelectorAll('dialog:not([hidden])');
            if (nativeDialogs.length > 0) return true;

            // Custom user-defined CSS selectors for third-party overlays the built-in checks miss.
            // Comma-separated list, e.g. ".pysssss-lightbox, .model-linker-backdrop"
            const customSelectors = app.extensionManager.setting.get(MANUAL_OVERLAY_SELECTORS_SETTING);
            if (customSelectors) {
                for (const sel of customSelectors.split(',')) {
                    const trimmed = sel.trim();
                    if (!trimmed) continue;
                    try {
                        const el = document.querySelector(trimmed);
                        if (el && window.getComputedStyle(el).display !== 'none') return true;
                    } catch {
                        // Invalid CSS selector - skip silently
                    }
                }
            }

            // Fallback: full-viewport fixed overlay with high z-index.
            // Checks visibility and actual rendered dimensions to avoid false positives.
            const overlays = document.querySelectorAll('div[style*="position: fixed"]');
            for (const el of overlays) {
                const cs = window.getComputedStyle(el);
                if (cs.display === 'none' || cs.visibility === 'hidden') continue;

                // Must cover the full viewport in rendered size
                const w = el.clientWidth;
                const h = el.clientHeight;
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                if (w < vw * 0.95 || h < vh * 0.95) continue;

                // Must have a high z-index to be an overlay
                const z = parseInt(cs.zIndex, 10);
                if (z < 9000) continue;

                return true;
            }

            return false;
        }

        /** Check if the currently selected node has an image carousel to navigate. */
        function hasImageCarousel(node) {
            if (!node) return false;
            const hasMultipleImgs = !!(node.imgs && node.imgs.length > 1);
            const imgWidgetCount = node.widgets?.filter(widget => widget.name === 'image').length || 0;
            // Need at least 2 images/widgets for a carousel to make sense
            if (hasMultipleImgs) return true;
            if (imgWidgetCount > 1) return true;
            return false;
        }

        const keybindListener = function (event) {
            // Fast path: not an arrow key
            if (!ARROW_KEYS.has(event.key)) return;

            // Fast path: modifier keys block or trigger speed boost
            const isShiftPressed = event.shiftKey;
            if (event.altKey || event.metaKey) return;

            // Fast path: input has focus
            if (isInputFocused()) return;

            // Fast path: dialog/modal is open
            if (isDialogOpen()) return;

            // --- Canvas pan logic ---
            const offset = app.canvas.ds.offset;
            const baseDelta = app.extensionManager.setting.get(PAN_SPEED_SETTING);
            const delta = isShiftPressed
                ? baseDelta * app.extensionManager.setting.get(SHIFT_MULTIPLIER_SETTING)
                : baseDelta;

            if (event.key === 'ArrowUp') {
                offset[1] += delta;
            } else if (event.key === 'ArrowDown') {
                offset[1] -= delta;
            } else {
                // Left/Right: check for image carousel on selected node
                const { current_node } = app.canvas;
                const isSelected = current_node?.is_selected;

                if (!hasImageCarousel(current_node) || !isSelected) {
                    if (event.key === 'ArrowLeft') offset[0] += delta;
                    else offset[0] -= delta;
                }
            }
        };

        window.addEventListener('keydown', keybindListener, true);
    },
});

import { app } from '../../../scripts/app.js';

const CANVAS_BLOCKING_UI_WINDOW_CLASSES = '.comfy-modal, .p-dialog, .pysssss-lightbox';

app.registerExtension({
    name: 'codecringebinge.arrow.key.canvas.navigation',
    async setup() {
        const panSpeedSettingName = 'codecringebinge.Arrow Key Canvas Navigation';
        const defaultPanSpeed = 60;

        app.ui.settings.addSetting({
            id: panSpeedSettingName,
            name: 'Pan Speed',
            type: 'number',
            defaultValue: defaultPanSpeed,
        });

        const keybindListener = function (event) {
            const isModifierPressed = !!(event.altKey || event.metaKey);
            const isInputSelected = ['INPUT', 'TEXTAREA'].includes(event.composedPath()[0].tagName);
            const uiWindows = Array.from(document.querySelectorAll(CANVAS_BLOCKING_UI_WINDOW_CLASSES));
            const isCanvasBlocked = !!uiWindows.filter((uiw) => window.getComputedStyle(uiw).getPropertyValue('display') !== 'none').length;
            const isArrowKeyPressed = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key);

            if (isModifierPressed || isInputSelected || isCanvasBlocked || !isArrowKeyPressed) {
                return;
            }

            const offset = app.canvas.ds.offset;
            const newOffsetDelta = app.ui.settings.getSettingValue(panSpeedSettingName, defaultPanSpeed);

            if (event.key === 'ArrowUp') {
                offset[1] += newOffsetDelta;
            } else if (event.key === 'ArrowDown') {
                offset[1] -= newOffsetDelta;
            } else {
                const { current_node } = app.canvas;
                const isSelected = current_node && current_node.is_selected;
                const hasImgs = current_node && (current_node.imgs || []).length > 1;
                const hasImgWidgets = current_node && (current_node.widgets || []).filter((widget) => widget.name === 'image').length > 1;
                const hasImageCarousel = current_node && (hasImgs || hasImgWidgets);

                if (!hasImageCarousel || !isSelected) {
                    if (event.key === 'ArrowLeft') {
                        offset[0] += newOffsetDelta;
                    } else if (event.key === 'ArrowRight') {
                        offset[0] -= newOffsetDelta;
                    }
                }
            }
        };

        window.addEventListener('keydown', keybindListener, true);
    },
});

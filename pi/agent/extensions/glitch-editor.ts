/**
 * Keep the prompt editor border on the normal theme border.
 *
 * Pi uses the thinking-level theme colors for the editor border by default.
 * The footer owns that signal for glitch, so this editor deliberately ignores
 * Pi's thinking-level border updates while preserving normal and bash-mode
 * editor behavior.
 *
 * <|°_°|>
 */

import {
	CustomEditor,
	type ExtensionAPI,
	type KeybindingsManager,
} from "@earendil-works/pi-coding-agent";
import type { EditorTheme, TUI } from "@earendil-works/pi-tui";

class StableBorderEditor extends CustomEditor {
	constructor(tui: TUI, theme: EditorTheme, keybindings: KeybindingsManager) {
		super(tui, theme, keybindings);

		// Interactive mode copies the default editor's borderColor onto custom
		// editors and updates it whenever thinking changes. Keep the ordinary
		// editor border instead of accepting those thinking-level assignments.
		const stableBorderColor = theme.borderColor;
		let currentBorderColor = stableBorderColor;
		let bashMode = false;

		Object.defineProperty(this, "borderColor", {
			configurable: true,
			enumerable: true,
			get: () => currentBorderColor,
			set: (borderColor: (text: string) => string) => {
				// Pi's bash-mode assignment is useful; thinking-level assignments
				// are intentionally ignored.
				if (bashMode) currentBorderColor = borderColor;
			},
		});

		// setCustomEditorComponent wires the default editor's onChange handler
		// after constructing us. Wrap that assignment so bash-mode border color
		// remains available without letting thinking changes recolor the prompt.
		let onChange: ((text: string) => void) | undefined;
		Object.defineProperty(this, "onChange", {
			configurable: true,
			enumerable: true,
			get: () => onChange,
			set: (handler: ((text: string) => void) | undefined) => {
				onChange = handler
					? (text: string) => {
						bashMode = text.trimStart().startsWith("!");
						if (!bashMode) currentBorderColor = stableBorderColor;
						handler(text);
						if (!bashMode) currentBorderColor = stableBorderColor;
					}
					: undefined;
			},
		});
	}
}

export default function (pi: ExtensionAPI) {
	pi.on("session_start", (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setEditorComponent((tui, theme, keybindings) =>
			new StableBorderEditor(tui, theme, keybindings),
		);
	});
}

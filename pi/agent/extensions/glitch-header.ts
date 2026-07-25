/**
 * Custom header — shows the glitch bee on boot.
 *
 * <|°_°|>
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode !== "tui") return;

		ctx.ui.setHeader((_tui, theme) => ({
			render(): string[] {
				const bee = ` <|°_°|> `;

				return [
					"",
					theme.fg("warning", bee),
				];
			},
			invalidate() {},
		}));
	});

	pi.registerCommand("builtin-header", {
		description: "restore the default pi header",
		handler: async (_args, ctx) => {
			ctx.ui.setHeader(undefined);
			ctx.ui.notify("default header restored", "info");
		},
	});
}

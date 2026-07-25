/**
 * Explicit deny list for sensitive file mutations.
 *
 * This stays intentionally narrow: block direct `write` / `edit` attempts into
 * paths that should never be modified by the agent. It does not try to parse
 * bash or become a sandbox.
 *
 * Hard-blocked:
 *   - anything under `.git/`
 *
 * <|°_°|>
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const DENIED_PATH_PARTS = [".git/"];

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (event.toolName !== "write" && event.toolName !== "edit") return undefined;

		const path = event.input.path as string;
		const matched = DENIED_PATH_PARTS.find((part) => path.includes(part));
		if (!matched) return undefined;

		if (ctx.hasUI) {
			ctx.ui.notify(`🚫 blocked write to ${path}`, "warning");
		}

		return {
			block: true,
			reason: `path denied by policy: "${matched}"`,
		};
	});
}

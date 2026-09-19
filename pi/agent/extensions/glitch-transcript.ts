/**
 * Small transcript presentation tweaks.
 *
 * <|°_°|>
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.registerMarkdownTransformer((markdown, { messageType }) => {
		if (messageType === "user") {
			return `---\n${markdown}\n---\n---`;
		}
		return markdown;
	});
}

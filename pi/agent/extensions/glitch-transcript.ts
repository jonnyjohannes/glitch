/**
 * transcript presentation tweaks.
 *
 * <|°_°|>
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

export default function (pi: ExtensionAPI) {
	pi.registerMarkdownTransformer((markdown, { messageType }) => {
		// if (messageType === "user") {
		// 	return markdown
		// 		.split("\n")
		// 		.map((line) => `> ${line}`)
		// 		.join("\n");
		// }
		return markdown;
	});
}

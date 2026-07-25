/**
 * Explicit deny list for dangerous bash commands.
 *
 * This is intentionally small. It is a tripwire, not a permission system.
 * If something is risky-but-valid, trust the agent/user workflow instead of
 * forcing harness prompts everywhere.
 *
 * Hard-blocked:
 *   - sudo
 *   - git reset --hard
 *   - git push -f / --force / --force-with-lease
 *   - rm with both recursive + force flags (`rm -rf`, `rm -r -f`, etc.)
 *
 * <|°_°|>
 */

import { isToolCallEventType, type ExtensionAPI } from "@earendil-works/pi-coding-agent";

interface DenyRule {
	label: string;
	test: (cmd: string) => boolean;
}

const DENY_RULES: DenyRule[] = [
	{
		label: "sudo",
		test: (cmd) => /(?:^|[\s;&|])sudo(?:\s|$)/.test(cmd),
	},
	{
		label: "git reset --hard",
		test: (cmd) => /(?:^|[\s;&|])git(?:\s+-C\s+\S+)?\s+reset\b[^;&|]*\s--hard(?:\s|$|[;&|])/.test(cmd),
	},
	{
		label: "git push --force",
		test: (cmd) => /(?:^|[\s;&|])git(?:\s+-C\s+\S+)?\s+push\b[^;&|]*(?:\s-f(?:\s|$)|\s--force(?:[=\s]|$)|\s--force-with-lease(?:[=\s]|$))/.test(cmd),
	},
	{
		label: "rm -rf",
		test: (cmd) => {
			const rmCommands = cmd.split(/(?:&&|\|\||;|\n)/);
			return rmCommands.some((part) => {
				const rm = part.match(/(?:^|\s)rm\s+([^;&|]+)/);
				if (!rm) return false;
				const flags = rm[1]
					.split(/\s+/)
					.filter((token) => token.startsWith("-"))
					.join(" ");
				return /(?:^|\s)--recursive(?:\s|$)|-[A-Za-z]*r[A-Za-z]*/.test(flags) && /(?:^|\s)--force(?:\s|$)|-[A-Za-z]*f[A-Za-z]*/.test(flags);
			});
		},
	},
];

export default function (pi: ExtensionAPI) {
	pi.on("tool_call", async (event, ctx) => {
		if (!isToolCallEventType("bash", event)) return undefined;

		const matched = DENY_RULES.find((rule) => rule.test(event.input.command));
		if (!matched) return undefined;

		if (ctx.hasUI) {
			ctx.ui.notify(`🚫 blocked: ${matched.label}`, "warning");
		}

		return {
			block: true,
			reason: `command denied by policy: "${matched.label}"`,
		};
	});
}

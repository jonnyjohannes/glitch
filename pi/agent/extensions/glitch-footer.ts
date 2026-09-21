/**
 * Glitch footer
 *
 *   󰉋 .   main *14  󰧑 gpt-5.5 • medium   ██░░░░░░░░ 23%
 *
 * Segments:
 *   - folder glyph + repo-relative dir (theme accent)
 *   - git glyph + branch + open PR# + dirty count (theme warning)
 *   - brain glyph + model + thinking level (theme accent + thinking-level color)
 *   - storage glyph + context gauge bar + % (theme success/warning/error)
 *
 * Dirty count and PR number are cached and refreshed in the background
 * so the render path never blocks.
 *
 * <|°_°|>
 */

import type { ExtensionAPI, ThemeColor } from "@earendil-works/pi-coding-agent";
import { truncateToWidth } from "@earendil-works/pi-tui";
import { execFile } from "node:child_process";

// ── glyphs (nerd font) ──────────────────────────────────────────────
const FOLDER = "\u{F024B}"; // 󰉋  md-folder
const GIT = "\u{E0A0}"; //   powerline branch
const BRAIN = "\u{F09D1}"; // 󰧑  md-brain
const STORAGE = "\u{EACE}"; //   cod-database

// ── context gauge ────────────────────────────────────────────────────
const BAR_FILL = "\u2588"; // █
const BAR_EMPTY = "\u2591"; // ░
const BAR_WIDTH = 10;
const CTX_WARN = 60; // % → yellow
const CTX_CRIT = 85; // % → red

type ThinkingLevel = "off" | "minimal" | "low" | "medium" | "high" | "xhigh" | "max";

const THINKING_COLORS: Record<ThinkingLevel, ThemeColor> = {
	off: "thinkingOff",
	minimal: "thinkingMinimal",
	low: "thinkingLow",
	medium: "thinkingMedium",
	high: "thinkingHigh",
	xhigh: "thinkingXhigh",
	max: "thinkingMax",
};

const MODEL_COLORS: Partial<Record<string, ThemeColor>> = {
	luna: "mdHeading",
	sol: "mdCode",
};

function getModelColor(modelId: string): ThemeColor {
	const modelName = modelId.toLowerCase().split("-").pop() ?? modelId.toLowerCase();
	return MODEL_COLORS[modelName] ?? "mdLink";
}

// ── helpers ──────────────────────────────────────────────────────────

/** run a command in the background, resolve stdout (empty on error) */
function bg(cmd: string, args: string[], cwd: string): Promise<string> {
	return new Promise((resolve) => {
		execFile(cmd, args, { cwd, timeout: 5000 }, (err, stdout) => {
			resolve(err ? "" : (stdout ?? "").trim());
		});
	});
}

export default function (pi: ExtensionAPI) {
	// ── cached git state (refreshed in background) ───────────────────
	let gitRoot: string | null = null;
	let dirtyCount = 0;
	let prNumber = "";
	let refreshTimer: ReturnType<typeof setInterval> | undefined;
	let requestRender: (() => void) | undefined;

	async function refreshGitState(cwd: string) {
		// git root
		const root = await bg("git", ["rev-parse", "--show-toplevel"], cwd);
		gitRoot = root || null;
		if (!gitRoot) {
			dirtyCount = 0;
			prNumber = "";
			return;
		}

		// dirty count
		const porcelain = await bg("git", ["status", "--porcelain"], cwd);
		dirtyCount = porcelain ? porcelain.split("\n").filter(Boolean).length : 0;

		// open PR for current branch (requires gh)
		const branch = await bg("git", ["rev-parse", "--abbrev-ref", "HEAD"], cwd);
		if (branch && branch !== "HEAD") {
			const prJson = await bg("gh", ["pr", "view", "--json", "number,state"], cwd);
			if (prJson) {
				try {
					const parsed = JSON.parse(prJson) as { number?: number; state?: string };
					prNumber = parsed.state === "OPEN" && parsed.number ? String(parsed.number) : "";
				} catch {
					prNumber = "";
				}
			} else {
				prNumber = "";
			}
		} else {
			prNumber = "";
		}
	}

	pi.on("session_start", async (_event, ctx) => {
		if (ctx.mode !== "tui") return;
		requestRender = undefined;
		// initial refresh
		await refreshGitState(ctx.cwd);

		// periodic refresh every 15s
		clearInterval(refreshTimer);
		refreshTimer = setInterval(() => {
			void refreshGitState(ctx.cwd);
		}, 15_000);

		ctx.ui.setFooter((tui, theme, footerData) => {
			requestRender = () => tui.requestRender();
			const branchUnsub = footerData.onBranchChange(() => {
				void refreshGitState(ctx.cwd);
				tui.requestRender();
			});

			return {
				dispose: branchUnsub,
				invalidate() {},

				render(width: number): string[] {
					const parts: string[] = [];

					// ── 2. git branch + PR + dirty (rose-pine gold) ───
					const branch = footerData.getGitBranch();
					if (branch) {
						let gitSeg = `${GIT} ${branch}`;
						if (prNumber) gitSeg += ` #${prNumber}`;
						if (dirtyCount > 0) gitSeg += ` *${dirtyCount}`;
						parts.push(theme.fg("warning", gitSeg));
					}

					// ── 3. model + thinking level ───────────────────────
					const model = ctx.model;
					if (model) {
						const thinkingLevel = pi.getThinkingLevel();
						const thinkingLabel = thinkingLevel === "off" ? "thinking off" : thinkingLevel;
						const modelColor = getModelColor(model.id);
						parts.push(
							`${theme.fg(modelColor, BRAIN)} ${theme.fg(modelColor, model.id)} ${theme.fg("dim", "•")} ${theme.fg(THINKING_COLORS[thinkingLevel], thinkingLabel)}`,
						);
					}

					// ── 4. context gauge (rose-pine foam/gold/love) ───
					const usage = ctx.getContextUsage();
					const pct = usage?.percent;
					if (pct != null) {
						const pctInt = Math.max(0, Math.min(100, Math.round(pct)));
						const filled = Math.round((pctInt * BAR_WIDTH) / 100);
						const level = pctInt >= CTX_CRIT ? "error" : pctInt >= CTX_WARN ? "warning" : "success";

						const filledBar = theme.fg(level, BAR_FILL.repeat(filled));
						const emptyBar = theme.fg("borderMuted", BAR_EMPTY.repeat(BAR_WIDTH - filled));

						parts.push(`${theme.fg(level, STORAGE)} ${filledBar}${emptyBar} ${theme.fg(level, `${pctInt}%`)}`);
					}

					const line = parts.join("  ");
					return [truncateToWidth(line, width), ""];
				},
			};
		});
	});

	// refresh on turn end (dirty count / context may have changed)
	pi.on("turn_end", async (_event, ctx) => {
		void refreshGitState(ctx.cwd);
	});

	pi.on("model_select", () => {
		requestRender?.();
	});

	pi.on("thinking_level_select", () => {
		requestRender?.();
	});

	pi.on("session_shutdown", () => {
		clearInterval(refreshTimer);
		refreshTimer = undefined;
		requestRender = undefined;
	});

	// ── commands ──────────────────────────────────────────────────────
	pi.registerCommand("default-footer", {
		description: "restore the default pi footer",
		handler: async (_args, ctx) => {
			ctx.ui.setFooter(undefined);
			ctx.ui.notify("default footer restored", "info");
		},
	});
}

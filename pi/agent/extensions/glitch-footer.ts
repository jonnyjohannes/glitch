/**
 * Glitch footer
 *
 *   󰉋 .   main *14  󰧑 gpt-5.5 • medium   ██░░░░░░░░ 23%
 *
 * Segments:
 *   - folder glyph + repo-relative dir (theme accent)
 *   - git status indicators in the configured Starship format (theme warning)
 *   - brain glyph + model + thinking level (theme accent + thinking-level color)
 *   - storage glyph + context gauge bar + % (theme success/warning/error)
 *
 * Git status is cached and refreshed in the background so the render path
 * never blocks.
 *
 * <|°_°|>
 */

import type { ExtensionAPI, ThemeColor } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";
import { execFile } from "node:child_process";

// ── glyphs (nerd font) ──────────────────────────────────────────────
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
	// ── cached git status (refreshed in the background) ───────────────
	let gitStatus = "";
	let refreshTimer: ReturnType<typeof setInterval> | undefined;
	let requestRender: (() => void) | undefined;

	async function refreshGitState(cwd: string) {
		const status = await bg("git", ["status", "--porcelain=v2", "--branch"], cwd);
		if (!status) {
			gitStatus = "";
			requestRender?.();
			return;
		}

		const flags = {
			conflicted: false,
			stashed: false,
			deleted: false,
			renamed: false,
			modified: false,
			staged: false,
			untracked: false,
		};
		let ahead = 0;
		let behind = 0;
		for (const line of status.split("\n")) {
			if (line.startsWith("# branch.ab ")) {
				const match = line.match(/\+(\d+) -(\d+)/);
				if (match) {
					ahead = Number(match[1]);
					behind = Number(match[2]);
				}
				continue;
			}
			if (line.startsWith("? ")) {
				flags.untracked = true;
				continue;
			}
			if (!line.startsWith("1 ") && !line.startsWith("2 ") && !line.startsWith("u ")) continue;

			const index = line[2];
			const worktree = line[3];
			if (line.startsWith("u ") || ["DD", "AU", "UD", "UA", "DU", "AA", "UU"].includes(`${index}${worktree}`)) {
				flags.conflicted = true;
			}
			if (index === "D" || worktree === "D") flags.deleted = true;
			if (index === "R") flags.renamed = true;
			if (index === "M" || worktree === "M") flags.modified = true;
			if (index === "A") flags.staged = true;
		}

		const stash = await bg("git", ["stash", "list", "-1"], cwd);
		flags.stashed = Boolean(stash);
		const allStatus = [
			flags.conflicted ? "=" : "",
			flags.stashed ? "$" : "",
			flags.deleted ? "✘" : "",
			flags.renamed ? "»" : "",
			flags.modified ? "!" : "",
			flags.staged ? "+" : "",
			flags.untracked ? "?" : "",
		].join("");
		const aheadBehind = ahead > 0 && behind > 0 ? "⇕" : ahead > 0 ? "⇡" : behind > 0 ? "⇣" : "";
		const content = `${allStatus}${aheadBehind}`;
		gitStatus = content;
		requestRender?.();
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
					let left = "";

					// Match [git_status]'s configured format, keeping brackets visible when clean.
					left = theme.fg("warning", `[${gitStatus}] `);

					// Model, thinking level, and context gauge stay anchored on the right.
					const rightParts: string[] = [];
					const model = ctx.model;
					if (model) {
						const thinkingLevel = pi.getThinkingLevel();
						const thinkingLabel = thinkingLevel === "off" ? "thinking off" : thinkingLevel;
						const modelColor = getModelColor(model.id);
						rightParts.push(
							`${theme.fg(modelColor, BRAIN)} ${theme.fg(modelColor, model.id)} ${theme.fg("dim", "•")} ${theme.fg(THINKING_COLORS[thinkingLevel], thinkingLabel)}`,
						);
					}

					const usage = ctx.getContextUsage();
					const pct = usage?.percent;
					if (pct != null) {
						const pctInt = Math.max(0, Math.min(100, Math.round(pct)));
						const filled = Math.round((pctInt * BAR_WIDTH) / 100);
						const level = pctInt >= CTX_CRIT ? "error" : pctInt >= CTX_WARN ? "warning" : "success";

						const filledBar = theme.fg(level, BAR_FILL.repeat(filled));
						const emptyBar = theme.fg("borderMuted", BAR_EMPTY.repeat(BAR_WIDTH - filled));

						rightParts.push(`${theme.fg(level, STORAGE)} ${filledBar}${emptyBar} ${theme.fg(level, `${pctInt}%`)}`);
					}

					const right = truncateToWidth(rightParts.join("  "), width);
					const rightWidth = visibleWidth(right);
					const leftWidth = Math.min(visibleWidth(left), Math.max(0, width - rightWidth - (left ? 2 : 0)));
					const visibleLeft = truncateToWidth(left, leftWidth);
					const gap = Math.max(0, width - visibleWidth(visibleLeft) - rightWidth);
					return [`${visibleLeft}${" ".repeat(gap)}${right}`, ""];
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

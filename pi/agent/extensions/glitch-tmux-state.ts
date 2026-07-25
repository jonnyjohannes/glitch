import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const pane = process.env.TMUX_PANE;
const agentOption = "@pi-agent";
const stateOption = "@pi-state";

type PiState = "idle" | "working" | "done";
const DONE_TIMEOUT_MS = 24 * 60 * 60 * 1000;

export default function (pi: ExtensionAPI) {
	if (!pane) return;

	let currentState: PiState | undefined;
	let pendingOperation = Promise.resolve();
	let doneTimer: ReturnType<typeof setTimeout> | undefined;

	function enqueue(operation: () => Promise<void>): Promise<void> {
		const nextOperation = pendingOperation.then(operation, operation);
		pendingOperation = nextOperation.catch(() => undefined);
		return nextOperation;
	}

	function clearDoneTimer(): void {
		if (doneTimer === undefined) return;
		clearTimeout(doneTimer);
		doneTimer = undefined;
	}

	function scheduleDoneExpiry(): void {
		clearDoneTimer();
		doneTimer = setTimeout(() => {
			doneTimer = undefined;
			void setState("idle");
		}, DONE_TIMEOUT_MS);
	}

	function setState(state: PiState): Promise<void> {
		if (state === "done") {
			scheduleDoneExpiry();
		} else {
			clearDoneTimer();
		}

		return enqueue(async () => {
			if (currentState === state) return;
			currentState = state;

			try {
				await pi.exec("tmux", ["set-option", "-p", "-t", pane, agentOption, "1"]);
				await pi.exec("tmux", ["set-option", "-p", "-t", pane, stateOption, state]);
			} catch {
				// Pi should keep working if the tmux pane disappears or tmux is unavailable.
			}
		});
	}

	function clearState(): Promise<void> {
		clearDoneTimer();
		return enqueue(async () => {
			currentState = undefined;

			try {
				await pi.exec("tmux", ["set-option", "-p", "-t", pane, "-u", agentOption]);
				await pi.exec("tmux", ["set-option", "-p", "-t", pane, "-u", stateOption]);
			} catch {
				// The pane may already be gone during shutdown.
			}
		});
	}

	pi.on("session_start", () => setState("idle"));
	pi.on("agent_start", () => setState("working"));
	pi.on("agent_settled", () => setState("done"));

	pi.on("session_shutdown", async (event) => {
		// Internal session replacement and /reload keep this Pi process alive.
		// Only remove the marker when the process is actually quitting.
		clearDoneTimer();
		if (event.reason === "quit") {
			await clearState();
		}
	});
}

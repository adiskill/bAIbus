export const ARRIVING_NOW_THRESHOLD_MS = 15_000;
export const LESS_THAN_MINUTE_THRESHOLD_MS = 60_000;

export type RelativeArrivalDisplay =
	| {
			kind: "now";
	  }
	| {
			kind: "underMinute";
	  }
	| {
			kind: "minutes";
			minutes: number;
	  };

export function getRelativeArrivalDisplay(remainingMs: number): RelativeArrivalDisplay {
	const safeRemainingMs = Math.max(0, remainingMs);

	if (safeRemainingMs < ARRIVING_NOW_THRESHOLD_MS) {
		return { kind: "now" };
	}

	if (safeRemainingMs < LESS_THAN_MINUTE_THRESHOLD_MS) {
		return { kind: "underMinute" };
	}

	return {
		kind: "minutes",
		minutes: Math.floor(safeRemainingMs / 60_000)
	};
}

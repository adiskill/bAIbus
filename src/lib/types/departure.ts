export type LiveDeparture = {
	tripId: number;
	line: string;
	destination: string;
	platform: string | null;
	routeType: number | null;
	scheduledDeparture: string;
	predictedDeparture: string;
	minutesUntilDeparture: number;
	delayMinutes: number;
	isLive: boolean;
	statusLabel: string;
};

export type LiveDepartureBoard = {
	stationId: number;
	departures: LiveDeparture[];
	fetchedAt: string;
	requestedDate: string;
	requestedTime: string;
};

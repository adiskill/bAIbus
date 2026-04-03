export type Coordinates = {
	latitude: number;
	longitude: number;
};

export type StationMode = "bus" | "tram" | "rail";

export type Station = {
	id: number;
	name: string;
	city: string;
	stationType: number | null;
	latitude: number;
	longitude: number;
};

export type NearbyStation = Station & {
	distanceMeters: number;
};

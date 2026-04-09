import type { TripStop, TripVehiclePosition } from "$lib/types/trip";

const EARTH_RADIUS_METERS = 6_371_000;

export type TripSegmentProgress = number;

function toRadians(value: number) {
	return (value * Math.PI) / 180;
}

function calculateDistanceMeters(
	origin: TripVehiclePosition,
	destination: TripVehiclePosition
) {
	const latitudeDelta = toRadians(destination.latitude - origin.latitude);
	const longitudeDelta = toRadians(destination.longitude - origin.longitude);
	const originLatitude = toRadians(origin.latitude);
	const destinationLatitude = toRadians(destination.latitude);

	const haversine =
		Math.sin(latitudeDelta / 2) ** 2 +
		Math.cos(originLatitude) *
			Math.cos(destinationLatitude) *
			Math.sin(longitudeDelta / 2) ** 2;

	return Math.round(
		2 * EARTH_RADIUS_METERS * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
	);
}

export function getTripSegmentProgress(
	stops: TripStop[],
	lastDepartedIndex: number,
	vehiclePosition: TripVehiclePosition | null
): TripSegmentProgress | null {
	if (
		vehiclePosition === null ||
		lastDepartedIndex < 0 ||
		lastDepartedIndex >= stops.length - 1
	) {
		return null;
	}

	const fromStop = stops[lastDepartedIndex];
	const toStop = stops[lastDepartedIndex + 1];

	if (fromStop.position === null || toStop.position === null) {
		return null;
	}

	const distanceFromVehicleToFromStop = calculateDistanceMeters(
		vehiclePosition,
		fromStop.position
	);
	const distanceFromVehicleToToStop = calculateDistanceMeters(
		vehiclePosition,
		toStop.position
	);
	const totalDistance = distanceFromVehicleToFromStop + distanceFromVehicleToToStop;

	if (totalDistance <= 0) {
		return 0;
	}

	return Number((distanceFromVehicleToFromStop / totalDistance).toFixed(3));
}

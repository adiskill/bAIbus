import type { Locale } from "$lib/i18n";
import type { TripDetail } from "$lib/types/trip";

import { getIdsbkTripDetail } from "$lib/api/idsbk/trips";

type TripDetailRequest = {
	tripId: string;
	locale: Locale;
};

export async function getTripDetail(
	fetchFn: typeof fetch,
	request: TripDetailRequest
): Promise<TripDetail> {
	return getIdsbkTripDetail(fetchFn, request);
}

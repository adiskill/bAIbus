export const catalog = {
	en: {
		header: {
			search: "Search",
			searchRoutes: "Search routes",
			searchTimetables: "Search timetables"
		},
		nav: {
			home: "Home",
			navigation: "Navigation",
			timetables: "Timetables"
		},
		home: {
			title: "Home",
			metaDescription: "Transit home screen with nearby stops and favorites.",
			nearbyHeading: "Nearby Stops",
			favoritesHeading: "Favorites",
			findingStops: "Finding stops near you...",
			retryingLocation: "Retrying location with higher accuracy...",
			locationPermissionDenied:
				"Allow location access in the browser and device settings to see the nearest stops.",
			locationPositionUnavailable:
				"Your browser could not determine your position. Check device location services and signal.",
			locationTimeout:
				"Location lookup timed out. Try again with a better signal or a less strict privacy setting.",
			locationUnavailable: "Unable to get your location right now.",
			locationNotAvailable: "Location is not available in this browser.",
			locationRequiresSecureContext: "Location requires HTTPS or localhost in this browser.",
			locationBlocked:
				"Location access is blocked in the browser. Enable it in site settings to see nearby stops.",
			loadingNearbyStops: "Loading nearby stops...",
			nearbyStopsLoadError: "Unable to load nearby stops right now.",
			noNearbyStops: "No nearby stops were found for your location."
		},
		navigation: {
			title: "Navigation",
			metaDescription:
				"Transit navigation page for route planning and nearby journey actions.",
			heading: "Navigation",
			cardTitle: "Route planning",
			cardDescription:
				"This page is ready for trip planning, route suggestions, and turn-by-turn transit flows.",
			quickActions: [
				"Plan a route between stops",
				"Use current location as the start",
				"Swap origin and destination quickly"
			]
		},
		timetables: {
			title: "Timetables",
			metaDescription:
				"Transit timetables page for departures, schedules, and line lookup.",
			heading: "Timetables",
			cardTitle: "Schedule lookup",
			cardDescription:
				"This page is ready for line timetables, stop boards, and service-day specific schedules.",
			sections: [
				"Browse stops and lines",
				"Check the next scheduled departures",
				"Review full-day service patterns"
			]
		},
		station: {
			metaDescription: (stationName: string, city: string) =>
				`Station detail for ${stationName} in ${city}.`,
			backToHome: "Back to home",
			addFavorite: "Add station to favourites",
			removeFavorite: "Remove station from favourites",
			openOnMap: "Open station on map",
			upcomingHeading: "Upcoming Departures",
			refreshing: "Refreshing",
			liveSource: "Live IDS BK",
			updatedAt: (time: string) => `Updated ${time}`,
			waitingForData: "Waiting for data",
			noLiveDepartures: "No live departures are available for this station right now.",
			scheduled: "Scheduled",
			onTime: "On time",
			refreshError: "Unable to refresh live departures right now.",
			platformLabel: (platform: string) => `Platform ${platform}`,
			now: "Now",
			minuteUnit: "min"
		},
		errors: {
			stationNotFound: "Station not found",
			invalidStationId: "Invalid station ID",
			invalidLatitudeCoordinate: "Invalid latitude coordinate",
			invalidLongitudeCoordinate: "Invalid longitude coordinate",
			latitudeRange: "Latitude must be between -90 and 90",
			longitudeRange: "Longitude must be between -180 and 180",
			nearbyStationsLoad: "Unable to load nearby stations",
			liveDeparturesLoad: "Unable to load live departures right now."
		}
	},
	sk: {
		header: {
			search: "Hľadať",
			searchRoutes: "Hľadať spojenia",
			searchTimetables: "Hľadať cestovné poriadky"
		},
		nav: {
			home: "Domov",
			navigation: "Navigácia",
			timetables: "Cestovné poriadky"
		},
		home: {
			title: "Domov",
			metaDescription: "Domovská obrazovka dopravy so zastávkami v okolí a obľúbenými.",
			nearbyHeading: "Zastávky v okolí",
			favoritesHeading: "Obľúbené",
			findingStops: "Vyhľadávam zastávky vo vašom okolí...",
			retryingLocation: "Skúšam polohu získať znova s vyššou presnosťou...",
			locationPermissionDenied:
				"Povoľte prístup k polohe v nastaveniach prehliadača a zariadenia, aby sa zobrazili najbližšie zastávky.",
			locationPositionUnavailable:
				"Prehliadač nedokázal určiť vašu polohu. Skontrolujte služby určovania polohy a signál zariadenia.",
			locationTimeout:
				"Vyhľadanie polohy vypršalo. Skúste to znova s lepším signálom alebo menej prísnym nastavením súkromia.",
			locationUnavailable: "Vašu polohu sa momentálne nepodarilo získať.",
			locationNotAvailable: "Poloha nie je v tomto prehliadači dostupná.",
			locationRequiresSecureContext:
				"Určovanie polohy v tomto prehliadači vyžaduje HTTPS alebo localhost.",
			locationBlocked:
				"Prístup k polohe je v prehliadači zablokovaný. Povoľte ho v nastaveniach stránky, aby sa zobrazili zastávky v okolí.",
			loadingNearbyStops: "Načítavam zastávky v okolí...",
			nearbyStopsLoadError: "Zastávky v okolí sa momentálne nepodarilo načítať.",
			noNearbyStops: "Pre vašu polohu sa nenašli žiadne zastávky v okolí."
		},
		navigation: {
			title: "Navigácia",
			metaDescription:
				"Stránka navigácie pre plánovanie trás a akcie súvisiace s cestovaním v okolí.",
			heading: "Navigácia",
			cardTitle: "Plánovanie trasy",
			cardDescription:
				"Táto stránka je pripravená na plánovanie ciest, návrhy trás a podrobné vedenie verejnou dopravou.",
			quickActions: [
				"Naplánovať trasu medzi zastávkami",
				"Použiť aktuálnu polohu ako štart",
				"Rýchlo vymeniť východiskový bod a cieľ"
			]
		},
		timetables: {
			title: "Cestovné poriadky",
			metaDescription:
				"Stránka cestovných poriadkov pre odchody, rozpisy a vyhľadávanie liniek.",
			heading: "Cestovné poriadky",
			cardTitle: "Vyhľadanie v poriadkoch",
			cardDescription:
				"Táto stránka je pripravená na cestovné poriadky liniek, odchodové tabule zastávok a rozpisy podľa dňa premávky.",
			sections: [
				"Prehliadať zastávky a linky",
				"Skontrolovať najbližšie plánované odchody",
				"Pozrieť si celodenné schémy premávky"
			]
		},
		station: {
			metaDescription: (stationName: string, city: string) =>
				`Detail zastávky ${stationName} v meste ${city}.`,
			backToHome: "Späť na domovskú stránku",
			addFavorite: "Pridať zastávku medzi obľúbené",
			removeFavorite: "Odobrať zastávku z obľúbených",
			openOnMap: "Otvoriť zastávku na mape",
			upcomingHeading: "Najbližšie odchody",
			refreshing: "Obnovuje sa",
			liveSource: "Živé IDS BK",
			updatedAt: (time: string) => `Aktualizované ${time}`,
			waitingForData: "Čaká sa na dáta",
			noLiveDepartures: "Momentálne nie sú pre túto zastávku dostupné žiadne živé odchody.",
			scheduled: "Podľa rozpisu",
			onTime: "Načas",
			refreshError: "Živé odchody sa momentálne nepodarilo obnoviť.",
			platformLabel: (platform: string) => `Nástupište ${platform}`,
			now: "Teraz",
			minuteUnit: "min"
		},
		errors: {
			stationNotFound: "Zastávka sa nenašla",
			invalidStationId: "Neplatné ID zastávky",
			invalidLatitudeCoordinate: "Neplatná zemepisná šírka",
			invalidLongitudeCoordinate: "Neplatná zemepisná dĺžka",
			latitudeRange: "Zemepisná šírka musí byť medzi -90 a 90",
			longitudeRange: "Zemepisná dĺžka musí byť medzi -180 a 180",
			nearbyStationsLoad: "Zastávky v okolí sa nepodarilo načítať",
			liveDeparturesLoad: "Živé odchody sa momentálne nepodarilo načítať."
		}
	}
} as const;

export type Messages = (typeof catalog)["en"];

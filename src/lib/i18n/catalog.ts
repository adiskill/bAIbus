export const catalog = {
	en: {
		header: {
			search: "Search",
			searchRoutes: "Search routes",
			searchTimetables: "Search timetables"
		},
		searchOverlay: {
			placeholder: "Search for a station or route",
			recentHeading: "Recent searches",
			emptyRecent: "Your recent searches will appear here.",
			back: "Back",
			close: "Close search",
			lastSearched: (relative: string) => `Last searched ${relative}`
		},
		nav: {
			home: "Home",
			navigation: "Navigation",
			timetables: "Timetables"
		},
		workInProgress: {
			heading: "Work in progress",
			description: (featureName: string) =>
				`${featureName} is still being built for a reliable mobile transit workflow.`,
			homeHint: "Use Home for nearby stops and live departures in the meantime.",
			openHome: "Open home"
		},
		home: {
			title: "Home",
			metaDescription: "Transit home screen with nearby stops and favorites.",
			searchPlaceholder: "Search for a station",
			searchingStations: "Searching stations...",
			noStationSearchResults: "No stations matched that search.",
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
			openTripDetails: (line: string, destination: string) =>
				`Open trip ${line} to ${destination}`,
			upcomingHeading: "Upcoming Departures",
			refreshing: "Refreshing",
			loadingMore: "Loading more departures",
			liveSource: "Live IDS BK",
			updatedNow: "Updated now",
			updatedAt: (time: string) => `Updated ${time} ago`,
			waitingForData: "Waiting for data",
			noLiveDepartures: "No live departures are available for this station right now.",
			scheduled: "Scheduled",
			onTime: "On time",
			refreshError: "Unable to refresh live departures right now.",
			loadMoreError: "Unable to load more departures right now.",
			retryLoadMore: "Try again",
			platformLabel: (platform: string) => `Platform ${platform}`,
			lessThanMinute: "<1",
			now: "Now",
			minuteUnit: "min"
		},
		trip: {
			metaDescription: (line: string, destination: string) =>
				`Trip detail for line ${line} to ${destination}.`,
			backToHome: "Back to home",
			backToStation: "Back to station",
			backToNavigation: "Back to navigation",
			openOnMap: "Open destination on map",
			arrivingNow: "Arriving now",
			arrivingLessThanMinutePrefix: "Arriving in",
			arrivingLessThanMinuteUnit: "min",
			arrivingIn: (minutes: number) => `Arriving in ${minutes}m`,
			delayBadge: (minutes: number) => `+${minutes}m delay`,
			previousStop: "Previous stop",
			nextStop: "Next stop",
			transferStop: "Transfer stop"
		},
		errors: {
			stationNotFound: "Station not found",
			tripNotFound: "Trip not found",
			stationSearchLoad: "Unable to load stations right now.",
			invalidStationId: "Invalid station ID",
			invalidLatitudeCoordinate: "Invalid latitude coordinate",
			invalidLongitudeCoordinate: "Invalid longitude coordinate",
			latitudeRange: "Latitude must be between -90 and 90",
			longitudeRange: "Longitude must be between -180 and 180",
			nearbyStationsLoad: "Unable to load nearby stations",
			liveDeparturesLoad: "Unable to load live departures right now.",
			tripLoad: "Unable to load trip details right now."
		}
	},
	sk: {
		header: {
			search: "Hľadať",
			searchRoutes: "Hľadať spojenia",
			searchTimetables: "Hľadať cestovné poriadky"
		},
		searchOverlay: {
			placeholder: "Vyhľadajte zastávku alebo linku",
			recentHeading: "Nedávne vyhľadávania",
			emptyRecent: "Vaše nedávne vyhľadávania sa zobrazia tu.",
			back: "Späť",
			close: "Zavrieť vyhľadávanie",
			lastSearched: (relative: string) => `Naposledy hľadané ${relative}`
		},
		nav: {
			home: "Domov",
			navigation: "Navigácia",
			timetables: "Cestovné poriadky"
		},
		workInProgress: {
			heading: "Pracujeme na tom",
			description: (featureName: string) =>
				`${featureName} ešte pripravujeme tak, aby spoľahlivo fungovalo pri cestovaní na mobile.`,
			homeHint: "Zatiaľ použite Domov pre zastávky v okolí a živé odchody.",
			openHome: "Otvoriť domov"
		},
		home: {
			title: "Domov",
			metaDescription: "Domovská obrazovka dopravy so zastávkami v okolí a obľúbenými.",
			searchPlaceholder: "Vyhľadajte zastávku",
			searchingStations: "Vyhľadávam zastávky...",
			noStationSearchResults: "Žiadne zastávky nezodpovedajú tomuto vyhľadávaniu.",
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
			openTripDetails: (line: string, destination: string) =>
				`Otvoriť detail spoja ${line} smer ${destination}`,
			upcomingHeading: "Najbližšie odchody",
			refreshing: "Obnovuje sa",
			loadingMore: "Načítavam ďalšie odchody",
			liveSource: "Živé IDS BK",
			updatedNow: "Aktualizované teraz",
			updatedAt: (time: string) => `Aktualizované pred ${time}`,
			waitingForData: "Čaká sa na dáta",
			noLiveDepartures: "Momentálne nie sú pre túto zastávku dostupné žiadne živé odchody.",
			scheduled: "Podľa rozpisu",
			onTime: "Načas",
			refreshError: "Živé odchody sa momentálne nepodarilo obnoviť.",
			loadMoreError: "Ďalšie odchody sa momentálne nepodarilo načítať.",
			retryLoadMore: "Skúsiť znova",
			platformLabel: (platform: string) => `Nástupište ${platform}`,
			lessThanMinute: "<1",
			now: "Teraz",
			minuteUnit: "min"
		},
		trip: {
			metaDescription: (line: string, destination: string) =>
				`Detail spoja linky ${line} smer ${destination}.`,
			backToHome: "Späť domov",
			backToStation: "Späť na zastávku",
			backToNavigation: "Späť na navigáciu",
			openOnMap: "Otvoriť cieľ na mape",
			arrivingNow: "Prichádza teraz",
			arrivingLessThanMinutePrefix: "Príde o",
			arrivingLessThanMinuteUnit: "min",
			arrivingIn: (minutes: number) => `Príde o ${minutes} min`,
			delayBadge: (minutes: number) => `+${minutes} min meškanie`,
			previousStop: "Predchádzajúca zastávka",
			nextStop: "Ďalšia zastávka",
			transferStop: "Prestupná zastávka"
		},
		errors: {
			stationNotFound: "Zastávka sa nenašla",
			tripNotFound: "Spoj sa nenašiel",
			stationSearchLoad: "Zastávky sa momentálne nepodarilo načítať.",
			invalidStationId: "Neplatné ID zastávky",
			invalidLatitudeCoordinate: "Neplatná zemepisná šírka",
			invalidLongitudeCoordinate: "Neplatná zemepisná dĺžka",
			latitudeRange: "Zemepisná šírka musí byť medzi -90 a 90",
			longitudeRange: "Zemepisná dĺžka musí byť medzi -180 a 180",
			nearbyStationsLoad: "Zastávky v okolí sa nepodarilo načítať",
			liveDeparturesLoad: "Živé odchody sa momentálne nepodarilo načítať.",
			tripLoad: "Detail spoja sa momentálne nepodarilo načítať."
		}
	}
} as const;

export type Messages = (typeof catalog)["en"];
export type LocalizedMessages = (typeof catalog)[keyof typeof catalog];

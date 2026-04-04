import { catalog } from "./catalog";

export const locales = ["en", "sk"] as const;

export type Locale = (typeof locales)[number];

type LanguagePreference = {
	index: number;
	quality: number;
	range: string;
};

const localeMetadata = {
	en: {
		htmlLang: "en",
		intlLocale: "en-GB"
	},
	sk: {
		htmlLang: "sk",
		intlLocale: "sk-SK"
	}
} as const satisfies Record<Locale, { htmlLang: string; intlLocale: string }>;

export type I18n = {
	htmlLang: string;
	intlLocale: string;
	locale: Locale;
	messages: (typeof catalog)[Locale];
};

function parseAcceptLanguageHeader(header: string | null) {
	if (!header) {
		return [];
	}

	return header
		.split(",")
		.map((part, index) => {
			const [rawRange, ...parameters] = part.trim().split(";");
			const range = rawRange.trim().toLowerCase();

			if (!range) {
				return null;
			}

			const qualityParameter = parameters.find((parameter) =>
				parameter.trim().startsWith("q=")
			);
			const qualityValue = qualityParameter?.split("=")[1]?.trim();
			const parsedQuality =
				qualityValue === undefined ? 1 : Number.parseFloat(qualityValue);
			const quality =
				Number.isFinite(parsedQuality) && parsedQuality >= 0 && parsedQuality <= 1
					? parsedQuality
					: 0;

			return {
				index,
				quality,
				range
			} satisfies LanguagePreference;
		})
		.filter((preference): preference is LanguagePreference => preference !== null)
		.filter((preference) => preference.quality > 0);
}

function findLanguagePreference(
	preferences: LanguagePreference[],
	language: Locale
) {
	let bestMatch: LanguagePreference | null = null;

	for (const preference of preferences) {
		if (
			preference.range !== language &&
			!preference.range.startsWith(`${language}-`)
		) {
			continue;
		}

		if (
			bestMatch === null ||
			preference.quality > bestMatch.quality ||
			(preference.quality === bestMatch.quality &&
				preference.index < bestMatch.index)
		) {
			bestMatch = preference;
		}
	}

	return bestMatch;
}

export function getI18n(locale: Locale): I18n {
	return {
		locale,
		messages: catalog[locale],
		...localeMetadata[locale]
	};
}

export function resolveLocale(acceptLanguageHeader: string | null): Locale {
	const preferences = parseAcceptLanguageHeader(acceptLanguageHeader);
	const slovakPreference = findLanguagePreference(preferences, "sk");
	const englishPreference = findLanguagePreference(preferences, "en");

	if (
		slovakPreference &&
		(!englishPreference ||
			slovakPreference.quality > englishPreference.quality ||
			(slovakPreference.quality === englishPreference.quality &&
				slovakPreference.index < englishPreference.index))
	) {
		return "sk";
	}

	return "en";
}

export function getMessages(locale: Locale) {
	return catalog[locale];
}

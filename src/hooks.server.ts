import type { Handle } from "@sveltejs/kit";

import { resolveLocale } from "$lib/i18n";

export const handle: Handle = async ({ event, resolve }) => {
	const locale = resolveLocale(event.request.headers.get("accept-language"));
	event.locals.locale = locale;

	const response = await resolve(event, {
		transformPageChunk: ({ html }) =>
			html.replace(/<html lang="[^"]*">/, `<html lang="${locale}">`)
	});

	response.headers.set("content-language", locale);

	return response;
};

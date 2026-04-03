import { QueryClient } from "@tanstack/svelte-query";

export function createAppQueryClient() {
	return new QueryClient();
}

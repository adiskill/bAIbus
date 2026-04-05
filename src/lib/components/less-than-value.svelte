<script lang="ts">
	import { cn } from "$lib/utils";

	let {
		value = "1",
		class: className
	}: {
		value?: string;
		class?: string;
	} = $props();
</script>

<span class={cn("inline-flex items-center align-middle leading-none", className)}>
	<span aria-hidden="true" class="text-[0.58em] leading-none">&lt;</span>
	<span class="leading-none">{value}</span>
</span>

<script lang="ts">
	import { Tabs as TabsPrimitive } from "bits-ui";
	import { cn } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.ContentProps = $props();
</script>

<TabsPrimitive.Content
	bind:ref
	data-slot="tabs-content"
	class={cn("text-sm flex-1 outline-none data-[state=active]:animate-in data-[state=inactive]:animate-out data-[state=active]:fade-in data-[state=inactive]:fade-out duration-200 ease-in-out", className)}
	{...restProps}
/>

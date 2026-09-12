<script lang="ts">
	import { Tabs as TabsPrimitive } from 'bits-ui';
	import { cn } from '$lib/utils.js';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: TabsPrimitive.ContentProps = $props();
</script>

<TabsPrimitive.Content
	bind:ref
	data-slot="tabs-content"
	class={cn(
		'flex-1 text-sm duration-200 ease-in-out outline-none data-[state=active]:animate-in data-[state=active]:fade-in data-[state=inactive]:animate-out data-[state=inactive]:fade-out',
		className
	)}
	{...restProps}
/>

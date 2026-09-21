<script lang="ts" generics="T extends { id: string | number }">
	import { dndzone } from 'svelte-dnd-action';
	import type { DndEvent } from 'svelte-dnd-action';
	import type { Snippet } from 'svelte';

	let {
		items = $bindable([] as T[]),
		type = undefined,
		itemIdKey = 'id' as keyof T & string,
		options = {},
		onConsider,
		onFinalize,
		children,
		...rest
	}: {
		items?: T[];
		type?: string;
		itemIdKey?: keyof T & string;
		options?: Record<string, unknown>;
		onConsider?: (detail: DndEvent<T>) => void;
		onFinalize?: (detail: DndEvent<T>) => void;
		children?: Snippet<[item: T, index: number]>;
	} = $props();

	function handleConsider(e: CustomEvent<DndEvent<T>>) {
		items = e.detail.items;
		onConsider?.(e.detail);
	}

	function handleFinalize(e: CustomEvent<DndEvent<T>>) {
		items = e.detail.items;
		onFinalize?.(e.detail);
	}

	const zoneOptions = $derived({ items, type, ...options });
</script>

<div use:dndzone={zoneOptions} {...rest} onconsider={handleConsider} onfinalize={handleFinalize}>
	{#each items as item, i (item[itemIdKey])}
		{@render children?.(item, i)}
	{/each}
</div>

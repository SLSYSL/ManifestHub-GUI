<script lang="ts" generics="T extends { id: string | number }">
	import { dndzone } from 'svelte-dnd-action';
	import type { HTMLAttributes } from 'svelte/elements';
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
	}: Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
		items?: T[];
		type?: string;
		itemIdKey?: keyof T & string;
		options?: Record<string, unknown>;
		onConsider?: (detail: DndEvent<T>) => void;
		onFinalize?: (detail: DndEvent<T>) => void;
		children?: Snippet<[item: T, index: number]>;
	} = $props();

	const zoneOptions = $derived({ items, type, ...options });
</script>

<div
	use:dndzone={zoneOptions}
	onconsider={(e) => {
		items = e.detail.items;
		onConsider?.(e.detail);
	}}
	onfinalize={(e) => {
		items = e.detail.items;
		onFinalize?.(e.detail);
	}}
	{...rest}
>
	{#each items as item, i (item[itemIdKey])}
		{@render children?.(item, i)}
	{/each}
</div>

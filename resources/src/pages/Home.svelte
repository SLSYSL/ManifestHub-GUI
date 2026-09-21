<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Card from '$lib/components/ui/card/index.js';

	let loading = $state(true);
	let games = $state({
		appid: '2638890',
		name: '鬼武者 Way of the Sword',
		img: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/2638890/ce31174fea86d0bafa21b26e853dcd0b7326e36f/header.jpg?t=1788494549'
	});
</script>

<form role="search" aria-label="游戏搜索" class="mb-4">
	<Input aria-label="游戏搜索框" placeholder="请输入游戏名" />
</form>

{#if loading}
	<p class="mb-4 shimmer text-center text-muted-foreground">正在加载&hellip;</p>
{/if}

<div class="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
	{#each { length: 12 }}
		<Card.Root>
			<img src={games.img} alt={games.name} class="aspect-460/215 w-full object-cover" />
			<Card.Header>
				<p>Test</p>
			</Card.Header>
		</Card.Root>
	{/each}
</div>

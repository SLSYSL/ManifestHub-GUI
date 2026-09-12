<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import { store } from '$lib/store.svelte.js';
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>个性化设置</Card.Title>
		<Card.Description>定制视觉与交互</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="flex items-center space-x-2">
			<Label for="dark-mode">深色模式</Label>
			<Switch
				id="dark-mode"
				checked={store.get('theme') === 'dark'}
				onCheckedChange={(checked) => store.set('theme', checked ? 'dark' : 'light')}
			/>
		</div>
	</Card.Content>
</Card.Root>

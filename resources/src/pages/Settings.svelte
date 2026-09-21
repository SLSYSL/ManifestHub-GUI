<script lang="ts">
	import { EllipsisVertical } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import DndZone from '$lib/components/custom/dnd/DndZone.svelte';
	import { store } from '$lib/store.svelte.js';

	type Source = {
		id: string;
		label: string;
		data: Array<{
			id: number | string;
			name: string;
		}>;
	}[];

	let DataSources: Source = $state([
		{
			id: 'featured',
			label: '特色',
			data: [
				{ id: 1, name: 'Test 1' },
				{ id: 2, name: 'Test 2' }
			]
		},
		{
			id: 'search',
			label: '搜索',
			data: [
				{ id: 1, name: 'Test 1' },
				{ id: 2, name: 'Test 2' }
			]
		},
		{
			id: 'key',
			label: '密钥',
			data: [
				{ id: 1, name: 'Test 1' },
				{ id: 2, name: 'Test 2' }
			]
		},
		{
			id: 'manifest',
			label: '清单',
			data: [
				{ id: 1, name: 'Test 1' },
				{ id: 2, name: 'Test 2' }
			]
		}
	]);
</script>

<Card.Root class="mb-4">
	<Card.Header>
		<Card.Title>核心设置</Card.Title>
		<Card.Description>定义应用的核心行为</Card.Description>
	</Card.Header>
	<Card.Content>
		<Dialog.Root>
			<Dialog.Trigger type="button" class={buttonVariants({ variant: 'outline' })}>
				数据源
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Title>数据源设置</Dialog.Title>
				<Dialog.Description>配置数据来源，管理状态与优先级，并定义解析逻辑</Dialog.Description>
				<Tabs.Root value={DataSources[0].id}>
					<Tabs.List variant="line">
						{#each DataSources as item}
							<Tabs.Trigger value={item.id}>{item.label}</Tabs.Trigger>
						{/each}
					</Tabs.List>
					{#each DataSources as group}
						<Tabs.Content value={group.id} aria-label={group.label} class="flex flex-col gap-2">
							<DndZone bind:items={group.data} options={{ morphDisabled: true }}>
								{#snippet children(item)}
									<Card.Root>
										<Card.Content class="flex items-center justify-between">
											<span>{item.name}</span>
											<Button size="icon" variant="ghost"><EllipsisVertical /></Button>
										</Card.Content>
									</Card.Root>
								{/snippet}
							</DndZone>
						</Tabs.Content>
					{/each}
				</Tabs.Root>
			</Dialog.Content>
		</Dialog.Root>

		<Dialog.Root>
			<Dialog.Trigger type="button" class={buttonVariants({ variant: 'outline' })}>
				输出格式
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Title>输出格式设置</Dialog.Title>
				<Dialog.Description>定义生成文件的格式、命名和后缀</Dialog.Description>
			</Dialog.Content>
		</Dialog.Root>
	</Card.Content>
</Card.Root>

<Card.Root>
	<Card.Header>
		<Card.Title>个性化设置</Card.Title>
		<Card.Description>定制视觉与交互</Card.Description>
	</Card.Header>
	<Card.Content class="flex flex-col gap-2">
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

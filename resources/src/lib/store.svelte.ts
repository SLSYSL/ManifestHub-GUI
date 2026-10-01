import { load, type Store } from '@tauri-apps/plugin-store';
import { getCurrentWindow } from '@tauri-apps/api/window';

class Persisted<S extends Record<string, Field<unknown>>> {
	#backend?: Store;
	#ready?: Promise<void>;
	#pending: Array<[string, unknown]> = [];
	#values = $state<Record<string, unknown>>({});

	constructor(readonly schema: S) {
		for (const [k, f] of Object.entries(schema)) this.#values[k] = f.resolve?.() ?? f.default;
	}

	get<K extends keyof S & string>(k: K) {
		return this.#values[k] as Infer<S>[K];
	}
	set<K extends keyof S & string>(k: K, v: Infer<S>[K]) {
		this.#values[k] = v;
		this.#backend ? void this.#backend.set(k, v) : this.#pending.push([k, v]);
	}

	init(file = 'settings.json') {
		return (this.#ready ??= (async () => {
			const b = (this.#backend = await load(file, { autoSave: true }));
			for (const [k, f] of Object.entries(this.schema)) {
				const saved = await b.get(k);
				if (saved !== undefined) this.#values[k] = saved;
			}
			for (const k of Object.keys(this.schema))
				await b.onKeyChange(k, (v) => {
					if (v !== undefined) this.#values[k] = v;
				});
			for (const [k, v] of this.#pending) void b.set(k, v);
			this.#pending.length = 0;
			await getCurrentWindow().onCloseRequested(() => b.save());
		})());
	}
}

type Field<T> = { default?: T; resolve?: () => T };
type Infer<S extends Record<string, Field<unknown>>> = {
	[K in keyof S]: S[K] extends Field<infer T> ? T : never;
};

export const store = new Persisted({
	theme: {
		resolve: () => (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
	},
	sources: {
		default: [{
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
		}]
	}
});

import { load, type Store } from '@tauri-apps/plugin-store';

let backend: Store;

class GlobalStore {
	theme = $state<'light' | 'dark'>('light');

	setTheme(t: 'light' | 'dark') {
		this.theme = t;
		backend?.set('theme', t);
	}

	async flush() {
		await backend?.save();
	}
}

export const store = new GlobalStore();

export async function init() {
	backend = await load('settings.json', { autoSave: true });
	const saved = await backend.get('theme');
	store.theme =
		saved === 'dark'
			? 'dark'
			: saved === 'light'
				? 'light'
				: matchMedia('(prefers-color-scheme: dark)').matches
					? 'dark'
					: 'light';
}

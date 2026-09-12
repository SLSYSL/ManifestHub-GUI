import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { resolve } from 'path';
import path from 'node:path';
import process from 'node:process';
const host = process.env.TAURI_DEV_HOST;

export default defineConfig(() => ({
	root: resolve(import.meta.dirname, 'resources'),
	plugins: [tailwindcss(), svelte()],
	server: {
		port: 1420,
		strictPort: true,
		host: host || false,
		hmr: host
			? {
					protocol: 'ws',
					host,
					port: 1421
				}
			: undefined,
		watch: {
			ignored: ['**/src-tauri/**']
		}
	},
	resolve: {
		alias: {
			$lib: path.resolve('./resources/src/lib')
		}
	},
	clearScreen: false
}));

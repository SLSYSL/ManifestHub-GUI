import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { init } from '$lib/store.svelte';

await init();
const app = mount(App, {
	target: document.getElementById('app')!
});

export default app;

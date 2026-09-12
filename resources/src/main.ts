import { mount } from 'svelte';
import './app.css';
import App from './App.svelte';
import { store } from '$lib/store.svelte';

await store.init();
const app = mount(App, {
	target: document.getElementById('app')!
});

export default app;

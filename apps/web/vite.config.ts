import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { contentMeta } from './vite-plugins/content-meta';

export default defineConfig({
	plugins: [contentMeta(), tailwindcss(), sveltekit()],
	optimizeDeps: {
		exclude: ['@rollup/browser']
	},
	worker: {
		format: 'es'
	}
});

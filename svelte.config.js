import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from 'process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess({
		scss: {
			includePaths: [path.join(__dirname, 'src/lib/styles')]
		}
	}),
	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		// adapter: adapter()
		vite: {
			server: {
				proxy: {
					'/api': {
						target: 'http://localhost:4000',
						rewrite: (path) => path.replace(/^\/api/, '')
					}
				}
			}
		}
	}
};

export default config;

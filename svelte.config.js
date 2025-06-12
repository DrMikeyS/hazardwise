import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
		pages: 'build',
		assets: 'build',
		fallback: 'index.html',
		// don't fail when encountering dynamic routes
		strict: false
		}),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/hazardwise' : '',
    }
  }
};

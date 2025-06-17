// svelte.config.js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  kit: {
    // use the static adapter with all the defaults
    adapter: adapter(),
    // remove any custom base path unless you really need it
    // paths: { base: '' },
  }
};
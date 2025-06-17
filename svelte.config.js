import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: preprocess(),

    kit: {
        adapter: adapter({
      // output folder (defaults to 'build')
      pages: 'build',
      assets: 'build',

      // serve index.html for any path not otherwise found
      fallback: '404.html'
    }),
		paths: {
      // keep your base path logic
      base: process.env.NODE_ENV === 'production' ? '/hazardwise' : ''
    }
    }
};

export default config;
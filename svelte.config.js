// svelte.config.js
import adapter from '@sveltejs/adapter-node';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocess(),
  kit: {
    adapter: adapter({
      // out: 'build',
      // precompress: false,
      // env: { host: 'HOST', port: 'PORT' }
    }),
    paths: {
      base: process.env.NODE_ENV === 'production' ? '/hazardwise' : ''
    }
  }
};

export default config;

import { writable } from 'svelte/store';
import Cookies from 'js-cookie';
import { browser } from '$app/environment';

function persistedCookie(key, initial) {
  const raw   = browser && Cookies.get(key);
  const value = raw ? JSON.parse(raw) : initial;
  const store = writable(value);
  if (browser) {
    store.subscribe(v =>
      Cookies.set(key, JSON.stringify(v), {
        expires: 7, sameSite: 'strict', path: '/'
      })
    );
  }
  return store;
}

export const mitigations = persistedCookie('hazardwise-mitigations', []);

/* Example mitigation structure:
[
  { id: 'M01', description: 'Improve UI labels' },
  { id: 'M02', description: 'Add validation' },
  { id: 'M03', description: 'User training video' }
]
*/
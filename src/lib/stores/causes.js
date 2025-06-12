//lib/stores/causes.js
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

export const causes = persistedCookie('hazardwise-causes', []);


/* Example cause structure:
[
  {
    id: 'C01',
    description: 'Unclear UI',
    mitigationIds: ['M01', 'M03'] // ← these are always linked to this cause
  }
]
*/
import { writable } from 'svelte/store';
import Cookies from 'js-cookie';
import { browser } from '$app/environment';
import { normalizeMitigationList } from '$lib/utils/mitigation.js';

function persistedCookie(key, initial) {
  const raw = browser && Cookies.get(key);
  let parsed = initial;

  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = initial;
    }
  }

  /** @param {unknown} value @returns {any[]} */
  const normalize = (value) =>
    normalizeMitigationList(Array.isArray(value) ? value : []);

  /** @type {import('svelte/store').Writable<any[]>} */
  const store = writable(normalize(parsed));

  const set = (value) => store.set(normalize(value));
  const update = (updater) =>
    store.update((current) => normalize(updater(current)));

  if (browser) {
    store.subscribe((value) =>
      Cookies.set(key, JSON.stringify(normalize(value)), {
        expires: 7, sameSite: 'strict', path: '/'
      })
    );
  }
  return {
    subscribe: store.subscribe,
    set,
    update
  };
}

export const mitigations = persistedCookie('hazardwise-mitigations', []);

/* Example mitigation structure:
[
  {
    id: 'M01',
    description: 'Improve UI labels',
    implementationClass: 'organisation'
  },
  {
    id: 'M02',
    description: 'Add validation',
    implementationClass: 'manufacturer'
  }
]
*/

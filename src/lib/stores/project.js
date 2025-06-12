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

export const project = persistedCookie('hazardwise-project', {
  title: '',
  description: '',
  safetyOfficer: '',
  hazards: [
    // example hazard:
    // {
    //   id: 'H01',
    //   description: 'AI summariser skips salient nuances',
    //   causeIds: ['C01', 'C03'],
    //   impactIds: ['I02'],
    //   mitigationIds: ['M01']
    // }
  ]
});

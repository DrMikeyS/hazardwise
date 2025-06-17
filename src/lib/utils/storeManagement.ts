// hazardwise/src/lib/utils/storeManagement.ts
import { project }     from '$lib/stores/project.js';
import { causes }      from '$lib/stores/causes.js';
import { mitigations } from '$lib/stores/mitigations.js';
import { impacts }     from '$lib/stores/impacts.js';


export function clearCookies() {
  document.cookie
    .split(';')
    .forEach(c => {
      document.cookie = c
        .replace(/^ +/, '')
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
}

const EMPTY_PROJECT = {
  title: '',
  description: '',
  safetyOfficer: '',
  hazards: []
};

export function clearLocalStorage() {
  project.set(EMPTY_PROJECT);
  causes.set([]);
  mitigations.set([]);
  impacts.set([]);
}
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { clearLocalStorage,clearCookies } from './utils/storeManagement';

export function startNewProject() {
  console.log('Starting new project');
  clearLocalStorage();
  clearCookies();
  goto(base+'/new');
}

export function uploadProject() {
  // placeholder; later you can wire up file-input here
  alert('Upload not yet implemented');
}

import { goto } from '$app/navigation';

export function startNewProject() {
  goto('/new');
}

export function uploadProject() {
  // placeholder; later you can wire up file-input here
  alert('Upload not yet implemented');
}

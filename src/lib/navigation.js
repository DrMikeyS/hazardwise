import { goto } from '$app/navigation';
import { base } from '$app/paths';
export function startNewProject() {
  console.log('Starting new project');
  goto(base+'/new');
}

export function uploadProject() {
  // placeholder; later you can wire up file-input here
  alert('Upload not yet implemented');
}

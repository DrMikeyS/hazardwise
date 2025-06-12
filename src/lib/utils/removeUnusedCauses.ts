import { get } from 'svelte/store';
import { project } from '$lib/stores/project.js';
import { causes } from '$lib/stores/causes.js';

export function removeUnusedCauses() {
  const proj = get(project);
  const allUsedCauseIds = new Set(
    proj.hazards.flatMap(h => h.causeIds || [])
  );

  causes.update(currentCauses =>
    currentCauses.filter(cause => allUsedCauseIds.has(cause.id))
  );
}

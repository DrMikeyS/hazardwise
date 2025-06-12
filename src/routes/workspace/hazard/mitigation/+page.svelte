<!-- src/routes/workspace/hazard/mitigation/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';

  let hazardID: string | null = null;
  let causeID: string | null = null;
  let mitigationID: string | null = null;
  let description = '';

  onMount(() => {
    hazardID = page.url.searchParams.get('hazardID');
    causeID = page.url.searchParams.get('causeID');
    mitigationID = page.url.searchParams.get('mitigationID');

    if (!hazardID && !causeID) {
      alert('You must specify either a hazard or cause.');
      goto('/workspace');
    }

    if (mitigationID) {
      const existing = get(mitigations).find(m => m.id === mitigationID);
      if (existing) {
        description = existing.description;
      }
    }
  });

  function goBack() {
    if (causeID) goto(`/workspace/hazard/cause?hazardID=${hazardID}&causeID=${causeID}`);
    else if (hazardID) goto(`/workspace/hazard?id=${hazardID}`);
    else goto('/workspace');
  }

  function handleSave() {
    mitigations.update(list => {
      if (mitigationID) {
        return list.map(m =>
          m.id === mitigationID ? { ...m, description } : m
        );
      } else {
        const nextIndex = list.length + 1;
        const newId = `M${String(nextIndex).padStart(2, '0')}`;
        mitigationID = newId;
        return [...list, { id: newId, description }];
      }
    });

    // Link mitigation to either cause or hazard
    if (mitigationID) {
      if (causeID) {
        causes.update(all =>
          all.map(c =>
            c.id === causeID && !c.mitigationIds?.includes(mitigationID!)
              ? {
                  ...c,
                  mitigationIds: [...(c.mitigationIds || []), mitigationID]
                }
              : c
          )
        );
      } else if (hazardID) {
        project.update(proj => ({
          ...proj,
          hazards: proj.hazards.map(h =>
            h.id === hazardID && !h.mitigationIds?.includes(mitigationID!)
              ? {
                  ...h,
                  mitigationIds: [...(h.mitigationIds || []), mitigationID]
                }
              : h
          )
        }));
      }
    }

    goBack();
  }
</script>

<main class="container py-4">
  <button class="btn btn-link mb-3" on:click={goBack}>
    ← Back
  </button>

  <h1 class="mb-4">{mitigationID ? 'Edit Mitigation' : 'Add Mitigation'}</h1>

  <div class="mb-3">
    <label for="mitigationDescription" class="form-label">
      Mitigation Description
    </label>
    <textarea
      id="mitigationDescription"
      class="form-control"
      rows="3"
      bind:value={description}
      placeholder="e.g. Add human review step"
    ></textarea>
    <div class="form-text">
      A mitigation is an action or control that reduces the likelihood or impact of a hazard or cause.
    </div>
  </div>

  <button class="btn btn-success" on:click={handleSave}>
    {mitigationID ? 'Save Changes' : 'Save Mitigation'}
  </button>
</main>

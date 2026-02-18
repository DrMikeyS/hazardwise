<!-- src/routes/workspace/hazard/mitigation/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import {
    MITIGATION_IMPLEMENTATION_CLASS,
    MITIGATION_IMPLEMENTATION_HELP_TEXT,
    MITIGATION_IMPLEMENTATION_LABELS,
    normalizeMitigationImplementationClass
  } from '$lib/utils/mitigation.js';

  let hazardID: string | null = null;
  let causeID: string | null = null;
  let mitigationID: string | null = null;
  let description = '';
  let implementationClass: string = MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION;

  onMount(() => {
    hazardID = page.url.searchParams.get('hazardID');
    causeID = page.url.searchParams.get('causeID');
    mitigationID = page.url.searchParams.get('mitigationID');

    if (!hazardID && !causeID) {
      alert('You must specify either a hazard or cause.');
      goto(base+'/workspace/hazards');
    }

    if (mitigationID) {
      const existing = get(mitigations).find(m => m.id === mitigationID);
      if (existing) {
        description = existing.description;
        implementationClass = normalizeMitigationImplementationClass(existing.implementationClass);
      }
    }
  });

  function goBack() {
    if (causeID) goto(base+`/workspace/hazard/cause?hazardID=${hazardID}&causeID=${causeID}`);
    else if (hazardID) goto(base+`/workspace/hazard?id=${hazardID}`);
    else goto(base+'/workspace/hazards');
  }

  function handleSave() {
    mitigations.update(list => {
      if (mitigationID) {
        return list.map(m =>
          m.id === mitigationID ? { ...m, description, implementationClass } : m
        );
      } else {
        const nextIndex = list.length + 1;
        const newId = `M${String(nextIndex).padStart(2, '0')}`;
        mitigationID = newId;
        return [...list, { id: newId, description, implementationClass }];
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
    <div class="form-text mb-2">
      Describe the control or action that reduces the likelihood or impact of harm.
    </div>
    <textarea
      id="mitigationDescription"
      class="form-control"
      rows="3"
      bind:value={description}
    ></textarea>
    <div class="form-text">
      A mitigation is an action or control that reduces the likelihood or impact of a hazard or cause. e.g. "Staff are advised not to carry uncovered drinks to prevent spills.".
    </div>
  </div>

  <fieldset class="mb-4">
    <legend class="col-form-label pt-0">Who implements this mitigation?</legend>
    <div class="form-text mb-2">
      Choose who is responsible for putting this mitigation in place.
    </div>

    <div class="form-check mb-2">
      <input
        id="implementationClassOrganisation"
        class="form-check-input"
        type="radio"
        name="implementationClass"
        value={MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION}
        bind:group={implementationClass}
      />
      <label class="form-check-label" for="implementationClassOrganisation">
        {MITIGATION_IMPLEMENTATION_LABELS[MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION]}
      </label>
      <div class="form-text">
        {MITIGATION_IMPLEMENTATION_HELP_TEXT[MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION]}
      </div>
    </div>

    <div class="form-check">
      <input
        id="implementationClassManufacturer"
        class="form-check-input"
        type="radio"
        name="implementationClass"
        value={MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER}
        bind:group={implementationClass}
      />
      <label class="form-check-label" for="implementationClassManufacturer">
        {MITIGATION_IMPLEMENTATION_LABELS[MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER]}
      </label>
      <div class="form-text">
        {MITIGATION_IMPLEMENTATION_HELP_TEXT[MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER]}
      </div>
    </div>
  </fieldset>

  <button class="btn btn-success" on:click={handleSave}>
    {mitigationID ? 'Save Changes' : 'Save Mitigation'}
  </button>
</main>

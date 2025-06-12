<!-- src/routes/workspace/hazard/cause/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';

  import LinkMitigationModal from '$lib/components/LinkMitigationModal.svelte';

  // — local state —
  let hazardID: string | null = null;
  let causeID: string | null = null;
  let description = '';

  // which mitigations are already linked:
  let linkedMitigationIds: string[] = [];

  // modal controls:
  let showMitigationModal = false;
  let mitigationSearch = '';

  // derive the full and filtered lists:
  $: allMitigations = $mitigations;
  $: filteredMitigations = allMitigations.filter(
    m =>
      m.description.toLowerCase().includes(mitigationSearch.toLowerCase()) &&
      !linkedMitigationIds.includes(m.id)
  );

  // — load existing cause if editing —
  onMount(() => {
    hazardID = page.url.searchParams.get('hazardID');
    causeID  = page.url.searchParams.get('causeID');

    if (causeID) {
      const existing = get(causes).find(c => c.id === causeID);
      if (existing) {
        description = existing.description;
        linkedMitigationIds = existing.mitigationIds || [];
      }
    }
  });

  function goBack() {
    goto(`/workspace/hazard?id=${hazardID}`);
  }

  function updateExistingCause() {
    causes.update(list =>
      list.map(c =>
        c.id === causeID
          ? { ...c, description, mitigationIds: linkedMitigationIds }
          : c
      )
    ); 
  }

  function saveNewCause() {
    // generate next numeric index for ID
    const nextIndex = get(causes).length + 1;
    causeID = `C${String(nextIndex).padStart(2, '0')}`;

    // append to causes store
    causes.update(list => [
      ...list,
      { id: causeID!, description, mitigationIds: linkedMitigationIds }
    ]);

    // also link this new cause into the current hazard
    project.update(proj => ({
      ...proj,
      hazards: proj.hazards.map(h =>
        h.id === hazardID
          ? { ...h, causeIds: [...(h.causeIds || []), causeID!] }
          : h
      )
    }));
  }

  function handleSave() {
    if (causeID) {
      updateExistingCause();
    } else {
      saveNewCause();
    }
  }

  function saveAndReturn() {
    handleSave();
    // navigate back to hazard overview
    goto(`/workspace/hazard?id=${hazardID}`);
  }

  // add/remove locally
  function addMitigation(id: string) {
    linkedMitigationIds = [...linkedMitigationIds, id];
  }
  function removeMitigation(id: string) {
    linkedMitigationIds = linkedMitigationIds.filter(mid => mid !== id);
  }

  function newMitigation() {
    handleSave()
    goto(
      `/workspace/hazard/mitigation?causeID=${causeID}&hazardID=${hazardID}`
    );
  }

  // handle events from the modal:
  function onLinkMitigation(event) {
    addMitigation(event.detail);
    showMitigationModal = false;
  }
</script>

<main class="container py-4">
  <button class="btn btn-link mb-3" on:click={goBack}>← Back to Hazard</button>

  <h1 class="mb-4">{causeID ? 'Edit Cause' : 'Add Cause'}</h1>

  <div class="mb-3">
    <label for="causeDescription" class="form-label">Cause Description</label>
    <textarea
      id="causeDescription"
      class="form-control"
      rows="3"
      bind:value={description}
      placeholder="Describe a factor that could lead to this hazard"
    ></textarea>
    <div class="form-text">
      A cause is a factor or condition that could contribute to the hazard occurring.
    </div>
  </div>

  <div class="mb-4">
    <label class="form-label">Linked Mitigations</label>

    {#if linkedMitigationIds.length}
      <ul class="list-group mb-2">
        {#each linkedMitigationIds as mid}
          {#if $mitigations.find(m => m.id === mid)}
            {@const mit = $mitigations.find(m => m.id === mid)}
            <li class="list-group-item d-flex justify-content-between align-items-center">
              {mit.description}
              <button
                class="btn btn-sm btn-outline-danger"
                on:click={() => removeMitigation(mid)}
              >
                Remove
              </button>
            </li>
          {/if}
        {/each}
      </ul>
    {:else}
      <p class="text-muted">No mitigations linked yet.</p>
    {/if}
  </div>

  <div class="mb-3">
    <button class="btn btn-secondary me-2" on:click={newMitigation}>
      + Add New Mitigation
    </button>
    <button
      class="btn btn-outline-primary"
      on:click={() => (showMitigationModal = true)}
    >
      Link Existing Mitigation
    </button>
  </div>

  <button class="btn btn-success" on:click={saveAndReturn}>
    {causeID ? 'Save Changes' : 'Save Cause'}
  </button>

  <!-- reuse LinkMitigationModal -->
  <LinkMitigationModal
    show={showMitigationModal}
    mitigations={filteredMitigations}
    bind:search={mitigationSearch}
    on:link={onLinkMitigation}
    on:close={() => (showMitigationModal = false)}
  />
</main>

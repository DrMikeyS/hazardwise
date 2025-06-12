<!-- src/routes/workspace/hazard/+page.svelte -->
<script lang="ts">
  // ——————————————————————————————————————————
  // Imports
  // ——————————————————————————————————————————
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { get } from 'svelte/store';

  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { impacts } from '$lib/stores/impacts.js';
  import { HazardUtils } from '$lib/utils/hazard.js';

  import LinkImpactModal from '$lib/components/LinkImpactModal.svelte';
  import LinkCauseModal from '$lib/components/LinkCauseModal.svelte';
  import LinkMitigationModal from '$lib/components/LinkMitigationModal.svelte';

  // ——————————————————————————————————————————
  // Local state
  // ——————————————————————————————————————————
  let id: string | null = null;
  let description = '';
  let hazardObj: any;
  let showImpactModal = false;
  let impactSearch = '';
  let showCauseModal = false;
  let causeSearch = '';
  let showMitigationModal = false;
  let mitigationSearch = '';
  let linkedMitigationIds: string[] = hazardObj?.mitigationIds || [];
  let linkedImpactIds: string[] = hazardObj?.impactIds || [];
  let linkedCauseIds: string[] = hazardObj?.causeIds || [];
  // ——————————————————————————————————————————
  // Reactive derived lists
  // ——————————————————————————————————————————
  // List of cause objects for this hazard
  $: causeList = (hazardObj?.causeIds || [])
    .map(cid => $causes.find(c => c.id === cid))
    .filter(Boolean);

  // All mitigations linked to any cause
  $: causeMitigations = causeList
    .flatMap(c => c.mitigationIds || [])
    .map(mid => $mitigations.find(m => m.id === mid))
    .filter(Boolean);

  // Mitigations directly on this hazard
  $: hazardMitigations = (hazardObj?.mitigationIds || [])
    .map(mid => $mitigations.find(m => m.id === mid))
    .filter(Boolean);

  // All impacts, filtered by search and already-linked
  $: allImpacts = $impacts;
  $: filteredImpacts = allImpacts.filter(
    i =>
      i.description.toLowerCase().includes(impactSearch.toLowerCase()) &&
      !linkedImpactIds.includes(i.id)
  );
 $: allCauses = $causes;
 $: filteredCauses = allCauses.filter(
   c =>
     c.description.toLowerCase().includes(causeSearch.toLowerCase()) &&
     !linkedCauseIds.includes(c.id)
 );
 $: allMits = $mitigations;
  $: filteredMits = allMits.filter(
    m =>
      m.description.toLowerCase().includes(mitigationSearch.toLowerCase()) &&
      !linkedMitigationIds.includes(m.id)
  );

  // ——————————————————————————————————————————
  // Lifecycle: load existing hazard if editing
  // ——————————————————————————————————————————
  onMount(() => {
    id = page.url.searchParams.get('id');
    if (id) {
      const proj = get(project);
      hazardObj = proj.hazards.find(h => h.id === id);
      console.log('Loaded hazard:', hazardObj);
      if (hazardObj) {
        description = hazardObj.description;
      }
    }
  });

  // ——————————————————————————————————————————
  // Navigation helpers
  // ——————————————————————————————————————————
  function goBack() {
    goto('/workspace');
  }

  function editCause(cid: string) {
    goto(`/workspace/hazard/cause?hazardID=${id}&causeID=${cid}`);
  }

  function addCause() {
    ensureSaved(); // make sure hazard has an ID before adding children
    goto(`/workspace/hazard/cause?hazardID=${id}`);
  }

  function addHazardSpecificMitigation() {
    ensureSaved();
    goto(`/workspace/hazard/mitigation?hazardID=${id}`);
  }

  function addImpact() {
    ensureSaved();
    goto(`/workspace/hazard/impact?hazardID=${id}`);
  }

  // ——————————————————————————————————————————
  // Linking & removing functions
  // ——————————————————————————————————————————
  /** Link an existing impact via modal */
  function linkImpact(impactId: string) {
    if (!id) return;

    project.update(proj => ({
      ...proj,
      hazards: proj.hazards.map(h =>
        h.id === id && !h.impactIds?.includes(impactId)
          ? { ...h, impactIds: [...(h.impactIds || []), impactId] }
          : h
      )
    }));

    showImpactModal = false;

    // Refresh local hazardObj
    hazardObj = get(project).hazards.find(h => h.id === id);
  }
  function linkCause(cid: string) {
    if (!id) return;
    project.update(p => ({
      ...p,
      hazards: p.hazards.map(h =>
        h.id === id && !h.causeIds?.includes(cid)
          ? { ...h, causeIds: [...(h.causeIds||[]), cid] }
          : h
      )
    }));
    showCauseModal = false;
    hazardObj = get(project).hazards.find(h => h.id === id);
  }

 function onLinkCause(evt) {
   linkCause(evt.detail);
 }

 function linkMitigation(mid: string) {
  if (!id) return;
  project.update(proj => ({
    ...proj,
    hazards: proj.hazards.map(h =>
      h.id === id && !h.mitigationIds?.includes(mid)
        ? { ...h, mitigationIds: [...(h.mitigationIds||[]), mid] }
        : h
    )
  }));
  showMitigationModal = false;
  hazardObj = get(project).hazards.find(h => h.id === id);
}
function onLinkMitigation(evt) {
  linkMitigation(evt.detail);
}
  /** Remove a linked impact */
  function removeImpact(iid: string) {
    if (!id) return;
    hazardObj = HazardUtils.removeImpact(id, iid);
  }

  /** Remove a linked cause */
  function removeCause(cid: string) {
    if (!id) return;
    hazardObj = HazardUtils.removeCause(id, cid);
  }

  /** Remove a hazard-level mitigation */
  function removeHazardMitigation(mid: string) {
    if (!id) return;
    hazardObj = HazardUtils.removeHazardMitigation(id, mid);
  }

  // handle the link event
  function onLinkImpact(event) {
    linkImpact(event.detail);
  }

  // ——————————————————————————————————————————
  // Saving helpers
  // ——————————————————————————————————————————
  /** Ensure hazard exists in store, creating if new */
  function ensureSaved() {
    if (!id) {
      const result = HazardUtils.saveNewHazard(description);
      id = result.id;
      hazardObj = result.hazardObj;
    }
  }

  /** Final save & navigate back */
  function handleSave() {
    ensureSaved();
    project.update(proj => ({
      ...proj,
      hazards: proj.hazards.map(h =>
        h.id === id ? { ...h, description } : h
      )
    }));
    goto('/workspace');
  }
</script>

<main class="container py-4">
  <!-- Back button & title -->
  <button class="btn btn-link mb-3" on:click={goBack}>← Back to Workspace</button>
  <h1 class="mb-4">Edit Hazard</h1>

  <!-- Description -->
  <div class="mb-3">
    <label for="hazardDescription" class="form-label">Hazard Description</label>
    <textarea
      id="hazardDescription"
      class="form-control"
      rows="4"
      bind:value={description}
      placeholder="Describe what might go wrong"
    ></textarea>
    <div class="form-text">A hazard is anything that could potentially cause harm.</div>
  </div>

  <!-- Causes section -->
  <details class="card mb-3">
    <summary class="card-header d-flex justify-content-between align-items-center">
      <strong>Causes</strong>
      <small class="text-muted">▼</small>
    </summary>
    <div class="card-body">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Cause</th>
            <th>Associated Mitigations</th>
            <th class="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#if causeList.length === 0}
            <tr><td colspan="3" class="text-center text-muted">No causes added yet.</td></tr>
          {:else}
            {#each causeList as c}
              <tr>
                <td>{c.description}</td>
                <td>
                  {#if c.mitigationIds?.length}
                    {#each c.mitigationIds as mid, i}
                      { $mitigations.find(m => m.id === mid)?.description }
                      {i < c.mitigationIds.length - 1 ? ', ' : ''}
                    {/each}
                  {:else}
                    <span class="text-muted">None</span>
                  {/if}
                </td>
                <td class="text-end">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-secondary" on:click={() => editCause(c.id)}>Edit</button>
                    <button class="btn btn-sm btn-outline-danger" on:click={() => removeCause(c.id)}>Remove</button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
      <button class="btn btn-outline-primary" on:click={addCause}>Add New Cause</button>
      <button class="btn btn-outline-secondary ms-2" on:click={() => showCauseModal = true}>
        Link Existing Cause
      </button>
    </div>
  </details>

  <!-- Hazard-level Mitigations -->
  <details class="card mb-3">
    <summary class="card-header d-flex justify-content-between align-items-center">
      <strong>Hazard-Specific Mitigations</strong>
      <small class="text-muted">▼</small>
    </summary>
    <div class="card-body">
      {#if hazardMitigations.length}
        <ul class="list-group mb-3">
          {#each hazardMitigations as m}
            <li class="list-group-item d-flex justify-content-between align-items-center">
              <span>{m.description}</span>
              <div class="btn-group">
                <button
                  class="btn btn-sm btn-outline-secondary"
                  on:click={() => goto(`/workspace/hazard/mitigation?hazardID=${id}&mitigationID=${m.id}`)}
                >
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" on:click={() => removeHazardMitigation(m.id)}>
                  Remove
                </button>
              </div>
            </li>
          {/each}
        </ul>
      {:else}
        <p class="text-muted">No hazard-specific mitigations added.</p>
      {/if}
    <button class="btn btn-outline-primary" on:click={addHazardSpecificMitigation}>
      Add Hazard-Specific Mitigation
    </button>
    <button class="btn btn-outline-secondary ms-2" on:click={() => showMitigationModal = true}>
      Link Existing Mitigation
    </button>

    </div>
  </details>

  <!-- Impacts section -->
  <details class="card mb-3">
    <summary class="card-header d-flex justify-content-between align-items-center">
      <strong>Impacts</strong>
      <small class="text-muted">▼</small>
    </summary>
    <div class="card-body">
      {#if hazardObj?.impactIds?.length}
        <table class="table table-striped mb-3">
          <thead>
            <tr>
              <th>Description</th>
              <th>Likelihood</th>
              <th>Severity</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each hazardObj.impactIds as iid}
              {#if $impacts.find(i => i.id === iid)}
                <tr>
                  <td>{$impacts.find(i => i.id === iid).description}</td>
                  <td>{$impacts.find(i => i.id === iid).likelihood}</td>
                  <td>{$impacts.find(i => i.id === iid).severity}</td>
                  <td class="text-end">
                    <div class="btn-group">
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        on:click={() => goto(`/workspace/hazard/impact?hazardID=${id}&impactID=${iid}`)}
                      >
                        Edit
                      </button>
                      <button class="btn btn-sm btn-outline-danger" on:click={() => removeImpact(iid)}>
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              {/if}
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="text-muted mb-3">No impacts added yet.</p>
      {/if}

      <button class="btn btn-outline-primary" on:click={addImpact}>Add Impact</button>
    <button class="btn btn-outline-secondary ms-2" on:click={() => showImpactModal = true}>
      Link Existing Impact
    </button>
    </div>
  </details>

  <!-- Save button -->
  <button class="btn btn-success mb-4" on:click={handleSave}>
    Save Hazard
  </button>

  <!-- Impact-linking modal -->
<LinkImpactModal
  show={showImpactModal}
  impacts={filteredImpacts}
  bind:search={impactSearch}
  on:link={onLinkImpact}
  on:close={() => (showImpactModal = false)}
/>

 <LinkCauseModal
  show={showCauseModal}
  causes={filteredCauses}
  bind:search={causeSearch}
  on:link={onLinkCause}
  on:close={() => (showCauseModal = false)}
/>

<LinkMitigationModal
  show={showMitigationModal}
  mitigations={filteredMits}
  bind:search={mitigationSearch}
  on:link={onLinkMitigation}
  on:close={() => (showMitigationModal = false)}
/>

</main>

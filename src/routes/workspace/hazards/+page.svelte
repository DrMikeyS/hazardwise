<!-- src/routes/workspace/+page.svelte -->
<script lang="ts">
  // ——————————————————————————————————————————
  // Imports
  // ——————————————————————————————————————————
  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { impacts } from '$lib/stores/impacts.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { HazardUtils } from '$lib/utils/hazard';
  import { assessHazardImpact } from '$lib/utils/dcbRisk';

  // ——————————————————————————————————————————
  // Reactive state
  // ——————————————————————————————————————————
  // Array of all hazards in the project
  $: hazards = $project.hazards || [];

  // ——————————————————————————————————————————
  // Helper to build display rows for a single hazard
  // ——————————————————————————————————————————
  function getDisplayedImpacts(hazard: any) {
    return (hazard.hazardImpacts || [])
      .map((hi: any) => {
        const core = $impacts.find(i => i.id === hi.impactID);
        const risk = assessHazardImpact(hi);
        return { hi, core, risk };
      })
      .filter((item: any) => !!item.core);
  }

  // Debug/logging (optional)
  console.log('project:', $project);
  console.log('impacts:', $impacts);

  // ——————————————————————————————————————————
  // Navigation & actions
  // ——————————————————————————————————————————
  /** Navigate to create a new hazard */
  function addHazard() {
    goto(base + '/workspace/hazard');
  }

  /** Remove a hazard after user confirmation */
  function removeHazard(id: string) {
    if (confirm('Are you sure you want to remove this hazard?')) {
      project.update(p => ({
        ...p,
        hazards: p.hazards.filter(h => h.id !== id)
      }));
    }
  }
</script>

<main class="container py-4">
  <!-- Project title -->
  <h1 class="mb-3">Hazard Log</h1>

  {#if hazards.length === 0}
    <!-- Empty state -->
    <div class="alert alert-info" role="alert">
      You have not added any hazards yet. Get started by adding your first one.
    </div>
    <button class="btn btn-primary mt-3" on:click={addHazard}>
      Add First Hazard
    </button>
  {:else}
    <!-- Add button -->
    <button class="btn btn-primary mb-3" on:click={addHazard}>
      Add Another Hazard
    </button>

    <!-- List of hazards -->
    {#each hazards as h}
      <details class="card mb-3">
        <summary class="card-header d-flex justify-content-between align-items-center">
          <div>
            <strong>{h.id}</strong>: {h.description}
            {#if HazardUtils.getHighestRisk(h).rating}
              <span
                class="badge ms-2"
                style="background-color: {HazardUtils.getHighestRisk(h).color};"
              >
                Risk: {HazardUtils.getHighestRisk(h).rating}
              </span>
            {/if}
          </div>

          <div class="d-flex align-items-center">
            <div class="btn-group">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                on:click={() => goto(base + `/workspace/hazard?id=${h.id}`)}
              >
                Edit
              </button>
              <button
                type="button"
                class="btn btn-sm btn-outline-danger"
                on:click={() => removeHazard(h.id)}
              >
                Remove
              </button>
            </div>
            <small class="ms-3 text-muted">▼</small>
          </div>
        </summary>

        <div class="card-body">
          <!-- Causes table -->
          <h5 class="card-title">Causes</h5>
          {#if h.causeIds?.length}
            <div class="table-responsive mb-3">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th style="width:50%">Cause</th>
                    <th style="width:50%">Mitigations</th>
                  </tr>
                </thead>
                <tbody>
                  {#each h.causeIds as cid}
                    {#if $causes.find(c => c.id === cid)}
                      {@const cause = $causes.find(c => c.id === cid)}
                      <tr>
                        <td>{cause.description}</td>
                        <td>
                          {#if cause.mitigationIds?.length}
                            {#each cause.mitigationIds as mid, i}
                              {#if $mitigations.find(m => m.id === mid)}
                                {@const mit = $mitigations.find(m => m.id === mid)}
                                <span>{mit.description}</span
                                >{i < cause.mitigationIds.length - 1 ? ', ' : ''}
                              {/if}
                            {/each}
                          {:else}
                            <span class="text-muted">None</span>
                          {/if}
                        </td>
                      </tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p class="text-muted mb-3">No causes added.</p>
          {/if}

          <!-- Hazard-level mitigations -->
          <h5 class="card-title">Hazard-Level Mitigations</h5>
          {#if h.mitigationIds?.length}
            <div class="table-responsive mb-3">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr><th>Mitigation</th></tr>
                </thead>
                <tbody>
                  {#each h.mitigationIds as mid}
                    {#if $mitigations.find(m => m.id === mid)}
                      {@const mit = $mitigations.find(m => m.id === mid)}
                      <tr><td>{mit.description}</td></tr>
                    {/if}
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p class="text-muted">No mitigations added.</p>
          {/if}

          <!-- Impacts table -->
          <h5 class="card-title">Impacts</h5>
          {#if getDisplayedImpacts(h).length}
            <div class="table-responsive mb-3">
              <table class="table table-sm table-bordered">
                <thead>
                  <tr>
                    <th style="width:70%">Description</th>
                    <th style="width:30%">Risk Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {#each getDisplayedImpacts(h) as { core, risk }}
                    <tr>
                      <td>{core.description}</td>
                      <td>
                        {#if risk}
                          {risk.rating}
                        {:else}
                          <em>Not assessed</em>
                        {/if}
                      </td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p class="text-muted mb-3">No impacts added.</p>
          {/if}
        </div>
      </details>
    {/each}
  {/if}
</main>

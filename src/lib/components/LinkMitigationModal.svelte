<!-- lib/components/LinkMitigationModal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  // Controls
  export let show = false;
  export let mitigations: any[] = [];
  export let search = '';

  const dispatch = createEventDispatcher();

  // User clicks “Link”
  function handleLink(id: string) {
    dispatch('link', id);
  }

  // User clicks “Close”
  function handleClose() {
    dispatch('close');
  }
</script>

{#if show}
  <div class="modal-backdrop fade show"></div>
  <div class="modal d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">Link Existing Mitigation</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={handleClose}></button>
        </div>

        <div class="modal-body">
          <label for="searchMitigations" class="form-label">Search mitigations</label>
          <div class="form-text mb-2">Filter mitigations by description.</div>
          <input
            id="searchMitigations"
            type="text"
            class="form-control mb-3"
            bind:value={search}
          />

          {#if mitigations.length}
            <ul class="list-group">
              {#each mitigations as m}
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>{m.description}</div>
                  <button class="btn btn-sm btn-outline-primary" on:click={() => handleLink(m.id)}>
                    Link
                  </button>
                </li>
              {/each}
            </ul>
          {:else if search}
            <p class="text-muted">No matching mitigations found.</p>
          {/if}
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" on:click={handleClose}>Close</button>
        </div>

      </div>
    </div>
  </div>
{/if}

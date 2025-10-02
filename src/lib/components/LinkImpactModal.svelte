<!-- lib/components/LinkImpactModal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let show = false;
  type ImpactItem = {
    id: string;
    description: string;
    likelihood?: string;
    severity?: string;
  };

  export let impacts: ImpactItem[] = [];
  export let search = '';
  const dispatch = createEventDispatcher();

  // When the user clicks “Link”
  function handleLink(id: string) {
    dispatch('link', id);
  }

  // When the user clicks “Close”
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
          <h5 class="modal-title">Link Existing Impact</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={handleClose}></button>
        </div>
        <div class="modal-body">
          <input
            type="text"
            class="form-control mb-3"
            placeholder="Search impacts..."
            bind:value={search}
          />
          {#if impacts.length}
            <ul class="list-group">
              {#each impacts as imp}
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{imp.description}</strong><br />
                    <small>Likelihood: {imp.likelihood} | Severity: {imp.severity}</small>
                  </div>
                  <button class="btn btn-sm btn-outline-primary" on:click={() => handleLink(imp.id)}>
                    Link
                  </button>
                </li>
              {/each}
            </ul>
          {:else if search}
            <p class="text-muted">No matching impacts found.</p>
          {/if}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" on:click={handleClose}>Close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

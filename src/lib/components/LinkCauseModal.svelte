<!-- lib/components/LinkCauseModal.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  export let show = false;
  export let causes: any[] = [];
  export let search = '';
  const dispatch = createEventDispatcher();

  // user clicked “Link”
  function handleLink(id: string) {
    dispatch('link', id);
  }
  // user clicked “Close”
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
          <h5 class="modal-title">Link Existing Cause</h5>
          <button type="button" class="btn-close" aria-label="Close" on:click={handleClose}></button>
        </div>
        <div class="modal-body">
          <label for="searchCauses" class="form-label">Search causes</label>
          <div class="form-text mb-2">Filter causes by description.</div>
          <input
            id="searchCauses"
            type="text"
            class="form-control mb-3"
            bind:value={search}
          />
          {#if causes.length}
            <ul class="list-group">
              {#each causes as c}
                <li class="list-group-item d-flex justify-content-between align-items-center">
                  <div>{c.description}</div>
                  <button class="btn btn-sm btn-outline-primary" on:click={() => handleLink(c.id)}>
                    Link
                  </button>
                </li>
              {/each}
            </ul>
          {:else if search}
            <p class="text-muted">No matching causes found.</p>
          {/if}
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" on:click={handleClose}>Close</button>
        </div>
      </div>
    </div>
  </div>
{/if}

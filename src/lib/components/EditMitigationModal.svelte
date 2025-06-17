<!-- lib/components/EditMitigationModal.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { get } from 'svelte/store';

  export let mitigationID: string;
  const dispatch = createEventDispatcher();

  let description = '';

  onMount(() => {
    const m = get(mitigations).find(item => item.id === mitigationID);
    if (m) description = m.description;
    console.log(`Editing mitigation: ${mitigationID}`, m);
  });

  function save() {
    mitigations.update(list =>
      list.map(item =>
        item.id === mitigationID ? { ...item, description } : item
      )
    );
    dispatch('save', { mitigationID, description });
  }

  function cancel() {
    dispatch('cancel');
  }
</script>

<!-- Modal backdrop -->
<div class="modal-backdrop fade show"></div>

<!-- Modal dialog -->
<div class="modal fade show" tabindex="-1" style="display: block;">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Edit Mitigation</h5>
        <button type="button" class="btn-close" aria-label="Close" on:click={cancel}></button>
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <label for="mitigationDescription" class="form-label">Description</label>
          <textarea
            id="mitigationDescription"
            class="form-control"
            rows="3"
            bind:value={description}
          ></textarea>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={cancel}>
          Cancel
        </button>
        <button type="button" class="btn btn-primary" on:click={save}>
          Save
        </button>
      </div>
    </div>
  </div>
</div>

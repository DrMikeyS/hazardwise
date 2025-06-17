<!-- lib/components/EditImpactModal.svelte -->
 <script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { impacts } from '$lib/stores/impacts.js';
  import { get } from 'svelte/store';

  export let impactID: string;
  const dispatch = createEventDispatcher();
 console.log(`Editing impact in modal: ${impactID}`);
  let description = '';
  let severity = '';

  const severityOptions = [
    'Catastrophic',
    'Major',
    'Considerable',
    'Significant',
    'Minor'
  ];

  onMount(() => {
    const existing = get(impacts).find(i => i.id === impactID);
    if (existing) {
      description = existing.description;
      severity = existing.severity;
    }
  });

  function save() {
    impacts.update(list =>
      list.map(i =>
        i.id === impactID ? { ...i, description, severity } : i
      )
    );
    dispatch('save', { impactID, description, severity });
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
        <h5 class="modal-title">Edit Impact</h5>
        <button type="button" class="btn-close" aria-label="Close" on:click={cancel}></button>
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <label for="impactDescription" class="form-label">Description</label>
          <textarea
            id="impactDescription"
            class="form-control"
            rows="3"
            bind:value={description}
          ></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Severity</label>
          <div>
            {#each severityOptions as option}
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="radio"
                  name="impactSeverity"
                  id={option}
                  value={option}
                  bind:group={severity}
                />
                <label class="form-check-label" for={option}>
                  {option}
                </label>
              </div>
            {/each}
          </div>
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

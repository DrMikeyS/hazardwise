<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { impacts } from '$lib/stores/impacts.js';
  import { get } from 'svelte/store';

  export let impactID: string;
  const dispatch = createEventDispatcher();
  let description = '';
  let severity = '';

  // Severity options with descriptions and classes matching impact page
  const severityOptions = [
    {
      value: 'Catastrophic',
      label: 'Catastrophic',
      description:
        'Death; permanent life-changing incapacity; or severe injury/incapacity from which recovery is not expected in the short term. [Multiple patients]',
      class: 'table-danger'
    },
    {
      value: 'Major',
      label: 'Major',
      description:
        '[Single patient:] death or permanent life-changing incapacity not recoverable. ' +
        '[Multiple patients:] severe injury/incapacity recoverable; severe psychological trauma.',
      class: 'table-warning'
    },
    {
      value: 'Considerable',
      label: 'Considerable',
      description:
        'Severe injury/incapacity from which recovery is expected in the short term; severe psychological trauma. [Single or multiple patients]',
      class: 'table-info'
    },
    {
      value: 'Significant',
      label: 'Significant',
      description:
        'Minor injury or injuries from which recovery is not expected in the short term; significant psychological trauma. [Single or multiple patients]',
      class: ''
    },
    {
      value: 'Minor',
      label: 'Minor',
      description:
        'Minor injury from which recovery is expected in the short term; minor psychological upset or inconvenience. [Single or multiple patients]',
      class: 'table-secondary text-white'
    }
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

        <h5 class="mt-4">Severity</h5>
        <p>How badly could someone (or some people) be hurt if this impact occurred?</p>
        <table class="table table-bordered align-middle">
          <tbody>
            {#each severityOptions as option}
              <tr class={option.class}>
                <td class="text-nowrap">
                  <input
                    type="radio"
                    name="impactSeverity"
                    value={option.value}
                    bind:group={severity}
                    class="form-check-input me-2"
                  />
                  <strong>{option.label}</strong>
                </td>
                <td>{option.description}</td>
              </tr>
            {/each}
          </tbody>
        </table>
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

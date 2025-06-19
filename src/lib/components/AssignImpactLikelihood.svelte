<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { impacts } from '$lib/stores/impacts.js';
  import { project } from '$lib/stores/project.js';
  import { get } from 'svelte/store';
  import { DCBRisk } from '$lib/utils/dcbRisk';

  export let hazardID;
  export let impactID: string;
  const dispatch = createEventDispatcher();

  let description = '';
  let severity = '';
  let likelihood = '';

  // Preload impact details
  onMount(() => {
    const impact = get(impacts).find(i => i.id === impactID);
    if (impact) {
      description = impact.description;
      severity = impact.severity;
    }
  });

  // Reactive risk score calculation
  const levels: Record<string, number> = {
    'Catastrophic': 5,
    'Major': 4,
    'Considerable': 3,
    'Significant': 2,
    'Minor': 1,
    'Almost Certain': 5,
    'Likely': 4,
    'Possible': 3,
    'Unlikely': 2,
    'Rare': 1
  };

  const riskBadgeClasses = {
    1: 'bg-success text-white',
    2: 'bg-info text-dark',
    3: 'bg-warning text-dark',
    4: 'bg-danger text-white',
    5: 'bg-danger text-white'
  };

  $: rawScore = (levels[severity] || 0) * (levels[likelihood] || 0);
  $: riskResult = (levels[severity] && levels[likelihood])
    ? DCBRisk.assess(levels[likelihood], levels[severity])
    : null;

  // Likelihood options for radio selection
  const likelihoodOptions = [
    { value: 'Almost Certain', label: 'Almost Certain', description: 'Expected to occur frequently', class: 'table-danger' },
    { value: 'Likely', label: 'Likely', description: 'Will probably occur occasionally', class: 'table-warning' },
    { value: 'Possible', label: 'Possible', description: 'Could occur but uncommon', class: 'table-info' },
    { value: 'Unlikely', label: 'Unlikely', description: 'Rare but possible', class: '' },
    { value: 'Rare', label: 'Rare', description: 'Exceptional circumstances only', class: 'table-secondary text-white' }
  ];

  function save() {
    if (!likelihood) {
      alert('Please select a likelihood.');
      return;
    }

    project.update(proj => ({
      ...proj,
      hazards: proj.hazards.map(h => {
        if (h.id !== hazardID) return h;

        const existing = h.hazardImpacts?.some(e => e.impactID === impactID);
        const newEntry = { impactID, likelihood };

        return {
          ...h,
          hazardImpacts: existing
            ? h.hazardImpacts!.map(e =>
                e.impactID === impactID ? newEntry : e
              )
            : [...(h.hazardImpacts || []), newEntry]
        };
      })
    }));

    dispatch('save');
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
        <h5 class="modal-title">Assess Impact</h5>
        <button type="button" class="btn-close" aria-label="Close" on:click={cancel}></button>
      </div>

      <div class="modal-body">
        <div class="mb-3">
          <label class="form-label">Impact Description</label>
          <textarea class="form-control" rows="2" disabled bind:value={description}></textarea>
        </div>
        <div class="mb-3">
          <label class="form-label">Severity</label>
          <input class="form-control" disabled value={severity} />
        </div>
        <div class="mb-3"></div>
        <label class="form-label">Likelihood</label>
        <p>How likely is it that this impact will occur <strong>due to this hazard</strong> and <strong>with the planned mitigations</strong> in place?</p>
        <table class="table table-bordered align-middle">
          <tbody>
            {#each likelihoodOptions as option}
              <tr class={option.class}>
                <td class="text-nowrap">
                  <input
                    type="radio"
                    name="likelihood"
                    value={option.value}
                    bind:group={likelihood}
                    class="form-check-input me-2"
                  />
                  <strong>{option.label}</strong>
                </td>
                <td>{option.description}</td>
              </tr>
            {/each}
          </tbody>
        </table>

        {#if riskResult}
          <div class="mb-3">
            <label class="form-label">Risk Rating</label>
            <div class="d-flex align-items-center">
             <span class={`badge ${riskBadgeClasses[riskResult.score]} me-2`}>
        {riskResult.rating}
      </span>
              <small>{riskResult.definition} (Score: {riskResult.score})</small>
            </div>
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" on:click={cancel}>Cancel</button>
        <button type="button" class="btn btn-primary" on:click={save}>Save</button>
      </div>
    </div>
  </div>
</div>
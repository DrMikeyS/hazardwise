<!-- src/routes/workspace/hazard/impact/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { project } from '$lib/stores/project.js';
  import { impacts } from '$lib/stores/impacts.js';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
import { DCBRisk } from '$lib/utils/dcbRisk';


  let hazardID: string | null = null;
  let impactID: string | null = null;
  let description = '';
  let severity = '';
  let likelihood = '';

  const severityOptions = [
    { value: 'Catastrophic', label: 'Catastrophic', description: 'Death or permanent major harm', class: 'table-danger' },
    { value: 'Major', label: 'Major', description: 'Temporary major harm or permanent minor harm', class: 'table-warning' },
    { value: 'Moderate', label: 'Moderate', description: 'Short-term harm requiring intervention', class: 'table-info' },
    { value: 'Minor', label: 'Minor', description: 'Minimal harm, may require monitoring', class: '' },
    { value: 'Negligible', label: 'Negligible', description: 'No significant harm', class: 'table-secondary text-white' }
  ];

  const likelihoodOptions = [
    { value: 'Almost Certain', label: 'Almost Certain', description: 'Expected to occur frequently', class: 'table-danger' },
    { value: 'Likely', label: 'Likely', description: 'Will probably occur occasionally', class: 'table-warning' },
    { value: 'Possible', label: 'Possible', description: 'Could occur but uncommon', class: 'table-info' },
    { value: 'Unlikely', label: 'Unlikely', description: 'Rare but possible', class: '' },
    { value: 'Rare', label: 'Rare', description: 'Exceptional circumstances only', class: 'table-secondary text-white' }
  ];

  const riskBadgeClasses = {
  1: 'bg-success text-white',
  2: 'bg-info text-dark',
  3: 'bg-warning text-dark',
  4: 'bg-danger text-white',
  5: 'bg-danger text-white'
};


  // Numeric mappings for severity and likelihood
const levels = {
  'Catastrophic': 5,
  'Major': 4,
  'Moderate': 3,
  'Minor': 2,
  'Negligible': 1,
  'Almost Certain': 5,
  'Likely': 4,
  'Possible': 3,
  'Unlikely': 2,
  'Rare': 1
};


//–– reactive: when severity or likelihood changes, compute both raw score and DCB‐style rating
$: rawScore = (levels[severity] || 0) * (levels[likelihood] || 0);

// now ask DCBRisk for the official rating & definition:
$: riskResult = (levels[severity] && levels[likelihood])
  ? DCBRisk.assess(levels[likelihood], levels[severity])
  : null;
$: console.log('Risk assessment:', riskResult, rawScore);

  onMount(() => {
    hazardID = page.url.searchParams.get('hazardID');
    impactID = page.url.searchParams.get('impactID');

    if (!hazardID) {
      alert('You must specify a hazard.');
      goto('/workspace');
    }

    if (impactID) {
      const existing = get(impacts).find(i => i.id === impactID);
      if (existing) {
        description = existing.description;
        severity = existing.severity;
        likelihood = existing.likelihood;
      }
    }
  });

  function goBack() {
    goto(`/workspace/hazard?id=${hazardID}`);
  }

  function handleSave() {
  if (!severity || !likelihood) {
    alert('Please select both severity and likelihood.');
    return;
  }


  const score  = rawScore;
  const rating = riskResult!.rating;

  impacts.update(list => {
    if (impactID) {
      return list.map(i =>
        i.id === impactID
          ? { ...i, description, severity, likelihood, score, rating }
          : i
      );
    } else {
      const nextIndex = list.length + 1;
      const newId = `I${String(nextIndex).padStart(2, '0')}`;
      impactID = newId;
      return [
        ...list,
        {
          id: newId,
          description,
          severity,
          likelihood,
          score,
          rating
        }
      ];
    }
  });

  // Link to hazard if not already
  if (impactID) {
    project.update(proj => ({
      ...proj,
      hazards: proj.hazards.map(h =>
        h.id === hazardID && !h.impactIds?.includes(impactID!)
          ? {
              ...h,
              impactIds: [...(h.impactIds || []), impactID]
            }
          : h
      )
    }));
  }

  goBack();
}

</script>

<main class="container py-4">
  <button class="btn btn-link mb-3" on:click={goBack}>
    ← Back to Hazard
  </button>

  <h1 class="mb-4">{impactID ? 'Edit Impact' : 'Add Impact'}</h1>

  <div class="mb-3">
    <label for="impactDescription" class="form-label">Impact Description</label>
    <textarea
      id="impactDescription"
      class="form-control"
      rows="3"
      bind:value={description}
      placeholder="e.g. Incorrect clinical advice leads to unsafe prescription"
    ></textarea>
  </div>

  <h5 class="mt-4">Severity</h5>
  <table class="table table-bordered align-middle">
    <tbody>
      {#each severityOptions as option}
        <tr class={option.class}>
          <td class="text-nowrap">
            <input
              type="radio"
              name="severity"
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

  <h5 class="mt-4">Likelihood</h5>
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
  <div class="mt-4">
    <h5>Calculated Risk Rating</h5>
    <div class={`badge ${riskBadgeClasses[riskResult.score]}`}>
      {riskResult.rating} ({riskResult.score} pts)
    </div>
    <div class="form-text">{riskResult.definition}</div>
  </div>
{/if}



  <button class="btn btn-success mt-4" on:click={handleSave}>
    {impactID ? 'Save Impact' : 'Add Impact'}
  </button>
</main>

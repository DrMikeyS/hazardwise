<!-- src/routes/workspace/hazard/impact/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';
  import { project } from '$lib/stores/project.js';
  import { impacts } from '$lib/stores/impacts.js';
  import { get } from 'svelte/store';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
import { DCBRisk } from '$lib/utils/dcbRisk';


  let hazardID: string | null = null;
  let impactID: string | null = null;
  let description = '';
  let severity = '';
  let likelihood = '';

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
  'Considerable': 3,
  'Significant': 2,
  'Minor': 1,
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

// Live Debug output
$: console.log('Levels', severity, likelihood, levels);  
$: console.log('Risk assessment:', riskResult, rawScore);

  onMount(() => {
    hazardID = page.url.searchParams.get('hazardID');
    impactID = page.url.searchParams.get('impactID');

    if (!hazardID) {
      alert('You must specify a hazard.');
      goto(base+'/workspace');
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
    goto(base+`/workspace/hazard?id=${hazardID}`);
  }

  function handleSave() {
  if (!severity || !likelihood) {
    alert('Please select both severity and likelihood.');
    return;
  }

  const score  = rawScore;
  const rating = riskResult!.rating;

  // 1. Update the core impacts store: only id, description & severity
  impacts.update(list => {
    if (impactID) {
      return list.map(i =>
        i.id === impactID
          ? { ...i, description, severity }
          : i
      );
    } else {
      const nextIndex = list.length + 1;
      const newId = `I${String(nextIndex).padStart(2, '0')}`;
      impactID = newId;
      return [
        ...list,
        { id: newId, description, severity }
      ];
    }
  });

  // 2. Link (or update) this impact on the hazard with full risk info
  if (impactID) {
    project.update(proj => ({
      ...proj,
      hazards: proj.hazards.map(h => {
        if (h.id !== hazardID) return h;

        const exists = h.hazardImpacts?.some(e => e.impactID === impactID);
        const entry = { impactID, likelihood };

        return {
          ...h,
          hazardImpacts: exists
            // replace existing entry
            ? h.hazardImpacts!.map(e =>
                e.impactID === impactID ? entry : e
              )
            // or append new entry
            : [...(h.hazardImpacts || []), entry]
        };
      })
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

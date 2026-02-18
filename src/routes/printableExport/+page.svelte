<script lang="ts">
  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { impacts } from '$lib/stores/impacts.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { HazardUtils } from '$lib/utils/hazard';
  import { assessHazardImpact } from '$lib/utils/dcbRisk';
  import { groupMitigationsByImplementationClass } from '$lib/utils/mitigation.js';

const severityBadgeMap = {
  Catastrophic: 'bg-danger',
  Major:        'bg-warning text-dark',
  Considerable: 'bg-info text-dark',
  Significant:  'bg-secondary text-white',
  Minor:        'bg-light text-dark'
};
const likelihoodBadgeMap = {
  'Almost Certain': 'bg-danger',
  Likely:           'bg-warning text-dark',
  Possible:         'bg-info text-dark',
  Unlikely:         'bg-secondary text-white',
  Rare:             'bg-light text-dark'
};


  // Reactive hazards list
  $: hazards = $project.hazards || [];

  // Helper: fetch causes and mitigations for a hazard
  function getCauses(h) {
    return (h.causeIds || [])
      .map(cid => $causes.find(c => c.id === cid))
      .filter(Boolean);
  }
  function getHazardMits(h) {
    return (h.mitigationIds || [])
      .map(mid => $mitigations.find(m => m.id === mid))
      .filter(Boolean);
  }
  // Helper: full impacts with risk
  function getFullImpacts(h) {
    return (h.hazardImpacts || [])
      .map(hi => {
        const core = $impacts.find(i => i.id === hi.impactID);
        const risk = assessHazardImpact(hi);
        return { hi, core, risk };
      })
      .filter(item => !!item.core);
  }
   // Helper: combine hazard + cause mitigations (deduped)
 function getAllMitigations(h) {
   const hazardMits = getHazardMits(h);
   const causeMits = (h.causeIds || [])
     .flatMap(cid => $causes.find(c => c.id === cid)?.mitigationIds || [])
     .map(mid => $mitigations.find(m => m.id === mid))
     .filter(Boolean);
   // dedupe by id
   const map = new Map();
   ;[...hazardMits, ...causeMits].forEach(m => map.set(m.id, m));
   return Array.from(map.values());
 }

  function getGroupedMitigations(h) {
    return groupMitigationsByImplementationClass(getAllMitigations(h));
  }
</script>
<svelte:head>
  <title>Hazard Summary Report for {$project.title}</title>
</svelte:head>
<style>
  @media print {
    /* Force background colors to print */
    .badge {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    /* If you need to force inline-styled spans, too: */
    span[style*="background-color"] {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
</style>

<main class="container py-4">
  <h1 class="mb-4">Hazard Summary Report for {$project.title}</h1>

  <!-- Summary table -->
  <div class="table-responsive mb-5">
    <table class="table table-bordered">
      <thead class="thead-light">
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Highest Risk</th>
        </tr>
      </thead>
      <tbody>
        {#each hazards as h}
          {@const hr = HazardUtils.getHighestRisk(h)}
          <tr>
            <td>{h.id}</td>
            <td><a href='#{h.id}'>{h.description}</a></td>
            <td>
              {#if hr.rating}
                <span class="badge" style="background-color: {hr.color};">
                  {hr.rating}
                </span>
              {:else}
                <em>None</em>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Detailed hazards -->
  {#each hazards as h}
    {@const hr = HazardUtils.getHighestRisk(h)}
    <div class="card mb-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <div>
          <h4 id='{h.id}'><strong>{h.id}</strong>: {h.description}</h4>
        </div>
        <div>
          {#if hr.rating}
            <span class="badge" style="background-color: {hr.color};">
              Risk: {hr.rating}
            </span>
          {/if}
        </div>
      </div>
      <div class="card-body">
        <!-- Causes -->
        <h5>Potential Causes of Hazard</h5>
        {#if getCauses(h).length}
          <ul>
            {#each getCauses(h) as cause}
              <li>{cause.description}</li>
            {/each}
          </ul>
        {:else}
          <p class="text-muted">None</p>
        {/if}

        <!-- Hazard Mitigations -->
        <h5>All Related Mitigations</h5>
{#if getAllMitigations(h).length}
  {#each getGroupedMitigations(h) as group}
    {#if group.items.length}
      <h6 class="mb-1 mt-3">{group.label}</h6>
      <ul>
        {#each group.items as mit}
          <li>{mit.description}</li>
        {/each}
      </ul>
    {/if}
  {/each}
{:else}
  <p class="text-muted">None</p>
{/if}

        <!-- Impacts with Risk -->
        <h5>Impacts & Risk Ratings</h5>
        {#if getFullImpacts(h).length}
          <ul class="list-unstyled">
            {#each getFullImpacts(h) as { hi, core, risk }}
              <li class="mb-2">
                <strong>{core.description}</strong><br/>

                Severity: <span class={`badge ${severityBadgeMap[core.severity]} me-1`}>
                {core.severity}
                </span>
                Likelihood: <span class={`badge ${likelihoodBadgeMap[hi.likelihood]} me-1`}>
                {hi.likelihood}
                </span>

                <!-- Risk‐rating badge (coloured via inline style) -->
                {#if risk.rating}
                    Risk Level: <span class="badge me-1" style="background-color: {HazardUtils.getRiskColor(risk.rating)};">
                    {risk.rating} 
                    </span>
                {:else}
                    <em>Not assessed</em>
                {/if}
                </li>

            {/each}
          </ul>
        {:else}
          <p class="text-muted">No impacts added.</p>
        {/if}


      </div>
    </div>
  {/each}
</main>

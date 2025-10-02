<script lang="ts">
  import { base } from '$app/paths';
  import { project } from '$lib/stores/project.js';
  import { mitigations } from '$lib/stores/mitigations';
  // The progress object values: boolean for tick/cross or string for counts
  let progress: Record<string, boolean | string>;

  // Recompute progress whenever the project store updates
  $: {
    const p = $project;
    const m = $mitigations;
    const sections = p.reportSections ?? {};
    const narrativeProvided = Object.values(sections).some(value => (value ?? '').toString().trim().length > 0);
    console.log('mitigations', m);
    const hazardCount = p.hazards?.length ?? 0;

    progress = {
      clinicalSafetyOfficer: Boolean(p.safetyOfficer?.trim()),
      projectDetails: Boolean(p.description?.trim()),
      hazardLogRiskAssessment: String(hazardCount)+" Hazards Identified",
      mitigationsInPlace: String(m.length)+" Mitigations Identified",
      vendorComplianceReview: Boolean(p.compliance?.vendorComplianceReviewed),
      alternativeOptionsAnalysis: Boolean(p.alternatives?.trim()),
      clinicalSafetyNarrative: narrativeProvided
    };
  }

  const rows = [
    {
      key: 'clinicalSafetyOfficer',
      title: 'Named Clinical Safety Officer',
      description:
        'The appointed individual responsible for overseeing and ensuring clinical safety compliance throughout the project lifecycle.',
      link: base + '/workspace/project'
    },
    {
      key: 'projectDetails',
      title: 'Project Details Described',
      description:
        'A comprehensive description of the project scope, objectives, and clinical context as per DCB0160 requirements.',
      link: base + '/workspace/project'
    },
    {
      key: 'hazardLogRiskAssessment',
      title: 'Hazard Log and Risk Assessment',
      description:
        'Documentation of identified hazards, their risk assessments, and mitigation plans in line with risk management processes.',
      link: base + '/workspace/hazards'
    },
    {
      key: 'mitigationsInPlace',
      title: 'Mitigations In Place',
      description:
        'Implementation of risk mitigations as identified in the hazard log, ensuring clinical safety measures are actively managed.',
      link: base + '/workspace/mitigations'
    },
    {
      key: 'vendorComplianceReview',
      title: 'Review of Vendor Compliance',
      description:
        'Assessment of vendor adherence to regulatory standards and contractual obligations relevant to clinical safety.',
      link: base + '/workspace/compliance'
    },
    {
      key: 'alternativeOptionsAnalysis',
      title: 'Consideration of Risks/Benefits of Alternative Options',
      description:
        'Evaluation of potential alternatives, including risk-benefit analysis to justify selected solutions.',
      link: base + '/workspace/project'
    },
    {
      key: 'clinicalSafetyNarrative',
      title: 'Clinical Safety Case Narrative Prepared',
      description:
        'Draft the introduction, governance, risk summary, and conclusion text that will appear in the exported safety case report.',
      link: base + '/workspace/project'
    }
  ];
</script>

<main class="container mt-4">
  <!-- Project title -->
  <h1 class="mb-4">{$project.title || 'Untitled Project'}</h1>
  <h3 class="mb-3">DCB0160 Clinical Safety Case Progress</h3>
  <table class="table table-bordered">
    <thead class="thead-light">
      <tr>
        <th scope="col" class="text-center">Status</th>
        <th scope="col">Details</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          <td class="align-middle text-center">
            {#if typeof progress[row.key] === 'string'}
              {progress[row.key]}
            {:else if progress[row.key]}
              ✅
            {:else}
              ❌
            {/if}
          </td>
          <td>
            <h5 class="mb-1">
              <a href={row.link} class="text-decoration-none">{row.title}</a>
            </h5>
            <p class="mb-0 text-muted">{row.description}</p>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

<script lang="ts">
  import { browser } from '$app/environment';
  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { impacts } from '$lib/stores/impacts.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { HazardUtils } from '$lib/utils/hazard';
  import { assessHazardImpact } from '$lib/utils/dcbRisk';

  const generatedOn = new Date().toLocaleDateString();

  const defaultTexts = {
    introduction:
      'DCB0160 is a clinical risk management standard that health and social care organisations must comply with to safely implement health IT systems. This clinical safety case report summarises the assurance work completed for this project.',
    purpose:
      "This report documents clinical hazards and risks, and captures the mitigations required to maintain clinical safety. It supports governance teams in confirming that the solution is safe to deploy.",
    governance: ({ safetyOfficer }: { safetyOfficer: string }) =>
      `A Clinical Safety Officer (CSO) – ${safetyOfficer || 'name to be confirmed'} – is accountable for the ongoing clinical safety of the system, including maintaining the hazard log, monitoring mitigations and advising senior leadership. Final deployment decisions rest with the organisation's accountable officers informed by the CSO's recommendation.`,
    riskOverview:
      'Each hazard has been assessed for potential harm severity and likelihood. Residual risk is evaluated after applying mitigations to ensure that risks are reduced to an acceptable level wherever possible.',
    conclusion: ({ projectTitle }: { projectTitle: string }) =>
      `Subject to the mitigations described within this report remaining effective, the risk profile for ${projectTitle || 'this system'} is considered acceptable for clinical use. Leadership should ensure ongoing monitoring and review in line with governance arrangements.`
  } as const;

  $: projectTitle = $project.title || 'Untitled Project';
  $: projectDescription = $project.description || 'No description provided yet.';
  $: safetyOfficer = $project.safetyOfficer || '';
  $: alternatives = $project.alternatives?.trim() || '';
  $: reportSections = $project.reportSections ?? {};
  $: hazards = $project.hazards || [];

  type SectionKey = keyof typeof defaultTexts;

  function resolveSection(key: SectionKey) {
    const value = (reportSections as Record<string, string> | undefined)?.[key];
    const text = typeof value === 'string' ? value.trim() : '';
    if (text) return text;
    const fallback = defaultTexts[key];
    if (typeof fallback === 'function') {
      return fallback({ safetyOfficer, projectTitle });
    }
    return fallback;
  }

  function getCauses(hazard: any) {
    return (hazard.causeIds || [])
      .map((cid: string) => $causes.find((c) => c.id === cid))
      .filter(Boolean);
  }

  function getAllMitigations(hazard: any) {
    const hazardMits = (hazard.mitigationIds || [])
      .map((mid: string) => $mitigations.find((m) => m.id === mid))
      .filter(Boolean);

    const causeMits = (hazard.causeIds || [])
      .flatMap((cid: string) => $causes.find((c) => c.id === cid)?.mitigationIds || [])
      .map((mid: string) => $mitigations.find((m) => m.id === mid))
      .filter(Boolean);

    const map = new Map();
    [...hazardMits, ...causeMits].forEach((mit: any) => {
      if (mit) map.set(mit.id, mit);
    });
    return Array.from(map.values());
  }

  function getFullImpacts(hazard: any) {
    return (hazard.hazardImpacts || [])
      .map((hi: any) => {
        const core = $impacts.find((i) => i.id === hi.impactID);
        if (!core) return null;
        const risk = assessHazardImpact(hi);
        return { hi, core, risk };
      })
      .filter(Boolean);
  }

  function residualRiskLabel(hazard: any) {
    const highest = HazardUtils.getHighestRisk(hazard);
    return highest.rating || 'Not yet assessed';
  }

  function downloadDoc() {
    if (!browser) return;
    const container = document.getElementById('report-content');
    if (!container) return;
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${projectTitle} Clinical Safety Case Report</title></head><body>${container.innerHTML}</body></html>`;
    const blob = new Blob([html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectTitle.replace(/\s+/g, '-').toLowerCase() || 'clinical-safety-report'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  <title>Clinical Safety Case Report – {projectTitle}</title>
</svelte:head>

<style>
  :global(body) {
    background-color: #f8f9fa;
  }
  main {
    font-family: 'Segoe UI', Tahoma, sans-serif;
    color: #212529;
  }
  #report-content {
    background: #ffffff;
    padding: 2rem;
    border-radius: 0.5rem;
    border: 1px solid #dee2e6;
  }
  h1, h2, h3 {
    font-weight: 600;
  }
  .section-heading {
    margin-top: 2rem;
    border-bottom: 2px solid #0d6efd;
    padding-bottom: 0.5rem;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 1rem;
  }
  table, th, td {
    border: 1px solid #adb5bd;
  }
  th, td {
    padding: 0.75rem;
    text-align: left;
    vertical-align: top;
  }
  .muted {
    color: #6c757d;
  }
  .download-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .small-label {
    font-size: 0.9rem;
    color: #495057;
  }
</style>

<main class="container py-4">
  <div class="download-toolbar">
    <div>
      <h1 class="mb-1">Clinical Safety Case Report</h1>
      <div class="small-label">Project: <strong>{projectTitle}</strong></div>
      <div class="small-label">Generated: {generatedOn}</div>
    </div>
    <button class="btn btn-primary" on:click={downloadDoc}>Download Word (.doc)</button>
  </div>

  <div id="report-content">
    <section>
      <h2 class="section-heading">1. Introduction</h2>
      <p>{resolveSection('introduction')}</p>
    </section>

    <section>
      <h2 class="section-heading">2. Purpose</h2>
      <p>{resolveSection('purpose')}</p>
    </section>

    <section>
      <h2 class="section-heading">3. Description of the Proposed System</h2>
      <p>{projectDescription}</p>
    </section>

    <section>
      <h2 class="section-heading">4. Clinical Safety Governance</h2>
      <p>{resolveSection('governance')}</p>
      <p>
        <strong>Named Clinical Safety Officer:</strong>
        {safetyOfficer ? safetyOfficer : 'To be confirmed'}
      </p>
    </section>

    <section>
      <h2 class="section-heading">5. Hazard Identification</h2>
      {#if hazards.length}
        <p>The following hazards have been identified through multidisciplinary workshops and review:</p>
        <table>
          <thead>
            <tr>
              <th scope="col">Hazard ID</th>
              <th scope="col">Description</th>
              <th scope="col">Residual Risk Level</th>
            </tr>
          </thead>
          <tbody>
            {#each hazards as hazard}
              <tr>
                <td>{hazard.id}</td>
                <td>{hazard.description || 'Description not provided'}</td>
                <td>{residualRiskLabel(hazard)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      {:else}
        <p class="muted">No hazards have been logged yet.</p>
      {/if}
    </section>

    <section>
      <h2 class="section-heading">6. Risk Assessment &amp; Mitigations</h2>
      <p>{resolveSection('riskOverview')}</p>
      {#if hazards.length}
        {#each hazards as hazard}
          <div class="mb-4">
            <h3>{hazard.id}: {hazard.description || 'Description not provided'}</h3>
            <p><strong>Residual Risk:</strong> {residualRiskLabel(hazard)}</p>

            <h4>Causes</h4>
            {#if getCauses(hazard).length}
              <ul>
                {#each getCauses(hazard) as cause}
                  <li>{cause.description}</li>
                {/each}
              </ul>
            {:else}
              <p class="muted">No causes recorded.</p>
            {/if}

            <h4>Mitigations</h4>
            {#if getAllMitigations(hazard).length}
              <ul>
                {#each getAllMitigations(hazard) as mitigation}
                  <li>{mitigation.description}</li>
                {/each}
              </ul>
            {:else}
              <p class="muted">No mitigations recorded.</p>
            {/if}

            <h4>Impact Assessment</h4>
            {#if getFullImpacts(hazard).length}
              <table>
                <thead>
                  <tr>
                    <th scope="col">Impact</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Likelihood</th>
                    <th scope="col">Residual Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {#each getFullImpacts(hazard) as { hi, core, risk }}
                    <tr>
                      <td>{core.description}</td>
                      <td>{core.severity || 'Not set'}</td>
                      <td>{hi.likelihood || 'Not set'}</td>
                      <td>{risk.rating || 'Not assessed'}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            {:else}
              <p class="muted">No impact assessments recorded.</p>
            {/if}
          </div>
        {/each}
      {/if}
    </section>

    <section>
      <h2 class="section-heading">7. Alternative Options</h2>
      <p>{alternatives || 'Alternative approaches have not been documented yet.'}</p>
    </section>

    <section>
      <h2 class="section-heading">8. Clinical Safety Case Report Conclusion</h2>
      <p>{resolveSection('conclusion')}</p>
    </section>
  </div>
</main>

<script lang="ts">
  import { project } from '$lib/stores/project.js';
  import { HazardUtils } from '$lib/utils/hazard';
  import { base } from '$app/paths';

  type Hazard = {
    id: string;
    description?: string;
  };

  type CaseReportSections = {
    riskAssessmentAndMitigations?: string;
    alternatives?: string;
    implementationRecommendedByCSO?: boolean;
    conclusionNarrative?: string;
    conclusion?: string;
  };

  $: currentProject = $project ?? {};
  $: hazards = ((currentProject.hazards || []) as Hazard[]).slice();
  $: caseReportSections = ((currentProject as any).caseReportSections || {}) as CaseReportSections;
  $: generatedAt = new Date();

  function getCompletionText(value?: string): string {
    return value?.trim() ? value : 'Not completed yet.';
  }

  function getSummaryRisk(hazard: Hazard): string {
    return HazardUtils.getHighestRisk(hazard).rating || 'Not yet assessed';
  }

  function getCaseReportSectionValue(key: keyof CaseReportSections): string {
    const value = caseReportSections[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }

    return '';
  }

  $: section6ManualText = getCaseReportSectionValue('riskAssessmentAndMitigations');
  $: section7ManualText = getCaseReportSectionValue('alternatives');
  $: includeSection7 = Boolean(section7ManualText);
  $: conclusionSectionNumber = includeSection7 ? 8 : 7;
  $: section8RecommendationChecked = Boolean(caseReportSections.implementationRecommendedByCSO);
  $: section8NarrativeText =
    getCaseReportSectionValue('conclusionNarrative') || getCaseReportSectionValue('conclusion');

  function triggerPrint(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }
</script>

<svelte:head>
  <title>Clinical Safety Case Report - {currentProject.title || 'Untitled Project'}</title>
</svelte:head>

<main class="clinical-report">
  <div class="print-controls">
    <button class="btn btn-primary" on:click={triggerPrint}>Print / Save as PDF</button>
  </div>

  <header class="cover">
    <h1>Clinical Safety Case Report for AI Scribe Software</h1>
    <p class="meta-line">
      <strong>System:</strong>
      {currentProject.title?.trim() || 'Untitled project'}
    </p>
    <p class="meta-line">
      <strong>Generated:</strong>
      {generatedAt.toLocaleString()}
    </p>
  </header>

  <section>
    <h2>Contents</h2>
    <ol class="contents-list">
      <li><a href="#intro">1. Introduction</a></li>
      <li><a href="#purpose">2. Purpose</a></li>
      <li><a href="#system">3. Description of the proposed new system</a></li>
      <li><a href="#governance">4. Clinical Safety Governance</a></li>
      <li><a href="#hazards">5. Hazard Identification</a></li>
      <li><a href="#risk">6. Risk Assessment and Mitigations</a></li>
      {#if includeSection7}
        <li><a href="#alternatives">7. Alternative options</a></li>
      {/if}
      <li><a href="#conclusion">{conclusionSectionNumber}. Clinical Safety Case Report Conclusion</a></li>
    </ol>
  </section>

  <section id="intro">
    <h2>1. Introduction</h2>
    <p>This report outlines the clinical safety activities and risk-management outputs.</p>
    <p>
      It is intended to support DCB0160-aligned governance by summarising hazards, assessed risks,
      and mitigations associated with this deployment.
    </p>
  </section>

  <section id="purpose">
    <h2>2. Purpose</h2>
    <ul>
      <li>Report on clinical hazards.</li>
      <li>Summarise the current risk profile and any unresolved areas.</li>
    </ul>
  </section>

  <section id="system">
    <h2>3. Description of the proposed new system</h2>
    {#if currentProject.description?.trim()}
      <p>{currentProject.description}</p>
    {:else}
      <p class="todo">Not completed yet. Add a system description in Project Details.</p>
    {/if}
  </section>

  <section id="governance">
    <h2>4. Clinical Safety Governance</h2>
    <p>
      <strong>Clinical Safety Officer:</strong>
      {getCompletionText(currentProject.safetyOfficer)}
    </p>
    <p>
      <strong>Vendor compliance review checked:</strong>
      {currentProject.compliance?.vendorComplianceReviewed ? 'Checked' : 'Not checked'}
    </p>
  </section>

  <section id="hazards">
    <h2>5. Hazard Identification</h2>
    <p>
      A hazard is any potential source of harm associated with use of the system. Residual risk is
      the risk level remaining after planned mitigations are applied.
    </p>
    <p>
      Residual risk in this report is derived using the NHS-style clinical risk matrix approach:
      combining severity and likelihood to produce a 1-5 risk score, then categorising that score
      into acceptable, undesirable, or unacceptable levels in line with DCB clinical safety
      guidance.
      <a href="https://digital.nhs.uk/services/clinical-safety/documentation" target="_blank" rel="noreferrer">
        NHS Clinical Safety documentation
      </a>.
    </p>
    <p>
      The hazards currently present in this case and their highest recorded residual risk ratings
      are listed below.
    </p>
    {#if hazards.length}
      <div class="table-responsive">
        <table class="table table-bordered report-table">
          <thead>
            <tr>
              <th>Hazard</th>
              <th>Level of residual risk after mitigations</th>
            </tr>
          </thead>
          <tbody>
            {#each hazards as hazard}
              <tr>
                <td>{hazard.description || `Hazard ${hazard.id}`}</td>
                <td>{getSummaryRisk(hazard)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="todo">Not completed yet. No hazards are currently recorded in this case.</p>
    {/if}
  </section>

  <section id="risk">
    <h2>6. Risk Assessment and Mitigations</h2>
    {#if section6ManualText}
      <p class="manual-text">{section6ManualText}</p>
    {:else}
      <p class="todo">
        Not completed yet. Add Section 6 content in
        <a href="{base}/workspace/case-report" target="_blank" rel="noreferrer">
          Case Report Inputs
        </a>.
      </p>
    {/if}
  </section>

  {#if includeSection7}
    <section id="alternatives">
      <h2>7. Alternative options</h2>
      <p class="manual-text">{section7ManualText}</p>
    </section>
  {/if}

  <section id="conclusion">
    <h2>{conclusionSectionNumber}. Clinical Safety Case Report Conclusion</h2>
    <p>
      <strong>
        Recommended to be implemented by the Clinical Safety Officer (subject to mitigations being
        enacted):
      </strong>
      {section8RecommendationChecked ? 'Yes' : 'No / not confirmed'}
    </p>
    {#if section8NarrativeText}
      <p class="manual-text">{section8NarrativeText}</p>
    {:else if !section8RecommendationChecked}
      <p class="todo">
        Not completed yet. Add Section 8 content in
        <a href="{base}/workspace/case-report" target="_blank" rel="noreferrer">
          Case Report Inputs
        </a>.
      </p>
    {/if}
  </section>
</main>

<style>
  :global(body) {
    background: #f8fafc;
  }

  .clinical-report {
    max-width: 980px;
    margin: 1rem auto 3rem;
    padding: 2rem;
    background: #fff;
    color: #101820;
    font-family: Arial, Helvetica, sans-serif;
    line-height: 1.45;
  }

  .print-controls {
    margin-bottom: 1rem;
  }

  .cover {
    border-bottom: 2px solid #005eb8;
    margin-bottom: 1.2rem;
    padding-bottom: 0.8rem;
  }

  .cover h1 {
    font-size: 2rem;
    margin-bottom: 0.8rem;
  }

  .meta-line {
    margin: 0.25rem 0;
  }

  h2 {
    color: #005eb8;
    font-weight: 700;
    font-size: 1.6rem;
    margin-top: 1.7rem;
    margin-bottom: 0.7rem;
  }

  section {
    break-inside: avoid;
    page-break-inside: avoid;
  }

  .contents-list {
    margin-bottom: 0;
  }

  .contents-list a {
    color: #0b3b8f;
    text-decoration: none;
  }

  .contents-list a:hover {
    text-decoration: underline;
  }

  .report-table th {
    background: #eef4fb;
  }

  .todo {
    color: #6c757d;
    font-style: italic;
  }

  .manual-text {
    white-space: pre-wrap;
  }

  @page {
    size: A4;
    margin: 14mm;
  }

  @media print {
    :global(body) {
      background: #fff;
    }

    .clinical-report {
      max-width: none;
      margin: 0;
      padding: 0;
    }

    .print-controls {
      display: none;
    }
  }
</style>

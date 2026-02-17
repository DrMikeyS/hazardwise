<script lang="ts">
  import { onDestroy } from 'svelte';
  import { goto } from '$app/navigation';
  import { base } from '$app/paths';
  import { project } from '$lib/stores/project.js';

  type CaseReportSections = {
    riskAssessmentAndMitigations?: string;
    alternatives?: string;
    implementationRecommendedByCSO?: boolean;
    conclusionNarrative?: string;
    conclusion?: string;
  };

  let section6RiskAssessment = '';
  let section7Alternatives = '';
  let section8RecommendationChecked = false;
  let section8Narrative = '';

  const unsubscribe = project.subscribe((p) => {
    const sections = ((p as any).caseReportSections || {}) as CaseReportSections;
    section6RiskAssessment = sections.riskAssessmentAndMitigations ?? '';
    section7Alternatives = sections.alternatives ?? (p as any).alternatives ?? '';
    section8RecommendationChecked = Boolean(sections.implementationRecommendedByCSO);
    section8Narrative = sections.conclusionNarrative ?? sections.conclusion ?? '';
  });

  onDestroy(unsubscribe);

  function saveCaseReportInputs() {
    project.update((p) => ({
      ...p,
      caseReportSections: {
        ...(p as any).caseReportSections,
        riskAssessmentAndMitigations: section6RiskAssessment,
        alternatives: section7Alternatives,
        implementationRecommendedByCSO: section8RecommendationChecked,
        conclusionNarrative: section8Narrative
      }
    }));

    goto(base + '/workspace');
  }
</script>

<main class="container py-4">
  <h1 class="mb-4">Case Report Inputs</h1>
  <p class="text-muted mb-4">
    These fields populate the printable Clinical Safety Case Report narrative sections.
  </p>

  <form on:submit|preventDefault={saveCaseReportInputs}>
    <div class="mb-4">
      <label for="section6Risk" class="form-label">Risk Assessment and Mitigations</label>
      <div class="form-text mb-2">
        Enter the narrative for risk assessment, mitigation status, and any key points requiring
        leadership attention.
      </div>
      <textarea
        id="section6Risk"
        class="form-control"
        rows="8"
        bind:value={section6RiskAssessment}
      ></textarea>
    </div>

    <div class="mb-4">
      <label for="section7Alternatives" class="form-label">Alternative options</label>
      <div class="form-text mb-2">
        Enter the alternatives analysis, including rationale for the selected option.
      </div>
      <textarea
        id="section7Alternatives"
        class="form-control"
        rows="6"
        bind:value={section7Alternatives}
      ></textarea>
    </div>

    <div class="mb-4">
      <p class="form-label mb-2">Clinical Safety Case Report Conclusion</p>
      <div class="form-check mb-3">
        <input
          id="section8Recommendation"
          class="form-check-input"
          type="checkbox"
          bind:checked={section8RecommendationChecked}
        />
        <label class="form-check-label" for="section8Recommendation">
          Recommended to be implemented by the Clinical Safety Officer (subject to mitigations being enacted)
        </label>
      </div>
      <label for="section8Narrative" class="form-label">Further narrative</label>
      <div class="form-text mb-2">Add any additional conclusion narrative.</div>
      <textarea
        id="section8Narrative"
        class="form-control"
        rows="6"
        bind:value={section8Narrative}
      ></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Save</button>
  </form>
</main>

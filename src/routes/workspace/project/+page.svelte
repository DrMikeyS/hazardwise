<script lang="ts">
  import { onDestroy } from 'svelte';
  import { project } from '$lib/stores/project.js';
import { base } from '$app/paths';  
import { goto } from '$app/navigation';
  // Local form fields
  let title: string = '';
  let description: string = '';
  let safetyOfficer: string = '';
  let alternatives: string = '';
  let introduction: string = '';
  let purpose: string = '';
  let governance: string = '';
  let riskOverview: string = '';
  let conclusion: string = '';

  // Subscribe to project store
  const unsubscribe = project.subscribe(p => {
    title = p.title;
    description = p.description;
    safetyOfficer = p.safetyOfficer;
    // Add an "alternatives" field if not present
    alternatives = (p as any).alternatives ?? '';

    const sections = (p as any).reportSections ?? {};
    introduction = sections.introduction ?? '';
    purpose = sections.purpose ?? '';
    governance = sections.governance ?? '';
    riskOverview = sections.riskOverview ?? '';
    conclusion = sections.conclusion ?? '';
  });
  onDestroy(unsubscribe);

  // Save updates back to the store
  function saveProject() {
    project.update(p => ({
      ...p,
      title,
      description,
      safetyOfficer,
      // persist alternatives field
      alternatives,
      reportSections: {
        ...((p as any).reportSections ?? {}),
        introduction,
        purpose,
        governance,
        riskOverview,
        conclusion
      }
    }));
    goto(base + '/workspace');
  }
</script>

<main class="container py-4">
  <h1 class="mb-4">Project Details</h1>

  <form on:submit|preventDefault={saveProject}>
    <div class="mb-3">
      <label for="projectTitle" class="form-label">Project Name</label>
      <input
        type="text"
        id="projectTitle"
        class="form-control"
        bind:value={title}
        placeholder="Enter project name"
        required
      />
    </div>

    <div class="mb-3">
      <label for="projectDescription" class="form-label">Description</label>
      <textarea
        id="projectDescription"
        class="form-control"
        rows="3"
        bind:value={description}
        placeholder="Brief description of the project"
      ></textarea>
    </div>

    <div class="mb-3">
      <label for="reportIntroduction" class="form-label">Clinical Safety Report Introduction</label>
      <textarea
        id="reportIntroduction"
        class="form-control"
        rows="4"
        bind:value={introduction}
        placeholder="Set out the DCB0160 context and provide any local introductory wording"
      ></textarea>
      <div class="form-text">
        This text appears in the report's opening section. Leave blank to use the default wording provided in the export.
      </div>
    </div>

    <div class="mb-3">
      <label for="reportPurpose" class="form-label">Purpose of this Safety Case</label>
      <textarea
        id="reportPurpose"
        class="form-control"
        rows="3"
        bind:value={purpose}
        placeholder="Explain the objectives of the clinical safety case report"
      ></textarea>
    </div>

    <div class="mb-3">
      <label for="safetyOfficer" class="form-label">Safety Officer</label>
      <input
        type="text"
        id="safetyOfficer"
        class="form-control"
        bind:value={safetyOfficer}
        placeholder="Name of safety officer"
      />
    </div>

    <div class="mb-3">
      <label for="reportGovernance" class="form-label">Clinical Safety Governance Notes</label>
      <textarea
        id="reportGovernance"
        class="form-control"
        rows="3"
        bind:value={governance}
        placeholder="Outline governance arrangements, decision makers, or review cadence"
      ></textarea>
    </div>

    <div class="mb-3">
      <label for="alternatives" class="form-label">Alternatives</label>
      <textarea
        id="alternatives"
        class="form-control"
        rows="4"
        bind:value={alternatives}
        placeholder="Outline any alternative approaches or tools considered"
      ></textarea>
    </div>

    <div class="mb-3">
      <label for="reportRiskOverview" class="form-label">Risk Assessment Summary</label>
      <textarea
        id="reportRiskOverview"
        class="form-control"
        rows="4"
        bind:value={riskOverview}
        placeholder="Highlight key risks, mitigations, or sign-offs that leadership should note"
      ></textarea>
    </div>

    <div class="mb-4">
      <label for="reportConclusion" class="form-label">Conclusion</label>
      <textarea
        id="reportConclusion"
        class="form-control"
        rows="3"
        bind:value={conclusion}
        placeholder="Record the overall safety conclusion and any conditions"
      ></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Save</button>
  </form>
</main>

<!-- src/routes/new/+page.svelte -->
<script lang="ts">
  import { project } from '$lib/stores/project.js';
  import { goto } from '$app/navigation';

  // local form state
  let title = '';
  let description = '';
  let safetyOfficer = '';

  function handleSubmit() {
    // write to the store
    project.set({ title, description, safetyOfficer });
    console.log('Project saved:', $project);
    goto('/workspace');
  }
</script>

<h1 class="mb-4">Start New Project</h1>

<form on:submit|preventDefault={handleSubmit}>
  <div class="mb-3">
    <label for="projectTitle" class="form-label">
      Project Title <span class="text-danger">*</span>
    </label>
    <input
      id="projectTitle"
      type="text"
      bind:value={title}
      required
      class="form-control"
      placeholder="Enter project title"
    />
  </div>

  <div class="mb-3">
    <label for="projectDescription" class="form-label">
      Project Description
    </label>
    <textarea
      id="projectDescription"
      bind:value={description}
      rows="3"
      class="form-control"
      placeholder="Use plain language understandable to the public"
    ></textarea>
  </div>

  <div class="mb-3">
    <label for="safetyOfficer" class="form-label">
      Clinical Safety Officer
    </label>
    <input
      id="safetyOfficer"
      type="text"
      bind:value={safetyOfficer}
      class="form-control"
      placeholder="Name of the responsible clinician"
    />
    <div class="form-text">
      Tip: This is the clinician taking responsibility for the clinical safety process.
    </div>
  </div>

  <button type="submit" class="btn btn-primary">
    Create Project
  </button>
</form>

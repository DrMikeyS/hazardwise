<!-- src/routes/new/+page.svelte -->
<script lang="ts">
  import { project } from '$lib/stores/project.js';
  import { goto } from '$app/navigation';
import { base } from '$app/paths';
  // local form state
  let title = '';

  function handleSubmit() {
    // write to the store
    project.set({ title });
    console.log('Project saved:', $project);
    goto(base+'/workspace');
  }
</script>
<main class="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
 
<h1 class="mb-4">Start New Project</h1>

<form on:submit|preventDefault={handleSubmit} class="w-100" style="max-width: 600px;">
  <div class="mb-3">
    <label for="projectTitle" class="form-label">
      Project Title <span class="text-danger">*</span>
    </label>
    <div class="form-text mb-2">Enter a clear title for this clinical safety case.</div>
    <input
      id="projectTitle"
      type="text"
      bind:value={title}
      required
      class="form-control w-100"
    />
  </div>

  <button type="submit" class="btn btn-primary">
    Create Project
  </button>
</form>
</main>

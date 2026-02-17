<script lang="ts">
  import { onDestroy } from 'svelte';
  import { project } from '$lib/stores/project.js';
  import { base } from '$app/paths';
  import { goto } from '$app/navigation';
  // Local form fields
  let title: string = '';
  let description: string = '';
  let safetyOfficer: string = '';

  // Subscribe to project store
  const unsubscribe = project.subscribe(p => {
    title = p.title;
    description = p.description;
    safetyOfficer = p.safetyOfficer;
  });
  onDestroy(unsubscribe);

  // Save updates back to the store
  function saveProject() {
    project.update(p => ({
      ...p,
      title,
      description,
      safetyOfficer
    }));
    goto(base + '/workspace');
  }
</script>

<main class="container py-4">
  <h1 class="mb-4">Project Details</h1>

  <form on:submit|preventDefault={saveProject}>
    <div class="mb-3">
      <label for="projectTitle" class="form-label">Project Name</label>
      <div class="form-text mb-2">Enter the name of the system or project under assessment.</div>
      <input
        type="text"
        id="projectTitle"
        class="form-control"
        bind:value={title}
        required
      />
    </div>

    <div class="mb-3">
      <label for="projectDescription" class="form-label">Description</label>
      <div class="form-text mb-2">
        Summarize what the system does and where it is used in clinical workflow.
      </div>
      <textarea
        id="projectDescription"
        class="form-control"
        rows="3"
        bind:value={description}
      ></textarea>
    </div>

    <div class="mb-3">
      <label for="safetyOfficer" class="form-label">Safety Officer</label>
      <div class="form-text mb-2">Enter the named Clinical Safety Officer responsible for this case.</div>
      <input
        type="text"
        id="safetyOfficer"
        class="form-control"
        bind:value={safetyOfficer}
      />
    </div>

    <button type="submit" class="btn btn-primary">Save</button>
  </form>
</main>

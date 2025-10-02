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

  // Subscribe to project store
  const unsubscribe = project.subscribe(p => {
    title = p.title;
    description = p.description;
    safetyOfficer = p.safetyOfficer;
    // Add an "alternatives" field if not present
    alternatives = (p as any).alternatives ?? '';
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
      alternatives
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
      <label for="alternatives" class="form-label">Alternatives</label>
      <textarea
        id="alternatives"
        class="form-control"
        rows="4"
        bind:value={alternatives}
        placeholder="Outline any alternative approaches or tools considered"
      ></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Save</button>
  </form>
</main>

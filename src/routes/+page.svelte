<!-- src/routes/+page.svelte -->
<script>
  import '$lib/styles/start.css';
  import { startNewProject } from '$lib/navigation.js';
  import { appName } from '$lib/config';
  import ImportData from '$lib/components/ImportData.svelte';
  import { base } from '$app/paths';
</script>

<style>
  .logo-text {
    font-family: "Jost", sans-serif;
    color: #016FB8;
  }
</style>

<main class="d-flex flex-column justify-content-center align-items-center vh-100 text-center">
  <img
    src="{base}/hazardwise_icon.svg"
    alt="HazardWise Logo"
    style="width: 80px; height: 80px;"
    class="mb-4"
  />
  <div class="logo-text display-3 fw-bold mb-5">
    {appName}
  </div>
  <p class="lead text-muted mb-5">
    Empowering busy clinicians to complete the DCB0160 process in minutes—create hazard logs, quantify risks, and generate ready-to-share mitigation reports for your team.
  </p>
  

  <button
    class="btn btn-primary btn-lg w-100 mb-3"
    on:click={startNewProject}
    style="max-width: 300px;"
  >
    Start New Project
  </button>

  <div style="max-width: 300px; width: 100%;">
    <ImportData />
  </div>
</main>

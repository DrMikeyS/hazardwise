<!-- src/routes/+page.svelte -->
<script>
  import '$lib/styles/start.css';        // styles only
  import { startNewProject }
    from '$lib/navigation.js';          // navigation helpers
  import { appName } from '$lib/config'; // e.g. your app name
  import ImportData from '$lib/components/ImportData.svelte';
</script>


  <h1 class="mb-4">{appName}</h1>

  <button
    class="btn btn-primary btn-lg w-100 mb-3"
    on:click={startNewProject}
  >
    Start New Project
  </button>

<ImportData />

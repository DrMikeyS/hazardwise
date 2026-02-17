<!-- hazardwise/src/routes/workspace/export/+page.svelte -->
<script lang="ts">
  import ExportData from '$lib/components/ExportData.svelte';
</script>

<main class="container py-4 export-tools">
  <h1 class="mb-2">Export tools</h1>
  <p class="text-muted mb-4">
    Choose a format depending on whether you need a downloadable file or a print-ready report.
  </p>
  <ExportData />
</main>

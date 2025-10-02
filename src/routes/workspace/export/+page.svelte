<!-- hazardwise/src/routes/workspace/export/+page.svelte -->
<script lang="ts">
  import ExportData from '$lib/components/ExportData.svelte';
  import { base } from '$app/paths';
</script>

<main class="container py-4">
  <h1 class="mb-4">Export tools</h1>
  <ExportData />

  <div class="d-flex flex-column flex-md-row gap-2 mt-3">
    <a class="btn btn-outline-secondary" href={base + '/printableExport'} target="_blank" rel="noopener">
      Printable Hazard Summary
    </a>
    <a
      class="btn btn-primary"
      href={base + '/workspace/export/clinical-report'}
      target="_blank"
      rel="noopener"
    >
      Clinical Safety Case Report
    </a>
  </div>
</main>
 
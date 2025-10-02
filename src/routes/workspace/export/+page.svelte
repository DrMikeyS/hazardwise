<!-- hazardwise/src/routes/workspace/export/+page.svelte -->
<script lang="ts">
  // Placeholder logic can go here in the future
import ExportData from "$lib/components/ExportData.svelte";
import { base } from "$app/paths";
</script>

<main class="container py-4">
  <h1 class="mb-4">Export tools</h1>
  <ExportData /> 
  <a class="btn btn-outline-secondary mt-3" href="{base}/printableExport" target="_blank">
    Printable Export
  </a>
  <!-- You can add search, filters, tables, and forms here -->
</main>
 
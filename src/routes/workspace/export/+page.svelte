<!-- hazardwise/src/routes/workspace/export/+page.svelte -->
<script lang="ts">
  // Placeholder logic can go here in the future
import ExportData from "$lib/components/ExportData.svelte";
import { base } from "$app/paths";
</script>

<main class="container py-4">
  <h1 class="mb-4">Export tools</h1>
  <ExportData /> 
  <div class="d-flex flex-wrap gap-2">
    <a class="btn btn-outline-secondary" href="{base}/printableExport" target="_blank">
      Printable Hazard Log
    </a>
    <a class="btn btn-outline-secondary" href="{base}/printableMitigations" target="_blank">
      Printable Mitigation List
    </a>
  </div>
  <!-- You can add search, filters, tables, and forms here -->
</main>
 

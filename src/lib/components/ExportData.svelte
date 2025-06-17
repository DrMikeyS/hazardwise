<script lang="ts">
  import { get } from 'svelte/store';
  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { impacts } from '$lib/stores/impacts.js';

  /**
   * Gather all store data and trigger a JSON download.
   */
  function exportJSON() {
    const data = {
      project:     get(project),
      causes:      get(causes),
      mitigations: get(mitigations),
      impacts:     get(impacts)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = get(project).title+'-hazardwise-data.json';
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="my-4">
  <button class="btn btn-outline-primary" on:click={exportJSON}>
    📤 Export Data to JSON
  </button>
</div>

<script lang="ts">
  import { project }     from '$lib/stores/project.js';
  import { causes }      from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { impacts }     from '$lib/stores/impacts.js';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
import { clearCookies,clearLocalStorage } from '$lib/utils/storeManagement';


  /**
   * Read a JSON file and restore all four stores, after purging existing data.
   */
  function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // Purge any existing cookies, storage, and store data
    // Clear cookies
    clearCookies();
    // Clear local and session storage
    clearLocalStorage();

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        project.set(data.project);
        causes.set(data.causes);
        mitigations.set(data.mitigations);
        impacts.set(data.impacts);
        alert('Data successfully imported!');
      } catch (err) {
        console.error(err);
        alert('Failed to import: invalid JSON format.');
      }
      // Reset the input so the same file can be re-selected if needed
      input.value = '';
    };

    reader.readAsText(file);
    goto(base + '/workspace');
  }
</script>

<div class="my-4">
  <label class="btn btn-outline-secondary mb-0">
    📥 Import Data from JSON
    <input type="file" accept="application/json" on:change={handleImport} hidden />
  </label>
</div>

<script lang="ts">
  import { project }     from '$lib/stores/project.js';
  import { causes }      from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { impacts }     from '$lib/stores/impacts.js';
import { goto } from '$app/navigation';
import { base } from '$app/paths';
  /**
   * Remove all cookies by expiring them.
   */
  function clearCookies() {
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  }

  /**
   * Purge any persisted data (cookies, web storage) and reset stores.
   */
  function purgeAllData() {
    // Clear cookies
    clearCookies();
    // Clear local and session storage
    localStorage.clear();
    sessionStorage.clear();
    // Reset stores to empty/default values
    project.set({ title: '', description: '', safetyOfficer: '', hazards: [] });
    causes.set([]);
    mitigations.set([]);
    impacts.set([]);
  }

  /**
   * Read a JSON file and restore all four stores, after purging existing data.
   */
  function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    // Purge any existing cookies, storage, and store data
    purgeAllData();

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

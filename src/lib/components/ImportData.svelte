<script lang="ts">
  import { project }     from '$lib/stores/project.js';
  import { causes }      from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { impacts }     from '$lib/stores/impacts.js';
  import { goto }        from '$app/navigation';
  import { base }        from '$app/paths';
  import { clearCookies, clearLocalStorage } from '$lib/utils/storeManagement';

  let fileInput: HTMLInputElement;

  function handleImport(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];

    clearCookies();
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
      } catch {
        alert('Failed to import: invalid JSON format.');
      }
      input.value = '';
    };
    reader.readAsText(file);
    goto(base + '/workspace');
  }
</script>

<div class="my-4">
  <button
    class="btn btn-secondary btn-lg w-100 mb-3"
    type="button"
    on:click={() => fileInput.click()}
  >
    📥 Import Existing Project
  </button>
  <input
    bind:this={fileInput}
    type="file"
    accept="application/json"
    on:change={handleImport}
    hidden
  />
</div>

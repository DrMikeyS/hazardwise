<!-- src/routes/mitigations/+page.svelte -->
<script>
  import { mitigations } from '$lib/stores/mitigations.js';
  import { base } from '$app/paths';
  import EditMitigationModal from '$lib/components/EditMitigationModal.svelte';
  /** 
   * Prompt the user and remove a mitigation by id 
   */
  function removeMitigation(id) {
    if (confirm('Are you sure you want to remove this mitigation?')) {
      mitigations.update(list => list.filter(item => item.id !== id));
    }
  }

  let showModal = false;
  let selectedId = null;

  function openEditor(id) {
    selectedId = id;
    showModal = true;
  }

  function handleSave(event) {
    // your modal already updated the store
    showModal = false;
  }

  function handleCancel() {
    showModal = false;
  }

  // Toggle “implemented” on/off
  function toggleImplemented(id, isImplemented) {
    mitigations.update(list =>
      list.map(item =>
        item.id === id ? { ...item, implemented: isImplemented } : item
      )
    );
  }
</script>

<div class="container py-4">
  <h1 class="mb-4">Mitigations</h1>

  <table class="table table-striped table-bordered">
    <thead class="table-light">
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Description</th>
        <th scope="col" class="text-center">Implemented</th>
        <th scope="col">Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each $mitigations as m}
        <tr>
          <td>{m.id}</td>
          <td>{m.description}</td>
          <td class="text-center">
            <input
              type="checkbox"
              checked={m.implemented}
              on:change={e => toggleImplemented(m.id, e.target.checked)}
              aria-label="Mark {m.id} implemented"
            />
          </td>
          <td>
            <button
              class="btn btn-sm btn-outline-primary me-2"
              on:click={() => openEditor(m.id)}
            >
              Edit
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-danger"
              on:click={() => removeMitigation(m.id)}
            >
              Remove
            </button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

{#if showModal}
  <EditMitigationModal
    mitigationID={selectedId}
    on:save={handleSave}
    on:cancel={handleCancel}
  />
{/if}
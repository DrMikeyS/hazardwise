<!-- src/routes/mitigations/+page.svelte -->
<script lang="ts">
  import { mitigations } from '$lib/stores/mitigations.js';
  import EditMitigationModal from '$lib/components/EditMitigationModal.svelte';
  import { groupMitigationsByImplementationClass } from '$lib/utils/mitigation.js';

  type MitigationItem = {
    id: string;
    description?: string;
    implemented?: boolean;
  };

  type MitigationGroup = {
    key: string;
    label: string;
    helpText: string;
    items: MitigationItem[];
  };

  /** 
   * Prompt the user and remove a mitigation by id 
   */
  function removeMitigation(id: string) {
    if (confirm('Are you sure you want to remove this mitigation?')) {
      mitigations.update(list => list.filter(item => item.id !== id));
    }
  }

  let showModal = false;
  let selectedId: string | null = null;

  function openEditor(id: string) {
    selectedId = id;
    showModal = true;
  }

  function handleSave() {
    showModal = false;
  }

  function handleCancel() {
    showModal = false;
  }

  $: mitigationGroups = groupMitigationsByImplementationClass($mitigations) as MitigationGroup[];

  // Toggle “implemented” on/off
  function toggleImplemented(id: string, isImplemented: boolean) {
    mitigations.update(list =>
      list.map(item =>
        item.id === id ? { ...item, implemented: isImplemented } : item
      )
    );
  }

  function handleImplementedChange(id: string, event: Event) {
    const target = event.currentTarget as HTMLInputElement | null;
    if (!target) return;
    toggleImplemented(id, target.checked);
  }
</script>

<div class="container py-4">
  <h1 class="mb-4">Mitigations</h1>
  <p class="text-muted mb-4">
    Mitigations are grouped by who is responsible for implementing them.
  </p>

  {#if !$mitigations.length}
    <p class="text-muted">No mitigations added.</p>
  {:else}
    {#each mitigationGroups as group}
      <section class="mb-4">
        <h2 class="h5 mb-1">{group.label}</h2>
        <p class="text-muted small mb-2">{group.helpText}</p>

        {#if group.items.length}
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
              {#each group.items as m}
                <tr>
                  <td>{m.id}</td>
                  <td>{m.description}</td>
                  <td class="text-center">
                    <input
                      type="checkbox"
                      checked={m.implemented}
                      on:change={(event) => handleImplementedChange(m.id, event)}
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
        {:else}
          <p class="text-muted">No mitigations in this class yet.</p>
        {/if}
      </section>
    {/each}
  {/if}
</div>

{#if showModal && selectedId}
  <EditMitigationModal
    mitigationID={selectedId}
    on:save={handleSave}
    on:cancel={handleCancel}
  />
{/if}

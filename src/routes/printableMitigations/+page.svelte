<script lang="ts">
  import { project } from '$lib/stores/project.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { groupMitigationsByImplementationClass } from '$lib/utils/mitigation.js';

  $: mitigationGroups = groupMitigationsByImplementationClass($mitigations);
</script>

<svelte:head>
  <title>Mitigation List for {$project.title}</title>
</svelte:head>

<main class="container py-4">
  <h1 class="mb-4">Mitigation List for {$project.title}</h1>

  {#if $mitigations.length}
    {#each mitigationGroups as group}
      <section class="mb-4">
        <h2 class="h5 mb-1">{group.label}</h2>
        <p class="text-muted small mb-2">{group.helpText}</p>
        {#if group.items.length}
          <div class="table-responsive">
            <table class="table table-bordered">
              <thead class="thead-light">
                <tr>
                  <th style="width: 15%">ID</th>
                  <th style="width: 85%">Description</th>
                </tr>
              </thead>
              <tbody>
                {#each group.items as mitigation}
                  <tr>
                    <td>{mitigation.id}</td>
                    <td>{mitigation.description}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="text-muted">No mitigations in this class.</p>
        {/if}
      </section>
    {/each}
  {:else}
    <p class="text-muted">No mitigations added.</p>
  {/if}
</main>

<script lang="ts">
  import { project } from '$lib/stores/project.js';
  import { mitigations } from '$lib/stores/mitigations.js';
</script>

<svelte:head>
  <title>Mitigation List for {$project.title}</title>
</svelte:head>

<main class="container py-4">
  <h1 class="mb-4">Mitigation List for {$project.title}</h1>

  {#if $mitigations.length}
    <div class="table-responsive">
      <table class="table table-bordered">
        <thead class="thead-light">
          <tr>
            <th style="width: 15%">ID</th>
            <th style="width: 85%">Description</th>
          </tr>
        </thead>
        <tbody>
          {#each $mitigations as mitigation}
            <tr>
              <td>{mitigation.id}</td>
              <td>{mitigation.description}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {:else}
    <p class="text-muted">No mitigations added.</p>
  {/if}
</main>

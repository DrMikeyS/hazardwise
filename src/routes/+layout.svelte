<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../app.css';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { startNewProject } from '$lib/navigation.js';
  let collapsed = false;
  function toggleSidebar() {
    collapsed = !collapsed;
  }

  function handleStartNewProject() {
    if (confirm('Really start new project? This will clear current data.')) {
      startNewProject();
    } else {
      // abort
    }    
  }

  // only show sidebar when path starts with /workspace
  $: showSidebar = $page.url.pathname.startsWith(`${base}/workspace`);
</script>

<svelte:head>
  <title>HazardWise</title>
</svelte:head>

<style>
  .sidebar { width: 250px; transition: width .2s ease; }
  .sidebar.collapsed { width: 70px; }
  .sidebar .label { display: inline-block; transition: opacity .2s ease, width .2s ease; white-space: nowrap; }
  .sidebar.collapsed .label { opacity: 0; width: 0; overflow: hidden; }
  main { transition: margin-left .2s ease; }
  .main-expanded { margin-left: 250px; }
  .main-collapsed { margin-left: 70px; }
  .logo-text { font-family: "Jost", sans-serif; color: #016FB8; }
</style>

<div class="d-flex">
  {#if showSidebar}
    <!-- Sidebar -->
    <div class="bg-light sidebar border-end vh-100 position-fixed {collapsed ? 'collapsed' : ''}">
      <div
        class="d-flex align-items-center gap-2 mb-4 p-3 logo-wrapper"
        on:click={toggleSidebar}
        style="cursor: pointer;"
      >
        <img
          src="{base}/hazardwise_icon.svg"
          alt="HazardWise Logo"
          style="width:40px; height:40px;"
        />
        <div class="logo-text fs-4 fw-bold label">HazardWise</div>
      </div>

      <ul class="nav nav-pills flex-column mt-3">
        <li class="nav-item">
          <a
            class="nav-link { $page.url.pathname === `${base}/workspace` ? 'active' : '' }"
            href="{base}/workspace"
          >
            🏠 <span class="label ms-2">Overview</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link { $page.url.pathname === `${base}/workspace/hazards` ? 'active' : '' }"
            href="{base}/workspace/hazards"
          >
            ⚠️ <span class="label ms-2">Hazards</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link { $page.url.pathname === `${base}/workspace/mitigations` ? 'active' : '' }"
            href="{base}/workspace/mitigations"
          >
            ⚙️ <span class="label ms-2">Manage Mitigations</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link { $page.url.pathname === `${base}/workspace/impacts` ? 'active' : '' }"
            href="{base}/workspace/impacts"
          >
            ⚡️ <span class="label ms-2">Manage Impacts</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link { $page.url.pathname === `${base}/workspace/project` ? 'active' : '' }"
            href="{base}/workspace/project"
          >
            📊 <span class="label ms-2">Project Details</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link { $page.url.pathname === `${base}/workspace/compliance` ? 'active' : '' }"
            href="{base}/workspace/compliance"
          >
            🛡️ <span class="label ms-2">Compliance</span>
          </a>
        </li>
        <li class="nav-item">
          <a
            class="nav-link { $page.url.pathname === `${base}/workspace/export` ? 'active' : '' }"
            href="{base}/workspace/export"
          >
            📤 <span class="label ms-2">Export Tools</span>
          </a>
        </li>
      <li class="nav-item">
      <button
        type="button"
        class="nav-link btn btn-link text-start w-100"
        on:click={handleStartNewProject}
      >
        ✨ <span class="label ms-2">Start New Project</span>
      </button>
    </li>
      </ul>
    </div>
  {/if}

  <!-- Main content: shift only when sidebar is shown -->
  <main
    class="py-4 px-3 flex-grow-1
      {showSidebar
         ? (collapsed ? 'main-collapsed' : 'main-expanded')
         : ''}"
  >
    <slot />
  </main>
</div>

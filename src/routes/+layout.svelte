<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../app.css';
  import { page } from '$app/stores';

  let collapsed = false;
  function toggleSidebar() {
    collapsed = !collapsed;
  }
</script>

<svelte:head>
  <title>HazardWise</title>
</svelte:head>

<style>
  .sidebar {
    width: 250px;
    transition: width 0.2s ease;
  }

  .sidebar.collapsed {
    width: 70px;
  }

  .sidebar .label {
    display: inline-block;
    transition: opacity 0.2s ease, width 0.2s ease;
    white-space: nowrap;
  }

  .sidebar.collapsed .label {
    opacity: 0;
    width: 0;
    overflow: hidden;
  }

  .sidebar .nav-link {
    white-space: nowrap;
  }

  main {
    transition: margin-left 0.2s ease;
  }

  .main-expanded {
    margin-left: 250px;
  }

  .main-collapsed {
    margin-left: 70px;
  }

  .logo-text {
    font-family: "Jost", sans-serif;
    font-optical-sizing: auto;
    font-style: normal;
    color: #016FB8;
  }
</style>


<div class="d-flex">
  <!-- Sidebar -->
  <div class="bg-light sidebar border-end vh-100 position-fixed {collapsed ? 'collapsed' : ''}">
    <div class="d-flex align-items-center gap-2 mb-4 p-3 logo-wrapper" on:click={toggleSidebar} style="cursor: pointer;">
      <img src="/hazardwise_icon.svg" alt="HazardWise Logo" style="width: 40px; height: 40px;" />
      <div class="logo-text fs-4 fw-bold label">HazardWise</div>
    </div>

    <ul class="nav nav-pills flex-column mt-3">
      <li class="nav-item">
        <a
          class="nav-link {($page.url.pathname === '/workspace') ? 'active' : ''}"
          href="/workspace"
        >
          🏠 <span class="label ms-2">Hazards</span>
        </a>
      </li>
      <li class="nav-item">
        <a
          class="nav-link {($page.url.pathname === '/about') ? 'active' : ''}"
          href="/about"
        >
          ℹ️ <span class="label ms-2">About</span>
        </a>
      </li>
    </ul>
  </div>

  <!-- Main content -->
  <main class="py-4 px-3 flex-grow-1 {collapsed ? 'main-collapsed' : 'main-expanded'}">
    <slot />
  </main>
</div>


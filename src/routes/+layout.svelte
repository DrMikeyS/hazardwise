<script lang="ts">
  import 'bootstrap/dist/css/bootstrap.min.css';
  import '../app.css';
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { startNewProject } from '$lib/navigation.js';

  let mobileMenuOpen = false;

  type MenuItem = {
    icon: string;
    label: string;
    href: string;
    exact?: boolean;
    match?: string[];
  };

  const menuSections: { heading: string; items: MenuItem[] }[] = [
    {
      heading: 'Workspace',
      items: [
        { icon: '🏠', label: 'Overview', href: '/workspace', exact: true },
        { icon: '📊', label: 'Project Details', href: '/workspace/project' }
      ]
    },
    {
      heading: 'Risk Register',
      items: [
        {
          icon: '⚠️',
          label: 'Hazards',
          href: '/workspace/hazards',
          match: ['/workspace/hazards', '/workspace/hazard']
        },
        { icon: '⚙️', label: 'Mitigations', href: '/workspace/mitigations' },
        { icon: '⚡️', label: 'Impacts', href: '/workspace/impacts' }
      ]
    },
    {
      heading: 'Documentation',
      items: [
        { icon: '📝', label: 'Case Report Inputs', href: '/workspace/case-report' },
        { icon: '🛡️', label: 'Compliance', href: '/workspace/compliance' },
        { icon: '📤', label: 'Export Tools', href: '/workspace/export' }
      ]
    }
  ];

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  function isItemActive(item: MenuItem) {
    const path = $page.url.pathname;

    if (item.exact) {
      return path === `${base}${item.href}`;
    }

    if (item.match?.length) {
      return item.match.some((prefix) => {
        const full = `${base}${prefix}`;
        return path === full || path.startsWith(`${full}/`);
      });
    }

    const fullHref = `${base}${item.href}`;
    return path === fullHref || path.startsWith(`${fullHref}/`);
  }

  function handleStartNewProject() {
    if (confirm('Really start new project? This will clear current data.')) {
      closeMobileMenu();
      startNewProject();
    }
  }

  $: showSidebar = $page.url.pathname.startsWith(`${base}/workspace`);

  $: if (!showSidebar) {
    mobileMenuOpen = false;
  }
</script>

<svelte:head>
  <title>HazardWise</title>
</svelte:head>

<style>
  .workspace-shell {
    min-height: 100vh;
  }

  .workspace-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1040;
    width: 280px;
    height: 100vh;
    background: #f8f9fa;
    border-right: 1px solid #dee2e6;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
    overflow-y: auto;
  }

  .workspace-sidebar.open {
    transform: translateX(0);
  }

  .sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .logo-wrap {
    display: flex;
    align-items: center;
    gap: 0.65rem;
  }

  .logo-text {
    font-family: 'Jost', sans-serif;
    color: #016fb8;
    font-size: 1.25rem;
    font-weight: 700;
  }

  .menu-heading {
    font-size: 0.73rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #6c757d;
    padding: 0 1rem;
    margin: 1rem 0 0.45rem;
  }

  .nav-item {
    padding: 0 0.6rem;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    border-radius: 0.55rem;
    color: #2f343a;
    padding: 0.5rem 0.65rem;
  }

  .nav-link:hover {
    background: #e9ecef;
  }

  .nav-link.active {
    background: #016fb8;
    color: #fff;
  }

  .menu-icon {
    width: 1.2rem;
    text-align: center;
    flex-shrink: 0;
  }

  .workspace-main {
    flex: 1;
    min-width: 0;
    width: 100%;
    padding: 1rem;
  }

  .mobile-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.9rem;
    padding-bottom: 0.6rem;
    border-bottom: 1px solid #e9ecef;
  }

  .mobile-overlay {
    border: 0;
    padding: 0;
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    z-index: 1030;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }

  .mobile-overlay.show {
    opacity: 1;
    pointer-events: auto;
  }

  @media (min-width: 992px) {
    .workspace-sidebar {
      transform: translateX(0);
    }

    .workspace-main.with-sidebar {
      margin-left: 280px;
      padding: 1.4rem;
    }

    .mobile-topbar,
    .mobile-overlay {
      display: none;
    }
  }
</style>

<div class="workspace-shell d-flex">
  {#if showSidebar}
    <aside
      id="workspace-menu"
      class="workspace-sidebar {mobileMenuOpen ? 'open' : ''}"
      aria-label="Main workspace menu"
    >
      <div class="sidebar-header">
        <div class="logo-wrap">
          <img src={base + '/hazardwise_icon.svg'} alt="HazardWise Logo" style="width:40px; height:40px;" />
          <span class="logo-text">HazardWise</span>
        </div>
      </div>

      {#each menuSections as section}
        <div class="menu-heading">{section.heading}</div>
        <ul class="nav flex-column">
          {#each section.items as item}
            <li class="nav-item">
              <a
                class="nav-link {isItemActive(item) ? 'active' : ''}"
                href={base + item.href}
                on:click={closeMobileMenu}
              >
                <span class="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </a>
            </li>
          {/each}
        </ul>
      {/each}

      <div class="mt-auto p-3 border-top">
        <button
          type="button"
          class="btn btn-outline-primary w-100"
          on:click={handleStartNewProject}
        >
          ✨ Start New Project
        </button>
      </div>
    </aside>

    <button
      type="button"
      class="mobile-overlay {mobileMenuOpen ? 'show' : ''}"
      on:click={closeMobileMenu}
      aria-label="Close navigation menu"
    ></button>
  {/if}

  <main class="workspace-main {showSidebar ? 'with-sidebar' : ''}">
    {#if showSidebar}
      <div class="mobile-topbar d-lg-none">
        <button
          type="button"
          class="btn btn-outline-secondary btn-sm"
          on:click={toggleMobileMenu}
          aria-expanded={mobileMenuOpen}
          aria-controls="workspace-menu"
        >
          ☰ Menu
        </button>
        <span class="fw-semibold">Workspace</span>
      </div>
    {/if}

    <slot />
  </main>
</div>

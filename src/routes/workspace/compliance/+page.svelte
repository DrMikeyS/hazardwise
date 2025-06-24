<script lang="ts">
  import { onMount } from 'svelte';
  import { browser }  from '$app/environment';
  import { project }  from '$lib/stores/project.js';

  /***********************
   * 1. BOILERPLATE: Bootstrap tooltips – browser only
   ************************/
  onMount(async () => {
    if (!browser) return;
    const Tooltip = (await import('bootstrap/js/dist/tooltip')).default;
    document
      .querySelectorAll('[data-bs-toggle="tooltip"]')
      .forEach(el => new Tooltip(el as HTMLElement));
  });

  /***********************
   * 2. COMPLIANCE DATA
   ************************/
  // List every checkbox id in one place (easier to iterate / add later)
  const CHECK_IDS = [
    'dtac-pack',
    'dtac-csc',
    'dtac-cso',
    'dtac-ceplus',
    'dtac-pen',
    'dtac-dspt',
    'gdpr',
    'mhra',
    'benefit-evidence',
    'economic-just'
  ];

  // A convenience derived store
  $: compliance = $project.compliance ?? {};

  // Make sure the object exists on first mount
  if (!$project.compliance) {
    project.update(p => ({ ...p, compliance: {} }));
  }

  /**
   * Toggle one checkbox in the project store
   */
  function toggle(id: string, checked: boolean) {
    project.update(p => ({
      ...p,
      compliance: { ...p.compliance, [id]: checked }
    }));
  }
</script>

<main class="container py-4">
  <h1 class="mb-4">Compliance Checklist</h1>

  <!-- ============  1. Minimum Essential  ================= -->
  <form>
    <div class="mb-5">
      <h2>1. Minimum Essential Requirements</h2>
      <p>
        Before signing a contract ask the supplier for each document below and sanity-check it yourself.
      </p>

      <!--========== DTAC Evidence Pack ==========-->
      <div class="form-check mb-2">
        <input
          class="form-check-input"
          type="checkbox"
          id="dtac-pack"
          checked={!!compliance['dtac-pack']}
          on:change={(e)=>toggle('dtac-pack', e.currentTarget.checked)}
        />
        <label class="form-check-label" for="dtac-pack">
          Digital Technology Assessment Criteria (DTAC) – complete evidence pack
          <span class="ms-1 text-info" role="button" data-bs-toggle="tooltip"
                title="DTAC is NHS England’s baseline ‘fitness-for-purpose’ checklist.">
            ℹ️
          </span>
        </label>
      </div>

      <!-- Sub-items of DTAC -->
      <div class="ps-4">
        {#each [
          {id:'dtac-csc',   label:'Clinical Safety Case & Hazard Log (DCB0129)',
            tip:'DCB0129 documents clinical risks and mitigations.'},
          {id:'dtac-cso',   label:'Named Clinical Safety Officer (CSO)',
            tip:'Registered clinician accountable for safety.'},
          {id:'dtac-ceplus',label:'Cyber Essentials Plus certificate',
            tip:'Independent audit of cyber security controls.'},
          {id:'dtac-pen',   label:'Pen-test report (CREST-accredited ideally)',
            tip:'Recent penetration test; look for fixes applied.'},
          {id:'dtac-dspt',  label:'Data Security & Protection Toolkit (DSPT) submission',
            tip:'“Standards Met” status for current year.'}
        ] as item}
          <div class="form-check">
            <input
              class="form-check-input"
              type="checkbox"
              id={item.id}
              checked={!!compliance[item.id]}
              on:change={(e)=>toggle(item.id, e.currentTarget.checked)}
            />
            <label class="form-check-label" for={item.id}>
              {item.label}
              <span class="ms-1 text-info" role="button" data-bs-toggle="tooltip" title={item.tip}>ℹ️</span>
            </label>
          </div>
        {/each}
      </div>

      <!-- GDPR Compliance -->
      <div class="form-check mt-3">
        <input class="form-check-input" type="checkbox" id="gdpr"
               checked={!!compliance['gdpr']}
               on:change={(e)=>toggle('gdpr', e.currentTarget.checked)} />
        <label class="form-check-label" for="gdpr">
          GDPR compliance & Data Processing Agreement
          <span class="ms-1 text-info" role="button" data-bs-toggle="tooltip"
                title="Detailed DPA plus UK-GDPR alignment.">ℹ️</span>
        </label>
      </div>

      <!-- MHRA -->
      <div class="form-check mt-2">
        <input class="form-check-input" type="checkbox" id="mhra"
               checked={!!compliance['mhra']}
               on:change={(e)=>toggle('mhra', e.currentTarget.checked)} />
        <label class="form-check-label" for="mhra">
          Medical Device classification (MHRA) <a href="https://assets.publishing.service.gov.uk/media/64a7d22d7a4c230013bba33c/Medical_device_stand-alone_software_including_apps__including_IVDMDs_.pdf" target="_blank">guidance</a>
          <span class="ms-1 text-info" role="button" data-bs-toggle="tooltip"
                title="Ask for Class I certificate (or Class IIa for decision-support tools).">ℹ️</span>
        </label>
      </div>
    </div>

    <!-- ============  2. Desirable Evidence  ================= -->
    <div class="mb-4">
      <h2>2. Desirable Vendor Evidence</h2>

      {#each [
        {id:'benefit-evidence', label:'Real-world benefit evidence in your setting',
          tip:'Studies or metrics showing efficiency or patient-care gains.'},
        {id:'economic-just',    label:'Economic justification & workforce impact',
          tip:'Cost-benefit analysis and staffing impact summary.'}
      ] as item}
        <div class="form-check">
          <input class="form-check-input" type="checkbox" id={item.id}
                 checked={!!compliance[item.id]}
                 on:change={(e)=>toggle(item.id, e.currentTarget.checked)} />
          <label class="form-check-label" for={item.id}>
            {item.label}
            <span class="ms-1 text-info" role="button" data-bs-toggle="tooltip" title={item.tip}>ℹ️</span>
          </label>
        </div>
      {/each}
    </div>
    <!-- Vendor compliance sign-off -->

  <input
    class="form-check-input"
    type="checkbox"
    id="vendor-compliance-reviewed"
    checked={!!compliance['vendorComplianceReviewed']}
    on:change={(e) => toggle('vendorComplianceReviewed', e.currentTarget.checked)}
  />
  <label class="form-check-label" for="vendor-compliance-reviewed">
    I confirm the vendor compliance review is complete and I am happy to sign off.
  </label>
  </form>
</main>

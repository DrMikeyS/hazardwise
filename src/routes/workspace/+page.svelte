<script>
  import {base} from '$app/paths';
  export let progress={
      clinicalSafetyOfficer: true,
      projectDetails: false,
      hazardLogRiskAssessment: false,
      vendorComplianceReview: true,
      alternativeOptionsAnalysis: false
    }

  const rows = [
    {
      key: 'clinicalSafetyOfficer',
      title: 'Named Clinical Safety Officer',
      description: 'The appointed individual responsible for overseeing and ensuring clinical safety compliance throughout the project lifecycle.',
      link: base+'/workspace/project'
    },
    {
      key: 'projectDetails',
      title: 'Project Details Described',
      description: 'A comprehensive description of the project scope, objectives, and clinical context as per DCB0160 requirements.',
      link: base+'/workspace/project'
    },
    {
      key: 'hazardLogRiskAssessment',
      title: 'Hazard Log and Risk Assessment',
      description: 'Documentation of identified hazards, their risk assessments, and mitigation plans in line with risk management processes.',
      link: base+'/workspace/hazards'
    },
    {
      key: 'hazardLogRiskAssessment',
      title: 'Mitigations In Place',
      description: 'Implementation of risk mitigations as identified in the hazard log, ensuring clinical safety measures are actively managed.',
      link: base+'/workspace/mitigations'
    },
    {
      key: 'vendorComplianceReview',
      title: 'Review of Vendor Compliance',
      description: 'Assessment of vendor adherence to regulatory standards and contractual obligations relevant to clinical safety.',
      link: base+'/workspace/compliance'
    },
    {
      key: 'alternativeOptionsAnalysis',
      title: 'Consideration of Risks/Benefits of Alternative Options',
      description: 'Evaluation of potential alternatives, including risk-benefit analysis to justify selected solutions.',
      link: base+'/workspace/project'
    }
  ];
</script>

<main class="container mt-4">
  <h1 class="mb-4">Overview</h1>
    <h3>DCB0160 Clinical Safety Case Progress</h3>
  <table class="table table-bordered">
    <thead class="thead-light">
      <tr>
        <th scope="col">Status</th>
        <th scope="col">Details</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row}
        <tr>
          <td class="align-middle text-center">
            {progress[row.key] ? '✅' : '❌'}
          </td>
          <td>
            <h3 class="h5 mb-1">
              <a href={row.link} class="text-decoration-none">{row.title}</a>
            </h3>
            <p class="mb-0 text-muted">{row.description}</p>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</main>

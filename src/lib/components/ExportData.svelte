<script lang="ts">
  import { get } from 'svelte/store';
  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { impacts } from '$lib/stores/impacts.js';
  import { HazardUtils } from '$lib/utils/hazard';
  import { assessHazardImpact } from '$lib/utils/dcbRisk';
  import { downloadDocx, type DocxContentBlock, type DocxHighlight } from '$lib/utils/docxExport';
  import { base } from '$app/paths';

  type HazardImpact = {
    impactID: string;
    likelihood?: string;
  };

  type Hazard = {
    id: string;
    description?: string;
    causeIds?: string[];
    mitigationIds?: string[];
    hazardImpacts?: HazardImpact[];
  };

  type Cause = {
    id: string;
    description?: string;
    mitigationIds?: string[];
  };

  type Mitigation = {
    id: string;
    description?: string;
  };

  type Impact = {
    id: string;
    description?: string;
    severity?: string;
  };

  type CaseReportSections = {
    riskAssessmentAndMitigations?: string;
    alternatives?: string;
    implementationRecommendedByCSO?: boolean;
    conclusionNarrative?: string;
    conclusion?: string;
  };

  type ProjectData = {
    title?: string;
    description?: string;
    safetyOfficer?: string;
    hazards?: Hazard[];
    compliance?: {
      vendorComplianceReviewed?: boolean;
    };
    caseReportSections?: CaseReportSections;
    alternatives?: string;
  };

  function sanitizeFileName(value: string): string {
    const cleaned = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    return cleaned || 'hazardwise';
  }

  function getExportPrefix(): string {
    return sanitizeFileName(get(project).title || 'hazardwise');
  }

  function getProjectTitle(): string {
    return (get(project).title || 'Untitled Project').trim();
  }

  function mapById<T extends { id: string }>(items: T[]): Map<string, T> {
    return new Map(items.map((item) => [item.id, item]));
  }

  function getCaseReportSectionValue(projectData: ProjectData, key: keyof CaseReportSections): string {
    const caseReportSections = projectData.caseReportSections || {};
    const value = caseReportSections[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
    return '';
  }

  function appendMultilineText(
    blocks: DocxContentBlock[],
    value: string,
    fallbackText?: string
  ): void {
    if (value.trim()) {
      for (const line of value.split(/\r?\n/)) {
        blocks.push({ text: line, style: 'Normal' });
      }
      return;
    }

    if (fallbackText) {
      blocks.push({ text: fallbackText, style: 'Normal' });
    }
  }

  function getRiskHighlight(rating: string): DocxHighlight | undefined {
    if (!rating) return undefined;
    return rating === 'Acceptable' ? 'green' : 'yellow';
  }

  function getAllMitigationIdsForHazard(hazard: Hazard, causeMap: Map<string, Cause>): string[] {
    const hazardMitigationIds = hazard.mitigationIds || [];
    const causeMitigationIds = (hazard.causeIds || []).flatMap(
      (causeId) => causeMap.get(causeId)?.mitigationIds || []
    );
    return Array.from(new Set([...hazardMitigationIds, ...causeMitigationIds]));
  }

  function buildHazardLogParagraphs(): DocxContentBlock[] {
    const projectData = get(project);
    const hazardItems = (projectData.hazards || []) as Hazard[];
    const causeItems = get(causes) as Cause[];
    const mitigationItems = get(mitigations) as Mitigation[];
    const impactItems = get(impacts) as Impact[];

    const causeMap = mapById(causeItems);
    const mitigationMap = mapById(mitigationItems);
    const impactMap = mapById(impactItems);

    const paragraphs: DocxContentBlock[] = [
      { text: `Hazard Log - ${getProjectTitle()}`, bold: true },
      { text: `Generated: ${new Date().toLocaleString()}` },
      { text: '' }
    ];

    if (!hazardItems.length) {
      paragraphs.push({ text: 'No hazards available.' });
      return paragraphs;
    }

    for (const hazard of hazardItems) {
      paragraphs.push({
        text: `${hazard.id}: ${hazard.description || 'No description'}`,
        bold: true
      });

      const highestRisk = HazardUtils.getHighestRisk(hazard).rating || 'Not assessed';
      paragraphs.push({ text: `Highest Risk: ${highestRisk}` });

      const hazardCauses = (hazard.causeIds || [])
        .map((causeId) => causeMap.get(causeId))
        .filter(Boolean) as Cause[];

      if (hazardCauses.length) {
        paragraphs.push({ text: 'Causes:', bold: true });
        for (const cause of hazardCauses) {
          paragraphs.push({ text: `- ${cause.id}: ${cause.description || 'No description'}` });
        }
      } else {
        paragraphs.push({ text: 'Causes: None' });
      }

      const relatedMitigationIds = getAllMitigationIdsForHazard(hazard, causeMap);
      if (relatedMitigationIds.length) {
        paragraphs.push({ text: 'Related Mitigations:', bold: true });
        for (const mitigationId of relatedMitigationIds) {
          const mitigation = mitigationMap.get(mitigationId);
          if (mitigation) {
            paragraphs.push({
              text: `- ${mitigation.id}: ${mitigation.description || 'No description'}`
            });
          }
        }
      } else {
        paragraphs.push({ text: 'Related Mitigations: None' });
      }

      const hazardImpacts = (hazard.hazardImpacts || [])
        .map((hazardImpact) => {
          const impact = impactMap.get(hazardImpact.impactID);
          if (!impact) return null;
          const risk = assessHazardImpact(hazardImpact);
          return { impact, hazardImpact, risk };
        })
        .filter(Boolean) as {
        impact: Impact;
        hazardImpact: HazardImpact;
        risk: ReturnType<typeof assessHazardImpact>;
      }[];

      if (hazardImpacts.length) {
        paragraphs.push({ text: 'Impacts:', bold: true });
        for (const { impact, hazardImpact, risk } of hazardImpacts) {
          paragraphs.push({
            text: `- ${impact.id}: ${impact.description || 'No description'} | Severity: ${impact.severity || 'Not set'} | Likelihood: ${hazardImpact.likelihood || 'Not set'} | Risk: ${risk?.rating || 'Not assessed'}`
          });
        }
      } else {
        paragraphs.push({ text: 'Impacts: None' });
      }

      paragraphs.push({ text: '' });
    }

    return paragraphs;
  }

  function buildMitigationListParagraphs(): DocxContentBlock[] {
    const mitigationItems = get(mitigations) as Mitigation[];

    const paragraphs: DocxContentBlock[] = [
      { text: `Mitigation List - ${getProjectTitle()}`, bold: true },
      { text: `Generated: ${new Date().toLocaleString()}` },
      { text: '' }
    ];

    if (!mitigationItems.length) {
      paragraphs.push({ text: 'No mitigations available.' });
      return paragraphs;
    }

    for (const mitigation of mitigationItems) {
      paragraphs.push({
        text: `${mitigation.id}: ${mitigation.description || 'No description'}`,
        bold: true
      });
      paragraphs.push({ text: '' });
    }

    return paragraphs;
  }

  function buildClinicalSafetyCaseReportParagraphs(): DocxContentBlock[] {
    const projectData = get(project) as ProjectData;
    const hazardItems = (projectData.hazards || []) as Hazard[];
    const section6Text = getCaseReportSectionValue(projectData, 'riskAssessmentAndMitigations');
    const section7Text =
      getCaseReportSectionValue(projectData, 'alternatives') ||
      (projectData.alternatives?.trim() || '');
    const includeSection7 = Boolean(section7Text.trim());
    const conclusionNumber = includeSection7 ? '8' : '7';
    const section8Recommendation = Boolean(
      projectData.caseReportSections?.implementationRecommendedByCSO
    );
    const section8NarrativeText =
      getCaseReportSectionValue(projectData, 'conclusionNarrative') ||
      getCaseReportSectionValue(projectData, 'conclusion');

    const blocks: DocxContentBlock[] = [
      { text: `Clinical Safety Case Report for ${getProjectTitle()}`, style: 'Title' },
      { text: `Generated: ${new Date().toLocaleString()}`, align: 'center' },
      {
        text: 'TEMPLATE: Review and amend this generated report before final sign-off.',
        align: 'center',
        highlight: 'yellow'
      },
      { text: '' },

      { text: '1. Introduction', style: 'Heading1' },
      {
        text: 'This report outlines the clinical safety activities and risk-management outputs.',
        style: 'Normal'
      },
      { text: '' },

      { text: '2. Purpose', style: 'Heading1' },
      { text: 'Report on clinical hazards.', bulletLevel: 0, style: 'Normal' },
      {
        text: 'Summarise the current risk profile and any unresolved areas.',
        bulletLevel: 0,
        style: 'Normal'
      },
      { text: '' },

      { text: '3. Description of the proposed new system', style: 'Heading1' }
    ];

    appendMultilineText(
      blocks,
      projectData.description?.trim() || '',
      'Not completed yet. Add a system description in Project Details.'
    );
    blocks.push({ text: '' });

    blocks.push({ text: '4. Clinical Safety Governance', style: 'Heading1' });
    blocks.push({
      text: `Clinical Safety Officer: ${projectData.safetyOfficer?.trim() || 'Not completed yet.'}`,
      style: 'Normal'
    });
    blocks.push({
      text: `Vendor compliance review checked: ${
        projectData.compliance?.vendorComplianceReviewed ? 'Checked' : 'Not checked'
      }`,
      style: 'Normal'
    });
    blocks.push({ text: '' });

    blocks.push({ text: '5. Hazard Identification', style: 'Heading1' });
    blocks.push({
      text: 'A hazard is any potential source of harm associated with use of the system.',
      style: 'Normal'
    });
    blocks.push({
      text: 'Residual risk is the risk level remaining after planned mitigations are applied.',
      style: 'Normal'
    });
    blocks.push({
      text: 'NHS guidance: https://digital.nhs.uk/services/clinical-safety/documentation',
      style: 'Normal'
    });
    const hazardRows =
      hazardItems.length > 0
        ? hazardItems.map((hazard) => {
            const highestRisk = HazardUtils.getHighestRisk(hazard);
            const residualRisk = highestRisk.rating
              ? `${highestRisk.score} - ${highestRisk.rating}`
              : 'Not yet assessed';
            return [
              { text: hazard.description || `Hazard ${hazard.id}` },
              {
                text: residualRisk,
                highlight: getRiskHighlight(highestRisk.rating)
              }
            ];
          })
        : [
            [
              { text: 'Not completed yet. No hazards are currently recorded in this case.' },
              { text: 'Not yet assessed' }
            ]
          ];

    blocks.push({
      type: 'table',
      headers: [
        { text: 'Hazard', bold: true },
        { text: 'Level of residual risk after mitigations', bold: true }
      ],
      rows: hazardRows,
      columnWidths: [4680, 5175]
    });
    blocks.push({ text: '' });

    blocks.push({ text: '6. Risk Assessment & Mitigations', style: 'Heading1' });
    appendMultilineText(
      blocks,
      section6Text,
      'Not completed yet. Add Section 6 content in Case Report Inputs.'
    );
    blocks.push({ text: '' });

    if (includeSection7) {
      blocks.push({ text: '7. Alternative options', style: 'Heading1' });
      appendMultilineText(blocks, section7Text);
      blocks.push({ text: '' });
    }

    blocks.push({ text: `${conclusionNumber}. Clinical Safety Case Report Conclusion`, style: 'Heading1' });
    blocks.push({
      text:
        'Recommended to be implemented by the Clinical Safety Officer (subject to mitigations being enacted): ' +
        (section8Recommendation ? 'Yes' : 'No / not confirmed'),
      bold: true
    });
    appendMultilineText(
      blocks,
      section8NarrativeText,
      !section8Recommendation
        ? 'Not completed yet. Add Section 8 content in Case Report Inputs.'
        : undefined
    );

    return blocks;
  }

  /**
   * Gather all store data and trigger a JSON download.
   */
  function exportJSON() {
    const data = {
      project:     get(project),
      causes:      get(causes),
      mitigations: get(mitigations),
      impacts:     get(impacts)
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = `${getExportPrefix()}-hazardwise-data.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportHazardLogDocx() {
    downloadDocx(
      `${getExportPrefix()}-hazard-log.docx`,
      `${getProjectTitle()} Hazard Log`,
      buildHazardLogParagraphs()
    );
  }

  function exportMitigationListDocx() {
    downloadDocx(
      `${getExportPrefix()}-mitigation-list.docx`,
      `${getProjectTitle()} Mitigation List`,
      buildMitigationListParagraphs()
    );
  }

  function exportClinicalSafetyCaseReportDocx() {
    downloadDocx(
      `${getExportPrefix()}-clinical-safety-case-report.docx`,
      `${getProjectTitle()} Clinical Safety Case Report`,
      buildClinicalSafetyCaseReportParagraphs()
    );
  }

</script>

<section class="mb-5">
  <h2 class="h5 mb-3">Project Data</h2>
  <div class="row g-3">
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h3 class="h6 card-title">Project Data (.json)</h3>
          <p class="small text-muted flex-grow-1 mb-3">
            Full project snapshot for backup, audit trail, or import into another workspace.
          </p>
          <button class="btn btn-primary w-100" on:click={exportJSON}>
            Download JSON
          </button>
        </div>
      </div>
    </div>
  </div>
</section>

<section>
  <h2 class="h5 mb-3">Reports</h2>
  <div class="row g-3">
    <div class="col-12 col-md-6 col-xl-4">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h3 class="h6 card-title">Hazard Log</h3>
          <p class="small text-muted flex-grow-1 mb-3">
            Full hazard summary with causes, impacts, mitigations, and risk ratings.
          </p>
          <div class="d-grid gap-2">
            <a
              class="btn btn-outline-secondary"
              href="{base}/printableExport"
              target="_blank"
              rel="noreferrer"
            >
              Open Printable / PDF
            </a>
            <button class="btn btn-outline-secondary" on:click={exportHazardLogDocx}>
              Download DOCX
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-md-6 col-xl-4">
      <div class="card h-100">
        <div class="card-body d-flex flex-column">
          <h3 class="h6 card-title">Mitigation List</h3>
          <p class="small text-muted flex-grow-1 mb-3">
            Consolidated list of mitigations currently captured in the case.
          </p>
          <div class="d-grid gap-2">
            <a
              class="btn btn-outline-secondary"
              href="{base}/printableMitigations"
              target="_blank"
              rel="noreferrer"
            >
              Open Printable / PDF
            </a>
            <button class="btn btn-outline-secondary" on:click={exportMitigationListDocx}>
              Download DOCX
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="col-12 col-md-6 col-xl-4">
      <div class="card h-100 border-primary-subtle">
        <div class="card-body d-flex flex-column">
          <h3 class="h6 card-title">Clinical Safety Case Report</h3>
          <p class="small text-muted flex-grow-1 mb-3">
            Structured DCB0160-style report including governance, hazards, and manual narrative sections.
          </p>
          <div class="d-grid gap-2">
            <a
              class="btn btn-primary"
              href="{base}/printableClinicalSafetyCase"
              target="_blank"
              rel="noreferrer"
            >
              Open Printable / PDF
            </a>
            <button class="btn btn-outline-primary" on:click={exportClinicalSafetyCaseReportDocx}>
              Download DOCX
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

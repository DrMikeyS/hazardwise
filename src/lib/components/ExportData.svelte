<script lang="ts">
  import { get } from 'svelte/store';
  import { project } from '$lib/stores/project.js';
  import { causes } from '$lib/stores/causes.js';
  import { mitigations } from '$lib/stores/mitigations.js';
  import { impacts } from '$lib/stores/impacts.js';
  import { HazardUtils } from '$lib/utils/hazard';
  import { assessHazardImpact } from '$lib/utils/dcbRisk';
  import { downloadDocx, type DocxParagraph } from '$lib/utils/docxExport';
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

  function getAllMitigationIdsForHazard(hazard: Hazard, causeMap: Map<string, Cause>): string[] {
    const hazardMitigationIds = hazard.mitigationIds || [];
    const causeMitigationIds = (hazard.causeIds || []).flatMap(
      (causeId) => causeMap.get(causeId)?.mitigationIds || []
    );
    return Array.from(new Set([...hazardMitigationIds, ...causeMitigationIds]));
  }

  function buildHazardLogParagraphs(): DocxParagraph[] {
    const projectData = get(project);
    const hazardItems = (projectData.hazards || []) as Hazard[];
    const causeItems = get(causes) as Cause[];
    const mitigationItems = get(mitigations) as Mitigation[];
    const impactItems = get(impacts) as Impact[];

    const causeMap = mapById(causeItems);
    const mitigationMap = mapById(mitigationItems);
    const impactMap = mapById(impactItems);

    const paragraphs: DocxParagraph[] = [
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

  function buildMitigationListParagraphs(): DocxParagraph[] {
    const mitigationItems = get(mitigations) as Mitigation[];

    const paragraphs: DocxParagraph[] = [
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

  function openPrintableClinicalSafetyCase() {
    window.open(`${base}/printableClinicalSafetyCase`, '_blank', 'noopener,noreferrer');
  }
</script>

<div class="my-4">
  <div class="d-flex flex-wrap gap-2 mb-3">
    <button class="btn btn-outline-primary" on:click={exportJSON}>
      Export Data to JSON
    </button>
    <button class="btn btn-outline-secondary" on:click={exportHazardLogDocx}>
      Export Hazard Log (.docx)
    </button>
    <button class="btn btn-outline-secondary" on:click={exportMitigationListDocx}>
      Export Mitigation List (.docx)
    </button>
    <button class="btn btn-outline-primary" on:click={openPrintableClinicalSafetyCase}>
      Clinical Safety Case Report (Printable / PDF)
    </button>
  </div>
</div>

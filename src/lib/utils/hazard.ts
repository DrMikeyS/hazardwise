// src/lib/utils/hazard.ts
import { get } from 'svelte/store';
import { project } from '$lib/stores/project.js';
import { causes } from '$lib/stores/causes.js';
import { mitigations } from '$lib/stores/mitigations.js';
import { impacts } from '$lib/stores/impacts.js';
import { DCBRisk } from './dcbRisk';

export class HazardUtils {
  /** 
   * Generate the next numeric ID = (max existing)+1 
   * Assumes IDs are parseable as integers. 
   */
  static generateNewId<T extends { id: string }>(items: T[]): string {
    const nums = items
      .map(i => parseInt(i.id, 10))
      .filter(n => !isNaN(n));
    return String((nums.length ? Math.max(...nums) : 0) + 1);
  }

  /** 
   * If the current hazard isn't in the store yet, create it. 
   * Returns the new or existing ID.
   */
  static saveNewHazard(description: string) {
      const proj = get(project);
      const newId = this.generateNewId(proj.hazards || []);

      // create and append
      const newHazard = {
        id: newId,
        description,
        causeIds: [],
        mitigationIds: [],
        impactIds: []
      };
      project.update(p => ({
  ...p,
  hazards: [...(p.hazards ?? []), newHazard]
}));

      // set local state so further edits see it
      return {
        id: newId,
        hazardObj: newHazard    
      }
  }

  /** Trim out any causes no longer referenced by any hazard */
  static removeUnusedCauses() {
    const proj = get(project);
    const used = new Set(proj.hazards.flatMap(h => h.causeIds || []));
    causes.update(all => all.filter(c => used.has(c.id)));
  }

  /** Similarly for mitigations */
  static removeUnusedMitigations() {
    const proj = get(project);
    const used = new Set([
      ...proj.hazards.flatMap(h => h.mitigationIds || []),
      ...proj.hazards.flatMap(h => h.causeIds || [])
                   .flatMap(cid =>
                     get(causes).find(c=>c.id===cid)?.mitigationIds||[]
                   )
    ]);
    mitigations.update(all => all.filter(m => used.has(m.id)));
  }

  /** And for impacts */
  static removeUnusedImpacts() {
    const proj = get(project);
    const used = new Set(proj.hazards.flatMap(h => h.impactIds || []));
    impacts.update(all => all.filter(i => used.has(i.id)));
  }

  static removeImpact(hazardID:string,impactID:string){
      project.update(proj => ({
            ...proj,
            hazards: proj.hazards.map(h =>
            h.id === hazardID
                ? {
                    ...h,
                    impactIds: (h.impactIds || []).filter(i => i !== impactID)
                }
                : h
            )
        }));

        const updated = get(project).hazards.find(h => h.id === hazardID);
        return updated;
  }

    static removeCause(hazardID:string,causeID:string){
    project.update(proj => ({
      ...proj,
      hazards: proj.hazards.map(h =>
        h.id === hazardID
          ? {
              ...h,
              causeIds: (h.causeIds || []).filter(c => c !== causeID)
            }
          : h
      )
    }));

        this.removeUnusedCauses();
        const updated = get(project).hazards.find(h => h.id === hazardID);
        return updated;
  }

  static removeHazardMitigation(hazardID:string,mitigationID:string){
  project.update(proj => ({
    ...proj,
    hazards: proj.hazards.map(h =>
      h.id === hazardID
        ? {
            ...h,
            mitigationIds: (h.mitigationIds || []).filter(m => m !== mitigationID)
          }
        : h
    )
  }));

        const updated = get(project).hazards.find(h => h.id === hazardID);
        return updated;
}

/**
   * Compute the highest risk rating among hazard impacts.
   * Skips entries without assigned likelihood.
   */
  static getHighestRisk(hazard: any) {
    const allImpacts = get(impacts);
    const entries = hazard.hazardImpacts || [];

    const levelMap: Record<string, number> = {
      'Minor': 1,
      'Significant': 2,
      'Considerable': 3,
      'Major': 4,
      'Catastrophic': 5,
      'Rare': 1,
      'Unlikely': 2,
      'Possible': 3,
      'Likely': 4,
      'Almost Certain': 5
    };

    const assessed = entries
      .map((e: any) => {
        const { impactID, likelihood } = e;
        if (!likelihood) return null;
        const core = allImpacts.find(i => i.id === impactID);
        if (!core || !core.severity) return null;

        const sevNum = levelMap[core.severity];
        const likNum = levelMap[likelihood];
        if (!sevNum || !likNum) return null;

        const { score, rating } = DCBRisk.assess(likNum, sevNum);
        return { score, rating };
      })
      .filter((x): x is { score: number; rating: string } => !!x);

    if (!assessed.length) {
      return { score: 0, rating: '', color: '' };
    }

    const top = assessed.reduce((a, b) => (b.score > a.score ? b : a));

    const colorMap: Record<string, string> = {
      'Acceptable': '#28a745',
      'Undesirable': '#ffc107',
      'Unacceptable Without Further Mitigation': '#dc3545',
      'Unacceptable': '#dc3545'
    };

    return {
      score: top.score,
      rating: top.rating,
      color: colorMap[top.rating] ?? '#6c757d'
    };
  }


}

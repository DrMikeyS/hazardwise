// src/lib/utils/dcbRisk.ts
import { get } from 'svelte/store';
import { impacts } from '$lib/stores/impacts.js';

export interface RiskResult {
    score: number;
  rating: string;
  definition: string;
}

export class DCBRisk {
  /** Risk‐rating matrix: rows = likelihood 1–5 (VL→VH), cols = severity 1–5 (Minor→Catastrophic) */
  private static matrix: number[][] = [
    /* VL (1) */ [1, 1, 2, 2, 3],
    /* L  (2) */ [1, 2, 2, 3, 4],
    /* M  (3) */ [2, 2, 3, 3, 4],
    /* H  (4) */ [2, 3, 3, 4, 5],
    /* VH (5) */ [3, 4, 4, 5, 5],
  ];

  /** Human‐readable definitions for each rating (1–5) */
  private static ratings: Record<number, string> = {
    1: 'Acceptable',
    2: 'Acceptable',
    3: 'Undesirable',
    4: 'Unacceptable Without Further Mitigation',
    5: 'Unacceptable',
  };

  /** Human‐readable definitions for each rating (1–5) */
  private static definitions: Record<number, string> = {
    1: 'Acceptable, no further action required.',
    2: 'Acceptable where cost of further reduction outweighs benefits gained.',
    3: 'Undesirable level of risk: attempts should be made to eliminate or control to reduce risk to an acceptable level; shall only be acceptable when further risk reduction is impractical.',
    4: 'Mandatory elimination or control to reduce risk to an acceptable level.',
    5: 'Unacceptable level of risk.',
  };

  /**
   * Compute a DCB0160 clinical risk.
   *
   * @param likelihood  – integer 1 (Very Low) to 5 (Very High)
   * @param severity    – integer 1 (Minor) to 5 (Catastrophic)
   * @returns rating & definition
   */
  static assess(likelihood: number, severity: number): RiskResult {
    if (
      !Number.isInteger(likelihood) ||
      !Number.isInteger(severity) ||
      likelihood < 1 || likelihood > 5 ||
      severity < 1 || severity > 5
    ) {
      throw new Error('Likelihood and severity must be integers from 1 to 5.');
    }

    const score = DCBRisk.matrix[likelihood - 1][severity - 1];
    const rating = DCBRisk.ratings[score];
    const definition = DCBRisk.definitions[score];

    return { score, rating, definition };
  }
}

  /**
 * Given a hazardImpact entry, compute its RiskResult using DCBRisk.
 * Returns null if likelihood or severity is not assigned or invalid.
 */ 
export function assessHazardImpact(
  hi: { impactID: string; likelihood?: string }
): RiskResult | null {
  // Map labels to numeric levels
  const levels: Record<string, number> = {
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

  const { impactID, likelihood } = hi;
  if (!likelihood) return null;

  // Lookup core impact for severity
  const core = get(impacts).find(i => i.id === impactID);
  if (!core || !core.severity) return null;

  const likNum = levels[likelihood];
  const sevNum = levels[core.severity];
  if (!likNum || !sevNum) return null;

  return DCBRisk.assess(likNum, sevNum);
}


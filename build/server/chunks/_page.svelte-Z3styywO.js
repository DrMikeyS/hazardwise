import { p as push, i as ensure_array_like, b as attr_class, f as attr, n as clsx, a as pop } from './index-C_pFhzh6.js';
import './client2-DyjX8TFl.js';
import 'js-cookie';
import './client-DbkKmYNh.js';
import { N as escape_html } from './exports-D0r3D1wz.js';

class DCBRisk {
  /** Risk‐rating matrix: rows = likelihood 1–5 (VL→VH), cols = severity 1–5 (Minor→Catastrophic) */
  static matrix = [
    /* VL (1) */
    [1, 1, 2, 2, 3],
    /* L  (2) */
    [1, 2, 2, 3, 4],
    /* M  (3) */
    [2, 2, 3, 3, 4],
    /* H  (4) */
    [2, 3, 3, 4, 5],
    /* VH (5) */
    [3, 4, 4, 5, 5]
  ];
  /** Human‐readable definitions for each rating (1–5) */
  static ratings = {
    1: "Acceptable",
    2: "Acceptable",
    3: "Undesirable",
    4: "Unacceptable Without Further Mitigation",
    5: "Unacceptable"
  };
  /** Human‐readable definitions for each rating (1–5) */
  static definitions = {
    1: "Acceptable, no further action required.",
    2: "Acceptable where cost of further reduction outweighs benefits gained.",
    3: "Undesirable level of risk: attempts should be made to eliminate or control to reduce risk to an acceptable level; shall only be acceptable when further risk reduction is impractical.",
    4: "Mandatory elimination or control to reduce risk to an acceptable level.",
    5: "Unacceptable level of risk."
  };
  /**
   * Compute a DCB0160 clinical risk.
   *
   * @param likelihood  – integer 1 (Very Low) to 5 (Very High)
   * @param severity    – integer 1 (Minor) to 5 (Catastrophic)
   * @returns rating & definition
   */
  static assess(likelihood, severity) {
    if (!Number.isInteger(likelihood) || !Number.isInteger(severity) || likelihood < 1 || likelihood > 5 || severity < 1 || severity > 5) {
      throw new Error("Likelihood and severity must be integers from 1 to 5.");
    }
    const score = DCBRisk.matrix[likelihood - 1][severity - 1];
    const rating = DCBRisk.ratings[score];
    const definition = DCBRisk.definitions[score];
    return { score, rating, definition };
  }
}
function _page($$payload, $$props) {
  push();
  let rawScore, riskResult;
  let description = "";
  let severity = "";
  let likelihood = "";
  const severityOptions = [
    {
      value: "Catastrophic",
      label: "Catastrophic",
      description: "Death or permanent major harm",
      class: "table-danger"
    },
    {
      value: "Major",
      label: "Major",
      description: "Temporary major harm or permanent minor harm",
      class: "table-warning"
    },
    {
      value: "Moderate",
      label: "Moderate",
      description: "Short-term harm requiring intervention",
      class: "table-info"
    },
    {
      value: "Minor",
      label: "Minor",
      description: "Minimal harm, may require monitoring",
      class: ""
    },
    {
      value: "Negligible",
      label: "Negligible",
      description: "No significant harm",
      class: "table-secondary text-white"
    }
  ];
  const likelihoodOptions = [
    {
      value: "Almost Certain",
      label: "Almost Certain",
      description: "Expected to occur frequently",
      class: "table-danger"
    },
    {
      value: "Likely",
      label: "Likely",
      description: "Will probably occur occasionally",
      class: "table-warning"
    },
    {
      value: "Possible",
      label: "Possible",
      description: "Could occur but uncommon",
      class: "table-info"
    },
    {
      value: "Unlikely",
      label: "Unlikely",
      description: "Rare but possible",
      class: ""
    },
    {
      value: "Rare",
      label: "Rare",
      description: "Exceptional circumstances only",
      class: "table-secondary text-white"
    }
  ];
  const riskBadgeClasses = {
    1: "bg-success text-white",
    2: "bg-info text-dark",
    3: "bg-warning text-dark",
    4: "bg-danger text-white",
    5: "bg-danger text-white"
  };
  const levels = {
    "Catastrophic": 5,
    "Major": 4,
    "Moderate": 3,
    "Minor": 2,
    "Negligible": 1,
    "Almost Certain": 5,
    "Likely": 4,
    "Possible": 3,
    "Unlikely": 2,
    "Rare": 1
  };
  rawScore = (levels[severity] || 0) * (levels[likelihood] || 0);
  riskResult = levels[severity] && levels[likelihood] ? DCBRisk.assess(levels[likelihood], levels[severity]) : null;
  console.log("Risk assessment:", riskResult, rawScore);
  const each_array = ensure_array_like(severityOptions);
  const each_array_1 = ensure_array_like(likelihoodOptions);
  $$payload.out += `<main class="container py-4"><button class="btn btn-link mb-3">← Back to Hazard</button> <h1 class="mb-4">${escape_html("Add Impact")}</h1> <div class="mb-3"><label for="impactDescription" class="form-label">Impact Description</label> <textarea id="impactDescription" class="form-control" rows="3" placeholder="e.g. Incorrect clinical advice leads to unsafe prescription">`;
  const $$body = escape_html(description);
  if ($$body) {
    $$payload.out += `${$$body}`;
  }
  $$payload.out += `</textarea></div> <h5 class="mt-4">Severity</h5> <table class="table table-bordered align-middle"><tbody><!--[-->`;
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let option = each_array[$$index];
    $$payload.out += `<tr${attr_class(clsx(option.class))}><td class="text-nowrap"><input type="radio" name="severity"${attr("value", option.value)}${attr("checked", severity === option.value, true)} class="form-check-input me-2"/> <strong>${escape_html(option.label)}</strong></td><td>${escape_html(option.description)}</td></tr>`;
  }
  $$payload.out += `<!--]--></tbody></table> <h5 class="mt-4">Likelihood</h5> <table class="table table-bordered align-middle"><tbody><!--[-->`;
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let option = each_array_1[$$index_1];
    $$payload.out += `<tr${attr_class(clsx(option.class))}><td class="text-nowrap"><input type="radio" name="likelihood"${attr("value", option.value)}${attr("checked", likelihood === option.value, true)} class="form-check-input me-2"/> <strong>${escape_html(option.label)}</strong></td><td>${escape_html(option.description)}</td></tr>`;
  }
  $$payload.out += `<!--]--></tbody></table> `;
  if (riskResult) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="mt-4"><h5>Calculated Risk Rating</h5> <div${attr_class(`badge ${riskBadgeClasses[riskResult.score]}`)}>${escape_html(riskResult.rating)} (${escape_html(riskResult.score)} pts)</div> <div class="form-text">${escape_html(riskResult.definition)}</div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--> <button class="btn btn-success mt-4">${escape_html("Add Impact")}</button></main>`;
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-Z3styywO.js.map

import { p as push, d as store_get, i as ensure_array_like, j as attr_style, c as stringify, u as unsubscribe_stores, a as pop } from './index-C_pFhzh6.js';
import { N as escape_html, O as get, M as writable } from './exports-D0r3D1wz.js';
import 'js-cookie';
import { c as causes, i as impacts } from './impacts-vFNr0TkW.js';
import { m as mitigations } from './mitigations-BaJtnDLZ.js';
import './client-DbkKmYNh.js';

function persistedCookie(key, initial) {
  const value = initial;
  const store = writable(value);
  return store;
}
const project = persistedCookie("hazardwise-project", {
  title: "",
  description: "",
  safetyOfficer: "",
  hazards: [
    // example hazard:
    // {
    //   id: 'H01',
    //   description: 'AI summariser skips salient nuances',
    //   causeIds: ['C01', 'C03'],
    //   impactIds: ['I02'],
    //   mitigationIds: ['M01']
    // }
  ]
});
class HazardUtils {
  /** 
   * Generate the next numeric ID = (max existing)+1 
   * Assumes IDs are parseable as integers. 
   */
  static generateNewId(items) {
    const nums = items.map((i) => parseInt(i.id, 10)).filter((n) => !isNaN(n));
    return String((nums.length ? Math.max(...nums) : 0) + 1);
  }
  /** 
   * If the current hazard isn't in the store yet, create it. 
   * Returns the new or existing ID.
   */
  static saveNewHazard(description) {
    const proj = get(project);
    const newId = this.generateNewId(proj.hazards || []);
    const newHazard = {
      id: newId,
      description,
      causeIds: [],
      mitigationIds: [],
      impactIds: []
    };
    project.update((p) => ({
      ...p,
      hazards: [...p.hazards ?? [], newHazard]
    }));
    return {
      id: newId,
      hazardObj: newHazard
    };
  }
  /** Trim out any causes no longer referenced by any hazard */
  static removeUnusedCauses() {
    const proj = get(project);
    const used = new Set(proj.hazards.flatMap((h) => h.causeIds || []));
    causes.update((all) => all.filter((c) => used.has(c.id)));
  }
  /** Similarly for mitigations */
  static removeUnusedMitigations() {
    const proj = get(project);
    const used = /* @__PURE__ */ new Set([
      ...proj.hazards.flatMap((h) => h.mitigationIds || []),
      ...proj.hazards.flatMap((h) => h.causeIds || []).flatMap(
        (cid) => get(causes).find((c) => c.id === cid)?.mitigationIds || []
      )
    ]);
    mitigations.update((all) => all.filter((m) => used.has(m.id)));
  }
  /** And for impacts */
  static removeUnusedImpacts() {
    const proj = get(project);
    const used = new Set(proj.hazards.flatMap((h) => h.impactIds || []));
    impacts.update((all) => all.filter((i) => used.has(i.id)));
  }
  static removeImpact(hazardID, impactID) {
    project.update((proj) => ({
      ...proj,
      hazards: proj.hazards.map(
        (h) => h.id === hazardID ? {
          ...h,
          impactIds: (h.impactIds || []).filter((i) => i !== impactID)
        } : h
      )
    }));
    const updated = get(project).hazards.find((h) => h.id === hazardID);
    return updated;
  }
  static removeCause(hazardID, causeID) {
    project.update((proj) => ({
      ...proj,
      hazards: proj.hazards.map(
        (h) => h.id === hazardID ? {
          ...h,
          causeIds: (h.causeIds || []).filter((c) => c !== causeID)
        } : h
      )
    }));
    this.removeUnusedCauses();
    const updated = get(project).hazards.find((h) => h.id === hazardID);
    return updated;
  }
  static removeHazardMitigation(hazardID, mitigationID) {
    project.update((proj) => ({
      ...proj,
      hazards: proj.hazards.map(
        (h) => h.id === hazardID ? {
          ...h,
          mitigationIds: (h.mitigationIds || []).filter((m) => m !== mitigationID)
        } : h
      )
    }));
    const updated = get(project).hazards.find((h) => h.id === hazardID);
    return updated;
  }
  /**
   * Get the top impact’s risk info (score, rating, colour) for a hazard.
   * Returns { score, rating, color } or empty rating/color if none.
   */
  static getHighestRisk(hazard) {
    const allImpacts = get(impacts);
    const linked = (hazard.impactIds || []).map((id) => allImpacts.find((i) => i.id === id)).filter((i) => !!i);
    if (!linked.length) {
      return { score: 0, rating: "", color: "" };
    }
    const top = linked.reduce(
      (best, curr) => curr.score > best.score ? curr : best
    );
    const colorMap = {
      "Acceptable": "#28a745",
      // green
      "Undesirable": "#ffc107",
      // yellow
      "Unacceptable": "#dc3545",
      // red,
      "Unacceptable Without Further Mitigation": "#dc3545"
      // red,
    };
    return {
      score: top.score,
      rating: top.rating,
      color: colorMap[top.rating] ?? "#6c757d"
      // fallback grey
    };
  }
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let hazards;
  console.log("project:", store_get($$store_subs ??= {}, "$project", project));
  console.log("impacts:", store_get($$store_subs ??= {}, "$impacts", impacts));
  hazards = store_get($$store_subs ??= {}, "$project", project).hazards || [];
  $$payload.out += `<main class="container py-4"><h1 class="mb-3">${escape_html(store_get($$store_subs ??= {}, "$project", project).title || "Untitled Project")}</h1> `;
  if (hazards.length === 0) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="alert alert-info" role="alert">You have not added any hazards yet. Get started by adding your first one.</div> <button class="btn btn-primary mt-3">Add First Hazard</button>`;
  } else {
    $$payload.out += "<!--[!-->";
    const each_array = ensure_array_like(hazards);
    $$payload.out += `<button class="btn btn-primary mb-3">Add Another Hazard</button> <!--[-->`;
    for (let $$index_4 = 0, $$length = each_array.length; $$index_4 < $$length; $$index_4++) {
      let h = each_array[$$index_4];
      $$payload.out += `<details class="card mb-3"><summary class="card-header d-flex justify-content-between align-items-center"><div><strong>${escape_html(h.id)}</strong>: ${escape_html(h.description)} `;
      if (HazardUtils.getHighestRisk(h).rating) {
        $$payload.out += "<!--[-->";
        $$payload.out += `<span class="badge ms-2"${attr_style(`background-color: ${stringify(HazardUtils.getHighestRisk(h).color)};`)}>Risk: ${escape_html(HazardUtils.getHighestRisk(h).rating)}</span>`;
      } else {
        $$payload.out += "<!--[!-->";
      }
      $$payload.out += `<!--]--></div> <div class="d-flex align-items-center"><div class="btn-group"><button type="button" class="btn btn-sm btn-outline-secondary">Edit</button> <button type="button" class="btn btn-sm btn-outline-danger">Remove</button></div> <small class="ms-3 text-muted">▼</small></div></summary> <div class="card-body"><h5 class="card-title">Causes</h5> `;
      if (h.causeIds?.length) {
        $$payload.out += "<!--[-->";
        const each_array_1 = ensure_array_like(h.causeIds);
        $$payload.out += `<div class="table-responsive mb-3"><table class="table table-sm table-bordered"><thead><tr><th style="width:50%">Cause</th><th style="width:50%">Mitigations</th></tr></thead><tbody><!--[-->`;
        for (let $$index_1 = 0, $$length2 = each_array_1.length; $$index_1 < $$length2; $$index_1++) {
          let cid = each_array_1[$$index_1];
          if (store_get($$store_subs ??= {}, "$causes", causes).find((c) => c.id === cid)) {
            $$payload.out += "<!--[-->";
            const cause = store_get($$store_subs ??= {}, "$causes", causes).find((c) => c.id === cid);
            $$payload.out += `<tr><td>${escape_html(cause.description)}</td><td>`;
            if (cause.mitigationIds?.length) {
              $$payload.out += "<!--[-->";
              const each_array_2 = ensure_array_like(cause.mitigationIds);
              $$payload.out += `<!--[-->`;
              for (let i = 0, $$length3 = each_array_2.length; i < $$length3; i++) {
                let mid = each_array_2[i];
                if (store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid)) {
                  $$payload.out += "<!--[-->";
                  const mit = store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid);
                  $$payload.out += `<span>${escape_html(mit.description)}</span>${escape_html(i < cause.mitigationIds.length - 1 ? ", " : "")}`;
                } else {
                  $$payload.out += "<!--[!-->";
                }
                $$payload.out += `<!--]-->`;
              }
              $$payload.out += `<!--]-->`;
            } else {
              $$payload.out += "<!--[!-->";
              $$payload.out += `<span class="text-muted">None</span>`;
            }
            $$payload.out += `<!--]--></td></tr>`;
          } else {
            $$payload.out += "<!--[!-->";
          }
          $$payload.out += `<!--]-->`;
        }
        $$payload.out += `<!--]--></tbody></table></div>`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<p class="text-muted mb-3">No causes added.</p>`;
      }
      $$payload.out += `<!--]--> <h5 class="card-title">Hazard-Level Mitigations</h5> `;
      if (h.mitigationIds?.length) {
        $$payload.out += "<!--[-->";
        const each_array_3 = ensure_array_like(h.mitigationIds);
        $$payload.out += `<div class="table-responsive mb-3"><table class="table table-sm table-bordered"><thead><tr><th>Mitigation</th></tr></thead><tbody><!--[-->`;
        for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
          let mid = each_array_3[$$index_2];
          if (store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid)) {
            $$payload.out += "<!--[-->";
            const mit = store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid);
            $$payload.out += `<tr><td>${escape_html(mit.description)}</td></tr>`;
          } else {
            $$payload.out += "<!--[!-->";
          }
          $$payload.out += `<!--]-->`;
        }
        $$payload.out += `<!--]--></tbody></table></div>`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<p class="text-muted">No mitigations added.</p>`;
      }
      $$payload.out += `<!--]--> <h5 class="card-title">Impacts</h5> `;
      if (h.impactIds?.length) {
        $$payload.out += "<!--[-->";
        const each_array_4 = ensure_array_like(h.impactIds);
        $$payload.out += `<div class="table-responsive mb-3"><table class="table table-sm table-bordered"><thead><tr><th style="width:70%">Description</th><th style="width:30%">Risk Rating</th></tr></thead><tbody><!--[-->`;
        for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
          let iid = each_array_4[$$index_3];
          if (store_get($$store_subs ??= {}, "$impacts", impacts).find((i) => i.id === iid)) {
            $$payload.out += "<!--[-->";
            const imp = store_get($$store_subs ??= {}, "$impacts", impacts).find((i) => i.id === iid);
            $$payload.out += `<tr><td>${escape_html(imp.description)}</td><td>${escape_html(imp.rating)}</td></tr>`;
          } else {
            $$payload.out += "<!--[!-->";
          }
          $$payload.out += `<!--]-->`;
        }
        $$payload.out += `<!--]--></tbody></table></div>`;
      } else {
        $$payload.out += "<!--[!-->";
        $$payload.out += `<p class="text-muted mb-3">No impacts added.</p>`;
      }
      $$payload.out += `<!--]--></div></details>`;
    }
    $$payload.out += `<!--]-->`;
  }
  $$payload.out += `<!--]--></main>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DruFhk1x.js.map

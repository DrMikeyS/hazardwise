import { p as push, d as store_get, k as copy_payload, l as assign_payload, u as unsubscribe_stores, a as pop, i as ensure_array_like, f as attr, m as bind_props } from './index-C_pFhzh6.js';
import './client2-DyjX8TFl.js';
import './client-DbkKmYNh.js';
import { N as escape_html, P as fallback } from './exports-D0r3D1wz.js';
import 'js-cookie';
import { c as causes, i as impacts } from './impacts-vFNr0TkW.js';
import { m as mitigations } from './mitigations-BaJtnDLZ.js';
import { L as LinkMitigationModal } from './LinkMitigationModal-BSPtOM0Z.js';

function LinkImpactModal($$payload, $$props) {
  push();
  let show = fallback($$props["show"], false);
  let impacts2 = fallback($$props["impacts"], () => [], true);
  let search = fallback($$props["search"], "");
  if (show) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="modal-backdrop fade show"></div> <div class="modal d-block" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Link Existing Impact</h5> <button type="button" class="btn-close"></button></div> <div class="modal-body"><input type="text" class="form-control mb-3" placeholder="Search impacts..."${attr("value", search)}/> `;
    if (impacts2.length) {
      $$payload.out += "<!--[-->";
      const each_array = ensure_array_like(impacts2);
      $$payload.out += `<ul class="list-group"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let imp = each_array[$$index];
        $$payload.out += `<li class="list-group-item d-flex justify-content-between align-items-center"><div><strong>${escape_html(imp.description)}</strong><br/> <small>Likelihood: ${escape_html(imp.likelihood)} | Severity: ${escape_html(imp.severity)}</small></div> <button class="btn btn-sm btn-outline-primary">Link</button></li>`;
      }
      $$payload.out += `<!--]--></ul>`;
    } else if (search) {
      $$payload.out += "<!--[1-->";
      $$payload.out += `<p class="text-muted">No matching impacts found.</p>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div> <div class="modal-footer"><button class="btn btn-secondary">Close</button></div></div></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { show, impacts: impacts2, search });
  pop();
}
function LinkCauseModal($$payload, $$props) {
  push();
  let show = fallback($$props["show"], false);
  let causes2 = fallback($$props["causes"], () => [], true);
  let search = fallback($$props["search"], "");
  if (show) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="modal-backdrop fade show"></div> <div class="modal d-block" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Link Existing Cause</h5> <button type="button" class="btn-close"></button></div> <div class="modal-body"><input type="text" class="form-control mb-3" placeholder="Search causes..."${attr("value", search)}/> `;
    if (causes2.length) {
      $$payload.out += "<!--[-->";
      const each_array = ensure_array_like(causes2);
      $$payload.out += `<ul class="list-group"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let c = each_array[$$index];
        $$payload.out += `<li class="list-group-item d-flex justify-content-between align-items-center"><div>${escape_html(c.description)}</div> <button class="btn btn-sm btn-outline-primary">Link</button></li>`;
      }
      $$payload.out += `<!--]--></ul>`;
    } else if (search) {
      $$payload.out += "<!--[1-->";
      $$payload.out += `<p class="text-muted">No matching causes found.</p>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div> <div class="modal-footer"><button class="btn btn-secondary">Close</button></div></div></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { show, causes: causes2, search });
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let causeList, hazardMitigations, allImpacts, filteredImpacts, allCauses, filteredCauses, allMits, filteredMits;
  let description = "";
  let showImpactModal = false;
  let impactSearch = "";
  let showCauseModal = false;
  let causeSearch = "";
  let showMitigationModal = false;
  let mitigationSearch = "";
  let linkedMitigationIds = [];
  let linkedImpactIds = [];
  let linkedCauseIds = [];
  causeList = [].map((cid) => store_get($$store_subs ??= {}, "$causes", causes).find((c) => c.id === cid)).filter(Boolean);
  causeList.flatMap((c) => c.mitigationIds || []).map((mid) => store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid)).filter(Boolean);
  hazardMitigations = [].map((mid) => store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid)).filter(Boolean);
  allImpacts = store_get($$store_subs ??= {}, "$impacts", impacts);
  filteredImpacts = allImpacts.filter((i) => i.description.toLowerCase().includes(impactSearch.toLowerCase()) && !linkedImpactIds.includes(i.id));
  allCauses = store_get($$store_subs ??= {}, "$causes", causes);
  filteredCauses = allCauses.filter((c) => c.description.toLowerCase().includes(causeSearch.toLowerCase()) && !linkedCauseIds.includes(c.id));
  allMits = store_get($$store_subs ??= {}, "$mitigations", mitigations);
  filteredMits = allMits.filter((m) => m.description.toLowerCase().includes(mitigationSearch.toLowerCase()) && !linkedMitigationIds.includes(m.id));
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<main class="container py-4"><button class="btn btn-link mb-3">← Back to Workspace</button> <h1 class="mb-4">Edit Hazard</h1> <div class="mb-3"><label for="hazardDescription" class="form-label">Hazard Description</label> <textarea id="hazardDescription" class="form-control" rows="4" placeholder="Describe what might go wrong">`;
    const $$body = escape_html(description);
    if ($$body) {
      $$payload2.out += `${$$body}`;
    }
    $$payload2.out += `</textarea> <div class="form-text">A hazard is anything that could potentially cause harm.</div></div> <details class="card mb-3"><summary class="card-header d-flex justify-content-between align-items-center"><strong>Causes</strong> <small class="text-muted">▼</small></summary> <div class="card-body"><table class="table table-striped"><thead><tr><th>Cause</th><th>Associated Mitigations</th><th class="text-end">Actions</th></tr></thead><tbody>`;
    if (causeList.length === 0) {
      $$payload2.out += "<!--[-->";
      $$payload2.out += `<tr><td colspan="3" class="text-center text-muted">No causes added yet.</td></tr>`;
    } else {
      $$payload2.out += "<!--[!-->";
      const each_array = ensure_array_like(causeList);
      $$payload2.out += `<!--[-->`;
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let c = each_array[$$index_1];
        $$payload2.out += `<tr><td>${escape_html(c.description)}</td><td>`;
        if (c.mitigationIds?.length) {
          $$payload2.out += "<!--[-->";
          const each_array_1 = ensure_array_like(c.mitigationIds);
          $$payload2.out += `<!--[-->`;
          for (let i = 0, $$length2 = each_array_1.length; i < $$length2; i++) {
            let mid = each_array_1[i];
            $$payload2.out += `<!---->${escape_html(store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid)?.description)}
                      ${escape_html(i < c.mitigationIds.length - 1 ? ", " : "")}`;
          }
          $$payload2.out += `<!--]-->`;
        } else {
          $$payload2.out += "<!--[!-->";
          $$payload2.out += `<span class="text-muted">None</span>`;
        }
        $$payload2.out += `<!--]--></td><td class="text-end"><div class="btn-group"><button class="btn btn-sm btn-outline-secondary">Edit</button> <button class="btn btn-sm btn-outline-danger">Remove</button></div></td></tr>`;
      }
      $$payload2.out += `<!--]-->`;
    }
    $$payload2.out += `<!--]--></tbody></table> <button class="btn btn-outline-primary">Add New Cause</button> <button class="btn btn-outline-secondary ms-2">Link Existing Cause</button></div></details> <details class="card mb-3"><summary class="card-header d-flex justify-content-between align-items-center"><strong>Hazard-Specific Mitigations</strong> <small class="text-muted">▼</small></summary> <div class="card-body">`;
    if (hazardMitigations.length) {
      $$payload2.out += "<!--[-->";
      const each_array_2 = ensure_array_like(hazardMitigations);
      $$payload2.out += `<ul class="list-group mb-3"><!--[-->`;
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let m = each_array_2[$$index_2];
        $$payload2.out += `<li class="list-group-item d-flex justify-content-between align-items-center"><span>${escape_html(m.description)}</span> <div class="btn-group"><button class="btn btn-sm btn-outline-secondary">Edit</button> <button class="btn btn-sm btn-outline-danger">Remove</button></div></li>`;
      }
      $$payload2.out += `<!--]--></ul>`;
    } else {
      $$payload2.out += "<!--[!-->";
      $$payload2.out += `<p class="text-muted">No hazard-specific mitigations added.</p>`;
    }
    $$payload2.out += `<!--]--> <button class="btn btn-outline-primary">Add Hazard-Specific Mitigation</button> <button class="btn btn-outline-secondary ms-2">Link Existing Mitigation</button></div></details> <details class="card mb-3"><summary class="card-header d-flex justify-content-between align-items-center"><strong>Impacts</strong> <small class="text-muted">▼</small></summary> <div class="card-body">`;
    {
      $$payload2.out += "<!--[!-->";
      $$payload2.out += `<p class="text-muted mb-3">No impacts added yet.</p>`;
    }
    $$payload2.out += `<!--]--> <button class="btn btn-outline-primary">Add Impact</button> <button class="btn btn-outline-secondary ms-2">Link Existing Impact</button></div></details> <button class="btn btn-success mb-4">Save Hazard</button> `;
    LinkImpactModal($$payload2, {
      show: showImpactModal,
      impacts: filteredImpacts,
      get search() {
        return impactSearch;
      },
      set search($$value) {
        impactSearch = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    LinkCauseModal($$payload2, {
      show: showCauseModal,
      causes: filteredCauses,
      get search() {
        return causeSearch;
      },
      set search($$value) {
        causeSearch = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----> `;
    LinkMitigationModal($$payload2, {
      show: showMitigationModal,
      mitigations: filteredMits,
      get search() {
        return mitigationSearch;
      },
      set search($$value) {
        mitigationSearch = $$value;
        $$settled = false;
      }
    });
    $$payload2.out += `<!----></main>`;
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-BPl1p6Ne.js.map

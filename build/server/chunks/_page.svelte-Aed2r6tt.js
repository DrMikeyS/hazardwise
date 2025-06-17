import { p as push, d as store_get, k as copy_payload, l as assign_payload, u as unsubscribe_stores, a as pop, i as ensure_array_like } from './index-C_pFhzh6.js';
import './client2-DyjX8TFl.js';
import './client-DbkKmYNh.js';
import { N as escape_html } from './exports-D0r3D1wz.js';
import 'js-cookie';
import { m as mitigations } from './mitigations-BaJtnDLZ.js';
import { L as LinkMitigationModal } from './LinkMitigationModal-BSPtOM0Z.js';

function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let allMitigations, filteredMitigations;
  let description = "";
  let linkedMitigationIds = [];
  let showMitigationModal = false;
  let mitigationSearch = "";
  allMitigations = store_get($$store_subs ??= {}, "$mitigations", mitigations);
  filteredMitigations = allMitigations.filter((m) => m.description.toLowerCase().includes(mitigationSearch.toLowerCase()) && !linkedMitigationIds.includes(m.id));
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out += `<main class="container py-4"><button class="btn btn-link mb-3">← Back to Hazard</button> <h1 class="mb-4">${escape_html("Add Cause")}</h1> <div class="mb-3"><label for="causeDescription" class="form-label">Cause Description</label> <textarea id="causeDescription" class="form-control" rows="3" placeholder="Describe a factor that could lead to this hazard">`;
    const $$body = escape_html(description);
    if ($$body) {
      $$payload2.out += `${$$body}`;
    }
    $$payload2.out += `</textarea> <div class="form-text">A cause is a factor or condition that could contribute to the hazard occurring.</div></div> <div class="mb-4"><label class="form-label">Linked Mitigations</label> `;
    if (linkedMitigationIds.length) {
      $$payload2.out += "<!--[-->";
      const each_array = ensure_array_like(linkedMitigationIds);
      $$payload2.out += `<ul class="list-group mb-2"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let mid = each_array[$$index];
        if (store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid)) {
          $$payload2.out += "<!--[-->";
          const mit = store_get($$store_subs ??= {}, "$mitigations", mitigations).find((m) => m.id === mid);
          $$payload2.out += `<li class="list-group-item d-flex justify-content-between align-items-center">${escape_html(mit.description)} <button class="btn btn-sm btn-outline-danger">Remove</button></li>`;
        } else {
          $$payload2.out += "<!--[!-->";
        }
        $$payload2.out += `<!--]-->`;
      }
      $$payload2.out += `<!--]--></ul>`;
    } else {
      $$payload2.out += "<!--[!-->";
      $$payload2.out += `<p class="text-muted">No mitigations linked yet.</p>`;
    }
    $$payload2.out += `<!--]--></div> <div class="mb-3"><button class="btn btn-secondary me-2">+ Add New Mitigation</button> <button class="btn btn-outline-primary">Link Existing Mitigation</button></div> <button class="btn btn-success">${escape_html("Save Cause")}</button> `;
    LinkMitigationModal($$payload2, {
      show: showMitigationModal,
      mitigations: filteredMitigations,
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
//# sourceMappingURL=_page.svelte-Aed2r6tt.js.map

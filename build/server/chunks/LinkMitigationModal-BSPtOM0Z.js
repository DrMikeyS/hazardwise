import { p as push, f as attr, i as ensure_array_like, m as bind_props, a as pop } from './index-C_pFhzh6.js';
import { P as fallback, N as escape_html } from './exports-D0r3D1wz.js';

function LinkMitigationModal($$payload, $$props) {
  push();
  let show = fallback($$props["show"], false);
  let mitigations = fallback($$props["mitigations"], () => [], true);
  let search = fallback($$props["search"], "");
  if (show) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<div class="modal-backdrop fade show"></div> <div class="modal d-block" tabindex="-1"><div class="modal-dialog modal-lg"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Link Existing Mitigation</h5> <button type="button" class="btn-close"></button></div> <div class="modal-body"><input type="text" class="form-control mb-3" placeholder="Search mitigations..."${attr("value", search)}/> `;
    if (mitigations.length) {
      $$payload.out += "<!--[-->";
      const each_array = ensure_array_like(mitigations);
      $$payload.out += `<ul class="list-group"><!--[-->`;
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let m = each_array[$$index];
        $$payload.out += `<li class="list-group-item d-flex justify-content-between align-items-center"><div>${escape_html(m.description)}</div> <button class="btn btn-sm btn-outline-primary">Link</button></li>`;
      }
      $$payload.out += `<!--]--></ul>`;
    } else if (search) {
      $$payload.out += "<!--[1-->";
      $$payload.out += `<p class="text-muted">No matching mitigations found.</p>`;
    } else {
      $$payload.out += "<!--[!-->";
    }
    $$payload.out += `<!--]--></div> <div class="modal-footer"><button class="btn btn-secondary">Close</button></div></div></div></div>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  bind_props($$props, { show, mitigations, search });
  pop();
}

export { LinkMitigationModal as L };
//# sourceMappingURL=LinkMitigationModal-BSPtOM0Z.js.map

import { N as escape_html } from './exports-D0r3D1wz.js';
import { p as push, a as pop } from './index-C_pFhzh6.js';
import './client2-DyjX8TFl.js';
import 'js-cookie';
import './client-DbkKmYNh.js';

function _page($$payload, $$props) {
  push();
  let description = "";
  $$payload.out += `<main class="container py-4"><button class="btn btn-link mb-3">← Back</button> <h1 class="mb-4">${escape_html("Add Mitigation")}</h1> <div class="mb-3"><label for="mitigationDescription" class="form-label">Mitigation Description</label> <textarea id="mitigationDescription" class="form-control" rows="3" placeholder="e.g. Add human review step">`;
  const $$body = escape_html(description);
  if ($$body) {
    $$payload.out += `${$$body}`;
  }
  $$payload.out += `</textarea> <div class="form-text">A mitigation is an action or control that reduces the likelihood or impact of a hazard or cause.</div></div> <button class="btn btn-success">${escape_html("Save Mitigation")}</button></main>`;
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DYqX3Ah_.js.map

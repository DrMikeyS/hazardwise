import { p as push, f as attr, a as pop } from './index-C_pFhzh6.js';
import { N as escape_html } from './exports-D0r3D1wz.js';
import 'js-cookie';
import './client-DbkKmYNh.js';

function _page($$payload, $$props) {
  push();
  let title = "";
  let description = "";
  let safetyOfficer = "";
  $$payload.out += `<h1 class="mb-4">Start New Project</h1> <form><div class="mb-3"><label for="projectTitle" class="form-label">Project Title <span class="text-danger">*</span></label> <input id="projectTitle" type="text"${attr("value", title)} required class="form-control" placeholder="Enter project title"/></div> <div class="mb-3"><label for="projectDescription" class="form-label">Project Description</label> <textarea id="projectDescription" rows="3" class="form-control" placeholder="Use plain language understandable to the public">`;
  const $$body = escape_html(description);
  if ($$body) {
    $$payload.out += `${$$body}`;
  }
  $$payload.out += `</textarea></div> <div class="mb-3"><label for="safetyOfficer" class="form-label">Clinical Safety Officer</label> <input id="safetyOfficer" type="text"${attr("value", safetyOfficer)} class="form-control" placeholder="Name of the responsible clinician"/> <div class="form-text">Tip: This is the clinician taking responsibility for the clinical safety process.</div></div> <button type="submit" class="btn btn-primary">Create Project</button></form>`;
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-DrTQ6MWJ.js.map

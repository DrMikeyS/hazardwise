import { N as escape_html } from './exports-D0r3D1wz.js';
import { p as push, a as pop, g as getContext } from './index-C_pFhzh6.js';
import './client2-DyjX8TFl.js';
import './client-DbkKmYNh.js';

function context() {
  return getContext("__request__");
}
const page$1 = {
  get error() {
    return context().page.error;
  },
  get status() {
    return context().page.status;
  }
};
const page = page$1;
function Error$1($$payload, $$props) {
  push();
  $$payload.out += `<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`;
  pop();
}

export { Error$1 as default };
//# sourceMappingURL=error.svelte-Bu7g8bDU.js.map

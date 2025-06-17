import { p as push, h as head, b as attr_class, c as stringify, d as store_get, e as slot, u as unsubscribe_stores, a as pop, g as getContext } from './index-C_pFhzh6.js';
import './client-DbkKmYNh.js';
import './exports-D0r3D1wz.js';

const getStores = () => {
  const stores$1 = getContext("__svelte__");
  return {
    /** @type {typeof page} */
    page: {
      subscribe: stores$1.page.subscribe
    },
    /** @type {typeof navigating} */
    navigating: {
      subscribe: stores$1.navigating.subscribe
    },
    /** @type {typeof updated} */
    updated: stores$1.updated
  };
};
const page = {
  subscribe(fn) {
    const store = getStores().page;
    return store.subscribe(fn);
  }
};
function _layout($$payload, $$props) {
  push();
  var $$store_subs;
  head($$payload, ($$payload2) => {
    $$payload2.title = `<title>HazardWise</title>`;
  });
  $$payload.out += `<div class="d-flex"><div${attr_class(`bg-light sidebar border-end vh-100 position-fixed ${stringify("")}`, "svelte-3gzija")}><div class="d-flex align-items-center gap-2 mb-4 p-3 logo-wrapper" style="cursor: pointer;"><img src="/hazardwise_icon.svg" alt="HazardWise Logo" style="width: 40px; height: 40px;"/> <div class="logo-text fs-4 fw-bold label svelte-3gzija">HazardWise</div></div> <ul class="nav nav-pills flex-column mt-3"><li class="nav-item"><a${attr_class(`nav-link ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/workspace" ? "active" : "")}`, "svelte-3gzija")} href="/workspace">🏠 <span class="label ms-2 svelte-3gzija">Hazards</span></a></li> <li class="nav-item"><a${attr_class(`nav-link ${stringify(store_get($$store_subs ??= {}, "$page", page).url.pathname === "/about" ? "active" : "")}`, "svelte-3gzija")} href="/about">ℹ️ <span class="label ms-2 svelte-3gzija">About</span></a></li></ul></div> <main${attr_class(`py-4 px-3 flex-grow-1 ${stringify("main-expanded")}`, "svelte-3gzija")}><!---->`;
  slot($$payload, $$props, "default", {});
  $$payload.out += `<!----></main></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-D7ggJjuz.js.map

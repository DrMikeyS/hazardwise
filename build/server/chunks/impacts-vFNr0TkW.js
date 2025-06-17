import { M as writable } from './exports-D0r3D1wz.js';
import 'js-cookie';

function persistedCookie$1(key, initial) {
  const value = initial;
  const store = writable(value);
  return store;
}
const causes = persistedCookie$1("hazardwise-causes", []);
function persistedCookie(key, initial) {
  const value = initial;
  const store = writable(value);
  return store;
}
const impacts = persistedCookie("hazardwise-impacts", []);

export { causes as c, impacts as i };
//# sourceMappingURL=impacts-vFNr0TkW.js.map

import { M as writable } from './exports-D0r3D1wz.js';
import 'js-cookie';

function persistedCookie(key, initial) {
  const value = initial;
  const store = writable(value);
  return store;
}
const mitigations = persistedCookie("hazardwise-mitigations", []);

export { mitigations as m };
//# sourceMappingURL=mitigations-BaJtnDLZ.js.map

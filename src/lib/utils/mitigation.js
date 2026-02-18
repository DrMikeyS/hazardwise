// @ts-nocheck
export const MITIGATION_IMPLEMENTATION_CLASS = Object.freeze({
  ORGANISATION: 'organisation',
  MANUFACTURER: 'manufacturer'
});

export const MITIGATION_IMPLEMENTATION_LABELS = Object.freeze({
  [MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION]: 'Implemented by your organisation',
  [MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER]: 'Implemented by the manufacturer'
});

export const MITIGATION_IMPLEMENTATION_HELP_TEXT = Object.freeze({
  [MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION]:
    'Use this for local controls such as training, policies, monitoring, and configuration decisions.',
  [MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER]:
    'Use this for controls delivered by the supplier, such as product changes, bug fixes, or vendor-managed safeguards.'
});

/**
 * @param {any} value
 * @returns {'organisation' | 'manufacturer'}
 */
export function normalizeMitigationImplementationClass(value) {
  return value === MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER
    ? MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER
    : MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION;
}

/**
 * @param {any} item
 * @returns {any}
 */
export function normalizeMitigation(item = {}) {
  return {
    ...item,
    implementationClass: normalizeMitigationImplementationClass(item.implementationClass)
  };
}

/**
 * @param {any} items
 * @returns {any[]}
 */
export function normalizeMitigationList(items) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => normalizeMitigation(item));
}

/**
 * @param {any} implementationClass
 * @returns {string}
 */
export function getMitigationImplementationLabel(implementationClass) {
  return MITIGATION_IMPLEMENTATION_LABELS[
    normalizeMitigationImplementationClass(implementationClass)
  ];
}

/**
 * @param {any} items
 * @returns {{ key: string; label: string; helpText: string; items: any[] }[]}
 */
export function groupMitigationsByImplementationClass(items) {
  const normalized = normalizeMitigationList(items);
  const grouped = {
    [MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION]: [],
    [MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER]: []
  };

  for (const item of normalized) {
    grouped[item.implementationClass].push(item);
  }

  return [
    {
      key: MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION,
      label: MITIGATION_IMPLEMENTATION_LABELS[MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION],
      helpText:
        MITIGATION_IMPLEMENTATION_HELP_TEXT[MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION],
      items: grouped[MITIGATION_IMPLEMENTATION_CLASS.ORGANISATION]
    },
    {
      key: MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER,
      label: MITIGATION_IMPLEMENTATION_LABELS[MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER],
      helpText:
        MITIGATION_IMPLEMENTATION_HELP_TEXT[MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER],
      items: grouped[MITIGATION_IMPLEMENTATION_CLASS.MANUFACTURER]
    }
  ];
}

/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  let result = Array.from(arr);
  let order = (param === 'asc') ? 1 : -1;
  return result.sort((a, b) => a.localeCompare(b, ['ru-RU', 'en-US'], {caseFirst: 'upper'}) > 0 ? order : -1 * order);
}

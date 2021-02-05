/**
 * omit - creates an object composed of enumerable property fields
 * @param {object} obj - the source object
 * @param {...string} fields - the properties paths to omit
 * @returns {object} - returns the new object
 */
export const omit = (obj, ...fields) => {
  let entries = Object.entries(obj);
  entries = entries.filter(([key, val]) => fields.includes(key) === false);
  return Object.fromEntries(entries);
};

/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  /*if (string.length === 0 || size === 0) {
    return '';
  }

  if (size === undefined) {
    return string;
  }*/

  const comparer = (acc, value) => {
    const sub = Array.from(acc.slice(-size));
    if (sub.length >= size && sub.every(char => char === value)){
      return acc;
    }
    return acc + value;
  };

  return Array.from(string).reduce(comparer, '');
}

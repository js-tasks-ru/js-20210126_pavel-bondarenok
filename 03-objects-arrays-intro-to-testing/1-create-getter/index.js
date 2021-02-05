/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
  let pathKeys = path.split('.');

  return (obj) => {
    let clone = {...obj};
    for (const key of pathKeys) {
      if (clone[key] === undefined) {
        return;
      }
      clone = clone[key];
    }
    return clone;
  };
}

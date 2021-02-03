/**
 *
 * @param {Number} end
 * @param {Number} start
 * @param {Number} step
 * @returns {[Number]} Range of initial values
 */
export default function initializeArrayWithRange(end, start = 0, step = 1) {
  return Array.from(
    {length: Math.ceil((end - start + 1) / step)},
    (__, i) => i * step + start,
  );
}

/**
 *
 * @param {Number} num
 * @returns {Number | String} Initial number or leading number
 */
export default function addLeadingZero(num) {
  return num < 10 ? `0${num}` : num;
}

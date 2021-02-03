export function getSum(nums) {
  return nums.reduce((sum, val) => sum + val);
}

export function getSumTail(nums) {
  const valStr = getSum(nums).toString();

  return Number(valStr.charAt(valStr.length - 1));
}

export function concatNumsFn(nums, fn) {
  return nums.reduce((sum, num) => sum.concat(fn(num)), '');
}

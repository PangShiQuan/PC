export default function getNumColor(numsColor) {
  const numColor = Object.entries(numsColor);
  return function numToColor(num) {
    const n = Number(num);
    const color = numColor.find(
      ([_, nums]) => (Array.isArray(nums) ? nums.includes(n) : nums === n),
    ) || ['none'];

    return color[0];
  };
}

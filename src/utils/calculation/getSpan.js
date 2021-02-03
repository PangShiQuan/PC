export default function(nums) {
  return Math.max.apply(null, nums) - Math.min.apply(null, nums);
}

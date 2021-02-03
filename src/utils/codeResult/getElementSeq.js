import {getSameInt, getContinuousInt} from 'utils/calculation';

export default function getElementSeq(nums, ...others) {
  const limit = 3;
  const sameInt = getSameInt(nums);
  const continuousInt = getContinuousInt(nums, ...others);
  if (nums.length > limit) return null;
  else if (sameInt === limit) {
    return '豹子';
  } else if (sameInt === 2) {
    return '二同号';
  } else if (continuousInt === limit) {
    return '三连号';
  }
  return '三不同号';
}

import {toNumber, map, forEach} from 'lodash';

export default function getSameInt(nums) {
  const sameCounts = {};
  let greatestInt = 0;
  const newArray = map(nums, toNumber);
  forEach(newArray, num => {
    sameCounts[num] = (sameCounts[num] || 0) + 1;
    if (sameCounts[num] > greatestInt) greatestInt = sameCounts[num];
  });
  return greatestInt;
}

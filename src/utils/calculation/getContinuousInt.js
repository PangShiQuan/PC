import {toNumber, map, forEach, isEqual, intersection} from 'lodash';

export default function getContinuousInt(nums, lastNum, reconnectNums) {
  let continuousInt = 1;
  const newArray = map(nums, toNumber).sort();
  const lastInt = toNumber(lastNum);
  const connectArray = map(reconnectNums, toNumber).sort();
  forEach(newArray, (num, index) => {
    if (num + 1 === newArray[index + 1]) {
      continuousInt++;
    } else if (
      index === newArray.length - 1 &&
      lastInt === num &&
      (lastInt && reconnectNums) &&
      isEqual(intersection(newArray, connectArray), connectArray)
    ) {
      continuousInt++;
    }
  });
  return continuousInt;
}

export function getContinuousIntPK(nums) {
  const allNums = nums[0].toString() + nums[1].toString() + nums[2].toString();
  const sunzi = [
    '123',
    '234',
    '345',
    '456',
    '567',
    '678',
    '789',
    '91011',
    '101112',
    '111213',
    '11213',
  ];

  return sunzi.includes(allNums);
}

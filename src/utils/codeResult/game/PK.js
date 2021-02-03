import {map, forEach, toNumber, round, subtract} from 'lodash';
import {getSameInt, getContinuousIntPK} from 'utils/calculation';

export function getPokerElement(nums) {
  const newArray = map(nums, toNumber).sort();
  const picArray = [];
  const numsArray = [];
  const target = nums.length;
  forEach(newArray, (num, index) => {
    const pokerPicture = round(num, -2);
    const pokerNum = subtract(num, pokerPicture);
    picArray.push(pokerPicture);
    numsArray.push(pokerNum);
  });
  const samePicCount = getSameInt(picArray);
  const isContinuesCount = getContinuousIntPK(numsArray.sort());
  const sameNumCount = getSameInt(numsArray);

  if (samePicCount === target) {
    return isContinuesCount ? '同花顺' : '同花';
  }
  if (isContinuesCount) {
    return '顺子';
  }
  if (sameNumCount === target) {
    return '豹子';
  }
  if (sameNumCount === 2) {
    return '对子';
  }
  return '散牌';
}

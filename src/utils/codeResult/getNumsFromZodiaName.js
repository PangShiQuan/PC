import getZodiacName from './getZodiacName';

var nums = {};
const ANIMALS = [
  '鼠',
  '牛',
  '虎',
  '兔',
  '龙',
  '蛇',
  '马',
  '羊',
  '猴',
  '鸡',
  '狗',
  '猪',
];
/**
 *
 * @param {string} symbolicName - chinse zodia name
 * @param {number} currentTimeEpoch - 开奖日期  unix 时间戳 stopOrderTimeEpoch 传这个字段就好
 * @returns {boolean|array[number]} array of numbers base on symbolic name
 */

function getNumsFromZodiaName({
  currentTimeEpoch,
  symbolicName,
}) {
  if (ANIMALS.indexOf(symbolicName) < 0) return false;
  if (nums[symbolicName]) return nums[symbolicName];
  for (let i = 1; i < 50; i++) {
    let openCode = i;
    if (openCode < 10) {
      openCode = `0${openCode}`;
    }

    const symbolic = getZodiacName({currentTimeEpoch, openCode});
    nums[symbolic] = nums[symbolic] || [];
    nums[symbolic].push(openCode);
  }

  return nums[symbolicName];
}

export default getNumsFromZodiaName;

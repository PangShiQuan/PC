import {
  SYMBOLIC_SHU,
  SYMBOLIC_NIU,
  SYMBOLIC_HU,
  SYMBOLIC_TU,
  SYMBOLIC_LONG,
  SYMBOLIC_SHE,
  SYMBOLIC_MA,
  SYMBOLIC_YANG,
  SYMBOLIC_HOU,
  SYMBOLIC_JI,
  SYMBOLIC_GOU,
  SYMBOLIC_ZHU,
  SYMBOLICS,
} from './type.config';

const A_DECADE_CONFIG = {
  0: {
    new: SYMBOLIC_SHU,
  },
  1: {
    new: SYMBOLIC_HU,
  },
  2: {
    new: SYMBOLIC_TU,
  },
  3: {
    new: SYMBOLIC_LONG,
  },
  4: {
    new: SYMBOLIC_SHE,
  },
  5: {
    new: SYMBOLIC_MA,
  },
  6: {
    new: SYMBOLIC_YANG,
  },
  7: {
    new: SYMBOLIC_HOU,
  },
  8: {
    new: SYMBOLIC_JI,
  },
  9: {
    new: SYMBOLIC_ZHU,
  },

};

let RIGHT_ORDER = [];

/**
 * 得到正确的顺序
 * @param startIndex  开始生肖对应的下标
 * @param startAnimal 开始的生肖
 */
function getRightOrder(startIndex, startAnimal) {
  if (RIGHT_ORDER[0] === startAnimal) {
    return;
  }
  // clear
  RIGHT_ORDER = [];

  for (let i = startIndex; i >= 0; i--) {
    RIGHT_ORDER.push(SYMBOLICS[i]);
  }
  if (RIGHT_ORDER.length === 12) {
    return;
  }
  for (let i = 11; i >= startIndex + 1; i--) {
    RIGHT_ORDER.push(SYMBOLICS[i]);
  }
}

/**
 * 根据开奖日期得到正确对应的号码与生肖 单个号码
 * @param time 开奖日期  unix 时间戳 stopOrderTimeEpoch 传这个字段就好
 * @param openCode 开奖号码 01-49
 * @return results 对应开奖号码的生肖  false : 参数有问题，无法转换
 */

export function getCqSscName({
  openCode = '',
}) {
  if ((!openCode && openCode !== 0) || openCode > 9 ) {
    return false;
  }
  const arr = ['大', '小', '单', '双'];
  if (arr.includes(openCode)) {
    return false;
  }
  const code = parseInt(openCode);
  const zodiacYear = A_DECADE_CONFIG[code];
  const zodiac = zodiacYear.new;

  getRightOrder(SYMBOLICS.indexOf(zodiac), zodiac);

  return zodiac;
}

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
} from '../type.config';

const A_DECADE_CONFIG = {
  '2017': {
    endTime: 128,
    old: SYMBOLIC_HOU,
    new: SYMBOLIC_JI,
  },
  '2018': {
    endTime: 216,
    old: SYMBOLIC_JI,
    new: SYMBOLIC_GOU,
  },
  '2019': {
    endTime: 205,
    old: SYMBOLIC_GOU,
    new: SYMBOLIC_ZHU,
  },
  '2020': {
    endTime: 125,
    old: SYMBOLIC_ZHU,
    new: SYMBOLIC_SHU,
  },
  '2021': {
    endTime: 212,
    old: SYMBOLIC_SHU,
    new: SYMBOLIC_NIU,
  },
  '2022': {
    endTime: 201,
    old: SYMBOLIC_NIU,
    new: SYMBOLIC_HU,
  },
  '2023': {
    endTime: 122,
    old: SYMBOLIC_HU,
    new: SYMBOLIC_TU,
  },
  '2024': {
    endTime: 210,
    old: SYMBOLIC_TU,
    new: SYMBOLIC_LONG,
  },
  '2025': {
    endTime: 129,
    old: SYMBOLIC_LONG,
    new: SYMBOLIC_SHE,
  },
  '2026': {
    endTime: 217,
    old: SYMBOLIC_SHE,
    new: SYMBOLIC_MA,
  },
  '2027': {
    endTime: 206,
    old: SYMBOLIC_MA,
    new: SYMBOLIC_YANG,
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

export default function getZodiacName({
  currentTimeEpoch = Math.floor(Date.now() / 1000),
  openCode = '',
}) {
  if (!openCode || openCode < 0 || openCode > 49) return false;
  const baseDate = new Date(0); // The 0 there is the key, which sets the date to the epoch
  baseDate.setUTCSeconds(currentTimeEpoch);

  const year = baseDate.getFullYear();

  if (!year) throw new Error(`缺失该${year}年份生肖对应号码的数据, 请更新.`);

  const code = parseInt(openCode);
  const zodiacYear = A_DECADE_CONFIG[year];
  const monthDay = parseInt(
    `${baseDate.getMonth() + 1}${baseDate
      .getDate()
      .toString()
      .padStart(2, '0')}`,
  );
  const zodiac =
    monthDay < zodiacYear.endTime ? zodiacYear.old : zodiacYear.new;

  getRightOrder(SYMBOLICS.indexOf(zodiac), zodiac);

  return RIGHT_ORDER[(code - 1) % 12];
}

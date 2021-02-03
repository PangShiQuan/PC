import toElement from '../getElement';
import toZodiacName from '../getZodiacName';
import getColor from '../getNumColor';
import {form, reduce} from '../../calculation';
import {T_NAME} from '../../type.config';

const COLORS_CN = {
  red: '红',
  blue: '蓝',
  green: '绿',
  none: '无',
};
const valuesColor = {
  red: [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46],
  blue: [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48],
  green: [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49],
};

export const getNumColor = getColor(valuesColor);

export function getSpecialNumColor(values) {
  return COLORS_CN[getNumColor(getSpecialCode(values))];
}

export function getFlatCode(values) {
  return values.slice(0, 6);
}

export function getSpecialCode(values) {
  return values.slice(-1)[0];
}

export function getOddEven(values) {
  return form.oddEven(getSpecialCode(values)) ? T_NAME.ODD : T_NAME.EVEN;
}

export function getSpecialHead(values) {
  return `${parseInt(getSpecialCode(values) / 10)}头`;
}

export function getTailSum(values) {
  return `${getSpecialCode(values) % 10}尾`;
}

// 特码合数单双
export function getTotalOddEven(values) {
  const value = getSpecialCode(values);
  const sum = reduce.getSum(
    value
      .toString()
      .split('')
      .map(val => parseInt(val)),
  );

  return `合${form.oddEven(sum) ? T_NAME.ODD : T_NAME.EVEN}`;
}

export function getElement(values, data) {
  const value = getSpecialCode(values);
  return toElement({currentTimeEpoch: data.currentTimeEpoch, openCode: value});
}

export function getZodiacName(values, data) {
  const value = getSpecialCode(values);
  return toZodiacName({
    currentTimeEpoch: data.currentTimeEpoch,
    openCode: value,
  });
}

import getColor from '../getNumColor';
import {form, reduce} from '../../calculation';
import {T_NAME} from '../../type.config';

const valuesColor = {
  red: [3, 6, 9, 12, 15, 18, 21, 24],
  blue: [2, 5, 8, 11, 17, 20, 23, 26],
  green: [1, 4, 7, 10, 16, 19, 22, 25],
};

const COLORS_CN = {
  red: '红',
  blue: '蓝',
  green: '绿',
  none: '无',
};
const color = getColor(valuesColor);
export function getNumColor(values, showName = true) {
  const value = Array.isArray(values) ? reduce.getSum(values) : values;
  const colorValue = color(value);
  return showName ? COLORS_CN[colorValue] : colorValue;
}

export function getBigSmallOddEven(value, JZ) {
  if (JZ) {
    if (value < 6) {
      return T_NAME.XSMALL;
    } else if (value > 21) {
      return T_NAME.XBIG;
    }
  }

  let str = '';
  if (JZ) {
    if (value > 13) {
      str += T_NAME.BIG;
    } else {
      str += T_NAME.SMALL;
    }
  } else if (value > 4) {
    str += T_NAME.BIG;
  } else {
    str += T_NAME.SMALL;
  }

  if ((parseInt(value) + 2) % 2 === 0) {
    str += T_NAME.EVEN;
  } else {
    str += T_NAME.ODD;
  }
  return str;
}

export function getTotalBigSmallOddEven(values) {
  const sum = reduce.getSum(values);
  const bigSmall = form.bigSmall(sum, 13) ? T_NAME.BIG : T_NAME.SMALL;
  const oddEven = form.oddEven(sum) ? T_NAME.ODD : T_NAME.EVEN;

  return bigSmall + oddEven;
}

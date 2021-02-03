import {form} from '../../calculation';
import {T_NAME} from '../../type.config';

export function getBigSmall(value) {
  const bigSmall = form.bigSmall(value, 10) ? T_NAME.BIG : T_NAME.SMALL;

  return bigSmall;
}

export function getOddEven(value) {
  const oddEven = form.oddEven(value) ? T_NAME.ODD : T_NAME.EVEN;

  return oddEven;
}

export function getBigSmallOddEven(value) {
  return getBigSmall(value) + getOddEven(value);
}

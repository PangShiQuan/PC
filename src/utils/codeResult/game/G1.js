import {T_NAME} from '../../type.config';
import {form, reduce} from '../../calculation';

function bigSmall(value) {
  return form.bigSmall(value, 13) ? T_NAME.BIG : T_NAME.SMALL;
}

function bigSmall3D(value) {
  return form.bigSmall(value, 4) ? T_NAME.BIG : T_NAME.SMALL;
}

function oddEven(value) {
  return form.oddEven(value) ? T_NAME.ODD : T_NAME.EVEN;
}

export function getBigSmallOddEven(value) {
  return bigSmall(value) + oddEven(value);
}

export function getBigSmall(values) {
  return reduce.concatNumsFn(values, bigSmall);
}

export function getBigSmallThree(values) {
  return reduce.concatNumsFn(values, bigSmall3D);
}


export function getOddEven(values) {
  return reduce.concatNumsFn(values, oddEven);
}

export function getPrimeComposite(values) {
  return reduce.concatNumsFn(
    values,
    value => (form.primeComposite(value) ? T_NAME.PRIME : T_NAME.COMPOSITE),
  );
}

export function getZeroOneTwo(values) {
  return reduce.concatNumsFn(values, form.zeroOneTwo);
}

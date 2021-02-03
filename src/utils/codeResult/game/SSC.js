import {T_NAME} from '../../type.config';
import {form, reduce} from '../../calculation';

export function getBigSmall(values) {
  return reduce.concatNumsFn(values, value =>
    form.bigSmall(value, 4) ? T_NAME.BIG : T_NAME.SMALL,
  );
}

export function getOddEven(values) {
  return reduce.concatNumsFn(values, value =>
    form.oddEven(value) ? T_NAME.ODD : T_NAME.EVEN,
  );
}

export function getPrimeComposite(values) {
  return reduce.concatNumsFn(values, value =>
    form.primeComposite(value) ? T_NAME.PRIME : T_NAME.COMPOSITE,
  );
}

export function getZeroOneTwo(values) {
  return reduce.concatNumsFn(values, form.zeroOneTwo);
}

export function getTotalBigSmallOddEven(values) {
  const sum = reduce.getSum(values);
  const bigSmall = form.bigSmall(sum, 22) ? T_NAME.BIG : T_NAME.SMALL;
  const oddEven = form.oddEven(sum) ? T_NAME.ODD : T_NAME.EVEN;

  return bigSmall + oddEven;
}

export function getCowName(values) {
  let s = 0;
  const dict = {};
  for (let i = 0; i < values.length; i++) {
    const ci = values[i];
    s += ci;
    dict[ci] = dict[ci] === undefined ? 1 : dict[ci] + 1;
  }
  const point = s % 10;

  let exists = false;
  for (const i of Object.keys(dict)) {
    const other = (10 + point - Number(i)) % 10;
    if (dict[other]) {
      if (
        (other === Number(i) && dict[other] >= 2) ||
        (other !== Number(i) && dict[other] >= 1)
      ) {
        exists = true;
        break;
      }
    }
  }
  const index1 = exists ? point : -1;
  const niuObj = {
    '-1': '无牛',
    0: '牛牛',
    1: '牛一',
    2: '牛二',
    3: '牛三',
    4: '牛四',
    5: '牛五',
    6: '牛六',
    7: '牛七',
    8: '牛八',
    9: '牛九',
  };
  return niuObj[index1];
}

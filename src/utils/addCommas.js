import _ from 'lodash';
import {round, roundDown} from './rounding';

const addCommas = (nStr, toRoundDown = false) => {
  // const str = String(_.round(nStr, 2));
  let str;
  if (toRoundDown) {
    str = roundDown(nStr);
  } else {
    str = round(nStr);
  }

  const x = str.split('.');
  let actualNumber = x[0];
  const afterDecimalNumber = x.length > 1 ? `.${x[1]}` : '.00';
  const rgx = /(\d+)(\d{3})/;
  while (rgx.test(actualNumber)) {
    actualNumber = actualNumber.replace(rgx, '$1,$2');
  }
  return actualNumber + afterDecimalNumber;
};

export {addCommas};

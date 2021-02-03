import _ from 'lodash';

const formatDecimalPoint = (decimalNumber, precision) => {
  let decimal = decimalNumber;

  if (decimal.length < precision) {
    const appendZero = '0'.repeat(precision - decimal.length);
    decimal = decimal.concat(appendZero);
  }

  return decimal;
};

const formatNumber = (inputNumber, precision) => {
  const array = inputNumber.toString().split('.');
  if (array.length > 1) {
    array.push(
      formatDecimalPoint(array.pop().substring(0, precision), precision),
    );
  } else {
    array.push('0'.repeat(precision));
  }
  return precision > 0 ? array.join('.') : array[0];
};

const round = (number, precision = 2) => {
  const roundedResult = _.round(number, precision);
  return formatNumber(roundedResult, precision);
};

const roundDown = (number, precision = 2) => {
  return formatNumber(number, precision);
};

export {round, roundDown};

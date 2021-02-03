import {random, round} from 'lodash';

Number.isInteger =
  Number.isInteger ||
  function isInteger(value) {
    return (
      typeof value === 'number' &&
      isFinite(value) &&
      Math.floor(value) === value
    );
  };

export function getTopupAmount(amount) {
  if (Number.isInteger(amount)) {
    const randomFloat = random(0.0, 0.99);
    return round(amount + randomFloat, 2);
  }
  return amount;
}

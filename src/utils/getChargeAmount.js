import _ from 'lodash';

function getChargeAmount({amount, multiply, maximum}) {
  // avoiding problems with demical math in js
  // convert to work with integers
  const scaledAmount = amount * 100;
  const multiplier = multiply * 100;

  let chargeAmount = _.floor(
    _.round(scaledAmount * multiplier, 2) / 100 / 100,
    2,
  );

  if (chargeAmount > maximum) chargeAmount = maximum;
  return chargeAmount;
}

export {getChargeAmount};

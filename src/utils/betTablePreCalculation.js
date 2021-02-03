import _ from 'lodash';

export default function betTablePreCalculation(
  betEntries,
) {
  let arrayCartItemPrize = [];
  for (let a = 0; a < betEntries.length; a++) {
    arrayCartItemPrize.push({
      arrayNumString: betEntries[a].numberOfUnits,
      arrayItemPrize: betEntries[a].returnMoneyRatioCart,
      arraySingleAmount: betEntries[a].amount,
      });
  }
  return arrayCartItemPrize;
}

import _ from 'lodash';

export default function betTableMultipleCalculation(
  betPlanData,
  value,
  id,
  singleAmountBet,
  arrayCartItemPrize,
  tabPlanValue,
  totalAmount,
) {
  const {arrayItemPrize} = arrayCartItemPrize[0];
  const getMatchId = id.split('multiply_');
  let betPlanTotal = [];
  _.forEach(betPlanData, (item, index) => {
    const {no, multiply, grandBet, reward, rewardRate, time} = item;
    if (tabPlanValue === 'profit') {
      if (no == getMatchId[1]) {
        betPlanTotal[index] = {
          no,
          multiply: value,
          grandBet:
            no === 1
              ? value * totalAmount
              : betPlanData[index - 1].grandBet + value * totalAmount,
          reward:
            no === 1
              ? arrayItemPrize[0] * value * singleAmountBet -
                value * totalAmount
              : arrayItemPrize[0] * value * singleAmountBet -
                (betPlanData[index - 1].grandBet + value * totalAmount),
          rewardRate:
            no === 1
              ? ((arrayItemPrize[0] * value * singleAmountBet -
                  value * totalAmount) /
                  (value * totalAmount)) *
                100
              : ((arrayItemPrize[0] * value * singleAmountBet -
                  (betPlanData[index - 1].grandBet + value * totalAmount)) /
                  (betPlanData[index - 1].grandBet + value * totalAmount)) *
                100,
          time,
        };
      } else {
        if (no > getMatchId[1]) {
          betPlanTotal[index] = {
            no,
            multiply,
            grandBet: betPlanTotal[index - 1].grandBet + totalAmount * multiply,
            reward:
              arrayItemPrize[0] * multiply * singleAmountBet -
              (betPlanTotal[index - 1].grandBet + totalAmount * multiply),
            rewardRate:
              ((arrayItemPrize[0] * multiply * singleAmountBet -
                (betPlanTotal[index - 1].grandBet + totalAmount * multiply)) /
                (betPlanTotal[index - 1].grandBet + totalAmount * multiply)) *
              100,
            time,
          };
        } else
          betPlanTotal[index] = {
            no,
            multiply,
            grandBet,
            reward,
            rewardRate,
            time,
          };
      }
    } else {
      if (no == getMatchId[1]) {
        betPlanTotal[index] = {
          no: no,
          multiply: value,
          grandBet:
            no === 1
              ? value * totalAmount
              : betPlanData[index - 1].grandBet + value * totalAmount,
          time: time,
        };
      } else {
        if (no > getMatchId[1]) {
          betPlanTotal[index] = {
            no,
            multiply,
            grandBet: betPlanTotal[index - 1].grandBet + totalAmount * multiply,
            time,
          };
        } else
          betPlanTotal[index] = {
            no,
            multiply,
            grandBet,
            time,
          };
      }
    }
  });
  return betPlanTotal;
}

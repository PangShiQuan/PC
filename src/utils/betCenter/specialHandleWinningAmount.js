export default function specialHandleWinningAmount(numberOfUnits, getAmountPerUnit, prizeSettings, methodId, ratio) {
  let prizeCollector = [];
  let winningAmount;
  prizeSettings.filter((prizeType) => {
    prizeCollector.push(prizeType.prizeAmount);
  });
  if (methodId === 'NCYG') {
    if (numberOfUnits == 1) {
      winningAmount = (getAmountPerUnit*prizeCollector[0])*ratio;
    }
    if (numberOfUnits == 2) {
      winningAmount = ((getAmountPerUnit*prizeCollector[1])+(getAmountPerUnit*prizeCollector[2]))*ratio;
    }
    if (numberOfUnits >= 3) {
      winningAmount = (getAmountPerUnit*prizeCollector[2]*3)*ratio;
    }
    return winningAmount;
  }
  else return false;
}

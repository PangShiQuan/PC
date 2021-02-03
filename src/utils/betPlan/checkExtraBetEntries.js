import _ from 'lodash';

export default function checkExtraBetEntries(betEntries) {
  let duplicatePlayMethodArray = [];
  let duplicatePrizeAmountMethod = [];
  betEntries.forEach(value=>{
    duplicatePlayMethodArray.push(value.gameplayMethod);
    duplicatePrizeAmountMethod.push(value.returnMoneyRatioCart);
  });
  //不同注单
  if (betEntries.length > 1) {
    return false;
  }
  //不同赔率
  if (_.uniq(Array.prototype.concat.apply([],duplicatePrizeAmountMethod)).length > 1) {
    return false;
  }
  //不同玩法
  if (_.uniq(duplicatePlayMethodArray).length != duplicatePlayMethodArray.length) {
    return false;
  }

  return true;
}
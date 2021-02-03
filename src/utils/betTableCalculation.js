import moment from 'moment';
import _ from 'lodash';
import {roundDown} from './rounding';

// initiateFactor 起始倍数
// baseProfitRate 最低盈利率
// doubledSpread 翻倍间隔
// doubledFactor 翻倍倍数

export default function betTableCalculation(
  arrayCartItemPrize,
  consecutivePeriod,
  currentResultsTimeMoment,
  selectedDurationResult,
  baseProfitRate,
  doubledFactor,
  doubledSpread,
  tab,
  getEntriesTotal,
  initiateFactor,
) {
  // 输出的object
  let betPlanTotal = [];
  // 获取购物车里的总金额和总注数
  let {totalAmount, totalUnits} = getEntriesTotal();
  // 累计投入
  let fixedAmount = 0;
  // 同倍和翻倍最高盈利
  let rewardNormalDoubled = 0;
  // 倍数
  let multiply = 1;
  // 盈利最高盈利变量初始化
  let rewardAI = 0;
  // 盈利最高盈利率变量初始化
  let rewardAIPercentage = 0;
  // 翻倍间隔变量初始化
  let intDoubledSpread = parseInt(doubledSpread);
  let intDoubledSpreadFinal = parseInt(doubledSpread);
  // 获取每期的时间间隔
  let selectedDurationResultMinutes = parseInt(
    selectedDurationResult.split('分钟')[0],
  );
  let selectedDurationResultRenew = 0;
  // 先减去的时间间隔
  let currentResultsTimeMomentRenew = moment(currentResultsTimeMoment)
    .subtract(selectedDurationResult.split('分钟')[0], 'minutes')
    .format('YYYY-MM-DD HH:mm:ss');
  // 获取购物车里的总金额 x 起始倍数
  multiply *= initiateFactor;
  // 算同倍最高赔率
  arrayCartItemPrize.forEach(item => {
    rewardNormalDoubled +=
      (Math.max(...item.arrayItemPrize) * item.arraySingleAmount * multiply) /
      item.arrayNumString;
  });

  // 根据连追期数来返回
  for (let a = 0; a < consecutivePeriod; a++) {
    // 算翻倍最高赔率
    if (a === intDoubledSpreadFinal) {
      multiply *= doubledFactor;
      rewardNormalDoubled *= doubledFactor;
      intDoubledSpreadFinal = intDoubledSpreadFinal + intDoubledSpread;
    }

    fixedAmount += totalAmount * multiply;
    selectedDurationResultRenew = selectedDurationResultRenew += selectedDurationResultMinutes;
    // 盈利最高盈利和盈利率
    if (tab === 'profit' && arrayCartItemPrize.length === 1) {
      rewardAI =
        (arrayCartItemPrize[0].arraySingleAmount /
          arrayCartItemPrize[0].arrayNumString) *
          multiply *
          arrayCartItemPrize[0].arrayItemPrize[0] -
        fixedAmount;
      rewardAIPercentage = (rewardAI / fixedAmount) * 100;

      if (rewardAIPercentage < roundDown(baseProfitRate)) {
        fixedAmount -= totalAmount * multiply;
      }

      while (rewardAIPercentage <= roundDown(baseProfitRate)) {
        multiply += 1;
        let totalAmountLoop = totalAmount * multiply;
        let fixedAmountLoop = fixedAmount + totalAmountLoop;
        rewardAI =
          (arrayCartItemPrize[0].arraySingleAmount /
            arrayCartItemPrize[0].arrayNumString) *
            multiply *
            arrayCartItemPrize[0].arrayItemPrize[0] -
          fixedAmountLoop;
        rewardAIPercentage = (rewardAI / fixedAmountLoop) * 100;
        if (rewardAIPercentage > roundDown(baseProfitRate)) {
          fixedAmount = fixedAmountLoop;
        }
        if (multiply > 10000) {
          break;
        }
      }
      if (multiply < 10000) {
        betPlanTotal[a] = {
          no: a + 1,
          multiply: multiply,
          grandBet: fixedAmount,
          reward: rewardAI,
          rewardRate: rewardAIPercentage,
          time: moment(currentResultsTimeMomentRenew)
            .add(selectedDurationResultRenew, 'minutes')
            .format('YYYY-MM-DD HH:mm:ss'),
        };
      }
    }
    // 数据展示呈现
    else
      betPlanTotal[a] = {
        no: a + 1,
        multiply: multiply,
        grandBet: fixedAmount,
        time: moment(currentResultsTimeMomentRenew)
          .add(selectedDurationResultRenew, 'minutes')
          .format('YYYY-MM-DD HH:mm:ss'),
      };
  }
  if (consecutivePeriod != betPlanTotal.length) {
    return {betPlanTotal, betCondition: false};
  }
  if (betPlanTotal.length == 0) {
    return {betCondition: false};
  }
  return {betPlanTotal, betCondition: true};
}

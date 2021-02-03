import _ from 'lodash';
import React from 'react';
import {
  addCommas,
  specialHandleWinningAmount,
  specialHandleLunpanBetString,
} from 'utils';
import {RangeInput} from 'components/General';
import css from 'styles/betCenter/RatioCtrl.less';
import betPrize from 'utils/betPrize';

function ReturnRatioCtrl(props) {
  let Scene = null;

  if (props.thisMethodPrizeSetting) {
    const {
      getAmount,
      getAmountPerUnit,
      onRangeChange,
      getEntriesTotal,
      thisMethodPrizeSetting: {prizeSettings, ratioOfReturnAmount},
      thisGameId,
      methodId,
      numberOfUnits,
      thisBetString,
      betEntries,
      displayTableLayout,
    } = props;
    let {returnMoneyRatio} = props;
    const showratioOfReturnAmount = _.round(ratioOfReturnAmount * 100, 1);
    if (methodId === 'SA') returnMoneyRatio = 10;
    const idExcluded = new RegExp(/(MARK_SIX)|(HF_JSMS)|(HF_\w[aA-zZ]\d[28])/g);
    const shouldShowRange =
      idExcluded.test(thisGameId) === false || methodId === 'LP';
    const ratio = (100 - returnMoneyRatio) / 100;
    // const prize = _.maxBy(prizeSettings, p => p.prizeAmount); // 最高赔率
    let prizeAmount;
    let winningAmount = 0;
    let prize = 0;
    let thisBetStringModified = null;
    if (methodId === 'LP') {
      thisBetStringModified = specialHandleLunpanBetString(thisBetString);
    } else thisBetStringModified = thisBetString;

    if (!displayTableLayout) {
      prize = betPrize.getBetPrize(
        methodId,
        thisBetStringModified,
        props.thisMethodPrizeSetting,
      );
    } else if (thisBetStringModified) {
      // in table view, select bet then only show rate
      prize = betPrize.getBetPrize(
        methodId,
        thisBetStringModified,
        props.thisMethodPrizeSetting,
      );
    }

    if (prize) {
      if (typeof prize === 'object') {
        prizeAmount = _.maxBy(Object.values(prize), p => {
          return p;
        });
      } else prizeAmount = prize;

      if (!prizeAmount) {
        prizeAmount = '0.00';
      }
      prizeAmount *= ratio;
    } else prizeAmount = '0.00';
    const winningAmountNCGY = specialHandleWinningAmount(
      numberOfUnits,
      getAmountPerUnit(),
      prizeSettings,
      methodId,
      ratio,
    );

    // [START} special cater for table view ============================
    if (prizeAmount === '0.00' && displayTableLayout && betEntries.length > 0) {
      const {returnMoneyRatioCart} = betEntries[betEntries.length - 1];
      if (returnMoneyRatioCart && returnMoneyRatioCart.length > 0) {
        prizeAmount = Math.max(returnMoneyRatioCart);
      }
    }
    // [END] special cater for table view ============================

    if (prizeAmount) {
      winningAmount = getAmountPerUnit() * prizeAmount;
      if (winningAmountNCGY) {
        winningAmount = winningAmountNCGY;
      }
    }
    let {totalAmount, totalUnits} = getEntriesTotal();
    const currentAmount = getAmount(numberOfUnits);
    const currentNumberOfUnits = numberOfUnits;
    totalAmount += currentAmount;
    totalUnits += currentNumberOfUnits;
    if (returnMoneyRatio > showratioOfReturnAmount) {
      returnMoneyRatio = showratioOfReturnAmount;
    }

    Scene = (
      <React.Fragment>
        <div className={css.ratioCtrl_paragraph}>
          <div className={css.ratioCtrl_label}>
            <p>总注数</p>
          </div>
          <div className={css.ratioCtrl_content}>
            <p>{totalUnits}</p>
          </div>
        </div>
        <div className={css.ratioCtrl_paragraph}>
          <div className={css.ratioCtrl_label}>
            <p>总金额</p>
          </div>
          <div className={css.ratioCtrl_content}>
            <p>{addCommas(totalAmount)} 元</p>
          </div>
        </div>
        {shouldShowRange ? (
          <React.Fragment>
            <div className={css.ratioCtrl_paragraph}>
              <div className={css.ratioCtrl_label}>
                <p>当前返点</p>
              </div>
              <div className={css.ratioCtrl_content}>
                <p>{returnMoneyRatio}%</p>
              </div>
            </div>
            <div className={css.ratioCtrl_rangeInput}>
              <RangeInput
                style={{marginBottom: 0}}
                onDrag={({currentTarget}) => onRangeChange(currentTarget.value)}
                onChange={({currentTarget}) =>
                  onRangeChange(currentTarget.value)
                }
                minLabel="0%"
                maxLabel={`${showratioOfReturnAmount}%`}
                shouldShowRange
                indicatorLabel={`(${returnMoneyRatio}%)`}
                name="prizeGroup"
                min={0}
                max={showratioOfReturnAmount}
                step={0.1}
                value={returnMoneyRatio}
              />
            </div>
            <div className={css.ratioCtrl_paragraph}>
              <div className={css.ratioCtrl_label}>
                <p>最高奖金</p>
              </div>
              <div className={css.ratioCtrl_content}>
                <p>{addCommas(+winningAmount, true)} 元</p>
              </div>
            </div>
            <div className={css.ratioCtrl_paragraph}>
              <div className={css.ratioCtrl_label}>
                <p>最高赔率</p>
              </div>
              <div className={css.ratioCtrl_content}>
                <p>{addCommas(prizeAmount, true)}</p>
              </div>
            </div>
          </React.Fragment>
        ) : null}
      </React.Fragment>
    );
  }

  return <div className={css.ratioCtrl}>{Scene}</div>;
}

export default ReturnRatioCtrl;

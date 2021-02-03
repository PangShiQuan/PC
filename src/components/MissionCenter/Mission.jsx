import React, {useCallback} from 'react';
import SVG from 'react-inlinesvg';
import css from 'styles/MissionCenter/mission.less';
import dollarSVG from 'assets/image/MissionCenter/dollar.svg';
import walletSVG from 'assets/image/MissionCenter/wallet.svg';
import {addCommas} from 'utils';

const Mission = props => {
  const {data} = props;
  let progressPercentage = (data.recordAmount / data.planAmount) * 100;
  progressPercentage = progressPercentage > 100 ? 100 : progressPercentage;
  const remainingAmount = (data.planAmount - data.recordAmount).toFixed(2);

  const renderText = useCallback(() => {
    let text = '去完成';
    if (data.taskReward) {
      if (data.taskReward.rewardStatus === 'RECEIVED') {
        text = '已领取';
      } else {
        text = '立即领取';
      }
    }
    return text;
  }, [data]);

  return (
    <div className={css.wrapper}>
      <div className={css.div_icon}>
        <SVG
          src={data.planType === 'TOPUP' ? walletSVG : dollarSVG}
          className={css.icon}
        />
      </div>
      <div className={css.div_info}>
        <div className={css.title}>
          {data.planType === 'TOPUP' ? '充值 ' : '投注 '}
          {addCommas(data.planAmount, true)}元金额
        </div>
        <div className={css.progress_bar}>
          <div
            className={css.progress}
            style={{width: `${progressPercentage}%`}}
          />
        </div>
        <div className={css.desc}>
          {remainingAmount <= 0 ? (
            <span>已完成</span>
          ) : (
            <React.Fragment>
              还差{' '}
              <span className={css.amount}>
                {addCommas(remainingAmount, true)}
              </span>
              元金额
            </React.Fragment>
          )}
        </div>
      </div>
      <div className={css.div_amount}>
        + {addCommas(data.planReward, true)}元
      </div>
      <div className={css.div_button}>
        <button
          type="button"
          data-received={
            data.taskReward && data.taskReward.rewardStatus === 'RECEIVED'
          }
          onClick={() => props.redeemReward(data.planType, data.taskReward)}>
          {renderText()}
        </button>
      </div>
    </div>
  );
};

export default Mission;

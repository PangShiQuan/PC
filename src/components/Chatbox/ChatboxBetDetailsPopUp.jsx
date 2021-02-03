import React, {useState, useEffect, useCallback} from 'react';
import {connect} from 'dva';
import moment from 'moment';
import css from 'styles/chatbox/index.less';
import {rounding} from 'utils';

const MULTIPLIER_ENUM = {
  DECREASE: 0,
  INCREASE: 1,
};
const renderStat = (label, value) => {
  return (
    <div className={css.stat}>
      <div className={css.label}>{label}</div>
      <div className={css.value}>{value}</div>
    </div>
  );
};

const calcTotalBetAmount = (value, multiplier, numberOfUnits) => {
  return rounding.round(
    (Math.round(value * 100 * multiplier) * numberOfUnits) / 100,
  );
};

const getInitialMultiplier = followOrderData => {
  if (
    followOrderData &&
    followOrderData.purchaseInfo &&
    followOrderData.purchaseInfo.childOrder &&
    followOrderData.purchaseInfo.childOrder.eachChildOrders &&
    followOrderData.purchaseInfo.childOrder.eachChildOrders.length === 1
  ) {
    const {
      multiplier,
    } = followOrderData.purchaseInfo.childOrder.eachChildOrders[0];
    return multiplier;
  }
  return 1;
};

const ChatboxBetDetailsPopUp = props => {
  const {dispatch, followOrderData, followOrderGameDetails} = props;

  const data = followOrderData.betEntries[0];

  const [multiplier, setMultiplier] = useState(
    getInitialMultiplier(followOrderData),
  );
  const [pricePerUnit, setPricePerUnit] = useState(data.pricePerUnit);
  const [totalBetAmount, setTotalBetAmount] = useState(
    calcTotalBetAmount(data.pricePerUnit, multiplier, data.numberOfUnits),
  );
  const [stopOrderTime, setStopOrderTime] = useState();
  const [alertMesaage, setAlertMessage] = useState();
  const [orderTimeout, setOrderTimeout] = useState();

  const getBetGameDetails = useCallback(() => {
    dispatch({
      type: 'chatboxModel/getBetGameDetails',
    });
  }, []);

  const showNewGameAlert = useCallback(() => {
    if (followOrderGameDetails) {
      const {current, lastOpen} = followOrderGameDetails;
      setAlertMessage(
        `${lastOpen.uniqueIssueNumber}期已截止${
          current.uniqueIssueNumber
        }期已开售。投注时注意期号变化`,
      );

      setTimeout(() => {
        setAlertMessage(null);
      }, 2000);
    }
  }, [followOrderGameDetails]);

  useEffect(() => {
    getBetGameDetails();
  }, []);

  useEffect(() => {
    let timeout;
    if (followOrderGameDetails) {
      timeout = setTimeout(() => {
        const diffTime =
          moment(followOrderGameDetails.current.stopOrderTime) - moment();

        if (diffTime < 0 && !orderTimeout) {
          setOrderTimeout(true);
          showNewGameAlert();
        } else if (diffTime > 0 && orderTimeout) {
          setOrderTimeout(false);
        }

        if (diffTime < 0) {
          return getBetGameDetails();
        }

        const duration = moment.duration(diffTime);
        setStopOrderTime(
          `${
            duration.hours() < 10 ? `0${duration.hours()}` : duration.hours()
          }:${
            duration.minutes() < 10
              ? `0${duration.minutes()}`
              : duration.minutes()
          }:${
            duration.seconds() < 10
              ? `0${duration.seconds() < 0 ? 0 : duration.seconds()}`
              : duration.seconds()
          }`,
        );
      }, 1000);
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [stopOrderTime, followOrderGameDetails, orderTimeout]);

  const closeWindow = useCallback(() => {
    dispatch({
      type: 'chatboxModel/updateState',
      payload: {
        followOrderData: null,
      },
    });
  }, [dispatch]);

  const multiplierClick = useCallback(value => {
    let newMultiplerValue = multiplier;
    if (value === MULTIPLIER_ENUM.INCREASE) {
      newMultiplerValue = multiplier < 99 ? multiplier + 1 : 99;
      setMultiplier(newMultiplerValue);
    } else if (value === MULTIPLIER_ENUM.DECREASE) {
      newMultiplerValue = multiplier > 1 ? multiplier - 1 : 1;
      setMultiplier(newMultiplerValue);
    } else {
      return setTotalBetAmount(
        calcTotalBetAmount(value, newMultiplerValue, data.numberOfUnits),
      );
    }
    setTotalBetAmount(
      calcTotalBetAmount(pricePerUnit, newMultiplerValue, data.numberOfUnits),
    );
  }, [multiplier, pricePerUnit]);

  const betAmountChange = useCallback(event => {
    const betAmountInput = event.target.validity.valid
      ? event.target.value
      : pricePerUnit;

    setPricePerUnit(betAmountInput);
    multiplierClick(betAmountInput);
  }, [pricePerUnit, multiplierClick]);

  const pricePerUnitFocus = useCallback(() => {
    if (pricePerUnit.toString().includes('.')) {
      setPricePerUnit(0);
      multiplierClick('');
    }
  }, [pricePerUnit]);

  const submitOrder = useCallback(() => {
    dispatch({
      type: 'chatboxModel/submitFollowOrder',
      payload: {
        data: followOrderData,
        multiplier,
        pricePerUnit,
      },
    });
  }, [followOrderData, multiplier, pricePerUnit, totalBetAmount]);

  return (
    <div className={css.chatbox_betDetails_container}>
      <div className={css.chatbox_betDetails_modal}>
        <div className={css.title_container}>
          跟单详情
          <button
            type="button"
            className={css.closeButton}
            onClick={closeWindow}>
            X
          </button>
        </div>
        <div className={css.body}>
          <div className={css.header}>
            <div className={css.game}>
              <div
                className={css.gameIcon}
                style={{backgroundImage: `url(${followOrderData.gameIconUrl})`}}
              />
              <div className={css.gameDesc}>
                <div>
                  {followOrderGameDetails
                    ? followOrderGameDetails.current.gameNameInChinese
                    : '-'}
                </div>
                <div className={css.issue}>
                  期号：
                  {followOrderGameDetails
                    ? `${followOrderGameDetails.current.planNo}期`
                    : '-'}
                </div>
              </div>
            </div>
            <div className={css.stopOrder}>
              <div>封盘时间：</div>
              <div>{stopOrderTime || '-'}</div>
            </div>
          </div>

          {renderStat('投注玩法', data.gameplayMethodInChinese)}
          {renderStat('投注内容', data.betStringForDisplay)}
          {renderStat('投注注数', data.numberOfUnits)}
          {renderStat('总金额', totalBetAmount)}

          <div className={css.bet_container}>
            <div className={css.label}>单注金额:</div>
            <div className={css.input}>
              {'￥'}
              <input
                type="text"
                pattern="[0-9]*"
                value={pricePerUnit}
                onChange={betAmountChange}
                onFocus={pricePerUnitFocus}
              />
            </div>
            <div className={css.multiplier_container}>
              <button
                type="button"
                onClick={() => multiplierClick(MULTIPLIER_ENUM.DECREASE)}>
                -
              </button>
              <b>{multiplier}倍</b>
              <button
                type="button"
                onClick={() => multiplierClick(MULTIPLIER_ENUM.INCREASE)}>
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            className={css.submitButton}
            onClick={submitOrder}>
            跟单
          </button>
        </div>
      </div>
      {alertMesaage && <div className={css.alertMessage}>{alertMesaage}</div>}
    </div>
  );
};

const mapStatesToProps = ({userModel, chatboxModel}) => {
  const {balance, awaitingResponse, userData} = userModel;
  const {
    enable: isChatEnabled,
    followOrderData,
    followOrderGameDetails,
  } = chatboxModel;
  return {
    balance,
    awaitingResponse,
    userData,
    isChatEnabled,
    followOrderData,
    followOrderGameDetails,
  };
};

export default connect(mapStatesToProps)(ChatboxBetDetailsPopUp);

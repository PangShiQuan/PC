import React, {Component} from 'react';
import {Modal, notification} from 'antd';
import {connect} from 'dva';
import _ from 'lodash';
import css from 'styles/betCenter/GamePlanModal.less';
import {Button, CoreButton, MDIcon} from 'components/General';
import {
  getGameSetup,
  betTableCalculation,
  betTablePreCalculation,
  betPlan,
  betTableMultipleCalculation,
} from 'utils';
import moment from 'moment';

const INPUTS = {
  CONSECUTIVE_PERIOD: {
    id: 'consecutivePeriod',
    text: '连追期数',
    defaultVal: 10,
  },
  INITIATE_FACTOR: {id: 'initiateFactor', text: '起始倍数', defaultVal: 1},
  BASE_PROFIT_RATE: {id: 'baseProfitRate', text: '最低盈利率', defaultVal: 30},
  DOUBLED_SPREAD: {id: 'doubledSpread', text: '翻倍间隔', defaultVal: 1},
  DOUBLED_FACTOR: {id: 'doubledFactor', text: '翻倍倍数', defaultVal: 1},
};
const initiateState = {};
Object.values(INPUTS).forEach(input => {
  initiateState[input.id] = input.defaultVal;
});
const BONUS_RATE = {
  profit: {
    id: 'profit',
    max: {
      [INPUTS.CONSECUTIVE_PERIOD.id]: 10,
      [INPUTS.INITIATE_FACTOR.id]: 20,
      [INPUTS.BASE_PROFIT_RATE.id]: 1000,
    },
    text: '盈利率追号',
  },
  normal: {
    id: 'normal',
    max: {
      [INPUTS.CONSECUTIVE_PERIOD.id]: 10,
      [INPUTS.INITIATE_FACTOR.id]: 20,
    },
    text: '同倍追号',
  },
  doubled: {
    id: 'doubled',
    max: {
      [INPUTS.CONSECUTIVE_PERIOD.id]: 10,
      [INPUTS.INITIATE_FACTOR.id]: 20,
      [INPUTS.DOUBLED_SPREAD.id]: 10,
      [INPUTS.DOUBLED_FACTOR.id]: 20,
    },
    text: '翻倍追号',
  },
};
const tableWidth = {
  [BONUS_RATE.profit.id]: '14%',
  [BONUS_RATE.normal.id]: '20%',
  [BONUS_RATE.doubled.id]: '20%',
};

class GamePlanModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tab: BONUS_RATE.profit.id,
      ...initiateState,
    };
    this.dispatch = props.dispatch;
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.uniqueIssueNumber !== nextProps.uniqueIssueNumber &&
      this.props.thisGameId === nextProps.thisGameId
    ) {
      if (this.props.betPlanData.length > 0) {
        this.onGenerateBetPlan();
        const key = 'notificationBetPlanRefreshBtn';
        const onBtnRefreshClick = () => {
          notification.close(key);
        };
        const btn = (
          <button
            onClick={onBtnRefreshClick}
            className={css.betCenter_notificationBtn}>
            <span>知道了！</span>
          </button>
        );
        notification.open({
          message: `${this.props.uniqueIssueNumber}期已截止，${
            this.props.uniqueIssueNumber+1
          }期已开售。投注时注意期号变化。`,
          btn,
          key,
          duration: 7,
          onClose: notification.close(key),
        });
      }
    }
  }

  onModalClose = () => {
    this.setState({
      tab: BONUS_RATE.profit.id,
      baseProfitRate: 30,
      consecutivePeriod: 10,
      doubledFactor: 1,
      doubledSpread: 1,
      initiateFactor: 1,
    });
    this.dispatch({
      type: 'betCenter/clearBetPlan',
    });
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {tabPlanValue: BONUS_RATE.profit.id},
    });
  };

  onGenerateBetPlan = () => {
    const {
      tab,
      baseProfitRate,
      consecutivePeriod,
      doubledFactor,
      doubledSpread,
      initiateFactor,
    } = this.state;
    const {
      thisGameId,
      methodId,
      betPlan,
      returnMoneyRatio,
      thisMethodPrizeSetting,
      betEntries,
      thisBetString,
      currentResults,
      getAmount,
      getEntriesTotal,
      numberOfUnits,
    } = this.props;
    let currentResultsTimeMoment;
    // let amountGame = baseAmount * multiply * numberOfUnits * amountUnit;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        consecutivePeriodStore: consecutivePeriod,
      },
    });
    this.dispatch({type: 'betCenter/getCurrentBetPlanNo', consecutivePeriod});
    const currentResultsFilterById = _.find(currentResults, [
      'gameUniqueId',
      thisGameId,
    ]);
    const selectedDurationResult = getGameSetup({gameUniqueId: thisGameId})
      .issueDuration; // time ++
    if (currentResultsFilterById && currentResultsFilterById.officialOpenTime) {
      currentResultsTimeMoment = moment(
        currentResultsFilterById.officialOpenTime,
      ).format('YYYY-MM-DD HH:mm:ss'); // time
    }
    const arrayCartItemPrize = betTablePreCalculation(betEntries);
    const {betCondition, betPlanTotal} = betTableCalculation(
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
    );
    if (betPlan) {
      _.forEach(betPlanTotal, item => {
        const {no, multiply} = item;
        this.setState({
          [`multiply_${no}`]: multiply,
        });
      });
      this.dispatch({
        type: 'betCenter/updateState',
        payload: {betPlanData: betPlanTotal},
      });
    }
    if (!betCondition && betPlan) {
      const key = 'notificationBetPlanBtn';
      const onBtnClick = () => {
        notification.close(key);
      };
      const btn = (
        <button onClick={onBtnClick} className={css.betCenter_notificationBtn}>
          <span>知道了！</span>
        </button>
      );
      notification.open({
        message: '系统自动过滤掉超过9999倍和负数盈利率订单',
        btn,
        key,
        duration: 7,
        onClose: notification.close(key),
      });
    }
  };

  onToggle = () => {
    const {haltOnWin} = this.props;
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        haltOnWin: !haltOnWin,
      },
    });
  };

  switchTab = ({currentTarget}) => {
    const {betEntries, thisGameId, betPlanData, methodGroup} = this.props;

    this.setState({
      tab: currentTarget.value,
      baseProfitRate: 30,
      consecutivePeriod: 10,
      doubledFactor: 1,
      doubledSpread: 1,
      initiateFactor: 1,
    });
    const isBetEntriesPlanExist = betPlan.getBetPlan(
      betEntries,
      getGameSetup({gameUniqueId: thisGameId}).issueDuration,
      betPlanData,
      currentTarget.value,
      methodGroup,
    );
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        betPlan: isBetEntriesPlanExist,
        tabPlanValue: currentTarget.value,
      },
    });
    this.dispatch({
      type: 'betCenter/clearBetPlan',
    });
  };

  onChange = ({currentTarget}) => {
    const {min, max} = currentTarget;
    let {value} = currentTarget;
    value = _.round(value);
    if (value < min) value = '';
    if (value > max) value = max;
    this.setState({
      [currentTarget.id]: value,
    });
  };

  onMultipleChange = ({currentTarget}) => {
    const {getEntriesTotal, betEntries, betPlanData, tabPlanValue} = this.props;
    const {min, max} = currentTarget;
    let {value} = currentTarget;
    let {totalAmount, totalUnits} = getEntriesTotal();
    let singleAmountBet = totalAmount / totalUnits;
    const arrayCartItemPrize = betTablePreCalculation(betEntries);
    value = _.round(value);
    if (value < min) value = '';
    if (value > max) value = max;
    const modifiedMultiplication = betTableMultipleCalculation(
      betPlanData,
      value ? value : min,
      currentTarget.id,
      singleAmountBet,
      arrayCartItemPrize,
      tabPlanValue,
      totalAmount,
    );
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {betPlanData: modifiedMultiplication},
    });
    this.setState({
      [currentTarget.id]: value,
    });
  };

  renderMultiplyInput(keyNo) {
    const {tabPlanValue} = this.props;
    const {[`multiply_${keyNo}`]: value} = this.state;
    return (
      <div
        className={css.inputFieldMultiplyDiv}
        style={{width: tableWidth[tabPlanValue]}}>
        <input
          key={keyNo}
          id={`multiply_${keyNo}`}
          max={9999}
          min={1}
          name={`multiply_${keyNo}`}
          value={value}
          type="number"
          className={css.inputFieldMultiply}
          onChange={this.onMultipleChange}
          onBlur={this.onBlur}
        />
      </div>
    );
  }

  onBlur = ({currentTarget}) => {
    const {min} = currentTarget;
    let {value} = currentTarget;
    this.setState({
      [currentTarget.id]: value ? value : min,
    });
  };

  renderInput(prop) {
    const {tab, [prop.id]: value} = this.state;
    const {max} = BONUS_RATE[tab];
    return (
      <label key={prop.id} htmlFor={prop.id}>
        <span className={css.label}>{prop.text} : </span>
        <input
          id={prop.id}
          max={max[prop.id]}
          min={1}
          name={prop.id}
          value={value}
          type="number"
          className={css.inputField}
          onChange={this.onChange}
          onBlur={this.onBlur}
        />
      </label>
    );
  }

  renderStopPrizeButton() {
    const {haltOnWin} = this.props;
    return (
      <button
        type="button"
        className={css.profile_radioBtn}
        data-checked={haltOnWin}
        name="stopPrize"
        onClick={this.onToggle}>
        <MDIcon iconName={haltOnWin ? 'radiobox-marked' : 'radiobox-blank'} />
        <span className={css.label}>中奖后停止追号</span>
      </button>
    );
  }

  renderChaseNoPlan() {
    return (
      <CoreButton
        placeholder="生成追号计划"
        onClick={this.onGenerateBetPlan}
        className={css.buttonPlan}
      />
    );
  }

  renderInputs() {
    const {tab} = this.state;
    const AddonInputs = {
      [BONUS_RATE.profit.id]: [this.renderInput(INPUTS.BASE_PROFIT_RATE)],
      [BONUS_RATE.normal.id]: [],
      [BONUS_RATE.doubled.id]: [
        this.renderInput(INPUTS.DOUBLED_FACTOR),
        this.renderInput(INPUTS.DOUBLED_SPREAD),
      ],
    }[tab];

    return (
      <div className={css.input}>
        {this.renderInput(INPUTS.CONSECUTIVE_PERIOD)}
        {this.renderInput(INPUTS.INITIATE_FACTOR)}
        {AddonInputs}
        {this.renderStopPrizeButton()}
        {this.renderChaseNoPlan()}
      </div>
    );
  }

  renderTableHeader() {
    const {tabPlanValue} = this.props;
    return (
      <div className={css.tableHeaders}>
        <span
          style={{width: tableWidth[tabPlanValue]}}
          className={css.tableHeader}>
          序号
        </span>
        <span
          style={{width: tableWidth[tabPlanValue]}}
          className={css.tableHeader}>
          追号期数
        </span>
        <span
          style={{width: tableWidth[tabPlanValue]}}
          className={css.tableHeader}>
          倍数
        </span>
        <span
          style={{width: tableWidth[tabPlanValue]}}
          className={css.tableHeader}>
          累计投入
        </span>
        {tabPlanValue === 'profit' ? (
          <span
            style={{width: tableWidth[tabPlanValue]}}
            className={css.tableHeader}>
            预期盈利
          </span>
        ) : null}
        {tabPlanValue === 'profit' ? (
          <span
            style={{width: tableWidth[tabPlanValue]}}
            className={css.tableHeader}>
            预期盈利率
          </span>
        ) : null}
        <span
          style={{width: tableWidth[tabPlanValue]}}
          className={css.tableHeader}>
          开奖时间
        </span>
      </div>
    );
  }

  renderTableBody() {
    const {
      betPlan,
      betPlanData,
      tabPlanValue,
      betPlanIssueNumber,
      awaitingResponse,
    } = this.props;
    let tableData = [];
    if (betPlan && betPlanData.length === 0) {
      return <div className={css.tableBody_NoData}>没有数据</div>;
    } else if (awaitingResponse && betPlan) {
      return <div className={css.tableBody_NoData}>数据加载中...</div>;
    } else {
      if (
        betPlan &&
        betPlanData.length > 0 &&
        betPlanIssueNumber &&
        (betPlanData.length == betPlanIssueNumber.length ||
          betPlanIssueNumber.length > betPlanData.length)
      ) {
        _.forEach(betPlanData, (item, index) => {
          const {no, grandBet, reward, rewardRate, time} = item;
          tableData.push(
            <div key={no} className={css.betPlanlist}>
              <span
                style={{width: tableWidth[tabPlanValue]}}
                className={css.tableTd}>
                {no}
              </span>
              <span
                style={{width: tableWidth[tabPlanValue]}}
                className={css.tableTd}>
                {betPlanIssueNumber[index].uniqueIssueNumber}
              </span>
              {this.renderMultiplyInput(no)}
              <span
                style={{width: tableWidth[tabPlanValue]}}
                className={css.tableTd}>{`${Math.floor(grandBet * 100) /
                100}元`}</span>
              {reward ? (
                <span
                  style={
                    reward > 0
                      ? {width: tableWidth[tabPlanValue], color: 'green'}
                      : {width: tableWidth[tabPlanValue], color: 'red'}
                  }
                  className={css.tableTd}>{`${Math.floor(reward * 100) /
                  100}元`}</span>
              ) : null}
              {rewardRate ? (
                <span
                  style={
                    rewardRate > 0
                      ? {width: tableWidth[tabPlanValue], color: 'green'}
                      : {width: tableWidth[tabPlanValue], color: 'red'}
                  }
                  className={css.tableTd}>{`${Math.floor(rewardRate * 100) /
                  100}%`}</span>
              ) : null}
              <span
                style={{width: tableWidth[tabPlanValue]}}
                className={css.tableTd}>
                {time}
              </span>
            </div>,
          );
        });
        return <div className={css.totalBetPlanList}>{tableData}</div>;
      } else
        return (
          <div className={css.tableBody_NoData}>
            <p>温馨提示</p>
            <p>您的当前订单暂无法进行智能追号, 可能存在以下情况:</p>
            <ol>
              <li>1. 包括多种玩法.</li>
              <li>2. 每注单价或赔率不同.</li>
              <li>3. 当前玩法不支持智能追号.</li>
              <li>
                4. 建议使用<span style={{color: 'blue'}}>同倍追号</span>和
                <span style={{color: 'blue'}}>翻倍追号</span>投注.
              </li>
            </ol>
          </div>
        );
    }
  }

  render() {
    const {addEntryLoading, tab} = this.state;
    const {
      betPlan,
      handleCancel,
      handleConfirm,
      visible,
      betEntries,
      methodId,
      thisBetString,
      betPlanData,
      numberOfUnits,
      getEntriesTotal,
    } = this.props;
    const disabled = !betPlanData.length;
    let {totalUnits} = getEntriesTotal();
    return (
      <Modal
        visible={visible}
        title="追号投注"
        centered
        width="80%"
        style={{maxWidth: '70rem'}}
        onOk={handleConfirm}
        onCancel={handleCancel}
        afterClose={this.onModalClose}
        wrapClassName={css.betPlanModelFooter}
        footer={[
          <Button
            key="confirm"
            disabled={disabled}
            className={css.action}
            loading={addEntryLoading}
            onClick={handleConfirm}
            placeholder="确认追号"
          />,
          <Button
            key="cancel"
            className={css.action}
            onClick={handleCancel}
            placeholder="取消追号"
          />,
        ]}>
        <div className={css.content}>
          {Object.values(BONUS_RATE).map(({id, text}) => (
            <button
              key={id}
              type="button"
              className={css.tab}
              data-checked={tab === id}
              onClick={this.switchTab}
              value={id}>
              {text}
            </button>
          ))}
        </div>
        {this.renderInputs()}
        {this.renderTableHeader()}
        {this.renderTableBody()}
        <div className={css.confirmText}>
          <span>
            您选择了追号
            <strong className={css.result}>
              {' '}
              {disabled ? 0 : betPlanData[betPlanData.length - 1].no}{' '}
            </strong>
            期 ,
          </span>
          <span>
            <strong className={css.result}>
              {' '}
              {disabled
                ? 0
                : totalUnits * betPlanData[betPlanData.length - 1].no}{' '}
            </strong>
            注 ,
          </span>
          <span>
            总共投注金额
            <strong className={css.result}>
              {' '}
              {disabled
                ? 0
                : (
                    Math.floor(
                      betPlanData[betPlanData.length - 1].grandBet * 100,
                    ) / 100
                  ).toFixed(2)}{' '}
            </strong>
            元
          </span>
        </div>
      </Modal>
    );
  }
}

function mapStateToProps({betCenter, gameInfosModel}) {
  return {
    betPlan: betCenter.betPlan,
    currentResults: gameInfosModel.currentResults,
  };
}

export default connect(mapStateToProps)(GamePlanModal);

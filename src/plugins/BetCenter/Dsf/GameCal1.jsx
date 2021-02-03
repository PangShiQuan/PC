import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Tooltip} from 'antd';
import _ from 'lodash';
import classnames from 'classnames';
import Modal from 'components/BetCenter/GamePlanModal';
import GamePlanButton from 'components/BetCenter/GamePlanButton';
import {MDIcon} from 'components/General';
import {type as TYPE} from 'utils';
import resolve from 'clientResolver';

const css = resolve.client('styles/betCenter/GameCal.less');

class GameCal extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.awaitingResponse = props.awaitingResponse;
    this.onInputChange = props.onInputChange;
    this.onInputBlur = props.onInputBlur;
  }

  componentWillReceiveProps(nextProps) {
    this.awaitingResponse = nextProps.awaitingResponse;
  }

  onMultipleChange = ({currentTarget}) => {
    let {multiply} = currentTarget.dataset;

    if (!currentTarget.dataset)
      multiply = currentTarget.getAttribute('data-multiply');

    this.props.onMultipleChange(multiply);
  };

  showModal = () => {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        betPlanModalVisible: true,
      },
    });
  };

  handleConfirm = () => {
    const {onPostEntryHandler} = this.props;
    this.hideModal();
    onPostEntryHandler({isBetPlan: true});
  };

  handleCancel = () => {
    this.hideModal();
  };

  hideModal() {
    this.dispatch({
      type: 'betCenter/updateState',
      payload: {
        betPlanModalVisible: false,
      },
    });
  }

  renderAmountUnitsBtn() {
    const {onUnitToggle, amountUnit} = this.props;
    return _.map(TYPE.UNITS, (unit, unitName) => {
      const btnActive = unit === amountUnit;
      return (
        <button
          type="button"
          key={unitName}
          className={css.gameCal_unitBtn}
          data-active={btnActive}
          onClick={onUnitToggle.bind(this, unit)}
          disabled={btnActive}>
          {unitName}
        </button>
      );
    });
  }

  render() {
    const {
      multiply,
      onInitializeClick,
      baseAmount,
      onAddEntry,
      onRandomClick,
      disabledAddEntry,
      awaitingResponse,
      haltOnWin,
      betEntries,
      dispatch,
      tabPlanValue,
      getAmount,
      getEntriesTotal,
      betPlanModalVisible,
      otherSettings,
      betPlanIssueNumber,
      isTableLayout,
    } = this.props;
    return (
      <div>
        <Modal
          visible={betPlanModalVisible}
          handleConfirm={this.handleConfirm}
          handleCancel={this.handleCancel}
          {...this.props}
        />
        <div className={css.gameCal}>
          <span className={css.gameCal_text}>金额</span>
          <input
            disabled={this.awaitingResponse}
            type="number"
            value={baseAmount}
            min={1}
            max={99999999}
            name="baseAmount"
            className={css.gameCal_baseAmountInput}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
          />
          {this.renderAmountUnitsBtn()}
          <span
            className={classnames(css.gameCal_multiplySpan, css.gameCal_text)}>
            倍数
          </span>
          <button
            type="button"
            disabled={this.awaitingResponse}
            className={css.gameCal_multiplyBtn}
            onClick={this.onMultipleChange}
            data-multiply={multiply - 1}>
            <MDIcon iconName="minus" />
          </button>
          <input
            disabled={this.awaitingResponse}
            type="number"
            value={multiply}
            min={1}
            max={9999}
            name="multiply"
            className={css.gameCal_multiplyInput}
            onChange={this.onInputChange}
            onBlur={this.onInputBlur}
          />
          <button
            type="button"
            disabled={this.awaitingResponse}
            className={css.gameCal_multiplyBtn}
            onClick={this.onMultipleChange}
            data-multiply={multiply + 1}>
            <MDIcon iconName="plus" />
          </button>
          <div className={css.gameCal_ctrlBtns}>
            <Tooltip
              title={
                betEntries.length > 0
                  ? '追号投注只追购物车里的订单'
                  : '请把订单加入购物车再追号'
              }>
              <div>
                <GamePlanButton
                  disabled={!(betEntries.length > 0) || awaitingResponse}
                  className={css.gameCal_ctrlBtn}
                  onClick={this.showModal}
                  {...this.props}
                />
              </div>
            </Tooltip>
            {!isTableLayout && (
              <button
                type="button"
                disabled={this.awaitingResponse}
                onClick={onInitializeClick}
                className={css.gameCal_ctrlBtn__clear}>
                清
              </button>
            )}
            {!isTableLayout && (
              <React.Fragment>
                <button
                  type="button"
                  disabled={this.awaitingResponse}
                  onClick={this.onMultipleChange}
                  data-multiply={multiply * 2}
                  className={css.gameCal_ctrlBtn}>
                  加倍
                </button>
                <button
                  type="button"
                  disabled={disabledAddEntry || this.awaitingResponse}
                  className={css.gameCal_ctrlAddBtn}
                  onClick={onAddEntry}>
                  添加
                </button>
                <button
                  type="button"
                  disabled={this.awaitingResponse}
                  onClick={onRandomClick}
                  className={css.gameCal_ctrlBtn}>
                  随机
                </button>
              </React.Fragment>
            )}
            {isTableLayout && (
              <button
                type="button"
                disabled={this.awaitingResponse}
                onClick={onInitializeClick}
                className={css.gameCal_ctrlBtn__clear}>
                清
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}

GameCal.propTypes = {
  thisGameId: PropTypes.string,
};

export default GameCal;

import React, {PureComponent} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {sortBy, map, truncate, split, toNumber, sum, find} from 'lodash';
import {
  addCommas,
  type as TYPE,
  getConcatArray,
  specialHandleDisplayNewPokerRX,
} from 'utils';
import {Tooltip, Modal, Dropdown} from 'antd';
import {MDIcon, PokerCard} from 'components/General';
import ClipboardButton from 'react-clipboard.js';
import css from 'styles/User/TradingCenter/BettingRecords.less';
import tableCSS from 'styles/User/Form/Table.less';

const {transactionStateRefs, coTransactionStateRefs} = TYPE;

function DropDownItem({active, onSelect, value, placeholder}) {
  function onClick() {
    onSelect(value);
  }
  return (
    <button
      type="button"
      data-active={active}
      onClick={onClick}
      className={tableCSS.dropdown_item}>
      {placeholder}
    </button>
  );
}

class BettingDetails extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tooltipText: '点我复制到剪贴板',
      showBetDetails: null,
    };
    this.dispatch = props.dispatch;
  }

  componentDidMount() {}

  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };

  onShowConfirmModalClick = () => {
    Modal.confirm({
      title: '您真的要撤销此订单',
      onOk: () => this.dispatch({type: 'orderModel/putCancelOrder'}),
    });
  };

  onChildOrderSelect = orderInfo => {
    const hasResultsState = ['CO_SUB_WIN', 'CO_SUB_LOSS'];
    if (hasResultsState.includes(orderInfo.transactionState)) {
      this.dispatch({type: 'orderModel/getOrderDetails', payload: orderInfo});
    } else {
      this.dispatch({
        type: 'orderModel/updateState',
        payload: {orderInfo, subOrders: []},
      });
    }
  };

  onBetDetailsClick = index => {
    document.addEventListener('click', this.disposeBetDetailsBox);
    this.setState({
      showBetDetails: index,
    });
  };

  disposeBetDetailsBox = () => {
    this.setState({
      showBetDetails: null,
    });
    document.removeEventListener('click', this.disposeBetDetailsBox);
  };

  renderResponseMsg = () => {
    const {responseMsg} = this.props;
    const {msg, color, icon} = responseMsg;
    if (msg) {
      return (
        <div data-color={color} className={css.profile_formResponse}>
          <MDIcon iconName={icon} />
          <span>{msg}</span>
        </div>
      );
    }
    return null;
  };

  renderCoChildOrder = () => {
    const {coChildOrderList, orderInfo} = this.props;
    return (
      <ul className={tableCSS.dropdown_menu}>
        {map(coChildOrderList, (childOrder, index) => {
          const {gameIssueNo, transactionState, winningAmount} = childOrder;
          const amountColor = {
            CO_SUB_LOSS: 'red',
            CO_SUB_WIN: 'green',
          };
          const placeholder = [
            `第${gameIssueNo}期 (追号第${index + 1}期) `,
            <span
              key="winningAmount"
              className={css.dropdown_item}
              data-color={amountColor[transactionState]}>
              {coTransactionStateRefs[transactionState]}
              {winningAmount ? ` ${addCommas(winningAmount)}元` : ''}
            </span>,
          ];
          return (
            <DropDownItem
              active={orderInfo.gameIssueNo === gameIssueNo}
              value={childOrder}
              key={childOrder.transactionTimeuuid}
              placeholder={placeholder}
              onSelect={this.onChildOrderSelect}
            />
          );
        })}
      </ul>
    );
  };

  renderBetString = perBetUnits => {
    const sortedBetUnits = sortBy(perBetUnits, [o => o.betString]);
    return (
      <ul className={css.dropdown_menu}>
        {map(sortedBetUnits, (betStrings, index) => {
          const {betString, bonus} = betStrings;
          return (
            <li key={`${betString}-${index}`} className={css.dropdown_item}>
              <span>{betString}</span>{' '}
              {bonus ? (
                <span
                  className={css.dropdown_item}
                  data-color="green">{`中奖 ${addCommas(bonus)}元`}</span>
              ) : null}
            </li>
          );
        })}
      </ul>
    );
  };

  renderOpenNo = () => {
    const {orderInfo} = this.props;
    const {gameUniqueId, drawNumber} = orderInfo;
    if (!drawNumber) {
      return <span> - </span>;
    }

    let drawArray = split(drawNumber, '|');
    drawArray = map(drawArray, drawNo => toNumber(drawNo));
    const drawArraySum = sum(drawArray);
    switch (gameUniqueId) {
      case 'HF_BJ28':
      case 'HF_LF28':
        return (
          <span className={css.draw_number}>
            {`${drawArray[0]} + ${drawArray[1]} + ${
              drawArray[2]
            } = ${drawArraySum}`}
          </span>
        );
      case 'HF_XYPK':
      case 'HF_LFKLPK':
        drawArray = map(drawArray, drawNo => (
          <span key={drawNo} className={css.profile_popUpPokerNo}>
            <PokerCard pokerCode={[drawNo]} size={1} />
          </span>
        ));
        return drawArray;
      default:
        return <span className={css.draw_number}>{drawNumber}</span>;
    }
  };

  renderTableBody = () => {
    const {showBetDetails} = this.state;
    const {subOrders, orderInfo} = this.props;
    let transactionStateInAdvanced;
    if (subOrders) {
      return map(
        subOrders,
        (
          {
            gameMethodInChinese,
            transactionState,
            perBetUnits,
            perBetUnit,
            bettingAmount,
            totalUnits,
            winningAmount,
            betString,
            transactionStateName,
            gameplayMethod,
          },
          index,
        ) => {
          const specialPokerRXHandle = specialHandleDisplayNewPokerRX(
            orderInfo.gameUniqueId,
            gameplayMethod,
            betString,
          );
          const truncatedBetString = specialPokerRXHandle
            ? truncate(specialPokerRXHandle, {length: '10'})
            : truncate(betString, {length: '20'});
          const amountColor = {
            WIN: 'green',
            LOSS: 'red',
          };

          if (winningAmount) {
            transactionStateInAdvanced = transactionStateRefs[transactionState];
          } else {
            transactionStateInAdvanced = transactionStateName;
            if (orderInfo.transactionState.indexOf('CO') > -1) {
              transactionStateInAdvanced = '---';
            }
          }

          const sortedBetUnits = sortBy(perBetUnits, [o => o.betString]);
          const inside = map(sortedBetUnits, (betStrings, i) => {
            const {betString: bString, bonus} = betStrings;
            let specialBetStringHandle;
            if (specialPokerRXHandle) {
              specialBetStringHandle = specialPokerRXHandle;
            } else {
              specialBetStringHandle = bString;
            }
            return (
              <div className={css.bet_string_result} key={`${bString}-${i}`}>
                <span>{specialBetStringHandle}</span>
                {bonus ? (
                  <span
                    className={css.betString_bonus}
                    data-color="green">{`中奖 ${addCommas(bonus)}元`}</span>
                ) : null}
              </div>
            );
          });

          return (
            <tr key={index}>
              <td>{gameMethodInChinese}</td>
              <td className={css.bet_string}>
                <button
                  type="button"
                  onClick={() => this.onBetDetailsClick(index)}>
                  {truncatedBetString}
                </button>
                <div
                  className={css.bet_string_details}
                  style={{
                    display: showBetDetails === index ? 'flex' : 'none',
                  }}>
                  <div>{gameMethodInChinese}</div>
                  <div className={css.bet_string_record}>{betString}</div>
                  {inside}
                </div>
              </td>
              <td>{addCommas(perBetUnit)}元</td>
              <td>{totalUnits}</td>
              <td>{bettingAmount}</td>
              <td
                className={css.winning_amount}
                data-color={amountColor[transactionState]}>
                {transactionStateInAdvanced}
                {winningAmount
                  ? ` ${addCommas(winningAmount.toFixed(2))}元`
                  : ''}
              </td>
            </tr>
          );
        },
      );
    }

    return (
      <tr>
        <td colSpan="100%">暂无数据</td>
      </tr>
    );
  };

  render() {
    const {tooltipText} = this.state;
    const {
      tag,
      orderInfo,
      gameInfos,
      otherSettings,
      coChildOrderList,
    } = this.props;
    const hasCoChildOrders = !!coChildOrderList.length;
    const {orderCommon = false, orderAfter = false} = otherSettings;
    const {
      gameNameInChinese,
      gameUniqueId,
      transactionTimeuuid,
      transactionAmount,
      gameIssueNo,
      rebate,
      winningAmount,
      bettingTime,
      transactionState,
      multiplier,
      transactionStateName,
      stopAfterWin,
    } = orderInfo;
    let notAllowedCancel;
    if (transactionState === 'PENDING') {
      notAllowedCancel = orderCommon;
    } else if (transactionState === 'CO_IN_PROGRESS') {
      notAllowedCancel = orderAfter;
    } else {
      notAllowedCancel = !['PENDING', 'CO_IN_PROGRESS'].includes(
        transactionState,
      );
    }

    const amountColor = {
      WIN: 'green',
      LOSS: 'red',
    };
    const stringArry = getConcatArray(transactionTimeuuid);
    const game = find(gameInfos, ['gameUniqueId', gameUniqueId]);

    return (
      <div className={css.bet_details}>
        <div className={css.bet_details_header}>
          <div className={css.headline}>
            {game ? (
              <img
                className={css.game_image}
                src={game.gameIconUrl}
                alt={gameNameInChinese}
              />
            ) : null}
            <div>
              <span className={css.game_name}>{gameNameInChinese}</span>
            </div>
            <div>
              <span className={css.game_period}>
                第<strong>{gameIssueNo}</strong>期开奖号
              </span>
            </div>
            <div>{this.renderOpenNo()}</div>
          </div>
          <div>
            {hasCoChildOrders && (
              <React.Fragment>
                {tag.includes('_PARENT') && (
                  <span>中奖后{!stopAfterWin && '不'}停止追号</span>
                )}
                <Dropdown overlay={this.renderCoChildOrder()}>
                  <button type="button" className={css.cancel_button}>
                    <i>追号订单</i>
                    <MDIcon iconName="chevron-down" />
                  </button>
                </Dropdown>
              </React.Fragment>
            )}
            {notAllowedCancel ? null : (
              <button
                type="button"
                className={css.cancel_button}
                onClick={this.onShowConfirmModalClick}>
                取消订单
              </button>
            )}
          </div>
        </div>

        {this.renderResponseMsg()}
        <div className={css.bet_details_body}>
          <div className={css.row}>
            <div className={css.column}>
              <div className={css.label}>投注金额</div>
              <div className={css.value}>{addCommas(transactionAmount)}元</div>
            </div>
            <div className={css.column}>
              <div className={css.label}>状态</div>
              <div
                className={classnames(css.value, css.winning_amount)}
                data-color={amountColor[transactionState]}>
                {winningAmount
                  ? transactionStateRefs[transactionState]
                  : transactionStateName}
                {winningAmount ? ` ${addCommas(winningAmount)}元` : ''}
              </div>
            </div>
          </div>

          <div className={css.row}>
            <div className={css.column}>
              <div className={css.label}>下注时间</div>
              <div className={css.value}>{bettingTime}</div>
            </div>
            <div className={css.column}>
              <div className={css.label}>注单号</div>
              <div className={css.value}>
                <ClipboardButton
                  onSuccess={this.onCopySuccess}
                  data-clipboard-text={transactionTimeuuid}
                  className={css.profile_popUpInlineInfo}>
                  <Tooltip
                    title={tooltipText}
                    onVisibleChange={this.onToolTipVisibleChange}>
                    <span className={css.link}>
                      <i>{stringArry[0]}</i>
                      <MDIcon iconName="multiplication" />
                      <MDIcon iconName="multiplication" />
                      <MDIcon iconName="multiplication" />
                      <MDIcon iconName="multiplication" />
                      <i>{stringArry[1]}</i>
                    </span>
                  </Tooltip>
                </ClipboardButton>
              </div>
            </div>
          </div>

          <div className={css.row}>
            <div className={css.column}>
              <div className={css.label}>倍数</div>
              <div className={css.value}>{multiplier || '-'}</div>
            </div>
            <div className={css.column}>
              <div className={css.label}>返水</div>
              <div className={css.value}>
                {rebate ? `${addCommas(rebate.toFixed(2))}元` : '-'}
              </div>
            </div>
          </div>
        </div>

        <div className={classnames(tableCSS.table_container, css.table)}>
          <table className={tableCSS.table}>
            <thead>
              <tr>
                <td>游戏玩法</td>
                <td>下注号码</td>
                <td>单注金额</td>
                <td>注数</td>
                <td>投注额</td>
                <td>中奖金额</td>
              </tr>
            </thead>
            <tbody>{this.renderTableBody()}</tbody>
          </table>
        </div>
      </div>
    );
  }
}

function mapStatesToProps({
  dataTableModel,
  gameInfosModel,
  orderModel,
  formModel,
}) {
  const {gameInfos, otherSettings} = gameInfosModel;
  const {responseMsg} = formModel;
  return {
    ...orderModel,
    ...dataTableModel,
    gameInfos,
    responseMsg,
    otherSettings,
  };
}

export default connect(mapStatesToProps)(BettingDetails);

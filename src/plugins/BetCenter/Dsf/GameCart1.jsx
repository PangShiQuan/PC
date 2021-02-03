import React, {Component} from 'react';
import {Popconfirm} from 'antd';
import VirtualList from 'react-tiny-virtual-list';
import PropTypes from 'prop-types';
import {MDIcon} from 'components/General';
import {addCommas, specialHandleDisplayNewPokerRX} from 'utils';
import resolve from 'clientResolver';

const css = resolve.client('styles/betCenter/GameCart.less');

class GameCart extends Component {
  onEditBetClick = ({currentTarget}) => {
    this.props.onEditBetClick(currentTarget.value);
  };
  renderResponseMsg() {
    const {responseMessage, responseColor} = this.props;
    if (responseMessage) {
      return (
        <div className={css.gameCart_response} data-color={responseColor}>
          <p>{responseMessage}</p>
        </div>
      );
    }
  }
  renderBody() {
    const {betEntries, thisGameId} = this.props;
    const height = 193;

    if (betEntries.length) {
      return (
        <VirtualList
          width="100%"
          height={height}
          className={css.gameCart_items}
          itemCount={betEntries.length}
          itemSize={26}
          renderItem={({index, style}) => {
            const {
              id,
              amount,
              gameMethod,
              betString,
              multiply,
              numberOfUnits,
              gameplayMethod,
            } = betEntries[index];
            let {returnMoneyRatio} = betEntries[index];
            if (gameplayMethod === 'SA') {
              returnMoneyRatio = 0.1;
            }
            const specialPokerRXHandle = specialHandleDisplayNewPokerRX(
              thisGameId,
              gameplayMethod,
              betString,
            );
            const rebate = (amount * returnMoneyRatio).toFixed(2);
            return (
              <div key={id} style={style}>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '20%'}}>
                  {gameMethod}
                </span>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '30%'}}>
                  {specialPokerRXHandle ? specialPokerRXHandle : betString}
                </span>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '10%'}}
                  data-align="right">
                  {numberOfUnits}
                </span>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '10%'}}
                  data-align="right">
                  {multiply}
                </span>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '10%'}}
                  data-align="right">
                  {addCommas(amount)} 元
                </span>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '10%'}}
                  data-align="right">
                  {rebate < 0.001 ? '-' : `${addCommas(rebate)}元`}
                </span>
                <button
                  className={css.gameCart_ctrlBtn}
                  onClick={this.onEditBetClick}
                  style={{width: '10%'}}
                  data-align="right"
                  value={id}>
                  <MDIcon iconName="pencil" />
                </button>
              </div>
            );
          }}
        />
      );
    }

    return (
      <div
        className={css.gameCart_items__empty}
        style={{height: `${height}px`}}>
        暂无投注项
      </div>
    );
  }
  render() {
    const {onRemoveAll, betEntries} = this.props;
    const popConfirmProps = {
      onConfirm: onRemoveAll,
      title: (
        <strong className={css.gameCart_popOverText}>
          <i>您确定要删除全部投注项目么？</i>
          <MDIcon iconName="emoticon-sad" />
        </strong>
      ),
      okText: '确定',
      cancel: '取消',
      placement: 'topRight',
    };
    const cartIsEmpty = !betEntries.length;
    return (
      <div className={css.gameCart}>
        {this.renderResponseMsg()}
        <section className={css.gameCart_table}>
          <div className={css.gameCart_header}>
            <div style={{width: '20%'}}>
              <span>玩法</span>
            </div>
            <div style={{width: '30%'}}>
              <span>下注号</span>
            </div>
            <div style={{width: '10%'}} data-align="right">
              <span>注数</span>
            </div>
            <div style={{width: '10%'}} data-align="right">
              <span>倍数</span>
            </div>
            <div style={{width: '10%'}} data-align="right">
              <span>金额</span>
            </div>
            <div style={{width: '10%'}} data-align="right">
              <span>返点</span>
            </div>
            <div style={{width: '10%'}} data-align="right">
              <Popconfirm {...popConfirmProps}>
                <button
                  disabled={cartIsEmpty}
                  className={css.gameCart_clearAllBtn}>
                  <span>全清</span>
                </button>
              </Popconfirm>
            </div>
          </div>
          {this.renderBody()}
        </section>
      </div>
    );
  }
}

GameCart.propTypes = {
  betEntries: PropTypes.arrayOf(PropTypes.object),
};

export default GameCart;

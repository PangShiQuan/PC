import React, {Component} from 'react';
import {Popconfirm} from 'antd';
import VirtualList from 'react-tiny-virtual-list';
import PropTypes from 'prop-types';
import {MDIcon} from 'components/General';
import {addCommas, specialHandleDisplayNewPokerRX} from 'utils';
import css from 'styles/betCenter/Base/GameCart1.less';
import clearIcon from 'assets/image/allIcon/clearIcon.svg';
import SVG from 'react-inlinesvg';

class GameCart extends Component {
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
    const {betEntries, onEditBetClick, thisGameId} = this.props;
    if (betEntries.length) {
      return (
        <VirtualList
          width="100%"
          height={235}
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
                  data-align="center">
                  {numberOfUnits}
                </span>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '10%'}}
                  data-align="center">
                  {multiply}
                </span>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '10%'}}
                  data-align="center">
                  {addCommas(amount)} 元
                </span>
                <span
                  className={css.gameCart_tdEllipsis}
                  style={{width: '10%'}}
                  data-align="center">
                  {rebate < 0.001 ? '-' : `${addCommas(rebate)}元`}
                </span>
                <span
                  className={css.gameCart_ctrlBtn}
                  onClick={onEditBetClick.bind(this, id)}
                  style={{width: '10%'}}
                  data-align="center">
                  <MDIcon iconName="pencil" />
                </span>
              </div>
            );
          }}
        />
      );
    }

    return (
      <div style={{width: '100%'}} className={css.gameCart_items}>
        <span>
          <div>暂无投注项</div>
        </span>
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
            <div style={{width: '20%', textAlign: 'center'}}>
              <span>玩法</span>
            </div>
            <div style={{width: '30%', textAlign: 'center'}}>
              <span>下注号</span>
            </div>
            <div style={{width: '10%', textAlign: 'center'}}>
              <span>注数</span>
            </div>
            <div style={{width: '10%', textAlign: 'center'}}>
              <span>倍数</span>
            </div>
            <div style={{width: '10%', textAlign: 'center'}}>
              <span>金额</span>
            </div>
            <div style={{width: '10%', textAlign: 'center'}}>
              <span>返点</span>
            </div>
            <div style={{width: '10%', textAlign: 'center'}}>
              <Popconfirm {...popConfirmProps}>
                <button
                  disabled={cartIsEmpty}
                  className={css.gameCart_clearAllBtn}>
                  <SVG className={css.clearIcon} src={clearIcon} />
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
  betEntries: PropTypes.array,
};

export default GameCart;

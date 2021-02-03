import React, {PureComponent} from 'react';
import {connect} from 'dva';

import {addCommas} from 'utils';
import ContentContainer from 'components/User/ContentContainer';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import SVG from 'react-inlinesvg';
import balanceIcon from 'assets/image/User/ic-balance.svg';
import refreshIcon from 'assets/image/User/ic-refresh.svg';
import css from 'styles/User/TradingCenter/Transfer.less';
import tableCSS from 'styles/User/Form/Table.less';

const CENTER = 'CENTER';

class OneClickTransfer extends PureComponent {
  constructor(props, context) {
    super(props, context);
    this.dispatch = props.dispatch;
  }

  onTransferAllClick = ({currentTarget}) => {
    ResponseMessageBar.clearResponseMessageBar(this);
    this.dispatch({
      type: 'playerModel/balanceTransferAll',
      gamePlatform: currentTarget.value,
    });
  };

  onTransferAllToCenterClick = ({currentTarget}) => {
    ResponseMessageBar.clearResponseMessageBar(this);
    this.dispatch({
      type: 'playerModel/balanceTransferAllToCenter',
      gamePlatform: currentTarget.value,
    });
  };

  renderBalance = () => {
    const {refreshBalance} = this.props;
    const transferType = this.props.transferTypeList.get(CENTER);
    return (
      <div className={css.balance_div}>
        <SVG className={css.svg_icon} src={balanceIcon} />
        <div className={css.balance_label}>{transferType.text}</div>
        <div className={css.balance}>
          {transferType.balance >= 0 ? addCommas(transferType.balance) : '?'}元
        </div>
        <button
          type="button"
          onClick={refreshBalance}
          className={css.refresh_button}
          value={CENTER}>
          <SVG src={refreshIcon} />
        </button>
      </div>
    );
  };

  renderAutoTransfer() {
    const {transferTypeList, onRefreshTotalClick} = this.props;
    const TransferList = [...transferTypeList.entries()].map(
      ([id, transferType]) => {
        if (!transferType.isHeader) {
          if (transferType.isransEnabled !== 'ON') {
            return (
              <tr key={id}>
                <td>
                  <div className={css.transferType}>{transferType.text}</div>
                </td>
                <td>
                  {transferType.balance < 0 ? (
                    <button
                      type="button"
                      className={css.balance_button}
                      onClick={onRefreshTotalClick}
                      disabled={
                        (transferType.isDisabledAutoTransferCenter &&
                          transferType.isDisabledAutoTransfer) ||
                        transferType.isRefreshing
                      }
                      value={transferType.value}>
                      点击显示游戏资金
                    </button>
                  ) : (
                    <React.Fragment>
                      {addCommas(transferType.balance)}元
                      <button
                        type="button"
                        className={css.refresh_button}
                        onClick={onRefreshTotalClick}
                        disabled={transferType.isRefreshing}
                        value={transferType.value}>
                        <SVG src={refreshIcon} />
                      </button>
                    </React.Fragment>
                  )}
                </td>
                <td>
                  <button
                    type="button"
                    className={css.transfer_button}
                    onClick={this.onTransferAllToCenterClick}
                    disabled={transferType.isDisabledAutoTransferCenter}
                    value={transferType.value}>
                    一键回归
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className={css.transfer_button}
                    onClick={this.onTransferAllClick}
                    disabled={transferType.isDisabledAutoTransfer}
                    value={transferType.value}>
                    一键转入
                  </button>
                </td>
              </tr>
            );
          }
          return null;
        }
        return null;
      },
    );

    return (
      <div className={tableCSS.table_containter}>
        <table className={tableCSS.table_alternate}>
          <tbody className={css.table_body}>{TransferList}</tbody>
        </table>
      </div>
    );
  }

  render() {
    return (
      <ContentContainer title="一键快捷转换" style={{flexBasis: '500px'}}>
        <div className={css.oneclick}>
          {this.renderBalance()}
          {this.renderAutoTransfer()}
        </div>
      </ContentContainer>
    );
  }
}

function mapStatesToProps({userModel, formModel}) {
  const {transferSelectFrom, transferSelectTo} = formModel;
  const {balance} = userModel;

  return {
    balance,
    transferSelectFrom,
    transferSelectTo,
  };
}

export default connect(mapStatesToProps)(OneClickTransfer);

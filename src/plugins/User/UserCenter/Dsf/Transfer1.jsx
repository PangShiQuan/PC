import React, { Component } from 'react';
import { connect } from 'dva';
import { Select } from 'antd';

import ExternalPage from 'pages/External';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import { type, addCommas, url } from 'utils';
import {
  CoreButton,
  LoadingBar,
  MDIcon,
  RefreshButton,
} from 'components/General';
import resolve from 'clientResolver';

const { PLATFORM_TYPE } = type;
const CENTER = 'CENTER';
const ON = 'ON';
const { Option } = Select;

const PLATFORM_PATH = {
  GAME: '/games',
  CARD: '/cards',
  SPORT: '/sports',
};

const Input = resolve.plugin('ProfileInput');

class Transfer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      transferTypeList: new Map(),
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['transferAmount', 'transferSelectTo', 'transferSelectFrom'],
    });
    this.props.dispatchUpdate(() => {
      this.dispatch({
        type: 'playerModel/resetBalance',
      });
    });
    // this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    this.dispatch({ type: 'userModel/getUserTotalBalance' });

    if (this.props.balance || this.props.gamePlatforms)
      this.updateTransferTypeList(this.props);
    this.onTransferMethodSelectFrom({ key: CENTER });
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.balance !== nextProps.balance ||
      this.props.balanceTransferAllIsLoading !==
      nextProps.balanceTransferAllIsLoading ||
      this.props.gamePlatforms !== nextProps.gamePlatforms ||
      this.props.balanceTransferAllToMainWalletIsLoading !==
      nextProps.balanceTransferAllToMainWalletIsLoading
    ) {
      this.updateTransferTypeList(nextProps);
    }
  }

  componentWillUnmount() {
    const { gamePlatformList, MODE, pathname } = this.props;
    const currentMode = MODE[url.basePath(pathname)];

    if (currentMode && gamePlatformList[currentMode].balance < 0) {
      this.onRefreshTotalClick({ currentTarget: { value: currentMode } });
    }

    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['transferAmount', 'transferSelectTo', 'transferSelectFrom'],
    });
  }

  onRefreshTotalClick = ({ currentTarget }) => {
    this.dispatch({
      type: 'playerModel/getBalanceOfGamePlatform',
      payload: {
        gamePlatform: currentTarget.value,
        showErrMsg: true,
        enableLoading: true,
      },
    });
  };

  onTransferAllClick = ({ currentTarget }) => {
    this.dispatch({
      type: 'playerModel/balanceTransferAll',
      gamePlatform: currentTarget.value,
    });
  };

  onTransferOneToCenterClick = ({ currentTarget }) => {
    this.dispatch({
      type: 'playerModel/balanceTransferOneToCenter',
      gamePlatform: currentTarget.value,
    });
  };

  onTransferAllToCenterClick = () => {
    this.dispatch({
      type: 'playerModel/balanceTransferAllToCenter',
    });
  };

  onTransferMethodSelectFrom = transferType => {
    const { transferSelectFrom } = this.props;

    this.refreshBalance(transferType.key);

    if (transferType.key !== CENTER) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectFrom: transferType.key,
          transferSelectTo: CENTER,
        },
      });
    } else {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectFrom: CENTER,
          transferSelectTo: transferSelectFrom,
        },
      });
    }
  };

  onTransferMethodSelectTo = transferType => {
    const { transferSelectTo } = this.props;

    this.refreshBalance(transferType.key);

    if (transferType.key !== CENTER) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectFrom: CENTER,
          transferSelectTo: transferType.key,
        },
      });
    } else {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectFrom: transferSelectTo,
          transferSelectTo: CENTER,
        },
      });
    }
  };

  onTransferOptionClick = () => {
    this.dispatch({ type: 'playerModel/manualBalanceTransfer' });
  };

  onInputChange = event => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({ type: 'formModel/validateInputAmount', payload: event });
  };

  onRefreshBalance = ({ currentTarget }) => {
    this.refreshBalance(currentTarget.value, true);
  };

  refreshBalance(value, refreshWalletBalance) {
    const { balance, gamePlatforms } = this.props;

    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['transferAmount'],
    });

    if (value === CENTER && (!balance || refreshWalletBalance)) {
      // this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
      this.dispatch({ type: 'userModel/getUserTotalRecoverBalance' });
    } else {
      const game =
        gamePlatforms.find(({ gamePlatform }) => gamePlatform === value) || {};

      if (game.balance < 0) this.onRefreshTotalClick({ currentTarget: { value } });
    }
  }

  updateTransferTypeList(props) {
    const { balance, balanceTransferAllIsLoading, gamePlatforms} = props;
    const center = {
      text: '中心钱包',
      balance,
      isHeader: true,
      value: CENTER,
    };
    const transferTypeList = new Map([[CENTER, center]]);
    const thisGamePlatformList = (Object.values(gamePlatforms).filter(
      ({gamePlatformType}) => gamePlatformType === PLATFORM_TYPE.THIRD_PARTY,
    )).sort((a,b)=>{
      return a.platformOrder-b.platformOrder
    });

    thisGamePlatformList.forEach(
      ({
        balance: gameBalance,
        gameNameInChinese,
        itransEnabled,
        gamePlatform,
        isLoading,
        status,
      }) => {
        const disabled = status !== ON;
        const prop = {
          text: gameNameInChinese,
          isRefreshing: isLoading,
          isransEnabled: itransEnabled,  // 是否免转标识
          balance: gameBalance,
          isDisabledAutoTransfer:
            disabled ||
            balanceTransferAllIsLoading ||
            !balance ||
            balance === 0 ||
            false,
          isDisabledAutoTransferCenter:
            disabled || !(balanceTransferAllIsLoading || gameBalance),
          isDisabledManualTransfer:
            disabled || balanceTransferAllIsLoading || false,
          value: gamePlatform,
        };

        transferTypeList.set(gamePlatform, prop);
      },
    );

    this.setState({ transferTypeList });
  }

  renderTransferMethodSelectComponent(renderList, onChange, selectType, label) {
    const { transferSelectFrom, transferSelectTo } = this.props;
    return (
      <div className={css.profile_transferLineHeight}>
        <label htmlFor={selectType} className={css.profile_inputLabel}>
          {label}
        </label>
        <Select
          labelInValue
          value={{
            key: selectType === 'From' ? transferSelectFrom : transferSelectTo,
          }}
          onChange={onChange}
          style={{ width: 300 }}>
          {renderList}
        </Select>
      </div>
    );
  }

  renderTransferMethodSelectOptionComponent() {
    const { transferTypeList } = this.state;
    return [...transferTypeList.entries()].map(
      ([id, { balance, text, isHeader, isransEnabled }]) => {
        if (!isHeader && isransEnabled !== 'ON'||id=='CENTER') {
          return <Option key={id}>
            {text} 余额:
          {balance >= 0 ? (
              `${addCommas(balance)}元`
            ) : (
                <span className={css.profile_noBalance}>?</span>
              )}
          </Option>
        }
        return null
      }
    );
  }

  renderTransferMethodSelect() {
    const renderList = this.renderTransferMethodSelectOptionComponent();
    return (
      <React.Fragment>
        {this.renderTransferMethodSelectComponent(
          renderList,
          this.onTransferMethodSelectFrom,
          'From',
          '从',
        )}
        {this.renderTransferMethodSelectComponent(
          renderList,
          this.onTransferMethodSelectTo,
          'To',
          '到',
        )}
      </React.Fragment>
    );
  }

  renderAutoTransferHeader() {
    const transferType = this.state.transferTypeList.get(CENTER);
    const {balanceTransferAllToMainWalletIsLoading} = this.props;
    return (
      <React.Fragment>
        <tr key={CENTER}>
          <td colSpan="2">
            <div className={css.profile_transferMainWalletHeader}>
              <MDIcon
                iconName="cash-multiple"
                className={css.profile_transferMainWalletHeaderIcon}
              />
              &nbsp;
              {transferType.text}&nbsp;: &nbsp;&nbsp;
              <b>
                {(transferType.balance >= 0 &&
                  addCommas(transferType.balance)) ||
                  '? '}
              </b>
              元
              <RefreshButton
                onClick={this.onRefreshBalance}
                value={CENTER}
                loading={this.props.loadingWallet}
                refreshClassName={css.profile_transferMainWalletRefreshBtn}
              />
              <button
                type="button"
                className={css.profile_transferAllBtn}
                onClick={this.onTransferAllToCenterClick}
                value={CENTER}
                disabled={balanceTransferAllToMainWalletIsLoading}>
                  一键回收
              </button>
            </div>
          </td>
        </tr>
        <tr key={`${CENTER}titleBar`}>
          <td className={css.profile_transferTableColumnLabel} data-title>
            帐户
          </td>
          <td className={css.profile_transferTableColumnValue} data-title>
            余额
          </td>
        </tr>
      </React.Fragment>
    );
  }

  renderAutoTransfer() {
    const {
      balanceIsLoading,
      balanceTransferAllIsLoading,
      loadingPlatformList,
      loadingWallet,
      balanceTransferAllToMainWalletIsLoading,
    } = this.props;
    const { transferTypeList } = this.state;
    const TransferList = [...transferTypeList.entries()].map(
      ([id, transferType]) => {
        if (!transferType.isHeader) {
          if (transferType.isransEnabled !== 'ON') {
            return (
              <tr key={id}>
                <td className={css.profile_transferTableColumnLabel}>
                  <span className={css.profile_transferMainWallet}>
                    {transferType.text}
                  </span>
                </td>
                <td className={css.profile_transferTableColumnValue} data-flex>
                  <div
                    className={css.profile_transferSubWallet}
                    data-type="transfer">
                    <button
                      type="button"
                      className={css.profile_transferBtn}
                      onClick={this.onTransferOneToCenterClick}
                      disabled={transferType.isDisabledAutoTransferCenter}
                      value={transferType.value}>
                      <MDIcon
                        iconName="undo"
                        className={css.profile_transferIcon}
                      />
                      一键回归
                    </button>
                  </div>
                  <div
                    className={css.profile_transferSubWallet}
                    data-type="transfer">
                    <button
                      type="button"
                      className={css.profile_transferBtn}
                      onClick={this.onTransferAllClick}
                      disabled={transferType.isDisabledAutoTransfer}
                      value={transferType.value}>
                      <MDIcon
                        iconName="transfer"
                        className={css.profile_transferIcon}
                      />
                      一键转入
                    </button>
                  </div>
                  <div
                    className={css.profile_transferSubWallet}
                    data-float="right"
                    data-type="refresh">
                    <button
                      type="button"
                      className={css.profile_transferRefresh}
                      onClick={this.onRefreshTotalClick}
                      disabled={balanceIsLoading}
                      data-active={transferType.isRefreshing}
                      value={transferType.value}>
                      <MDIcon
                        className={css.profile_transferRefreshIcon}
                        iconName="refresh"
                        rotated={transferType.isRefreshing || false}
                      />
                      刷新
                    </button>
                  </div>
                  <div
                    className={css.profile_transferSubWallet}
                    data-type="amount">
                    <b>
                      {transferType.balance < 0 ? (
                        <span className={css.profile_noBalance}>
                          <button
                            type="button"
                            onClick={this.onRefreshTotalClick}
                            disabled={transferType.isRefreshing}
                            value={transferType.value}>
                            点击显示游戏资金
                        </button>
                        </span>
                      ) : (
                          `${addCommas(transferType.balance)}元`
                        )}
                    </b>
                  </div>
                </td>
              </tr>
            );
          } else {
            return null
          }
        }
        return null;
      },
    );
    return (
      <React.Fragment>
        <h4 className={css.profile_formLabel}>自动额度转换</h4>
        <LoadingBar
          isLoading={
            balanceTransferAllIsLoading ||
            balanceIsLoading ||
            loadingPlatformList ||
            loadingWallet ||
            balanceTransferAllToMainWalletIsLoading
          }
        />
        <table className={css.profile_table}>
          <thead>{this.renderAutoTransferHeader()}</thead>
          <tbody>{TransferList}</tbody>
        </table>
      </React.Fragment>
    );
  }

  renderManualTransfer() {
    const {
      balanceIsLoading,
      balanceTransferIsLoading,
      loadingWallet,
      transferAmount: { value, inputMsg, icon, color, validatePassed },
      transferSelectFrom,
      transferSelectTo,
    } = this.props;
    const { transferTypeList } = this.state;
    let isContainBalance = false;
    let balance = 0;
    if (transferSelectFrom && transferSelectTo) {
      balance = transferTypeList.get(transferSelectFrom).balance;
      isContainBalance = balance > 0 && transferSelectTo;
    }

    return (
      <div>
        <h4 className={css.profile_formLabel}>手动额度转换</h4>
        {
          <LoadingBar
            isLoading={
              balanceTransferIsLoading || balanceIsLoading || loadingWallet
            }
          />
        }
        {this.renderTransferMethodSelect()}
        <div
          className={
            (css.profile_transferMainWallet, css.profile_transferLineHeight)
          }>
          <Input
            displayInputLength={false}
            dataColor={color}
            dataIcon={icon}
            dataMsg={inputMsg}
            disabled={!(balance >= 0)}
            label="转帐金额"
            name="transferAmount"
            type="number"
            min="1.00"
            max={balance}
            className={css.profile_transferInput}
            onChange={this.onInputChange}
            pattern="(?=[^\0])(?=^([0-9]+){0,1}(\.[0-9]{1,2}){0,1}$)"
            placeholder="请输入转帐金额"
            value={value}
          />
        </div>
        <div>
          <CoreButton
            className={css.profile_formBtn__submitTransferInd}
            placeholder={balanceTransferIsLoading ? '继续下一步' : '提交'}
            disabled={
              balanceTransferIsLoading || !validatePassed || !isContainBalance
            }
            onClick={this.onTransferOptionClick}
          />
        </div>
      </div>
    );
  }

  render() {
    if (!this.state.transferTypeList.size)
      return <span className={css.content__empty}>暂未开放，敬请期待</span>;

    return (
      <React.Fragment>
        <div className={css.profile_contentBody}>
          <div>{this.renderAutoTransfer()}</div>
        </div>
        <div className={css.profile_contentBody}>
          <div>{this.renderManualTransfer()}</div>
        </div>
        <div className={css.profile_contentBody}>
          <p className={css.profile_transferDisclaimer}>
            <MDIcon
              className={css.profile_disclaimerIcon}
              iconName="information-outline"
            />
            <span>
              <strong>转帐说明:</strong>
              中心余额与各个游戏钱包是相互独立的，转帐只能够在中心余额与游戏钱包间直接互转，游戏钱包之间不能直接互转。如要将各游戏钱包的金额发生流动，需要完成两次转帐，先将转出方金额转入中心余额，再由中心余额将金额移到转入方。
            </span>
          </p>
        </div>
      </React.Fragment>
    );
  }
}

function mapStatesToProps({
  cardModel,
  gameModel,
  sportModel,
  userModel,
  formModel,
  playerModel,
  loading,
  routing,
}) {
  const { transferAmount, transferSelectFrom, transferSelectTo } = formModel;
  const {
    balanceIsLoading,
    balanceTransferIsLoading,
    balanceTransferAllIsLoading,
    balanceTransferAllToMainWalletIsLoading,
    gamePlatformList,
  } = playerModel;
  const {
    balance,
  } = userModel;

  return {
    loadingWallet: loading.effects['userModel/getCardsAndWithdrawDetail'],
    loadingPlatformList: loading.effects['playerModel/getCMSGamePlatforms'],
    gamePlatformList,
    MODE: {
      [PLATFORM_PATH.CARD]: cardModel.MODE,
      [PLATFORM_PATH.GAME]: gameModel.MODE,
      [PLATFORM_PATH.SPORT]: sportModel.MODE,
    },
    pathname: routing.location.pathname,
    balance,
    balanceIsLoading,
    balanceTransferIsLoading,
    balanceTransferAllIsLoading,
    balanceTransferAllToMainWalletIsLoading,
    transferAmount,
    transferSelectFrom,
    transferSelectTo,
  };
}

const component = connect(mapStatesToProps)(Transfer);

export default function () {
  return <ExternalPage component={component} />;
}

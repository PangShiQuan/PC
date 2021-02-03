import React, {Component} from 'react';
import {connect} from 'dva';

import ExternalPage from 'pages/External';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import {type, url} from 'utils';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import TransferTips from 'components/User/TradingCenter/Transfer/TransferTips';
import OneClickTransfer from 'components/User/TradingCenter/Transfer/OneClickTransfer';
import ManualTransfer from 'components/User/TradingCenter/Transfer/ManualTransfer';
import TransferSuccessfulPopUp from 'components/User/TradingCenter/Transfer/TransferSuccessfulPopUp';
import transferCSS from 'styles/User/TradingCenter/Transfer.less';
import userCSS from 'styles/User/User.less';

const {PLATFORM_TYPE} = type;
const CENTER = 'CENTER';
const ON = 'ON';

const PLATFORM_PATH = {
  GAME: '/games',
  CARD: '/cards',
  SPORT: '/sports',
};

class Transfer extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      transferTypeList: new Map(),
    };
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    const {balance, gamePlatforms, dispatchUpdate} = this.props;
    dispatchUpdate(() => {
      this.dispatch({
        type: 'playerModel/resetBalance',
      });
    });

    this.dispatch({type: 'userModel/getUserTotalBalance'});

    if (balance || gamePlatforms) this.updateTransferTypeList(this.props);
  }

  componentDidUpdate(prevProps) {
    const {
      balance: pBalance,
      balanceTransferAllIsLoading: pBalanceTransferAllIsLoading,
      gamePlatforms: pGamePlatforms,
    } = prevProps;
    const {balance, balanceTransferAllIsLoading, gamePlatforms} = this.props;

    if (
      pBalance !== balance ||
      pBalanceTransferAllIsLoading !== balanceTransferAllIsLoading ||
      pGamePlatforms !== gamePlatforms
    ) {
      this.updateTransferTypeList(this.props);
    }
  }

  componentWillUnmount() {
    const {gamePlatformList, MODE, pathname} = this.props;
    const currentMode = MODE[url.basePath(pathname)];

    if (currentMode && gamePlatformList[currentMode].balance < 0) {
      this.onRefreshTotalClick({currentTarget: {value: currentMode}});
    }
  }

  onRefreshTotalClick = ({currentTarget}) => {
    this.dispatch({
      type: 'playerModel/getBalanceOfGamePlatform',
      payload: {
        gamePlatform: currentTarget.value,
        showErrMsg: true,
        enableLoading: true,
      },
    });
  };

  refreshBalance = (value, refreshWalletBalance) => {
    const {balance, gamePlatforms} = this.props;

    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['transferAmount'],
    });

    if (value === CENTER && (!balance || refreshWalletBalance)) {
      // this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
      this.dispatch({type: 'userModel/getUserTotalRecoverBalance'});
    } else {
      const game =
        gamePlatforms.find(({gamePlatform}) => gamePlatform === value) || {};

      if (game.balance < 0) this.onRefreshTotalClick({currentTarget: {value}});
    }
  };

  updateTransferTypeList = props => {
    const {balance, balanceTransferAllIsLoading, gamePlatforms} = props;
    const center = {
      text: '中心钱包',
      balance,
      isHeader: true,
      value: CENTER,
    };
    const transferTypeList = new Map([[CENTER, center]]);
    const thisGamePlatformList = Object.values(gamePlatforms)
      .filter(
        ({gamePlatformType}) => gamePlatformType === PLATFORM_TYPE.THIRD_PARTY,
      )
      .sort((a, b) => {
        return a.platformOrder - b.platformOrder;
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
          isransEnabled: itransEnabled, // 是否免转标识
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

    this.setState({transferTypeList});
  };

  render() {
    const {transferTypeList} = this.state;
    if (!transferTypeList.size)
      return <span className={css.content__empty}>暂未开放，敬请期待</span>;

    const {dispatchUpdate, gamePlatforms} = this.props;
    return (
      <React.Fragment>
        <ResponseMessageBar />
        <div className={userCSS.content_body}>
          <TransferTips gamePlatforms={gamePlatforms} />
          <div className={transferCSS.container}>
            <ManualTransfer
              dispatchUpdate={dispatchUpdate}
              gamePlatforms={gamePlatforms}
              transferTypeList={transferTypeList}
              updateTransferTypeList={this.updateTransferTypeList}
              refreshBalance={this.refreshBalance}
            />
            <div className={transferCSS.divider} />
            <OneClickTransfer
              dispatchUpdate={dispatchUpdate}
              gamePlatforms={gamePlatforms}
              transferTypeList={transferTypeList}
              refreshBalance={this.refreshBalance}
              onRefreshTotalClick={this.onRefreshTotalClick}
            />
          </div>
          <TransferSuccessfulPopUp gamePlatforms={gamePlatforms} />
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
  playerModel,
  routing,
}) {
  const {balanceTransferAllIsLoading, gamePlatformList} = playerModel;
  const {balance} = userModel;

  return {
    gamePlatformList,
    MODE: {
      [PLATFORM_PATH.CARD]: cardModel.MODE,
      [PLATFORM_PATH.GAME]: gameModel.MODE,
      [PLATFORM_PATH.SPORT]: sportModel.MODE,
    },
    pathname: routing.location.pathname,
    balance,
    balanceTransferAllIsLoading,
  };
}

const component = connect(mapStatesToProps)(Transfer);

export default function() {
  return <ExternalPage component={component} />;
}

import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import queryString from 'query-string';
import {Row} from 'antd';

import css from 'styles/external/container.less';
import {url as URL, addCommas, type} from 'utils';
import {MDIcon} from 'components/General';
import withUserCredential from 'components/Sync/UserCredential';
import resolve from 'clientResolver';

const {
  gamePlatformType: {MG},
} = type;
const Logo = resolve.client('assets/image/logo-invert.png');

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPlatform: null,
      currentUrl: '',
      id: '',
      isDemo: false,
      name: '',
    };
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    const {q} = queryString.parse(window.location.search);
    const {trimUrl, url, id, isDemo, platform, name} = queryString.parse(
      atob(q),
    );

    document.title = name;

    this.setState({
      currentPlatform: platform,
      currentUrl: url,
      id,
      isDemo: isDemo === 'true',
      name,
    });
    this.dispatch({
      type: 'playerModel/getGamePlatforms',
      runAfter: () => {
        this.dispatch({type: 'userModel/getCurrentUser'});
        this.onRefreshWalletBalance();
      },
    });

    if (trimUrl) URL.trimUrlTo(`/${trimUrl}`);
  }

  onRefreshWalletBalance = () => {
    this.dispatch({
      type: 'playerModel/getBalanceOfGamePlatform',
      payload: {
        gamePlatform: this.state.currentPlatform,
      },
    });
    this.dispatch({type: 'userModel/getUserTotalBalance'});

    if (!this.props.isDemo) {
      this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    }
  };

  onInputChange = event => {
    event.persist();
    const {value, pattern} = event.target;
    const eventValue = value ? parseFloat(value) : '';
    const reg = new RegExp(pattern);

    if (reg.test(eventValue) && value.length <= 10) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferAmount: {value: eventValue},
        },
      });
    }

    if (value.length === 0) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferAmount: {value: ''},
        },
      });
    }

    return false;
  };

  onTransfer = () => {
    const {currentUrl, currentPlatform} = this.state;
    const {transferAmount} = this.props;
    if (transferAmount > 0) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          transferSelectTo: currentPlatform,
          transferSelectFrom: 'CENTER',
          transferType: 'TopUp',
        },
      });

      // 该平台是 flash 制, 需要如此刷新余额
      const shouldReload = [MG].includes(currentPlatform);
      this.dispatch({
        type: 'playerModel/manualBalanceTransfer',
        runAfterPost: () => {
          if (shouldReload) {
            this.setState({currentUrl: ''}, () => {
              this.setState({currentUrl});
            });
          }
        },
      });
    }
  };

  renderTitle() {
    const {gameNameInChinese} = this.props.gamePlatformList[
      this.state.currentPlatform
    ] || {
      gameNameInChinese: '',
    };

    return (
      <div>
        <span className={css.container_Title}>{gameNameInChinese}</span>
        {this.renderGameAmount()}
        <span className={css.containerSplitter} />
      </div>
    );
  }

  renderGameAmount() {
    const {isDemo, currentPlatform} = this.state;
    const {gamePlatformList} = this.props;
    if (isDemo) {
      return <span className={css.containerLabel}>( 游戏试玩 )</span>;
    }

    let balance = 0;

    if (
      gamePlatformList[currentPlatform] &&
      gamePlatformList[currentPlatform].balance
    ) {
      balance =
        gamePlatformList[currentPlatform].balance === -1
          ? '?'
          : addCommas(gamePlatformList[currentPlatform].balance);
    }

    return <span className={css.containerLabel}>{balance} 元</span>;
  }

  renderWalletBalance() {
    const {loading, centerBalance} = this.props;
    return (
      <div className={css.containerWalletBalanceOuter}>
        <span className={css.containerLabel}>
          <MDIcon rotated={loading} iconName="cash-multiple" />
        </span>
        <span>
          <i>中心钱包 :</i>
        </span>
        <span className={css.containerWalletBalance}>
          {addCommas(centerBalance || 0)} 元
        </span>
        <span>
          <button type="button" onClick={this.onRefreshWalletBalance}>
            <MDIcon
              rotated={loading}
              iconName="refresh"
              className={css.containerWalletBalanceRefreshIcon}
            />
          </button>
        </span>
        <span className={css.containerSplitter} />
      </div>
    );
  }

  renderTransferItems() {
    const {centerBalance, transferAmount} = this.props;
    return (
      <div className={css.containerTransferItemsOuter}>
        <span className={css.containerLabel}>转入</span>
        <input
          className={css.containerAmount}
          type="number"
          name=""
          placeholder="金额"
          onChange={this.onInputChange}
          pattern="(?=[^\0])(?=^([0-9]+){0,1}(\.[0-9]{1,2}){0,1}$)"
          value={transferAmount === '' ? '' : transferAmount}
        />
        <button
          type="button"
          className={css.containerAgree}
          onClick={this.onTransfer}
          disabled={
            !centerBalance ||
            centerBalance === 0 ||
            transferAmount === '' ||
            transferAmount > centerBalance
          }>
          <MDIcon iconName="transfer" className={css.containerTransferIcon} />
          确定
        </button>
        <span className={css.containerSplitter} />
      </div>
    );
  }

  renderGreetingUsername() {
    const {userData} = this.props;
    return (
      <div className={css.containerGreetings}>
        <span className={css.containerSplitter} />
        <span className={css.containerLabel} data-icon>
          <MDIcon iconName="account" />
        </span>
        <span>{userData ? userData.username : '试玩用户'}，您好</span>
        <span className={css.containerSplitter} />
      </div>
    );
  }

  /**
   *
   * @param {boolean} nottransEnabled 非免转为true
   */
  renderIframe(nottransEnabled) {
    const {currentUrl, id, name} = this.state;
    return (
      <iframe
        title={id}
        alt={name}
        src={currentUrl}
        className={css.container_Iframe}
        height={nottransEnabled ? '96%' : '100%'}
      />
    );
  }

  render() {
    const {isDemo, currentPlatform} = this.state;
    const {gamePlatformList} = this.props;
    // 非免转:true
    const nottransEnabled =
      gamePlatformList[currentPlatform] &&
      gamePlatformList[currentPlatform].itransEnabled === 'OFF';
    return (
      <div className={css.containerOuter}>
        {nottransEnabled && (
          <Row className={css.container}>
            <Link className={css.containerlogoAnchor} to="/">
              <img src={Logo} alt="标志" className={css.container_logo} />
            </Link>
            {this.renderTitle()}
            {isDemo ? '' : this.renderWalletBalance()}
            {isDemo ? '' : this.renderTransferItems()}
            {this.renderGreetingUsername()}
          </Row>
        )}
        <Row>{this.renderIframe(nottransEnabled)}</Row>
      </div>
    );
  }
}

function mapStatesToProps({userModel, playerModel, formModel}) {
  const {
    userData,
    dailyWithdrawWithAdminSettingsResult,
    balance,
    awaitingResponse,
  } = userModel;
  const {gamePlatformList, balanceIsLoading} = playerModel;

  return {
    userData,
    centerBalance: balance,
    balance: dailyWithdrawWithAdminSettingsResult.balance,
    gamePlatformList,
    transferAmount: formModel.transferAmount.value,
    loading: balanceIsLoading || awaitingResponse,
  };
}

export default connect(mapStatesToProps)(withUserCredential(Container, true));

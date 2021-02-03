import React from 'react';

import {MDIcon} from 'components/General';
import isGuestUser from 'utils/isGuestUser';
import isPlatformExist from 'utils/isPlatformExist';
import css from 'styles/header/Dsf/userQuickAccessBar2.less';
import {addCommas} from 'utils';
import {connect} from 'dva';
import popOverBg from 'assets/image/header2/bg-dm.png';
import popOverProfilePic from 'assets/image/header2/ic-dm-user.svg';
import userIcon from 'assets/image/header2/ic-user.svg';
import msgIcon from 'assets/image/header2/ic-news.svg';
import SVG from 'react-inlinesvg';

class UserQuickAccessBar extends React.Component {
  constructor(props) {
    super(props);
    const isGuest = isGuestUser(props);
    this.state = {
      isGuest,
      isShowWallet: false,
    };
    this.dispatch = props.dispatch;
    this.onTopupCtrl = props.onQuickAccessClick.bind(this, 'topupCtrl');
    this.onRefreshClick = this.onRefreshClick.bind(this);
    this.onWithdrawalCtrl = props.onQuickAccessClick.bind(
      this,
      'withdrawalCtrl',
    );
    this.onBankCardInfo = props.onQuickAccessClick.bind(this, 'drawInfo');
    this.onTransferCtrl = props.onQuickAccessClick.bind(
      this,
      isGuest ? 'basicInfo' : 'transferCtrl',
    );
    this.basicInfo = props.onQuickAccessClick.bind(this, 'basicInfo');
    this.personalReport = props.onQuickAccessClick.bind(this, 'personalReport');
    this.onOrderRecord = props.onQuickAccessClick.bind(this, 'orderRecord');
    this.onMyCashFlow = props.onQuickAccessClick.bind(this, 'myCashFlow');
    this.securityInfo = props.onQuickAccessClick.bind(this, 'securityInfo');
    this.memberManage = props.onQuickAccessClick.bind(this, 'memberManage');
    this.feedback = props.onQuickAccessClick.bind(this, 'feedback');
    this.onMsgInbox = props.onQuickAccessClick.bind(this, 'msgInbox');
    this.handleShowAmount = this.handleShowAmount.bind(this);
  }

  componentWillMount() {
    this.dispatch({type: 'userModel/getUserMessageCount'});
    this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    this.dispatch({type: 'userModel/getUserTotalBalance'});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.username !== nextProps.username)
      this.setState({
        isGuest: isGuestUser(nextProps),
      });
  }

  handleShowAmount = () => {
    this.setState(prevState => {
      return {
        isShowWallet: !prevState.isShowWallet,
      };
    });
  };

  onRefreshClick = () => {
    this.dispatch({type: 'userModel/getUserTotalBalance'});
  };

  onChatRoomClick = () => {
    this.dispatch({
      type: 'chatboxModel/triggerShowChatbox',
      payload: {
        showChatbox: true,
      },
    });
  };

  render() {
    const {
      awaitingResponse,
      gamePlatformList,
      isBetCenter,
      myMessagesUnreadCount,
      profileModalTrigger,
      onLogOutClick,
      topupGroups,
      balance,
      userData: {username, role},
      isChatEnabled,
    } = this.props;

    const {isGuest} = this.state;
    return (
      <div className={css.quickAccessBar}>
        <div
          className={css.quickAccessBarBtnWelcome}
          data-betcenter={isBetCenter}>
          <SVG src={userIcon} className={css.userIcon} />
          <i>您好!</i>
          <MDIcon iconName="menu-down" />
          <div className={css.popover}>
            <div className={css.popoverTitle}>
              <img src={popOverBg} className={css.popOverBg} />
              <img src={popOverProfilePic} className={css.popOverProfilePic} />
              <span className={css.accountUserName}>{username.toString()}</span>
            </div>
            <div className={css.popoverContent}>
              <div className={css.subPopoverContent}>
                <button
                  type="button"
                  className={css.popoverContentItem}
                  onClick={this.onTransferCtrl}
                  data-betcenter={isBetCenter}>
                  <i>我的钱包</i>
                </button>
                <button
                  type="button"
                  className={css.popoverContentItem}
                  onClick={this.basicInfo}
                  data-betcenter={isBetCenter}>
                  <i>基本资料</i>
                </button>
                <button
                  type="button"
                  disabled={isGuest}
                  className={css.popoverContentItem}
                  onClick={this.onBankCardInfo}
                  data-betcenter={isBetCenter}>
                  <i>银行卡信息</i>
                </button>
              </div>
              <div className={css.subPopoverContent}>
                <button
                  type="button"
                  className={css.popoverContentItem}
                  onClick={this.onMyCashFlow}
                  data-betcenter={isBetCenter}>
                  <i>交易明细</i>
                </button>
                <button
                  type="button"
                  className={css.popoverContentItem}
                  onClick={this.onOrderRecord}
                  data-betcenter={isBetCenter}>
                  <i>投注记录</i>
                </button>
                <button
                  type="button"
                  className={css.popoverContentItem}
                  onClick={this.personalReport}
                  data-betcenter={isBetCenter}>
                  <i>个人报表</i>
                </button>
              </div>
              <div className={css.subPopoverContent}>
                <button
                  type="button"
                  className={css.popoverContentItem}
                  onClick={this.securityInfo}
                  data-betcenter={isBetCenter}>
                  <i>修改密码</i>
                </button>
                <button
                  type="button"
                  disabled={isGuest || role == 'PLAYER'}
                  className={css.popoverContentItem}
                  onClick={this.memberManage}
                  data-betcenter={isBetCenter}>
                  <i>代理中心</i>
                </button>
                <button
                  type="button"
                  className={css.popoverContentItem}
                  onClick={this.feedback}
                  data-betcenter={isBetCenter}>
                  <i>意见反馈</i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className={css.quickAccessBarBtnMsg}
          onClick={this.onMsgInbox}
          data-betcenter={isBetCenter}>
          <SVG src={msgIcon} className={css.msgIcon} />
          <i>
            消息
            {myMessagesUnreadCount > 0 && (
              <span className={css.quickAccessBar_btnBubble}>
                {myMessagesUnreadCount}
              </span>
            )}
          </i>
        </button>
        {this.state.isShowWallet ? (
          <span className={css.wrapAmount}>
            <i className={css.quickAccessBar_balance}>
              {(balance >= 0 && addCommas(balance)) || '?'}元
            </i>
            <i
              role="presentation"
              onClick={this.handleShowAmount}
              data-betcenter={isBetCenter}
              className={css.showWallet}>
              隐藏
            </i>
            <button type="button" onClick={this.onRefreshClick}>
              <MDIcon
                rotated={awaitingResponse}
                iconName="refresh"
                className={css.quickAccessBar_refreshIcon}
              />
            </button>
          </span>
        ) : (
          <span className={css.wrapAmount}>
            <i className={css.labelMoney}>中心钱包余额</i>
            <i
              role="presentation"
              onClick={this.handleShowAmount}
              data-betcenter={isBetCenter}
              className={css.showWallet}>
              显示
            </i>
          </span>
        )}
        <button
          type="button"
          disabled={isGuest || !topupGroups}
          className={css.quickAccessBarBtnMoney}
          onClick={this.onTopupCtrl}
          data-betcenter={isBetCenter}>
          <i>充值</i>
        </button>
        {isPlatformExist(gamePlatformList) && (
          <button
            type="button"
            disabled={isGuest}
            className={css.quickAccessBarBtnMoney}
            onClick={this.onTransferCtrl}
            data-access="transferCtrl"
            data-betcenter={isBetCenter}>
            <i>转帐</i>
          </button>
        )}
        <button
          type="button"
          disabled={isGuest}
          className={css.quickAccessBarBtnMoney}
          onClick={this.onWithdrawalCtrl}
          data-betcenter={isBetCenter}>
          <i>提款</i>
        </button>
        {isChatEnabled && (
          <button
            type="button"
            disabled={isGuest}
            className={`${css.quickAccessBarBtnMoney} ${
              css.quickAccessBarBtnChat
            }`}
            onClick={this.onChatRoomClick}>
            <i>聊天室</i>
          </button>
        )}
        <button
          type="button"
          className={css.quickAccessBarBtnLogout}
          onClick={onLogOutClick}
          data-betcenter={isBetCenter}>
          <MDIcon iconName="power" />
          <i className={css.showLogout}>退出</i>
        </button>
      </div>
    );
  }
}

const mapStatesToProps = ({userModel, chatboxModel}) => {
  const {balance, awaitingResponse, userData} = userModel;
  const {enable: isChatEnabled} = chatboxModel;
  return {
    balance,
    awaitingResponse,
    userData,
    isChatEnabled,
  };
};

export default connect(mapStatesToProps)(UserQuickAccessBar);

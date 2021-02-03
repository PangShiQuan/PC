import React from 'react';
import {MDIcon} from 'components/General';
import SVG from 'react-inlinesvg';
import {addCommas, isGuestUser} from 'utils';
import accountdetailIcon from 'assets/image/allIcon/accountdetailIcon.svg';
import betrecordIcon from 'assets/image/allIcon/betrecordIcon.svg';
import cashoutIcon from 'assets/image/allIcon/cashoutIcon.svg';
import logoutIcon from 'assets/image/allIcon/logoutIcon.svg';
import messageIcon from 'assets/image/allIcon/messageIcon.svg';
import reloadIcon from 'assets/image/allIcon/reloadIcon.svg';
import usercenterIcon from 'assets/image/allIcon/usercenterIcon.svg';
import css from 'styles/header/Base/userQuickAccessBar1.less';

class UserQuickAccessBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isGuest: isGuestUser(props),
    };
    this.dispatch = props.dispatch;
    this.onRefreshClick = this.onRefreshClick.bind(this);
    this.onBasicInfo = props.onQuickAccessClick.bind(this, 'basicInfo');
    this.onTopupCtrl = props.onQuickAccessClick.bind(this, 'topupCtrl');
    this.onWithdrawalCtrl = props.onQuickAccessClick.bind(
      this,
      'withdrawalCtrl',
    );
    this.onOrderRecord = props.onQuickAccessClick.bind(this, 'orderRecord');
    this.onMyCashFlow = props.onQuickAccessClick.bind(this, 'myCashFlow');
    this.onMsgInbox = props.onQuickAccessClick.bind(this, 'msgInbox');
  }

  componentWillMount() {
    this.dispatch({type: 'userModel/getUserMessageCount'});
    // this.dispatch({type:'userModel/getCardsAndWithdrawDetail'});
    this.dispatch({type: 'userModel/getUserTotalBalance'});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.username !== nextProps.username)
      this.setState({
        isGuest: isGuestUser(nextProps),
      });
  }

  onRefreshClick() {
    // this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    this.dispatch({type: 'userModel/getUserTotalBalance'});
  }

  onChatRoomClick = () => {
    this.dispatch({
      type: 'chatboxModel/triggerShowChatbox',
      payload: {
        showChatbox: true,
      },
    });
  };

  render() {
    const {isGuest} = this.state;
    const {
      awaitingResponse,
      balance,
      myMessagesUnreadCount,
      onLogOutClick,
      profileModalTrigger,
      topupGroups,
      isChatEnabled,
    } = this.props;

    return (
      <div className={css.quickAccessBar}>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onRefreshClick}>
          <i>余额</i>
          <i className={css.quickAccessBar_balance}>
            {(balance >= 0 && addCommas(balance)) || '?'}元
          </i>
          <MDIcon
            rotated={awaitingResponse}
            iconName="refresh"
            className={css.quickAccessBar_refreshIcon}
          />
        </button>
        <button
          type="button"
          disabled={isGuest || !topupGroups}
          className={css.quickAccessBarBtn}
          onClick={this.onTopupCtrl}>
          <SVG src={reloadIcon} className={css.reloadIcon} />
          <i>充值</i>
        </button>
        <button
          type="button"
          disabled={isGuest}
          className={css.quickAccessBarBtn}
          onClick={this.onWithdrawalCtrl}>
          <SVG src={cashoutIcon} className={css.cashoutIcon} />
          <i>提款</i>
        </button>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onOrderRecord}>
          <SVG src={betrecordIcon} className={css.betrecordIcon} />
          <i>投注记录</i>
        </button>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onMyCashFlow}>
          <SVG src={accountdetailIcon} className={css.accountdetailIcon} />
          <i>账户明细</i>
        </button>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onMsgInbox}>
          <SVG src={messageIcon} className={css.messageIcon} />
          <i>
            我的消息
            {myMessagesUnreadCount > 0 && (
              <span className={css.quickAccessBar_btnBubble}>
                {myMessagesUnreadCount}
              </span>
            )}
          </i>
        </button>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onBasicInfo}>
          <SVG src={usercenterIcon} className={css.usercenterIcon} />
          <i>用户中心</i>
        </button>
        {isChatEnabled && (
          <button
            type="button"
            disabled={isGuest}
            className={css.quickAccessBarBtn}
            onClick={this.onChatRoomClick}>
            <i>聊天室</i>
          </button>
        )}
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={onLogOutClick}>
          <SVG src={logoutIcon} className={css.logoutIcon} />
          <i>安全登出</i>
        </button>
      </div>
    );
  }
}

export default UserQuickAccessBar;

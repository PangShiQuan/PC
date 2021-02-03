import React from 'react';

import {MDIcon} from 'components/General';
import isGuestUser from 'utils/isGuestUser';
import isPlatformExist from 'utils/isPlatformExist';
import css from 'styles/header/Dsf/userQuickAccessBar1.less';

class UserQuickAccessBar extends React.Component {
  constructor(props) {
    super(props);
    const isGuest = isGuestUser(props);
    this.state = {
      isGuest,
    };
    this.dispatch = props.dispatch;
    this.onTopupCtrl = props.onQuickAccessClick.bind(this, 'topupCtrl');
    this.onWithdrawalCtrl = props.onQuickAccessClick.bind(
      this,
      'withdrawalCtrl',
    );
    this.onTransferCtrl = props.onQuickAccessClick.bind(
      this,
      isGuest ? 'basicInfo' : 'transferCtrl',
    );
    this.onOrderRecord = props.onQuickAccessClick.bind(this, 'orderRecord');
    this.onMyCashFlow = props.onQuickAccessClick.bind(this, 'myCashFlow');
    this.onMsgInbox = props.onQuickAccessClick.bind(this, 'msgInbox');
  }

  componentWillMount() {
    this.dispatch({type: 'userModel/getUserMessageCount'});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.username !== nextProps.username)
      this.setState({
        isGuest: isGuestUser(nextProps),
      });
  }

  render() {
    const {
      awaitingResponse,
      gamePlatformList,
      isBetCenter,
      myMessagesUnreadCount,
      profileModalTrigger,
      onLogOutClick,
      topupGroups,
    } = this.props;
    const {isGuest} = this.state;

    return (
      <div className={css.quickAccessBar}>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onTransferCtrl}
          data-betcenter={isBetCenter}>
          <MDIcon rotated={awaitingResponse} iconName="cash-multiple" />
          <i>中心钱包</i>
        </button>
        <button
          type="button"
          disabled={isGuest || !topupGroups}
          className={css.quickAccessBarBtn}
          onClick={this.onTopupCtrl}
          data-betcenter={isBetCenter}>
          <MDIcon iconName="bank" />
          <i>充值</i>
        </button>
        {isPlatformExist(gamePlatformList) && (
          <button
            type="button"
            disabled={isGuest}
            className={css.quickAccessBarBtn}
            onClick={this.onTransferCtrl}
            data-access="transferCtrl"
            data-betcenter={isBetCenter}>
            <MDIcon iconName="wallet" />
            <i>转账</i>
          </button>
        )}
        <button
          type="button"
          disabled={isGuest}
          className={css.quickAccessBarBtn}
          onClick={this.onWithdrawalCtrl}
          data-betcenter={isBetCenter}>
          <MDIcon iconName="cash-multiple" />
          <i>提款</i>
        </button>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onOrderRecord}
          data-betcenter={isBetCenter}>
          <MDIcon iconName="ticket-confirmation" />
          <i>投注记录</i>
        </button>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onMyCashFlow}
          data-betcenter={isBetCenter}>
          <MDIcon iconName="format-list-checks" />
          <i>账户明细</i>
        </button>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={this.onMsgInbox}
          data-betcenter={isBetCenter}>
          <MDIcon iconName="inbox" />
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
          onClick={profileModalTrigger}
          data-betcenter={isBetCenter}>
          <MDIcon iconName="face-profile" />
          <i>用户中心</i>
        </button>
        <button
          type="button"
          className={css.quickAccessBarBtn}
          onClick={onLogOutClick}
          data-betcenter={isBetCenter}>
          <MDIcon iconName="power" />
          <i>安全登出</i>
        </button>
      </div>
    );
  }
}

export default UserQuickAccessBar;

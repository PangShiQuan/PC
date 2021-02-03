import React, {Component} from 'react';
import {Modal} from 'antd';
import {connect} from 'dva';
import isGuestUser from 'utils/isGuestUser';
import {SubButton, Button, CoreButton} from 'components/General/';
import css from 'styles/header/Base/login1.less';
import resolve from 'clientResolver';
import {type as TYPE} from 'utils';
import {routerRedux} from 'dva/router';

const UserQuickAccessBar = resolve.plugin('UserQuickAccessBar');

class Login extends Component {
  constructor(props) {
    super(props);
    const isGuest = isGuestUser(props);
    this.dispatch = props.dispatch;
    this.onLogOutClick = this.onLogOutClick.bind(this);
    this.onShowProfileClick = this.onShowProfileClick.bind(this);
    this.onQuickAccessClick = this.onQuickAccessClick.bind(this);
    this.onRegister = this.onAuthModalClick.bind(this, TYPE.REGISTER);
    this.onLogin = this.onAuthModalClick.bind(this, TYPE.LOGIN);
    this.onGuestAccountRequest = this.onAuthModalClick.bind(
      this,
      TYPE.GUEST_REGISTER,
    );
    this.state = {
      isGuest,
    };
  }

  componentDidMount() {
    this.dispatch({
      type: 'chatboxModel/getChatStatus',
    });

    const isAgentCodeOnURL = window.location.search.includes('register');
    const isTopupOnURL = window.location.hash.includes('topup');
    const {accessToken} = this.props;
    if (isAgentCodeOnURL && !accessToken) {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {shouldShowAuthModel: true},
      });
      this.dispatch({
        type: 'userModel/updateState',
        payload: {authenticationState: TYPE.REGISTER},
      });
    } else if (isTopupOnURL) {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          profileSelectedNav: 'topupCtrl',
        },
      });
      this.dispatch(
        routerRedux.push({
          pathname: `/user`,
        }),
      );
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.username !== prevProps.username)
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        isGuest: isGuestUser(prevProps),
      });
  }

  onAuthModalClick(authenticationState) {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {shouldShowAuthModel: true},
    });
    this.dispatch({
      type: 'userModel/updateState',
      payload: {authenticationState},
    });
  }

  onQuickAccessClick(profileSelectedNav) {
    const isLogin = localStorage.getItem(TYPE.accessToken);
    if (!isLogin) {
      this.dispatch({type: 'userModel/getUserLogout'});
    } else {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          profileSelectedNav,
        },
      });
      this.dispatch(
        routerRedux.push({
          pathname: `/user`,
        }),
      );
    }
  }

  onShowProfileClick() {
    const isLogin = localStorage.getItem(TYPE.accessToken);
    if (!isLogin) {
      this.dispatch({type: 'userModel/getUserLogout'});
    } else {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {shouldShowProfileModal: true},
      });
    }
  }

  onLogOutClick() {
    const {dispatch} = this.props;
    Modal.confirm({
      title: '请问您确定要登出吗？',
      onOk() {
        dispatch({type: 'userModel/getUserLogout'});
      },
      okText: '确定',
      cancelText: '取消',
    });
  }

  onChatButtonClick = () => {
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
      userData,
      balance,
      myMessagesUnreadCount,
      pcOtherSettings: {paySwitch},
      topupGroups,
      isChatEnabled,
    } = this.props;
    const {isGuest} = this.state;

    if (userData) {
      const quickAccessBarProps = {
        dispatch: this.dispatch,
        awaitingResponse,
        onQuickAccessClick: this.onQuickAccessClick,
        onLogOutClick: this.onLogOutClick,
        profileModalTrigger: this.onShowProfileClick,
        username: userData.username,
        myMessagesUnreadCount,
        balance,
        topupGroups,
        isChatEnabled,
      };
      return (
        <div className={css.login_body}>
          <UserQuickAccessBar {...quickAccessBarProps} />
        </div>
      );
    }
    return (
      <div className={css.login_body}>
        {isChatEnabled && (
          <CoreButton
            className={css.login_guestRegisterBtn}
            disabled={isGuest}
            onClick={this.onChatButtonClick}
            placeholder="聊天室"
          />
        )}
        {paySwitch && (
          <SubButton
            className={css.login_guestRegisterBtn}
            disabled={awaitingResponse}
            onClick={this.onGuestAccountRequest}
            placeholder="免费试玩"
          />
        )}
        <CoreButton
          onClick={this.onRegister}
          placeholder="注册"
          className={css.login_button}
          type="button"
        />
        <CoreButton
          onClick={this.onLogin}
          placeholder="登录"
          className={css.login_button}
          type="submit"
        />
      </div>
    );
  }
}

function mapStatesToProps({
  transferModel,
  userModel,
  gameInfosModel,
  chatboxModel,
}) {
  const {
    userData,
    awaitingResponse,
    balance,
    myMessagesUnreadCount,
    accessToken,
  } = userModel;
  const {enable: isChatEnabled} = chatboxModel;
  return {
    topupGroups: transferModel.topupGroups,
    userData,
    awaitingResponse,
    balance,
    accessToken,
    myMessagesUnreadCount,
    pcOtherSettings: gameInfosModel.otherSettings,
    isChatEnabled,
  };
}

export default connect(mapStatesToProps)(Login);

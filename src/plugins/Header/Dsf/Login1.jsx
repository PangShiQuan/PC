import React, {Component} from 'react';
import {Modal} from 'antd';
import {connect} from 'dva';

import resolve from 'clientResolver';
import {CoreButton} from 'components/General/';
import css from 'styles/header/Dsf/login1.less';
import {type as TYPE} from 'utils';
import {routerRedux} from 'dva/router';

const Subbutton = resolve.client('components/Header/Login');
const UserQuickAccessBar = resolve.plugin('UserQuickAccessBar');

class Login extends Component {
  constructor(props) {
    super(props);
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
  }

  componentWillMount() {
    const isAgentCodeOnURL = (window.location.search).includes('register');
    const isTopupOnURL = (window.location.hash).includes('topup');
    const { accessToken } = this.props;
    if (isAgentCodeOnURL && !accessToken) {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {shouldShowAuthModel: true},
      });
      this.dispatch({
        type: 'userModel/updateState',
        payload: {authenticationState: TYPE.REGISTER},
      });
    }
    else if (isTopupOnURL) {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        shouldShowProfileModal: true,
        profileSelectedNav: 'topupCtrl',
        },
      });
    }
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

  onShowProfileClick = () => {
    const {userData} = this.props;
    const isLogin = localStorage.getItem(TYPE.accessToken);
    if (!isLogin) {
      this.dispatch({type: 'userModel/getUserLogout'});
    }
    if (userData) {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {shouldShowProfileModal: true},
      });
    }
  };

  onLogOutClick = () => {
    Modal.confirm({
      title: '请问您确定要登出吗？',
      onOk: () => {
        this.dispatch({type: 'userModel/getUserLogout'});
      },
      okText: '确定',
      cancelText: '取消',
    });
  };

  render() {
    const {
      awaitingResponse,
      userData,
      myMessagesUnreadCount,
      gamePlatformList,
      pathname,
      pcOtherSettings: {paySwitch},
      topupGroups,
    } = this.props;
    const isBetCenter = pathname.includes('betcenter');
    let Content;

    if (userData) {
      const quickAccessBarProps = {
        dispatch: this.dispatch,
        awaitingResponse,
        onQuickAccessClick: this.onQuickAccessClick,
        onLogOutClick: this.onLogOutClick,
        profileModalTrigger: this.onShowProfileClick,
        username: userData.username,
        myMessagesUnreadCount,
        gamePlatformList,
        isBetCenter,
        topupGroups,
      };
      Content = <UserQuickAccessBar {...quickAccessBarProps} />;
    } else {
      Content = (
        <React.Fragment>
          {paySwitch && (
            <Subbutton
              className={css.login_guestRegisterBtn}
              disabled={awaitingResponse}
              placeholder="免费试玩"
              type="button"
              onClick={this.onGuestAccountRequest}
              databetcenter={isBetCenter}
            />
          )}
          <CoreButton
            onClick={this.onRegister}
            placeholder="注册"
            className={css.login_button}
            type="button"
            data-betcenter={isBetCenter}
          />
          <CoreButton
            onClick={this.onLogin}
            placeholder="登录"
            className={css.login_button}
            type="submit"
            data-betcenter={isBetCenter}
          />
        </React.Fragment>
      );
    }

    return <div className={css.login_body}>{Content}</div>;
  }
}

function mapStatesToProps({
  userModel,
  playerModel,
  transferModel,
  routing,
  gameInfosModel,
}) {
  const {userData, awaitingResponse, myMessagesUnreadCount, accessToken} = userModel;
  const {gamePlatformList} = playerModel;
  const {topupGroups} = transferModel;
  const {pathname} = routing.location;
  return {
    topupGroups,
    userData,
    awaitingResponse,
    myMessagesUnreadCount,
    accessToken,
    gamePlatformList,
    pathname,
    pcOtherSettings: gameInfosModel.otherSettings,
  };
}

export default connect(mapStatesToProps)(Login);

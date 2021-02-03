import React, {Component} from 'react';
import {connect} from 'dva';
import {Route, Redirect} from 'dva/router';
import {message, Spin} from 'antd';

import css from 'styles/general/PrivateRoute.less';
import {type as TYPE, isGuestUser} from 'utils';

// 暂时方案. 稍后需统一所有路径
const pathMap = {
  '/sports': '体育竞技',
  '/games': '电子游戏',
  '/cards': '棋牌游戏',
  '/fishing': '捕鱼游戏',
};

class PrivateRoute extends Component {
  static pendingMessage = [];

  static messageDuration = 3;

  static isAuthorized(userData, memberAccessOnly) {
    return !memberAccessOnly || (memberAccessOnly && !isGuestUser(userData));
  }

  constructor(props) {
    super(props);
    this.state = {tempPass: false};
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    const {accessToken, standalone, userData} = this.props;
    const pendingUserData = accessToken && !userData;

    if (pendingUserData || standalone) this.setState({tempPass: true});
    if (standalone) {
      this.dispatch({
        type: 'userModel/updateState',
        payload: {standalonePass: true},
      });
      this.dispatch({type: 'userModel/getUserAccess'});
    } else this.handleAccess(this.props, pendingUserData);
  }

  componentWillReceiveProps(nextProps) {
    const revokePass =
      nextProps.standalone &&
      !nextProps.accessToken &&
      !nextProps.userData &&
      !nextProps.standalonePass;

    if ((!this.props.userData && nextProps.userData) || revokePass)
      this.setState({tempPass: false});
    if ((this.props.userData && !nextProps.userData) || revokePass) {
      this.handleAccess(nextProps, !revokePass);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  handleAccess(props, postAuth = false) {
    const {accessToken} = props;

    if (!accessToken && !postAuth) {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {shouldShowAuthModel: true},
      });
      this.dispatch({
        type: 'userModel/updateState',
        payload: {authenticationState: TYPE.LOGIN},
      });
    }

    if (!postAuth) {
      const {
        location: {pathname},
        memberAccessOnly,
        userData,
      } = props;
      const matchPath = Object.keys(pathMap).find(
        path => pathname.search(path) >= 0,
      );
      const navText = matchPath ? pathMap[matchPath] : '此项目';
      const restrictedAccess = `尊敬的用户, ${navText}只开通予注册会员.`;
      let msg;

      if (!accessToken) {
        if (memberAccessOnly) msg = restrictedAccess;
        else msg = `尊敬的用户, 请在登录后再访问${navText}.`;
      } else if (!PrivateRoute.isAuthorized(userData, memberAccessOnly))
        msg = restrictedAccess;

      if (msg && !PrivateRoute.pendingMessage.includes(msg)) {
        PrivateRoute.pendingMessage.push(msg);
        message.info(msg, PrivateRoute.messageDuration, () => {
          PrivateRoute.pendingMessage.splice(
            PrivateRoute.pendingMessage.indexOf(msg),
            1,
          );
        });
      }
    }
  }

  render() {
    const {
      accessToken,
      memberAccessOnly,
      prevPath,
      location,
      userData,
      standalone,
      ...componentProps
    } = this.props;
    const {tempPass} = this.state;
    const {component: AuthenticatedComponent, ...inheritProps} = componentProps;
    return (
      <Route
        {...inheritProps}
        render={props => {
          if (accessToken) {
            if (PrivateRoute.isAuthorized(userData, memberAccessOnly)) {
              return <AuthenticatedComponent {...props} />;
            }
            if (tempPass) {
              return (
                <div className={css.container_shell}>
                  <Spin
                    className={css.loading}
                    size="large"
                    tip="正在导入用户数据..."
                  />
                </div>
              );
            }
          }
          if (standalone && tempPass)
            return (
              <div className={css.container_shell}>
                <Spin className={css.loading} size="large" />
              </div>
            );

          return (
            <Redirect
              to={{
                pathname: prevPath || '/',
                state: {redirection: location, memberAccessOnly},
              }}
            />
          );
        }}
      />
    );
  }
}
function mapStatesToProps({userModel}) {
  return {
    accessToken: userModel.accessToken,
    standalonePass: userModel.standalonePass,
    userData: userModel.userData,
  };
}

export default connect(mapStatesToProps)(PrivateRoute);

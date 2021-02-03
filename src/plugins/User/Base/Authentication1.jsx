import React, {Component} from 'react';
import {connect} from 'dva';
import {MDIcon, LoadingBar} from 'components/General/';
import {type as TYPE} from 'utils';
import css from 'styles/User/Base/Authentication1.less';

const AUTH_ACTION = {
  [TYPE.GUEST_REGISTER]: '试玩',
  [TYPE.REGISTER]: '注册',
  [TYPE.LOGIN]: '登录',
};

class Authentication extends Component {
  constructor(props) {
    super(props);
    this.state = {
      iframeHeight: 475,
      ...Authentication.getAuthState(props),
    };
    this.dispatch = props.dispatch;
    this.isMac = !!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i);
    this.isIE = !!navigator.userAgent.match(/(MSIE|MSIE|Trident\/|Edge\/)/i);
  }

  componentDidMount() {
    window.addEventListener('message', this.handleiFrameAction);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.authenticationState !== nextProps.authenticationState) {
      const Auth = Authentication.getAuthState(nextProps);
      this.setState({...Auth});
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'userModel/initializeState',
      payload: ['awaitingResponse'],
    });
    window.removeEventListener('message', this.handleiFrameAction);
  }

  onModalClose = () => {
    localStorage.removeItem('loginAuthWay');
    localStorage.removeItem('gtData');
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        shouldShowProfileModal: false,
        shouldShowAuthModel: false,
      },
    });
  };

  static getAuthState({authenticationState}) {
    const isGuestRegister = authenticationState === TYPE.GUEST_REGISTER;
    return {
      isGuestRegister,
      isRegister: authenticationState === TYPE.REGISTER || isGuestRegister,
      isLogin: authenticationState === TYPE.LOGIN,
    };
  }

  handleiFrameAction = e => {
    if (e.data && typeof e.data === 'string') {
      let data = {};
      try {
        data = JSON.parse(e.data);
      } catch (err) {
        // continue regardless of error
      }
      const {action, payload} = data;
      if (action === 'set_height') {
        this.setState({iframeHeight: payload});
      } else if (action === 'to_login') {
        this.dispatch({
          type: 'userModel/updateState',
          payload: {authenticationState: TYPE.LOGIN},
        });
      } else if (action === 'to_register') {
        this.dispatch({
          type: 'userModel/updateState',
          payload: {authenticationState: TYPE.REGISTER},
        });
      } else if (action === 'to_guest_register') {
        this.dispatch({
          type: 'userModel/updateState',
          payload: {authenticationState: TYPE.GUEST_REGISTER},
        });
      } else if (action === 'register_success') {
        this.dispatch({
          type: 'userModel/postRegistration',
          payload: {successData: payload},
        });
      } else if (action === 'login_success') {
        this.dispatch({
          type: 'userModel/putUserLogin',
          payload: {successData: payload},
        });
      }
    }
  };

  renderScene() {
    const {isGuestRegister} = this.state;
    const urlQueries = window.location.search;
    let href, title, port;
    if (this.state.isLogin) {
      href = `/login${urlQueries}/`;
      title = '登录';
      port = 5001;
    } else {
      href = `/register/${isGuestRegister ? 'guest/' : ''}${urlQueries}`;
      title = '注册';
      port = 5000;
    }

    if (process.env.NODE_ENV === 'development') {
      href = `http://localhost:${port}${href}`;
    }

    return <iframe height="100%" title={title} src={href} />;
  }

  render() {
    const {awaitingResponse, authenticationState} = this.props;
    const {iframeHeight} = this.state;
    const contentStyle = {
      height: iframeHeight,
    };
    return (
      <div className={css.auth_body}>
        <div className={css.auth_content}>
          <h4 className={css.auth_modalLabel}>
            用户{AUTH_ACTION[authenticationState]}
            <button
              type="button"
              onClick={this.onModalClose}
              className={css.auth_modalCloseBtn}>
              {/* <i>关闭</i> */}
              <MDIcon iconName="window-close" />
            </button>
          </h4>
          <LoadingBar duration="2s" isLoading={awaitingResponse} />
          <div className={css.auth_contentBody} style={contentStyle}>
            {this.renderScene()}
          </div>
        </div>
      </div>
    );
  }
}

function mapStatesToProps({
  userModel,
  formModel,
  layoutModel,
  gameInfosModel,
}) {
  const {shouldShowAuthModel} = layoutModel;
  const {userAgreed, awaitingResponse, authenticationState} = userModel;
  return {
    ...formModel,
    userAgreed,
    awaitingResponse,
    authenticationState,
    shouldShowAuthModel,
    pcOtherSettings: gameInfosModel.otherSettings,
  };
}

export default connect(mapStatesToProps)(Authentication);

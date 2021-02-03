import React, {Component} from 'react';
import {connect} from 'dva';
import {Link, routerRedux} from 'dva/router';
import resolve from 'clientResolver';
import css from 'styles/header/Dsf/topTray2.less';
import {CUSTOM_LIVECHAT_TRIGGER} from 'config';

const Login = resolve.plugin('Login');
class TopTray extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  onBookmarkClick = () => {
    if (window.sidebar && window.sidebar.addPanel) {
      // Mozilla Firefox Bookmark
      window.sidebar.addPanel(document.title, window.location.href, '');
    } else if (window.external && 'AddFavorite' in window.external) {
      // IE Favorite
      window.external.AddFavorite(window.location.href, document.title);
    } else if (window.opera && window.print) {
      // Opera Hotlist
      this.title = document.title;
      return true;
    } else {
      // webkit - safari/chrome
      alert(
        `请按 ${
          navigator.userAgent.toLowerCase().indexOf('mac') !== -1
            ? 'Command/Cmd'
            : 'CTRL'
        } + D 收藏。`,
      );
    }
  };

  // 二维码跳转
  onQrcodeClick = () => {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        profileSelectedNav: 'affCodeManage',
      },
    });
    this.dispatch(
      routerRedux.push({
        pathname: `/user`,
      }),
    );
  };

  render() {
    const {role, pcOtherInfo} = this.props;
    const showQrcode = !(role === 'USER' || role === 'PLAYER');

    const csLiveChatProps = {};
    if (CUSTOM_LIVECHAT_TRIGGER) {
      csLiveChatProps.onClick = CUSTOM_LIVECHAT_TRIGGER;
    } else {
      csLiveChatProps.href = pcOtherInfo.onlineServiceUrl;
    }

    return (
      <div className={css.header_topTray}>
        <div className={css.header_topTrayBody}>
          <div className={css.header_topTrayLinks}>
            {showQrcode ? (
              <button
                type="button"
                className={css.header_topTrayLink}
                onClick={this.onQrcodeClick}>
                <i>二维码推广</i>
              </button>
            ) : null}
            <a
              className={css.header_topTrayLink}
              onClick={this.onBookmarkClick}>
              <i>加入收藏</i>
            </a>
            <Link to="/helpcenter" className={css.header_topTrayLink}>
              <i>帮助中心</i>
            </Link>
            <Link to="/mobilesite" className={css.header_topTrayLink}>
              <i>手机下注</i>
            </Link>
            <a
              target="_blank"
              rel="noopener noreferrer"
              {...csLiveChatProps}
              className={css.header_topTrayLink}>
              <i>在线客服</i>
            </a>
          </div>
          <Login />
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({gameInfosModel, userModel}) => {
  const {pcOtherInfo} = gameInfosModel;
  const {role} = userModel;
  return {pcOtherInfo, role};
};

export default connect(mapStatesToProps)(TopTray);

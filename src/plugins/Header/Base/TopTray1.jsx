import React, {Component} from 'react';
import {connect} from 'dva';
import {Link, routerRedux} from 'dva/router';
import resolve from 'clientResolver';
import css from 'styles/header/Base/header1.less';
import {CUSTOM_LIVECHAT_TRIGGER} from 'config';

const Marquee = resolve.plugin('Marquee');

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

  renderCsButton() {
    const {pcOtherInfo} = this.props;
    if (!pcOtherInfo || !pcOtherInfo.onlineServiceUrl) return null;
    const {onlineServiceUrl} = pcOtherInfo;

    const csLiveChatProps = {};
    if(CUSTOM_LIVECHAT_TRIGGER){
      csLiveChatProps.onClick = CUSTOM_LIVECHAT_TRIGGER;
    }else{
      csLiveChatProps.href = onlineServiceUrl;
      csLiveChatProps.target="_blank";
    }

    return (
      <a
        className={css.header_topTrayLink}
        rel="noopener noreferrer"
        {...csLiveChatProps}>
        <i>在线客服</i>
      </a>
    );
  }

  render() {
    const {thisGameId, role} = this.props;
    const showQrcode = !(role === 'USER' || role === 'PLAYER');
    return (
      <div className={css.header_topTray}>
        <div className={css.header_topTrayBody}>
          <Marquee announcements={this.props.announcements} />
          <div className={css.header_topTrayLinks}>
            {showQrcode ? (
              <button
                type="button"
                className={css.header_topTrayLink}
                onClick={this.onQrcodeClick}>
                <i>二维码推广</i>
              </button>
            ) : null}
            <button
              type="button"
              className={css.header_topTrayLink}
              onClick={this.onBookmarkClick}>
              <i>加入收藏</i>
            </button>
            <Link to="/helpcenter" className={css.header_topTrayLink}>
              <i>帮助中心</i>
            </Link>
            <Link
              target="_blank"
              to={`/instructions?gameUniqueId=${thisGameId}`}
              className={css.header_topTrayLink}>
              <i>玩法说明</i>
            </Link>
            {this.renderCsButton()}
          </div>
        </div>
      </div>
    );
  }
}

const mapStatesToProps = ({betCenter, gameInfosModel, userModel}) => {
  const {thisGameId} = betCenter;
  const {role} = userModel;
  const {pcOtherInfo} = gameInfosModel;
  return {pcOtherInfo, thisGameId, role};
};

export default connect(mapStatesToProps)(TopTray);

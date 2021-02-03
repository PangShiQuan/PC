import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import classnames from 'classnames';
import SVG from 'react-inlinesvg';
import {QRCode} from 'components/General';
import helpLogo from 'assets/image/floatWindow/help-logo.png';
import trialLogo from 'assets/image/floatWindow/play-logo.png';
import csLogo from 'assets/image/floatWindow/cs-logo.png';
import qqLog from 'assets/image/floatWindow/qq-logo.png';
import androidSVG from 'assets/image/floatWindow/ic-android.svg';
import iosSVG from 'assets/image/floatWindow/ic-ios.svg';
import closeSVG from 'assets/image/floatWindow/ic-close.svg';
import trialSVG from 'assets/image/floatWindow/ic-trial.svg';
import helpSVG from 'assets/image/floatWindow/ic-help.svg';
import csSVG from 'assets/image/floatWindow/ic-service.svg';
import qqSVG from 'assets/image/floatWindow/ic-qq.svg';
import css from 'styles/homepage/Base/FloatWindows1.less';
import {type as TYPE} from 'utils';
import {find, includes} from 'lodash';

const osIcon = {
  android: androidSVG,
  ios: iosSVG,
};

class FloatWindows extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.onGuestAccountRequest = this.onGuestAccountRequest.bind(this);
    this.onFloatWindowClose = this.onFloatWindowClose.bind(this);
    this.state = {
      isHover: false,
    }
  }
  onGuestAccountRequest() {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {shouldShowAuthModel: true},
    });
    this.dispatch({
      type: 'userModel/updateState',
      payload: {authenticationState: TYPE.GUEST_REGISTER},
    });
  }
  onFloatWindowClose() {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {floatWindowIsOpen: false},
    });
  }
  onHover = () => {
    this.setState({isHover: true});
  }
  onHoverLeave = () => {
    this.setState({isHover: false});
  }
  renderContent() {
    const {
      float,
      osName,
      osType,
      [`${osType}AppLink`]: appDownloadLink,
      pcOtherInfo: {onlineServiceUrl, qq1, otherContactDtoList={}} = {},
      otherSettings: {paySwitch},
    } = this.props;
    const btns = [];
    const qqInOtherContact = find(otherContactDtoList, (index)=> {
      if (includes(index.title, 'qq') || includes(index.title, 'QQ')) {
        return index;
      }
    });
    if (float === 'left') {
      const trialBtn = paySwitch ? (
        <button
          key="trial"
          className={css.playBtn}
          onClick={this.onGuestAccountRequest}>
          <SVG
            src={trialSVG}
            className={classnames(css.downScale, css.icon__svg)}>
          </SVG>
           <SVG
            src={trialSVG}
            className={css.allIcon}>
          </SVG>
          <span className={css.desc}>免费试玩</span>
        </button>
      ) : null;
      const helpBtn = (
        <Link
          key="help"
          className={css.helpBtn}
          rel="noopener noreferrer"
          to="/helpcenter">
          <SVG
            src={helpSVG}
            className={classnames(css.downScale, css.icon__svg)}>
          </SVG>
          <SVG
            src={helpSVG}
            className={css.allIcon}>
          </SVG>
          <span className={css.desc}>帮助中心</span>
        </Link>
      );

      btns.push(trialBtn, helpBtn);
    } else if (float === 'right') {
      const csBtn = onlineServiceUrl ? (
        <a
          key="cs"
          className={css.onlineCSBtn}
          target="_blank"
          rel="noopener noreferrer"
          href={onlineServiceUrl}>
          <SVG src={csSVG} className={classnames(css.downScale, css.icon__svg)}>
          </SVG>
          <SVG
            src={csSVG}
            className={css.allIcon}>
          </SVG>
          <span className={css.desc}>在线客服</span>
        </a>
      ) : null;
      const qqBtn = (qq1 || (qqInOtherContact && qqInOtherContact.content)) ? (
        <a
          onMouseOver={this.onHover}
          onMouseLeave={this.onHoverLeave}
          key="qq"
          className={css.qqBtn}
          href={`tencent://message/?exe=qq&menu=yes&Uin=${qq1}`}>
          <SVG src={qqSVG} className={classnames(css.downScale, css.icon__svg)}>
          </SVG>
          <SVG
            src={qqSVG}
            className={css.allIcon}>
          </SVG>
          <span className={css.desc} >{this.state.isHover? (qq1 || (qqInOtherContact && qqInOtherContact.content)) : '在线QQ'}</span>
        </a>
      ) : null;

      btns.push(csBtn, qqBtn);
    }

    const downScale = window.matchMedia('(max-width: 1400px)').matches;
    const text = {
      QR: downScale ? '' : '下载',
    };
    const qrCodeSize = 128;

    return (
      <div className={css.floatingPanel}>
        {btns}
        <div className={css.QRCode}>
          <SVG
            src={osIcon[osType]}
            className={classnames(css.downScale, css.icon__svg)}>
            <img src={osIcon[osType]} className={css.downScale} alt={osType} />
          </SVG>
          <div className={css.scannerEffectBg}>
            <span className={css.scannerEffect}></span>
            <QRCode
              className={css.QRCode_bracket}
              text={appDownloadLink}
              size={qrCodeSize}
            />
            <div className={css.QRCode_title}>扫一扫</div>
          </div>
          <span className={classnames(css.QRCode_desc, css.desc)}>
            {text.QR}
            {osName}APP
          </span>
        </div>
      </div>
    );
  }
  render() {
    const {float, floatWindowIsOpen, topBanner} = this.props;
    if (floatWindowIsOpen) {
      return (
        <div className={css.wrapper} data-float={float}>
          {topBanner || null}
          {this.renderContent()}
          <button className={css.closeBtn} onClick={this.onFloatWindowClose}>
            <SVG
              src={closeSVG}
              className={classnames(
                css.closeBtn_text,
                css.downScale,
                css.icon__svg,
              )}>
              <img src={closeSVG} className={css.downScale} alt="closeicon" />
            </SVG>
            <img src={closeSVG} className={css.closeBtnSVG} alt="closeicon" />
          </button>
        </div>
      );
    }
    return null;
  }
}

function mapStatesToProps({layoutModel, gameInfosModel}) {
  const {floatWindowIsOpen, iosAppLink, androidAppLink} = layoutModel;
  return {
    floatWindowIsOpen,
    pcOtherInfo: gameInfosModel.pcOtherInfo,
    iosAppLink,
    androidAppLink,
    otherSettings: gameInfosModel.otherSettings,
  };
}

export default connect(mapStatesToProps)(FloatWindows);

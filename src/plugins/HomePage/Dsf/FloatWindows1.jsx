import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import SVG from 'react-inlinesvg';

import {QRCode, MDIcon} from 'components/General';
import resolve from 'clientResolver';
import {type as TYPE} from 'utils';
import closeSVG from 'assets/image/floatWindow/ic-close.svg';
import androidSVG from 'assets/image/floatWindow/ic-android.svg';
import iosSVG from 'assets/image/floatWindow/ic-ios.svg';
import trialSVG from 'assets/image/floatWindow/ic-trial.svg';
import helpSVG from 'assets/image/floatWindow/ic-help.svg';
import csSVG from 'assets/image/floatWindow/ic-service.svg';
import qqSVG from 'assets/image/floatWindow/ic-qq.svg';

/* eslint-disable camelcase */
const css = resolve.client('styles/homepage/FloatWindows.less');
const svgIcon = {
  android: androidSVG,
  ios: iosSVG,
  coin: trialSVG,
  'information-outline': helpSVG,
  lifebuoy: csSVG,
  qqchat: qqSVG,
};

function TextIcon({float, index, iconName}) {
  const classname = css[`${float}-icon-${index}`];
  const src = resolve.client(
    `assets/image/floatWindow-btnIcon--${float}-${index}.png`,
  );
  const Icon = src ? (
    <img src={src} alt="" className={classname} />
  ) : (
    <MDIcon iconName={iconName} className={classname} />
  );
  const IconSwap = svgIcon[iconName] ? (
    <SVG
      src={svgIcon[iconName]}
      className={classnames(css.downScale, css.icon__svg)}>
      <img src={svgIcon[iconName]} className={css.downScale} alt="trialicon" />
    </SVG>
  ) : null;

  return (
    <React.Fragment>
      {IconSwap}
      {Icon}
    </React.Fragment>
  );
}

function Button({
  float,
  index,
  text,
  text_small,
  fn,
  href,
  target,
  to,
  icon = {},
}) {
  const classname = css[`${float}-btn-${index}`];
  const Content = (
    <React.Fragment>
      <TextIcon float={float} index={index} {...icon} />
      {text_small ? (
        <span className={classnames(css.downScale, css.desc)}>
          {text_small}
        </span>
      ) : null}
      <span className={css.desc}>{text}</span>
    </React.Fragment>
  );

  if (fn)
    return (
      <button type="button" className={classname} onClick={fn}>
        {Content}
      </button>
    );
  if (href)
    return (
      <a
        className={classname}
        target={target || '_blank'}
        rel="noopener noreferrer"
        href={href}>
        {Content}
      </a>
    );
  if (to)
    return (
      <Link className={classname} rel="noopener noreferrer" to={to}>
        {Content}
      </Link>
    );

  return <div className={classname}>{Content}</div>;
}

class FloatWindows extends Component {
  constructor(props) {
    super(props);
    this.state = {
      buttons: [],
    };
    this.dispatch = props.dispatch;
  }

  UNSAFE_componentWillMount() {
    this.updateButtons(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.buttons !== nextProps.buttons) {
      this.updateButtons(nextProps);
    }
  }

  onGuestAccountRequest = () => {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {shouldShowAuthModel: true},
    });
    this.dispatch({
      type: 'userModel/updateState',
      payload: {authenticationState: TYPE.GUEST_REGISTER},
    });
  };

  onFloatWindowClose = () => {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {floatWindowIsOpen: false},
    });
  };

  updateButtons(props) {
    const {buttons, float} = props;
    const btns = [];

    buttons[float].forEach((button, index) => {
      if (button) {
        let {fn} = button;
        if (typeof fn === 'string') fn = this[fn];

        btns.push({...button, fn});
      }
    });
    this.setState({buttons: btns});
  }

  renderButtons() {
    const {float} = this.props;
    const {buttons} = this.state;

    return (
      <React.Fragment>
        {buttons.map((btn, index) => (
          <Button key={index} float={float} index={index} {...btn} />
        ))}
      </React.Fragment>
    );
  }

  render() {
    const {
      float,
      osName,
      osType,
      floatWindowIsOpen,
      qrCodePlacement = 'bottom',
      closeBtnIcon,
      qrCodeSize,
      topBanner,
      [`${osType}AppLink`]: appDownloadLink,
    } = this.props;

    if (floatWindowIsOpen) {
      const Buttons = this.renderButtons();
      const downScale = window.matchMedia('(max-width: 1400px)').matches;
      const text = {
        QR: downScale ? '' : '下载',
      };
      const style = {
        maxWidth: (css.QRCode_bracket && qrCodeSize * 1.05) || null,
      };
      const QRCodeGroup = (
        <div className={css.QRCode}>
          <SVG
            src={svgIcon[osType]}
            className={classnames(css.downScale, css.icon__svg)}>
            <img src={svgIcon[osType]} className={css.downScale} alt={osType} />
          </SVG>
          <div className={css.scannerEffectBg}>
            <span className={css.scannerEffect}></span>
            <QRCode
              className={css.QRCode_bracket}
              text={appDownloadLink}
              size={qrCodeSize}
              style={style}
            />
            <span className={css.QRCode_title}>扫一扫</span>
          </div>
          <span className={classnames(css.QRCode_desc, css.desc)}>
            {text.QR}
            {osName}APP
          </span>
        </div>
      );
      const closeBtn = closeBtnIcon ? (
        <MDIcon iconName={closeBtnIcon} />
      ) : (
        <span>关闭</span>
      );
      let Content;

      if (qrCodePlacement === 'top')
        Content = (
          <React.Fragment>
            {QRCodeGroup}
            {Buttons}
          </React.Fragment>
        );
      else if (qrCodePlacement === 'bottom')
        Content = (
          <React.Fragment>
            {Buttons}
            {QRCodeGroup}
          </React.Fragment>
        );

      return (
        <div className={css.wrapper} data-float={float}>
          {topBanner || null}
          <div className={css.floatingPanel} style={this.state.siteBanner?{background: 'url('+this.state.siteBanner+') center/contain no-repeat'}:{}}>{Content}</div>
          <button
            type="button"
            className={css.closeBtn}
            onClick={this.onFloatWindowClose}>
            <SVG
              src={closeSVG}
              className={classnames(
                css.closeBtn_text,
                css.downScale,
                css.icon__svg,
              )}>
              <img src={closeSVG} className={css.downScale} alt="closeicon" />
            </SVG>
            {closeBtn}
          </button>
        </div>
      );
    }
    return null;
  }
}

const buttonPropType = PropTypes.shape({
  text: PropTypes.string,
  fn: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  href: PropTypes.string,
  to: PropTypes.string,
  icon: PropTypes.shape({
    iconName: PropTypes.string,
    src: PropTypes.string,
  }),
});

FloatWindows.defaultProps = {
  qrCodePlacement: 'bottom',
  qrCodeSize: 128,
};

FloatWindows.propTypes = {
  buttons: PropTypes.shape({
    left: PropTypes.arrayOf(buttonPropType),
    right: PropTypes.arrayOf(buttonPropType),
  }).isRequired,
  float: PropTypes.oneOf(['left', 'right']).isRequired,
  qrCodePlacement: PropTypes.oneOf(['top', 'bottom']),
  qrCodeSize: PropTypes.number,
  closeBtnIcon: PropTypes.string,
  topBanner: PropTypes.element,
};

const mapStatesToProps = ({layoutModel, gameInfosModel}) => {
  const {floatWindowIsOpen, iosAppLink, androidAppLink} = layoutModel;
  return {
    floatWindowIsOpen,
    iosAppLink,
    androidAppLink,
    otherSettings: gameInfosModel.otherSettings,
  };
};

export default connect(mapStatesToProps)(FloatWindows);

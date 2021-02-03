import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {MDIcon, QRCode} from 'components/General';
import css from '../../styles/mobileSite/mobileSite.less';
import mobileDevice from '../../assets/image/mobileSite/iphone.png';
import mobileHeader from '../../assets/image/mobileSite/mobile-bg-title.png';

class MobileSiteBody extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {iosAppLink, androidAppLink} = this.props;
    return (
        <div className={css.mobileBanner}>
          <div className={css.wrap}>
          <div className={css.mobileImage}>
            <img src={mobileDevice} alt="mobileDevice" />
          </div>
          <div className={css.mobileItems}>
            <div className={css.mobileHeader}>
            <img src={mobileHeader} alt="mobileHeaderContent1" />
            </div>
            <div className={css.iosAndroidButton}>
              <div className={css.mobileIOSBtn}>
                <MDIcon className={css.icon} iconName="apple" />
                <button onClick={() => window.open(iosAppLink, '', '_blank')}>
                  IPhone版下载
                </button>
              </div>
              <div className={css.mobileAndroidBtn}>
                <MDIcon className={css.icon} iconName="android" />
                <button
                  onClick={() => window.open(androidAppLink, '', '_blank')}>
                  Android版下载
                </button>
              </div>
            </div>
            <div className={css.mobileQR}>
              <div className={css.qrCol}>
                <div className={css.qrBg}>
                  <div className={css.mobileIOSQR}>
                    <QRCode text={iosAppLink} size={169} />
                  </div>
                </div>
                <div className={css.qrTitle}>IOS客户端</div>
              </div>
              <div className={css.qrCol} data-right>
                <div className={css.qrBg}>
                  <div className={css.mobileAndroidQR}>
                    <QRCode text={androidAppLink} size={169} />
                  </div>
                </div>
                <div className={css.qrTitle}>安卓客户端</div>
              </div>
            </div>
          </div>
          </div>
        </div>
    );
  }
}

function mapStateToProps({layoutModel}) {
  const {iosAppLink, androidAppLink} = layoutModel;
  return {iosAppLink, androidAppLink};
}

export default connect(mapStateToProps)(MobileSiteBody);

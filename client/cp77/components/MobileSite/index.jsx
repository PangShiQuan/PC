import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {MDIcon, QRCode} from 'components/General';
import css from '../../styles/mobileSite/mobileSite.less';
import mobileDevice from '../../assets/image/mobileSite/iphone.png';

class MobileSiteBody extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const {iosAppLink, androidAppLink} = this.props;
    return (
        <div className={css.mobileBanner}>
          <div className={css.mobileImage}>
            <img src={mobileDevice} alt="mobileDevice" />
          </div>
          <div className={css.mobileItems}>
            <div>
              <div className={css.mobileHeaderText1}>
                随时随地畅玩彩票， 随时掌控，
              </div>
              <div className={css.mobileHeaderText2}>投入梦想， 注定精彩</div>
            </div>
            <div className={css.iosAndroidButton}>
              <div className={css.mobileIOSBtn}>
                <MDIcon className={css.icon} iconName="apple" />
                <button onClick={() => window.open(iosAppLink, '', '_blank')}>
                  IOS版下载
                </button>
              </div>
              <div className={css.mobileAndroidBtn}>
                <MDIcon className={css.icon} iconName="android" />
                <button
                  onClick={() => window.open(androidAppLink, '', '_blank')}>
                  安卓版下载
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
                <div className={css.qrTitle}>扫一扫下载Iphone版</div>
              </div>
              <div className={css.qrCol} data-right>
                <div className={css.qrBg}>
                  <div className={css.mobileAndroidQR}>
                    <QRCode text={androidAppLink} size={169} />
                  </div>
                </div>
                <div className={css.qrTitle}>扫一扫下载Android版</div>
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

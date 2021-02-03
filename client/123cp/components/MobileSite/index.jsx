import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {MDIcon, QRCode} from 'components/General';
import * as image from './resource';
import css from '../../styles/mobileSite/mobileSite.less';

const platformMap = {
  android: {
    label: 'android',
    phone: 'Android',
  },
  ios: {
    label: 'apple',
    phone: 'iPhone',
  },
};
class MobileSiteBody extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.dispatch({type: 'layoutModel/getDownloadLink'});
  }
  renderQRItem(platform) {
    const {[`${platform}AppLink`]: appDownloadLink} = this.props;
    return (
      <div className={css.qrColumns}>
        <div className={css.qr}>
          <QRCode
            text={appDownloadLink}
            mode="image"
            image={image[platform]}
            size={170}
          />
        </div>
        <a
          href={appDownloadLink}
          target="_blank"
          className={css.downloadAnchor}>
          <MDIcon iconName={platformMap[platform].label} />
          <i>{platformMap[platform].phone}下载</i>
        </a>
      </div>
    );
  }
  render() {
    return (
      <article>
        <section>
          <div className={css.container}>
            <div className={css.contentColumn}>
              <div className={css.introBox}>
                <img src={image.tagline} alt="欢迎进入 123彩票" />
              </div>
              <div className={css.QRcontainer}>
                <h1 className={css.headline}>
                  彩种全面<span className={css.spacer} />购彩简单
                  <br />
                  随时随地<span className={css.spacer} />想买就买
                </h1>
                {this.renderQRItem('ios')}
                {this.renderQRItem('android')}
              </div>
            </div>

            <img
              src={image.phone}
              role="presentation"
              alt="欢迎进入 123彩票"
              className={css.devices}
            />
          </div>
        </section>
        <section>
          <div className={css.container}>
            <h1 className={css.featureHeadline}>
              <img src={image.appLogo} alt="123彩票" />
              <span>123彩票</span>
            </h1>
            <div className={css.features}>
              <div
                className={css.featureColumn}
                style={{backgroundImage: `url(${image.featureIcon1})`}}>
                <h4 className={css.featureTitle}>官方品质</h4>
                <p className={css.featureDesc}>
                  国家正规发型<br />官方品质保障
                </p>
              </div>
              <div
                className={css.featureColumn}
                style={{backgroundImage: `url(${image.featureIcon2})`}}>
                <h4 className={css.featureTitle}>到账及时</h4>
                <p className={css.featureDesc}>
                  平均0.3秒存款<br />平均25秒提款
                </p>
              </div>
              <div
                className={css.featureColumn}
                style={{backgroundImage: `url(${image.featureIcon3})`}}>
                <h4 className={css.featureTitle}>开奖及时</h4>
                <p className={css.featureDesc}>
                  信息准时到达<br />第一时间掌握
                </p>
              </div>
              <div
                className={css.featureColumn}
                style={{backgroundImage: `url(${image.featureIcon4})`}}>
                <h4 className={css.featureTitle}>投注方便</h4>
                <p className={css.featureDesc}>
                  彩种丰富多样<br />操作轻松顺畅
                </p>
              </div>
            </div>
          </div>
        </section>
      </article>
    );
  }
}
const mapStatesToProps = ({layoutModel}) => {
  const {iosAppLink, androidAppLink} = layoutModel;
  return {iosAppLink, androidAppLink};
};
export default connect(mapStatesToProps)(MobileSiteBody);

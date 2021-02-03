import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {MDIcon, QRCode} from 'components/General';
import * as image from './resource';
import css from '../../styles/mobileSite/mobileSite.less';

const platformMap = {
  android: {
    icon: 'android',
    label: 'Android',
    phone: 'Android',
  },
  ios: {
    icon: 'apple',
    label: 'IOS',
    phone: 'IPhone',
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
      <div className={css.container__flexVertical}>
        <a
          href={appDownloadLink}
          target="_blank"
          rel="noopener noreferrer"
          className={css.downloadBtn}
          data-platform={platform}>
          <MDIcon iconName={platformMap[platform].icon} />{' '}
          <span>{platformMap[platform].label}版下载</span>
        </a>
        <QRCode
          text={appDownloadLink}
          mode="image"
          image={image[platform]}
          size={170}
        />
        <p className={css.QRBottom_desc}>{`扫一扫下载${
          platformMap[platform].phone
        }版APP赠送20元彩金`}</p>
      </div>
    );
  }
  render() {
    return (
      <article>
        <section className={css.container__content}>
          <div className={css.container__flex}>
            <div style={{width: '50%'}}>
              <img
                src={image.phone}
                role="presentation"
                alt={`欢迎进入 ${this.props.siteName}`}
              />
            </div>
            <div style={{width: '50%'}}>
              <h1 className={css.introBox}>
                <span>随时随地畅玩彩票，随心掌控</span>
                <span>投入梦想，注定精彩</span>
              </h1>
              <div className={classnames(css.group)}>
                {this.renderQRItem('ios')}
                {this.renderQRItem('android')}
              </div>
            </div>
          </div>
        </section>
      </article>
    );
  }
}

function mapStatesToProps({gameInfosModel, layoutModel}) {
  const {iosAppLink, androidAppLink} = layoutModel;
  const {pcOtherInfo: {siteName = ''} = {}} = gameInfosModel;

  return {iosAppLink, androidAppLink, siteName};
}

export default connect(mapStatesToProps)(MobileSiteBody);

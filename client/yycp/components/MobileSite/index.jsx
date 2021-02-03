import React, {Component} from 'react';
import {connect} from 'dva';
import {Link} from 'dva/router';
import {MDIcon, QRCode} from 'components/General';
import * as image from './resource';
import css from '../../styles/mobileSite/mobileSite.less';

const platformMap = {
  android: {
    label: 'android',
    phone: 'Android',
    desc: '支持android2.3及以上',
  },
  ios: {
    label: 'apple',
    phone: 'IPhone',
    desc: '支持ios6.0及以上',
  },
};

class MobileSiteBody extends Component {
  constructor(props, context) {
    super(props, context);
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.dispatch({type: 'layoutModel/getDownloadLink'});
  }
  renderQRItem(platform) {
    const {[`${platform}AppLink`]: appDownloadLink} = this.props;
    return (
      <div className={css.mobilePromote_download}>
        <a
          className={css.mobilePromote_downloadLink}
          href={appDownloadLink}
          target="_blank">
          <MDIcon
            className={css.mobilePromote_linkIcon}
            iconName={`${platformMap[platform].label}`}
            size="24px"
          />
          <span>{`${platformMap[platform].phone}下载`}</span>
        </a>
        <p className={css.mobilePromote_linkDesc}>
          {platformMap[platform].desc}
        </p>
        <div className={css.mobilePromote_qr}>
          <QRCode
            text={appDownloadLink}
            mode="image"
            image={image[platform]}
            size={196}
          />
        </div>
      </div>
    );
  }
  render() {
    return (
      <div className={css.mobilePromote_container}>
        <article className={css.mobilePromote_article}>
          <div className={css.mobilePromote_deviceCol}>
            <img
              className={css.mobilePromote_device}
              src={image.device}
              alt="手机购彩"
            />
            <Link to="/" className={css.mobilePromote_downloadLink}>
              <MDIcon
                className={css.mobilePromote_linkIcon}
                iconName="laptop"
                size="24px"
              />
              <span>点击立即访问网页版</span>
            </Link>
          </div>
          <div className={css.mobilePromote_downloadCol}>
            <img
              className={css.mobilePromote_headline}
              src={image.headline}
              alt="手机购彩 尽在易盈网"
            />
            <div className={css.mobilePromote_downloads}>
              {this.renderQRItem('ios')}
              {this.renderQRItem('android')}
            </div>
          </div>
        </article>
      </div>
    );
  }
}

const mapStatesToProps = ({layoutModel}) => {
  const {iosAppLink, androidAppLink} = layoutModel;
  return {iosAppLink, androidAppLink};
};

export default connect(mapStatesToProps)(MobileSiteBody);

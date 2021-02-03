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
          <h1 className={css.mobilePromote_headline}>手机购彩 尽在8亿彩</h1>
          <p className={css.mobilePromote_paragraph}>
            <span className={css.placeholder} />
            <span>
              手机便捷下注，游戏生活两不误随时随地<br />畅玩彩票就那么简单
            </span>
          </p>
          <div className={css.mobilePromote_downloads}>
            {this.renderQRItem('ios')}
            {this.renderQRItem('android')}
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

import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {MDIcon, QRCode} from 'components/General';
import * as image from './resource';
import css from '../../styles/mobileSite/mobileSite.less';

const platformMap = {
  android: {
    label: "android",
    phone: "Android"
  },
  ios: {
    label: "apple",
    phone: "IPhone"
  }
};

class MobileSiteBody extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.dispatch({ type: "layoutModel/getDownloadLink" });
  }
  renderQRItem(platform) {
    const { [`${platform}AppLink`]: appDownloadLink } = this.props;

    return (
      <div className={css.container__flexVertical}>
        <a className={css.box} href={appDownloadLink} target="_blank">
          <MDIcon
            className={css.icon}
            iconName={`${platformMap[platform].label}`}
          />
          <span>{`${platformMap[platform].phone} 版`}</span>
        </a>
        <QRCode
          text={appDownloadLink}
          mode="image"
          image={image[platform]}
          size={135}
        />
      </div>
    );
  }

  render() {
    return (
      <article className={css.article}>
        <section
          className={classnames(
            css.container__flex,
            css.featured,
            css.background
          )}
        >
          <img
            className={css.featured__item}
            src={image.featured1}
            role="presentation"
          />
          <div className={css.container__decoration}>
            <div className={css.mobileSite_introFlex}>
              <div className={css.mobileSite_introRightColumn}>
                <img src={image.introduction} role="presentation" />
                <div className={css.mobileSite_intro}>
                  <div className={css.mobileSite_introBox}>
                    <p>彩种全面</p>
                    <p>随时随地</p>
                    <p>购彩简单</p>
                    <p>想买就买</p>
                  </div>
                </div>
              </div>
            </div>
            <div className={css.mobileSite_introTitle}>手机客户端下载</div>
            <figure className={classnames(css.container__flex, css.group)}>
              {this.renderQRItem("ios")}
              {this.renderQRItem("android")}
            </figure>
          </div>
        </section>
      </article>
    );
  }
}

const mapStatesToProps = ({ layoutModel }) => {
  const { iosAppLink, androidAppLink } = layoutModel;
  return { iosAppLink, androidAppLink };
};

export default connect(mapStatesToProps)(MobileSiteBody);

import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {MDIcon, QRCode} from 'components/General';
import * as image from './resource';
import css from '../../styles/mobileSite/mobileSite.less';

const platformMap = {
  android: {
    client: "安卓",
    label: "android",
    phone: "Android"
  },
  ios: {
    client: "IOS",
    label: "apple",
    phone: "iPhone"
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

  renderItem(platform) {
    const { [`${platform}AppLink`]: appDownloadLink } = this.props;

    return (
      <div
        className={classnames(css.container__flex, css.container__flexVertical)}
      >
        <a
          className={classnames(css.container__flex, css.box)}
          href={appDownloadLink}
          target="_blank"
        >
          <MDIcon
            className={css.icon}
            iconName={`${platformMap[platform].label}`}
            color="light"
            size="24px"
          />
          <span
            className={classnames(css.text, css.text__title, css.textWhite)}
          >
            {`${platformMap[platform].phone} 版下载`}
          </span>
        </a>
        <div className={css.bracket}>
          <span />
          <QRCode
            text={appDownloadLink}
            size={135}
            crisp={false}
            mode={"image"}
            image={require(`../../assets/image/mobileSite/${platform}.png`)}
          />
          <span />
        </div>
        <span className={classnames(css.text, css.textWhite)}>
          {`${platformMap[platform].client}客户端`}
        </span>
      </div>
    );
  }

  render() {
    return (
      <article>
        <section className={classnames(css.container__flex, css.introduction)}>
          <img src={image.phone} role="presentation" />
          <figure className={css.container__flexStart}>
            <figcaption>
              <img src={image.caijin} role="presentation" />
              <h2
                className={classnames(css.text, css.text__title, css.textWhite)}
              >
                <span>手机购彩 无限畅玩</span>
                <span>★668彩票 668.cc★ </span>
              </h2>
            </figcaption>
            <div className={css.container__flex}>
              {this.renderItem("ios")}
              {this.renderItem("android")}
            </div>
          </figure>
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

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
  static defaultProps = {
    features: [
      { title: "方便便捷", desc: ["不受时间限制和地点随时随地购彩"] },
      { title: "玩法丰富", desc: ["高频彩数字彩竞技全面丰富"] },
      { title: "充值便捷", desc: ["支持手机支付宝, 充值卡直通卡等多种充值方式"] },
      { title: "一站式购彩", desc: ["注册, 充值, 购彩, 提款手机全搞定"] },
      { title: "电脑同步", desc: ["与电脑同步账号电脑手机互通"] },
      { title: "全新体验", desc: ["全新UI界面全新的购彩体验"] }
    ]
  };
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.dispatch({ type: "layoutModel/getDownloadLink" });
  }

  renderFeaturesItem() {
    const { features } = this.props;
    return features.map((item, itemIndex) => {
      return (
        <div
          className={classnames(css.feature__item, css.box__desc)}
          key={itemIndex}
        >
          <img src={image.features[itemIndex]} role="presentation" />
          <p>
            <span>{item.title}</span>
            {item.desc.map((desc, index) => <span key={index}>{desc}</span>)}
          </p>
        </div>
      );
    });
  }

  renderQRItem(platform) {
    const { [`${platform}AppLink`]: appDownloadLink } = this.props;
    return (
      <div className={css.container__flexVertical}>
        <a className={css.downloadBtn} href={appDownloadLink} target="_blank">
          <MDIcon
            className={css.icon}
            iconName={`${platformMap[platform].label}`}
            size="24px"
          />
          <span>{`${platformMap[platform].phone} 版`}</span>
        </a>
        <QRCode
          text={appDownloadLink}
          mode="image"
          image={image[platform]}
          size={170}
        />
      </div>
    );
  }

  render() {
    return (
      <article>
        <section>
          <div className={css.banner} />
          <div className={css.container__flex}>
            <div className={classnames(css.text, css.description)}>
              <img src={image.introScreen} role="presentation" />
            </div>
            <div>
              <div className={classnames(css.group)}>
                {this.renderQRItem("ios")}
                {this.renderQRItem("android")}
              </div>
              <div className={css.introBox}>
                <h2 className={css.introTitle}>977彩票</h2>
                <p className={css.introDesc}>
                  本软件功能强大、操作简单、安全方便、界面美观、更省流量， 让你随时随地投注彩票，是您最好的省钱中利器。
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className={classnames(css.features)}>
          <figure className={css.container__flex}>
            {this.renderFeaturesItem()}
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

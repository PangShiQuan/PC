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
  constructor(props, context) {
    super(props, context);
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
        <a className={css.box} href={appDownloadLink} target="_blank">
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
          size={150}
        />
      </div>
    );
  }
  render() {
    return (
      <article className={css.article}>
        <section className={classnames(css.topBackground, css.background)}>
          <div className={classnames(css.container__flex, css.featured)}>
            <img
              className={css.featured__item}
              src={image.introScreen}
              role="presentation"
            />
            <div className={css.container__decoration}>
              <div className={css.mobileSite_introFlex}>
                <div className={css.mobileSite_introRightColumn}>
                  <div className={css.mobileSite_intro}>
                    <img
                      className={css.mobileSite_logoIcon}
                      src={image.logo}
                      role="presentation"
                    />
                    <img
                      className={css.mobileSite_introSentence}
                      src={image.introSentence}
                      role="presentation"
                    />
                  </div>
                </div>
              </div>

              <figure className={classnames(css.container__flex, css.group)}>
                {this.renderQRItem("ios")}
                {this.renderQRItem("android")}
              </figure>
            </div>
            <img
              className={css.decorationImg}
              src={image.decoration}
              role="presentation"
            />
          </div>
        </section>
        <section
          className={classnames(
            css.container__flex,
            css.features,
            css.background
          )}
        >
          <figure className={css.feature_container}>
            {this.renderFeaturesItem()}
          </figure>
          <img
            className={css.features__image}
            src={image.phoneScreen}
            role="presentation"
          />
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

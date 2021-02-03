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
    phone: "IOS"
  }
};

class MobileSiteBody extends Component {
  static defaultProps = {
    features: [
      { title: "购彩便捷", desc: ["下注快捷方便 走到哪 玩到哪儿"] },
      { title: "安全交易", desc: ["保障用户隐私 确保资金安全"] },
      { title: "领奖方便", desc: ["支持微信支付宝秒速存款，取款火速到账"] },
      { title: "24小时客服", desc: ["7x24小时客服贴心服务"] }
    ],
    guides: new Set([
      "扫描二维码下载118娱乐手机APP",
      "打开APP，点击右下角【我的】→【免费试玩】",
      "填写密码，完成注册",
      "注册成功获得2000元试玩金（打开118娱乐APP-余额）"
    ])
  };

  renderGuidesItem() {
    const { guides } = this.props;
    return Array.from(guides).map((item, itemIndex) => {
      return (
        <li key={itemIndex}>
          <span>{item}</span>
        </li>
      );
    });
  }

  renderFeaturesItem() {
    const { features } = this.props;
    return features.map((item, itemIndex) => {
      return (
        <div className={css.box__desc} key={itemIndex}>
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
        <div className={css.box__QRCode}>
          <QRCode
            text={appDownloadLink}
            mode="image"
            image={image[platform]}
            crisp={false}
            size={135}
          />
        </div>
        <a className={css.box} href={appDownloadLink} target="_blank">
          <MDIcon
            className={css.icon}
            iconName={`${platformMap[platform].label}`}
            size="24px"
          />
          <span>{`${platformMap[platform].phone} 版下载`}</span>
        </a>
      </div>
    );
  }

  render() {
    return (
      <article className={classnames(css.page, css.container__flexVertical)}>
        <section className={css.container__flex}>
          <figure>
            <figcaption className={css.caption}>
              <span className={css.text}>
                <strong className={css.textWhite}>离</strong>
                <strong className={css.textBlack}>梦想</strong>
                <strong className={css.textWhite}>最近的地方</strong>
              </span>
              <span className={classnames(css.text, css.textWhite)}>
                <p>手机便捷下注，游戏生活两不误</p>
                <p>随时随地，畅玩彩票就那么简单</p>
              </span>
            </figcaption>
            <div className={css.container__flex}>
              {this.renderQRItem("ios")}
              {this.renderQRItem("android")}
            </div>
          </figure>
          <img
            className={css.imgShrink}
            src={image.introduction}
            role="presentation"
          />
        </section>
        <section
          className={classnames(css.container__flex, css.container__flexStart)}
        >
          <img
            className={classnames(css.imgShrink, css.transformTop)}
            src={image.results}
            role="presentation"
          />
          <figure>
            <figcaption className={css.caption}>
              <span>
                <mark>下载APP</mark>
                免费 2000 元试玩金
              </span>
            </figcaption>
            <ol className={css.guides}>{this.renderGuidesItem()}</ol>
          </figure>
        </section>
        <section className={classnames(css.container__flex, css.features)}>
          <figure>
            <figcaption className={css.caption}>
              <span>
                <mark>四大优势</mark>
                <strong className={css.textWhite}>让你玩转彩票</strong>
              </span>
            </figcaption>
            <div className={css.features__item}>
              {this.renderFeaturesItem()}
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

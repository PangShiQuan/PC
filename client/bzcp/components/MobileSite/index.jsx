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
      {
        title: "099 彩票",
        desc: [
          "本软件功能强大, 操作简单, 安全方便,",
          "界面美观, 更省流量, 让你随时随地投注彩票,",
          "是您最好的省钱中奖利器.安全方便."
        ]
      },
      { title: "产品服务", desc: ["投注简单 支付方便"] },
      { title: "银行服务", desc: ["0.3秒存款 25 秒提款"] },
      { title: "值得信赖", desc: ["政府颁发执照"] }
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
          <img
            className={itemIndex === 0 ? css.imgMain : ""}
            src={image.features[itemIndex]}
            role="presentation"
          />
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
          <img src={image[platform]}/>
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
          <div className={css.container__bg}>
            <div className={css.container__wh}>
            </div>
          </div>
          <figure className={classnames(css.container__flex, css.group)}>
            {this.renderQRItem("ios")}
            {this.renderQRItem("android")}
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

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
    phone: 'IPhone',
  },
};

class MobileSiteBody extends Component {
  static defaultProps = {
    features: [
      {title: '产品服务', desc: ['投注简单 支付方便']},
      {title: '银行服务', desc: ['0.3秒存款 25秒提款']},
      {title: '值得信赖', desc: ['政府颁发执照']},
    ],
    description: [['彩种全面', '随时随地'], ['购彩简单', '想买就买']],
  };

  renderFeaturesItem() {
    const {features} = this.props;
    return features.map((item, itemIndex) => {
      return (
        <div className={css.box__desc} key={itemIndex}>
          <img src={image.features[itemIndex]} alt="" />
          <div>
            <h2 className={css.title}>{item.title}</h2>
            <span>{item.desc}</span>
          </div>
        </div>
      );
    });
  }

  renderQRItem(platform) {
    const {[`${platform}AppLink`]: appDownloadLink} = this.props;
    return (
      <div>
        <div className={css.box_download}>
          <a href={appDownloadLink} target="_blank">
            <MDIcon
              className={css.icon}
              iconName={`${platformMap[platform].label}`}
              size="36px"
            />
            <span>{`${platformMap[platform].phone} 版`}</span>
          </a>
        </div>
        <QRCode
          text={appDownloadLink}
          mode="image"
          image={image[platform]}
          crisp={true}
          className={css.QRCode}
        />
      </div>
    );
  }
  renderIntro() {
    const description = this.props.description.map((desc, index) => {
      return (
        <p className={css.intro_desc} key={index}>
          {desc.map((item, itemIndex) => {
            return <span key={itemIndex}>{item} </span>;
          })}
        </p>
      );
    });
    return (
      <div className={css.intro}>
        <span className={css.intro_title}>手机客户端下载</span>
        {description}
      </div>
    );
  }
  render() {
    return (
      <article className={css.article}>
        <section className={classnames(css.container__flex, css.featured)}>
          {/* <img className={css.mainScreen} src={image.mainScreen} alt="" /> */}
          <figure>
            <figcaption>
              {/* <img src={image.title} alt="手机彩票 尽在 709.com" /> */}
            </figcaption>
            {this.renderIntro()}
            <div className={css.container__inline}>
              {this.renderQRItem('ios')}
              {this.renderQRItem('android')}
            </div>
          </figure>
        </section>
        <section className={classnames(css.container__flex, css.features)}>
          <figure>
            <figcaption>
              {/* <h1 className={css.title}>709 彩票</h1> */}
              <h1 className={css.title}>彩票</h1>
              <p>本软件功能强大, 操作简单, 安全方便,</p>
              <p>界面美观, 更省流量, 让你随时随地投注彩票,</p>
              <p>是你最好的省钱中奖利器.</p>
            </figcaption>
            <div className={css.features__item}>
              {this.renderFeaturesItem()}
            </div>
          </figure>
          <img className={css.feature__image} src={image.featured} alt="" />
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

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
    os: '安卓4.0',
  },
  ios: {
    label: 'apple',
    phone: 'IPhone',
    os: '苹果8.0',
  },
};

class MobileSiteBody extends Component {
  static defaultProps = {
    features: [
      {title: '官方品质', desc: ['国家正规发行官方品质保障']},
      {title: '开奖及时', desc: ['信息准时到达第一时间掌握']},
      {title: '投注便捷', desc: ['彩种丰富多样操作轻松顺畅']},
      {title: '随时随地', desc: ['只需手指一点好运随时降临']},
    ],
  };
  constructor(props, context) {
    super(props, context);
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.dispatch({type: 'layoutModel/getDownloadLink'});
  }
  renderFeaturesItem() {
    const {features} = this.props;
    return features.map((item, itemIndex) => (
      <div
        className={classnames(css.feature__item, css.box__desc)}
        key={itemIndex}>
        <img src={image.features[itemIndex]} alt="" />
        <p>
          <span>{item.title}</span>
          {item.desc.map((desc, index) => <span key={index}>{desc}</span>)}
        </p>
      </div>
    ));
  }
  renderQRItem(platform) {
    const {[`${platform}AppLink`]: appDownloadLink} = this.props;
    return (
      <div className={css.container__flexVertical}>
        <QRCode text={appDownloadLink} size={175} />
        <a
          className={css.box}
          href={appDownloadLink}
          target="_blank"
          rel="noopener noreferrer">
          <MDIcon
            className={css.icon}
            iconName={`${platformMap[platform].label}`}
            size="24px"
          />
          <span>{`${platformMap[platform].phone} 版`}</span>
        </a>
        <p className={css.QRPlatform_description}>{`适用于${
          platformMap[platform].os
        }及以上系统`}</p>
      </div>
    );
  }
  render() {
    return (
      <article className={css.article}>
        <section className={classnames(css.topBackground, css.background)}>
          <div className={classnames(css.container__flex, css.featured)}>
            <div className={css.introRightBox}>
              <div className={css.intro}>
                <p>永远相信</p>
                <p>美好的事情即将发生</p>
              </div>
              <figure className={classnames(css.container__flex, css.group)}>
                {this.renderQRItem('ios')}
                {this.renderQRItem('android')}
              </figure>
            </div>
            <img
              className={css.featured__item}
              src={image.introScreen}
              alt="主页"
            />
          </div>
        </section>
        <section
          className={classnames(
            css.container__flex,
            css.features,
            css.background,
          )}>
          <figure className={css.feature_container}>
            {this.renderFeaturesItem()}
          </figure>
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

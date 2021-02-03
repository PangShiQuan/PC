import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {MDIcon, QRCode} from 'components/General';
import * as image from './resource';
import css from '../../styles/mobileSite/mobileSite.less';

class MobileSiteBody extends Component {
  constructor(props, context) {
    super(props, context);
    this.dispatch = props.dispatch;
  }
  componentWillMount() {
    this.dispatch({ type: "layoutModel/getDownloadLink" });
  }
  render() {
    const { iosAppLink, androidAppLink } = this.props;
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
              <img src={image.screenIntro} role="presentation" />
              <div className={css.mobileSite_introRightColumn}>
                <img src={image.introduction} role="presentation" />
                <div className={css.mobileSite_intro}>
                  <div className={css.mobileSite_introTitle}>
                    手机客户<br />端下载
                  </div>
                  <div className={css.mobileSite_introBox}>
                    <p className={css.mobileSite_introDesc}>
                      <span>彩种全面</span>
                      <span>随时随地</span>
                    </p>
                  </div>
                  <div className={css.mobileSite_introBox}>
                    <p className={css.mobileSite_introDesc}>
                      <span>购彩简单</span>
                      <span>想买就买</span>
                    </p>
                  </div>
                  <img
                    className={css.mobileSite_introShout}
                    src={image.introShout}
                    role="presentation"
                  />
                </div>
              </div>
            </div>

            <figure className={classnames(css.container__flex, css.group)}>
              <div className={css.container__flexVertical}>
                <a className={css.box} href={iosAppLink} target="_blank">
                  <MDIcon className={css.icon} iconName="apple" />
                  <span>IPhone 版</span>
                </a>
                <QRCode text={iosAppLink} size={150} />
              </div>
              <div className={css.container__flexVertical}>
                <a className={css.box} href={androidAppLink} target="_blank">
                  <MDIcon className={css.icon} iconName="android" />
                  <span>Android 版</span>
                </a>
                <QRCode text={androidAppLink} size={150} />
              </div>
            </figure>
          </div>
        </section>
        <section
          className={classnames(
            css.container__flex,
            css.features,
            css.background
          )}
        >
          <figure className={css.container__flexVertical}>
            <div className={classnames(css.feature__item, css.box__desc)}>
              <img
                className={css.imgMain}
                src={image.feature0}
                role="presentation"
              />
              <p>
                <span>901 彩票</span>
                <span>本软件功能强大、操作简单、安全方便、</span>
                <span>界面美观、更省流量，让你随时随地投注彩票，</span>
                <span>是您最好的省钱中奖利器。</span>
              </p>
            </div>
            <div
              className={classnames(
                classnames(css.features__item, css.box__desc),
                css.box__desc
              )}
            >
              <img src={image.feature1} role="presentation" />
              <p>
                <span>产品服务</span>
                <span>投注简单 支付方便</span>
              </p>
            </div>
            <div className={classnames(css.features__item, css.box__desc)}>
              <img src={image.feature2} role="presentation" />
              <p>
                <span>银行服务</span>
                <span>0.3秒存款 25 秒提款</span>
              </p>
            </div>
            <div className={classnames(css.features__item, css.box__desc)}>
              <img src={image.feature3} role="presentation" />
              <p>
                <span>值得信赖</span>
                <span>政府颁发执照</span>
              </p>
            </div>
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
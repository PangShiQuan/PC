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
        <a className={css.QRBtn} href={appDownloadLink} target="_blank">
          <img
            src={require(`../../assets/image/mobileSite/${platformMap[platform]
              .label}Btn.png`)}
            role="presentation"
          />
        </a>
        <QRCode
          text={appDownloadLink}
          mode="image"
          image={image[platform]}
          size={180}
        />
      </div>
    );
  }

  render() {
    return (
      <article>
        <section className={css.topSection}>
          <div className={css.container__flex}>
            <div className={classnames(css.text, css.description)}>
              <img src={image.introScreen} role="presentation" />
            </div>
            <div>
              <div className={css.introBox}>
                <img className={css.logoMobile} src={image.logomobile} role="presentation" />
                <img className={css.logoIntro} src={image.intro} role="presentation" />
              </div>
              <div className={classnames(css.group)}>
                {this.renderQRItem("ios")}
                {this.renderQRItem("android")}
              </div>
            </div>
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

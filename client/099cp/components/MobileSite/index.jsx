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
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentWillMount() {
    this.dispatch({type: 'layoutModel/getDownloadLink'});
  }

  renderQRItem(platform) {
    const {[`${platform}AppLink`]: appDownloadLink} = this.props;
    return (
      <div className={css.container__flexVertical}>
        <a className={css.downloadBtn} href={appDownloadLink} target="_blank">
          <img
            src={image[platform]}
            className={css.intro}
            role="presentation"
            alt="欢迎进入"
          />
        </a>
        <QRCode
          text={appDownloadLink}
          mode="image"
          image={image[platform]}
          size={140}
        />
      </div>
    );
  }

  render() {
    return (
      <article>
        <section>
          <div className={css.container__flex}>
            <div className={css.phoneBox}>
              <img src={image.phone} role="presentation" alt="欢迎进入" />
            </div>
            <div className={css.introBox}>
              <img
                src={image.header}
                className={css.intro}
                role="presentation"
                alt="欢迎进入"
              />
            </div>
            <div className={classnames(css.qrGroup)}>
              {this.renderQRItem('ios')}
              {this.renderQRItem('android')}
            </div>
          </div>
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

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

  componentDidMount() {
    this.dispatch({type: 'layoutModel/getDownloadLink'});
  }

  renderQRItem(platform) {
    const {[`${platform}AppLink`]: appDownloadLink} = this.props;
    return (
      <div className={css.container__flexVertical}>
        <a className={css.downloadBtn} href={appDownloadLink} target="_blank">
          <MDIcon
            className={css.downloadBtnIcon}
            iconName={`${platformMap[platform].label}`}
          />
          <span>{`${platformMap[platform].phone} 版下载`}</span>
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
            <div>
              <img
                src={image.phone}
                role="presentation"
                alt="欢迎进入 168彩票"
              />
            </div>
            <div className={css.container_description}>
              <div className={css.introBox}>
                <img
                  src={image.intro}
                  role="presentation"
                  alt="随时随地畅玩彩票，随心掌控投入梦想，注定精彩"
                />
              </div>
              <div className={classnames(css.group)}>
                {this.renderQRItem('ios')}
                {this.renderQRItem('android')}
              </div>
            </div>
          </div>
          <img src={image.logo} alt="logo" className={css.logo_display} />
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

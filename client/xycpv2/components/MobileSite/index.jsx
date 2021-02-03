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
        <a href={appDownloadLink} target="_blank">
          <img src={image[`${platform}Btn`]} alt={`下载 ${platform} 版本`}/>
        </a>
        <QRCode
          text={appDownloadLink}
          mode="image"
          image={image[platform]}
          size={170}
        />
        <p className={css.QRBottom_desc}>{`扫一扫下载${
          platformMap[platform].phone
        }版`}</p>
      </div>
    );
  }
  render() {
    return (
      <article>
        <section>
          <div
            className={css.container__flex}
            >
            <div style={{width: '50%'}}>
              <img
                src={image.phone}
                role="presentation"
                alt="欢迎进入 168彩票"
              />
            </div>
            <div style={{width: '50%'}}>
              <div className={css.introBox}>
                <img src={image.tagline} alt="手机购彩 尽在 幸运彩票" />
              </div>
              <div className={classnames(css.group)}>
                {this.renderQRItem('ios')}
                {this.renderQRItem('android')}
              </div>
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

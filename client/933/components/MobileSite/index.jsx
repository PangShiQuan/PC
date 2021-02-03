import React, {Component} from 'react';
import {connect} from 'dva';
import classnames from 'classnames';
import {QRCode} from 'components/General';
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
        <a
          className={css.downloadBtn}
          href={appDownloadLink}
          target="_blank"
          rel="noopener noreferrer">
          <img src={image[`${platform}Btn`]} alt={`${platform}版下载`} />
        </a>
        <QRCode text={appDownloadLink} size={170} />
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
          <div className={css.container__flex}>
            <div className={classnames(css.group)}>
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

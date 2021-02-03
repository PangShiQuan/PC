import React, {Component} from 'react';
import resolve from 'clientResolver';
import css from 'styles/footer/Dsf/footerBar1.less';
import {connect} from 'dva';

const Sitemap = resolve.plugin('Sitemap');
const WebDisclaimer =  resolve.plugin('WebDisclaimer');

class Footer extends Component {
  renderDisclaimer() {
    const {showDisclaimer, disclaimerBgColor} = this.props;
    if (showDisclaimer) {
      return <WebDisclaimer disclaimerBgColor={disclaimerBgColor} />;
    } else return null;
  }
  renderSitemap() {
    const { showSiteMap, sitemapBgColor } = this.props;
    if (showSiteMap) {
      return <Sitemap sitemapBgColor={sitemapBgColor} />;
    } else return null;
  }
  render() {
    const {minPageWidth, paths} = this.props;
    return (
      <footer data-pathname={paths.join('')} className={css.mainFooter} style={minPageWidth ? {minWidth: minPageWidth} : null}>
        {this.renderSitemap()}
        {this.renderDisclaimer()}
      </footer>
    );
  }
}

function mapStatesToProps({routing}) {
  const {location : {pathname}} = routing;

  return {
    pathname,
  }
}

export default connect(mapStatesToProps)(Footer);

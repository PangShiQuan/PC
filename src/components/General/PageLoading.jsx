import React, {PureComponent} from 'react';
import resolve from 'clientResolver';
import {assets} from 'config';
import css from 'styles/general/pageLoading.less';

import LoadingBar from './LoadingBar';

const MainLogo =resolve.client(assets.logo_invert);

class PageLoading extends PureComponent {
  render() {
    const {isLoading, logo = MainLogo} = this.props;
    return (
      <div className={css.pageLoading_Overlay} data-active={isLoading}>
        <div className={css.pageLoading_Loading}>
          <img src={logo} alt="loading_logo" className={css.pageLoading_Logo} />
          <LoadingBar isLoading className={css.pageLoading_LoadingBar} />
        </div>
      </div>
    );
  }
}

export default PageLoading;

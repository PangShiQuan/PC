import React from 'react';
import {connect} from 'dva';
import {routerRedux} from 'dva/router';
import classnames from 'classnames';

import predictMap from 'assets/image/prediction_map.png';
import css from 'styles/homepage/Base/PredictMap1.less';
import homeCss from 'styles/homepage/Base/homepageBody1.less';

function PredictMap({dispatch}) {
  function handleImgClick() {
    dispatch(
      routerRedux.push({
        pathname: 'trends',
      }),
    );
  }

  return (
    <div className={homeCss.homePage_panel}>
      <h2
        className={classnames(
          homeCss.homePage_panelHeader,
          css.predictPanel_header,
        )}>
        彩票走势图
      </h2>
      <div className={css.predictPanel_body}>
        <input
          type="image"
          src={predictMap}
          alt="走势图"
          className={css.predictPanel_banner}
          onClick={handleImgClick}
        />
      </div>
    </div>
  );
}

export default connect()(PredictMap);

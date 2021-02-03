import React from 'react';
import {connect} from 'dva';
import css from 'styles/footer/Base/footerBar1.less';
import * as webInfo from 'utils/webInfo.config';

function WebDisclaimer({disclaimerBgColor, pcOtherInfo}) {
  return (
    <div className={css.footer} data-disclaimerbgcolor={disclaimerBgColor}>
      <div className={css.footer_content}>
        <ul className={css.footerImgs}>
          <li />
          <li />
          <li />
          <li />
          <li />
        </ul>
        <div className={css.footerWord}>
          <p>
            2010-{new Date().getFullYear()} © {pcOtherInfo.siteName} 版权所有 |
            彩票网址：
            {pcOtherInfo.mainUrl || webInfo.website}
          </p>
          <p>
            {pcOtherInfo.siteName}
            郑重提示：彩票有风险，投注需谨慎！我们积极推行负责任博彩,
            并极力拒绝未成年玩家使用我们的软件进行网上娱乐。
          </p>
        </div>
      </div>
    </div>
  );
}

const mapStatesToProps = ({gameInfosModel}) => {
  const {pcOtherInfo = {}} = gameInfosModel;
  return {pcOtherInfo};
};

export default connect(mapStatesToProps)(WebDisclaimer);

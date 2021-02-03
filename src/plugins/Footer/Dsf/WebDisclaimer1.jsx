import React from 'react';
import {connect} from 'dva';
import {Row} from 'antd';
import FooterLogos from 'components/Footer/FooterLogos';
import css from 'styles/footer/Dsf/footerBar1.less';

function WebDisclaimer({disclaimerBgColor, pcOtherInfo}) {
  return (
    <Row className={css.footer} data-disclaimerbgcolor={disclaimerBgColor}>
      <div className={css.footer_content}>
        <FooterLogos />
        <p>COPYRIGHT © {pcOtherInfo.siteName}</p>
        <p>
          {pcOtherInfo.siteName}, 选择我们，您将拥有可靠的资金保障和优质的服务。
        </p>
      </div>
    </Row>
  );
}

const mapStatesToProps = ({gameInfosModel}) => {
  const {pcOtherInfo = {}} = gameInfosModel;
  return {pcOtherInfo};
};

export default connect(mapStatesToProps)(WebDisclaimer);

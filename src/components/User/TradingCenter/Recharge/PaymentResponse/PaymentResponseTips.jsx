import React from 'react';
import css from 'styles/User/TradingCenter/Recharge.less';
import SVG from 'react-inlinesvg';
import lightBulb from 'assets/image/User/ic-tips.svg';

const PaymentResponseTips = () => {
  return (
    <div className={css.tips_div}>
      <div className={css.tips_content}>
        <div className={css.tips_title}>
          <SVG className={css.tips_svg_icon} src={lightBulb} />
          温馨提示
        </div>
        <div className={css.tips_description}>
          <div>
            1. 请依照系统提供的金额以及带有的小数点，进行汇款可快速自动到账
          </div>
          <div>2. 为确保您的账户资金安全，请保留您的凭条</div>
          <div>3. 我们的客服会根据银行转账实际到账日，审核该充值订单</div>
          <div>4. 如有疑问，请依据凭条，联系在线客服</div>
        </div>
      </div>
    </div>
  );
};
export default PaymentResponseTips;

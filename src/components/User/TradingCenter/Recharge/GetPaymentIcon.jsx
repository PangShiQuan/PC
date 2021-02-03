import React from 'react';
import SVG from 'react-inlinesvg';
import css from 'styles/User/TradingCenter/Recharge.less';
import alipayIcon from 'assets/image/User/Payment/ic-alipay.svg';
import bankIcon from 'assets/image/User/Payment/ic-bank.svg';
import cardIcon from 'assets/image/User/Payment/ic-card.svg';
import jdPayIcon from 'assets/image/User/Payment/ic-jdpay.svg';
import qqIcon from 'assets/image/User/Payment/ic-qq.svg';
import unionPayIcon from 'assets/image/User/Payment/ic-unionpay.svg';
import wechatPayIcon from 'assets/image/User/Payment/ic-wechatpay.svg';
import newVIPIcon from 'assets/image/User/Payment/ic-newVIP.svg';
import virtualCoinIcon from 'assets/image/User/Payment/ic-virtualcoin.svg';
import hotIcon from 'assets/image/User/Payment/hot.svg';

const getPaymentIcon = code => {
  switch (code) {
    case 'WX':
    case 'FIXED_WX':
    case 'WX_PUBLIC':
      return wechatPayIcon;
    case 'QQ':
    case 'FIXED_QQ':
      return qqIcon;
    case 'BANK':
      return bankIcon;
    case 'ZHB':
    case 'FIXED_ZHB':
      return alipayIcon;
    case 'JD':
      return jdPayIcon;
    case 'OTHER':
      return unionPayIcon;
    case 'THIRD_PARTY':
      return cardIcon;
    case 'TAGENT':
      return newVIPIcon;
    case 'Hot':
      return hotIcon;
    case 'VIRTUAL_COIN':
      return virtualCoinIcon;
    case 'VIP':
    default:
      return null;
  }
};

const renderIcon = props => {
  const {code} = props;
  const icon = getPaymentIcon(code);

  return (
    <React.Fragment>
      {icon && <SVG className={css.svg_icon} src={icon} />}
    </React.Fragment>
  );
};

export default renderIcon;

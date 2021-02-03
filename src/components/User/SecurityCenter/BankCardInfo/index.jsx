import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {find, filter, map} from 'lodash';
import BankCard from 'components/User/SecurityCenter/BankCardInfo/BankCard';
import css from 'styles/User/SecurityCenter/BankCardInfo.less';
import userCSS from 'styles/User/User.less';

class BankCardInfo extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    const {bankAccounts, userData, withdrawalSetting} = this.props;
    const {
      enabledAlipayWithdraw,
      hasAlipayCard,
      hasBankCard,
      enabledVcWithdraw,
      vcList,
    } = withdrawalSetting;

    if (enabledAlipayWithdraw || enabledVcWithdraw) {
      if (!hasAlipayCard && !hasBankCard && !vcList.length > 0) {
        this.dispatch({
          type: 'layoutModel/updateState',
          payload: {
            profileSelectedNav: 'withdrawalCtrl',
          },
        });
      }
    } else if (!hasBankCard) {
      this.dispatch({
        type: 'layoutModel/updateState',
      });
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          profileSelectedNav: 'withdrawalCtrl',
        },
      });
    }

    this.dispatch({type: 'userModel/getAlipayAndBankSettings'});
    if (bankAccounts.length) {
      this.getUserRealName(userData);
      this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
      this.dispatch({type: 'formModel/getBankCardDetails'});
    }
  }

  getUserRealName(userData) {
    const {realName} = userData;
    if (realName) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          bankAccountName: {
            value: realName,
            validatePassed: true,
          },
          realName: {
            value: realName,
            validatePassed: true,
          },
        },
      });
    }
  }

  render() {
    const {
      withdrawalSetting,
      bankAccounts,
      bankName,
      aliPayCardNo,
      otherSettings: {bankCardLogoUrlPrefix},
    } = this.props;
    const {
      hasAlipayCard,
      hasBankCard,
      enabledAlipayWithdraw,
    } = withdrawalSetting;

    let bankProps, alipayProps;

    if (hasBankCard && bankName.value) {
      const bank = find(bankAccounts, x => x.bankName === bankName.value);
      if (bank) {
        bankProps = {
          image: `${bankCardLogoUrlPrefix}${bank.bankCode}.png`,
          title: bank.bankName,
          cardNo: bank.bankCardNo,
          name: bank.bankAccountName,
          address: bank.bankAddress,
        };
      }
    }

    if (enabledAlipayWithdraw && hasAlipayCard) {
      const alipay = find(
        bankAccounts,
        x => x.bankCardNo === aliPayCardNo.value,
      );
      if (alipay) {
        alipayProps = {
          image: `${bankCardLogoUrlPrefix}${alipay.bankCode}.png`,
          title: alipay.bankName,
          cardNo: alipay.bankCardNo,
          name: alipay.bankAccountName,
        };
      }
    }

    const vcAccountProps = [];
    const vcAccounts = filter(bankAccounts, acc => acc.type === 'VIRTUAL_COIN');
    if (vcAccounts && vcAccounts.length > 0) {
      map(vcAccounts, vc => {
        vcAccountProps.push({
          image: `${bankCardLogoUrlPrefix}${vc.bankCode.toLowerCase()}.png`,
          title: vc.bankName,
          cardNo: vc.bankCardNo,
          name: vc.bankAccountName,
        });
      });
    }

    return (
      <div className={userCSS.content_body}>
        <div className={css.card_div}>
          {hasBankCard && bankProps && <BankCard {...bankProps} imageNo={1} />}
          {enabledAlipayWithdraw && hasAlipayCard && alipayProps && (
            <BankCard {...alipayProps} imageNo={2} />
          )}
          {vcAccountProps.length > 0 &&
            map(vcAccountProps, (vc, index) => (
              <BankCard {...vc} imageNo={index + 3} />
            ))}
        </div>
      </div>
    );
  }
}

function mapStatesToProps({userModel, formModel, gameInfosModel}) {
  const {otherSettings} = gameInfosModel;
  const {bankAccounts, userData, withdrawalSetting} = userModel;
  return {
    bankAccounts,
    userData,
    withdrawalSetting,
    otherSettings,
    ...formModel,
  };
}

export default connect(mapStatesToProps)(BankCardInfo);

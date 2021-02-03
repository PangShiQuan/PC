import React, {PureComponent} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {type as TYPE} from 'utils';
import {MDIcon} from 'components/General';
import Dropdown from 'components/User/Form/Dropdown';
import ContentContainer from 'components/User/ContentContainer';
import InputTextField from 'components/User/Form/InputTextField';
import InputPinField from 'components/User/Form/InputPinField';
import SubmitResetButton from 'components/User/Form/SubmitResetButton';
import css from 'styles/User/TradingCenter/Withdrawal.less';
import formCSS from 'styles/User/SecurityCenter/SecurityInfo.less';

class WithdrawalBindingForm extends PureComponent {
  LABEL_WIDTH = '110px';

  validateBankCard = _.debounce(props => {
    if (props.bankCardNo.validatePassed) {
      this.dispatch({type: 'transferModel/identifyBank'});
    } else if (!props.bankAccounts.length)
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          bankName: {
            value: '',
            color: '',
            validatePassed: false,
          },
        },
      });
  }, 500);

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      showDropDown: false,
    };
  }

  componentDidMount() {
    const {userData} = this.props;
    if (userData) {
      this.getUserRealName(userData);
    }
    this.dispatch({type: 'transferModel/getBankOptions'});
    const {withdrawalSetting} = this.props;
    const {hasBankCard} = withdrawalSetting;
    if (this.props.userData) {
      this.getUserRealName(this.props.userData);
    }
    if (hasBankCard) {
      this.dispatch({type: 'formModel/getBankCardDetails'});
    } else {
      this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    }

    this.addEventListener('#bankName');
    this.addEventListener('#dropdownDiv');

    this.fetchUpdates(this.props);
  }

  componentDidUpdate(prevProps) {
    const {
      accessToken: prevAccessToken,
      userData: prevUserData,
      withdrawalSetting: {hasBankCard},
      bankAccounts: prevBankAccounts,
      bankCardNo: prevBankCardNo,
    } = prevProps;
    const {
      accessToken,
      userData,
      bankAccounts,
      bankCardNo,
      withdrawalMethod,
      vcCode,
      vcName,
      withdrawalSetting: {vcList},
    } = this.props;

    if (prevAccessToken && accessToken && prevAccessToken !== accessToken) {
      this.fetchUpdates(this.props, true);
    }

    if (prevUserData !== userData) {
      this.getUserRealName(userData);
    }

    if (
      bankAccounts &&
      bankAccounts.length &&
      prevBankAccounts !== bankAccounts
    ) {
      this.dispatch({type: 'formModel/getBankCardDetails'});
    }

    if (hasBankCard) {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          profileSelectedNav: 'withdrawalCtrl',
        },
      });
    }

    if (
      withdrawalMethod !== TYPE.withdrawalMethods.VirtualCoin &&
      bankCardNo &&
      bankCardNo.value &&
      prevBankCardNo.value !== bankCardNo.value
    ) {
      this.validateBankCard(this.props);
    }

    if (
      withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin &&
      _.isEmpty(vcCode.value) &&
      _.isEmpty(vcName.value) &&
      vcList.length > 0
    ) {
      const firstVcOption = vcList[0];
      this.dispatch({
        type: 'formModel/toggleFormValue',
        payload: {
          vcName: firstVcOption.name,
          vcCode: firstVcOption.code,
        },
      });
    }
  }

  addEventListener = selector => {
    const selectorElement = document.querySelector(selector);
    if (selectorElement) {
      selectorElement.addEventListener('mouseover', () => {
        this.setState({
          showDropDown: true,
        });
      });
      selectorElement.addEventListener('mouseout', () => {
        this.setState({
          showDropDown: false,
        });
      });
      if (selector === '#dropdownDiv') {
        selectorElement.addEventListener('click', () => {
          this.setState({
            showDropDown: false,
          });
        });
      }
    }
  };

  fetchUpdates = (props, switchUser = false) => {
    const {bankAccounts, dailyWithdrawWithAdminSettingsResult} = props;

    if (!bankAccounts.length) {
      this.dispatch({type: 'transferModel/getBankOptions'});

      if (!dailyWithdrawWithAdminSettingsResult || switchUser) {
        this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
      }
    }
  };

  getUserRealName = userData => {
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
  };

  onBankNameSelect = ({bankName, bankCode}) => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({
      type: 'formModel/toggleFormValue',
      payload: {
        bankName,
        bankCode,
      },
    });
  };

  onVcSelect = vcCode => {
    const {
      withdrawalSetting: {vcList},
    } = this.props;
    const selectedVc = vcList.find(x => x.code === vcCode);

    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({
      type: 'formModel/toggleFormValue',
      payload: {
        vcName: selectedVc.name,
        vcCode: selectedVc.code,
      },
    });
  };

  onSubmitInfoClick = () => {
    const {
      bankCardNo,
      aliPayCardNo,
      vcCardNo,
      withdrawalMethod,
      bankAccounts,
    } = this.props;

    if (withdrawalMethod === TYPE.withdrawalMethods.AliPay) {
      this.dispatch({
        type: 'formModel/updateState',
        payload: {
          bankAddress: {
            value: '支付宝',
          },
          bankCode: {
            value: 'ZHB',
          },
          bankName: {
            value: '支付宝',
          },
        },
      });
    }

    let cardNo;

    if (withdrawalMethod === TYPE.withdrawalMethods.AliPay) {
      cardNo = aliPayCardNo.value;
    } else if (withdrawalMethod === TYPE.withdrawalMethods.BankCard) {
      cardNo = bankCardNo.value;
    } else if (withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin) {
      cardNo = vcCardNo.value;
    }
    if (bankAccounts.length === 0) {
      // 第一次绑定
      this.dispatch({
        type: 'userModel/putRegisterInfo',
        bankCardNo: {
          value: cardNo,
        },
        withdrawalMethod,
      });
    } else {
      this.dispatch({
        type: 'userModel/putRegisterCardsInfo',
        bankCardNo: {
          value: cardNo,
        },
        withdrawalMethod,
      });
    }
  };

  onClearClick = () => {
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: ['foundMatchBank'],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'responseMsg',
        'bankAccountName',
        'bankCode',
        'bankName',
        'vcCode',
        'vcName',
        'vcCardNo',
        'realName',
        'securityPassword',
        'repeatSecurityPassword',
        'bankAddress',
        'bankCardNo',
        'aliPayCardNo',
        'vcNewCardNo',
        'vcSecurityPassword',
        'repeatVcSecurityPassword',
      ],
    });
  };

  renderRealNameInput = () => {
    const {realName, bankAccountName} = this.props;
    const {value, inputMsg, icon, color} = realName;

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <InputTextField
            id="realName"
            readOnly
            disabled
            label={TYPE.inputFieldRefs.realName}
            value={value || bankAccountName.value}
            labelWidth={this.LABEL_WIDTH}
            placeholder={`请输入中文、英文的${TYPE.inputFieldRefs.realName}`}
            pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
            type="text"
            obj={realName}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderSecurityInput = () => {
    const {securityPassword} = this.props;
    const {value, inputMsg, icon, color} = securityPassword;
    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem} style={{position: 'relative'}}>
          <InputPinField
            labelWidth={this.LABEL_WIDTH}
            obj={securityPassword}
            label={`${TYPE.inputFieldRefs.securityPassword}`}
            max="4"
            min="4"
            name="securityPassword"
            pattern="\d[0-9]\d"
            type="password"
            value={value}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderRepeatSecurityInput = () => {
    const {repeatSecurityPassword} = this.props;
    const {value, inputMsg, icon, color} = repeatSecurityPassword;
    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem} style={{position: 'relative'}}>
          <InputPinField
            labelWidth={this.LABEL_WIDTH}
            obj={repeatSecurityPassword}
            label={`${TYPE.inputFieldRefs.repeatSecurityPassword}`}
            max="4"
            min="4"
            name="repeatSecurityPassword"
            pattern="\d[0-9]\d"
            type="password"
            value={value}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderWithdrawInfoForm = () => {
    return (
      <ContentContainer title="提款信息">
        {this.renderRealNameInput()}
        {this.renderSecurityInput()}
        {this.renderRepeatSecurityInput()}
        {this.renderSubmitButtons()}
      </ContentContainer>
    );
  };

  renderBankAccountName = ({label = '', placeholder = ''}) => {
    const {bankAccountName, bankAccounts, realName} = this.props;
    const {value, inputMsg, icon, color} = bankAccountName;
    const realNameExist =
      realName && realName.value && !_.isEmpty(realName.value);

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <InputTextField
            id="bankAccountName"
            readOnly={bankAccounts.length || realNameExist}
            disabled={realNameExist}
            label={label}
            value={
              realName && realName.value && !_.isEmpty(realName.value)
                ? realName.value
                : value
            }
            labelWidth={this.LABEL_WIDTH}
            placeholder={`请输入${placeholder}`}
            pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
            type="text"
            obj={bankAccountName}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg || (
            <span className={css.msg}>
              *请注意：开户姓名需与真实姓名保持一致
            </span>
          )}
        </div>
      </div>
    );
  };

  renderVcCardNo = () => {
    const {vcCardNo} = this.props;
    const {value, inputMsg, icon, color} = vcCardNo;

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <InputTextField
            id="vcCardNo"
            label={TYPE.inputFieldRefs.vcCardNo}
            value={value}
            labelWidth={this.LABEL_WIDTH}
            placeholder="请输入钱包地址"
            type="text"
            pattern="^[a-zA-Z0-9]{1,100}$"
            obj={vcCardNo}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderBankCardNo = () => {
    const {bankCardNo} = this.props;
    const {value, inputMsg, icon, color} = bankCardNo;

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <InputTextField
            id="bankCardNo"
            label={TYPE.inputFieldRefs.bankCardNo}
            max="19"
            min="16"
            value={value}
            labelWidth={this.LABEL_WIDTH}
            placeholder="请输入 16-19 位银行卡号"
            pattern="^[0-9]{0,}$"
            type="text"
            obj={bankCardNo}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderAliPayCardNo = () => {
    const {aliPayCardNo} = this.props;
    const {value, inputMsg, icon, color} = aliPayCardNo;

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <InputTextField
            id="aliPayCardNo"
            label={TYPE.inputFieldRefs.aliPayCardNo}
            max="50"
            value={value}
            labelWidth={this.LABEL_WIDTH}
            placeholder="请输入支付宝账号"
            pattern="^((?:\+?86)?1(?:3\d{3}|5[^4\D]\d{2}|8\d{3}|7(?:[0135-9]\d{2}|4(?:0\d|1[0-2]|9\d))|9[0135-9]\d{2}|6[2567]\d{2}|4(?:[14]0\d{3}|[68]\d{4}|[579]\d{2}))\d{6})|([a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)$"
            type="text"
            obj={aliPayCardNo}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderVcDropDown = () => {
    const {
      withdrawalSetting: {vcList},
      vcName,
    } = this.props;
    const dropdownOptions = {};
    vcList.forEach(vc => {
      dropdownOptions[vc.code] = vc.name;
    });

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <div
            style={{
              display: 'inline-block',
              verticalAlign: 'middle',
              padding: '8px 0',
              fontSize: '0.875rem',
              width: `${this.LABEL_WIDTH}`,
            }}
            className={css.label}>
            虚拟币名称
          </div>
          <Dropdown
            // disabled={!sufficientWithdraw}
            items={dropdownOptions}
            defaultValue={vcName ? vcName.value : ''}
            onClick={this.onVcSelect}
            componentStyle={{
              display: 'inline-block',
              padding: '8px 8px 8px 15px',
              border: '1px solid #e1e1e1',
              borderRadius: '4px',
              height: '45px',
            }}
          />
        </div>
      </div>
    );
  };

  renderBankOptions = () => {
    const {
      otherSettings: {bankCardLogoUrlPrefix},
      selectableBankOptions,
      loadingBank,
    } = this.props;
    if (loadingBank) return null;

    return selectableBankOptions.map(({bankName, bankCode}) => (
      <button
        type="button"
        key={bankCode}
        className={css.option}
        onClick={() => this.onBankNameSelect({bankName, bankCode})}>
        <img
          className={css.option_favicon}
          height="14"
          width="14"
          src={`${bankCardLogoUrlPrefix}${bankCode}.png`}
          alt={bankCode}
        />
        <span className={css.option_name}>{bankName}</span>
      </button>
    ));
  };

  renderDropDownList = () => {
    return (
      <div
        className={css.bankOption_dropdownlist}
        id="dropdownDiv"
        style={{
          width: `calc(100% - ${this.LABEL_WIDTH}`,
          marginLeft: this.LABEL_WIDTH,
          display: this.state.showDropDown ? '' : 'none',
        }}>
        {this.renderBankOptions()}
      </div>
    );
  };

  renderBankName = () => {
    const {
      bankCardNo: {validatePassed: cardValidatePassed},
      bankName,
      loadingBank,
      selectableBankOptions,
      foundMatchBank,
      withdrawalSetting,
    } = this.props;
    const {
      value,
      inputMsg,
      icon,
      color,
      validatePassed: bankNameValidatePassed,
    } = bankName;
    const {hasBankCard} = withdrawalSetting;
    const noMatch = cardValidatePassed && !bankNameValidatePassed;
    let placeholder = '自动匹配';

    if (!hasBankCard) {
      if (noMatch) {
        if (selectableBankOptions.length) {
          placeholder = '系统无法匹配银行，请选择';
        } else if (!foundMatchBank) {
          placeholder = '系统暂时不支持该银行，请联系客服';
        }
      }
      if (loadingBank) placeholder = '银行匹配中...';
    }
    const noOpt = noMatch && !selectableBankOptions.length;

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <div style={{position: 'relative'}}>
            <InputTextField
              readOnly
              disabled={loadingBank || !cardValidatePassed || noOpt}
              id="bankName"
              label={TYPE.inputFieldRefs.bankName}
              min="2"
              max="10"
              value={value}
              labelWidth={this.LABEL_WIDTH}
              pattern="[^\u0000-\u00FF]{2,10}$"
              placeholder={placeholder}
              type="text"
              obj={bankName}
            />
            {this.renderDropDownList()}
          </div>
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderBankAddress() {
    const {bankAddress} = this.props;
    const {value, inputMsg, icon, color} = bankAddress;

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <InputTextField
            id="bankAddress"
            min="1"
            max="150"
            label={TYPE.inputFieldRefs.bankAddress}
            value={value}
            labelWidth={this.LABEL_WIDTH}
            pattern="."
            placeholder="请输入省市区（县）"
            type="text"
            obj={bankAddress}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  }

  renderBankForm = () => {
    return (
      <form autoComplete="off">
        {this.renderBankAccountName({
          label: TYPE.inputFieldRefs.bankAccountName,
          placeholder: `中文、英文的${TYPE.inputFieldRefs.bankAccountName}`,
        })}
        {this.renderBankCardNo()}
        {this.renderBankName()}
        {this.renderBankAddress()}
      </form>
    );
  };

  renderAlipayForm = () => {
    return (
      <form autoComplete="off">
        {this.renderBankAccountName({
          label: TYPE.inputFieldRefs.aliPayName,
          placeholder: TYPE.inputFieldRefs.aliPayCardNoName,
        })}
        {this.renderAliPayCardNo()}
      </form>
    );
  };

  renderVcForm = () => {
    return (
      <form autoComplete="off">
        {this.renderBankAccountName({
          label: '虚拟币开户姓名',
          placeholder: '姓名',
        })}
        {this.renderVcDropDown()}
        {this.renderVcCardNo()}
      </form>
    );
  };

  renderSubmitButtons = () => {
    const {
      bankAccountName,
      bankName,
      bankCardNo,
      bankAddress,
      securityPassword,
      repeatSecurityPassword,
      withdrawalMethod,
      aliPayCardNo,
      vcName,
      vcCode,
      vcCardNo,
      // realName,
    } = this.props;

    let readyToSubmit = false;
    if (withdrawalMethod === TYPE.withdrawalMethods.BankCard) {
      readyToSubmit =
        bankAccountName.validatePassed &&
        bankAddress.validatePassed &&
        bankName.validatePassed &&
        bankCardNo.validatePassed &&
        securityPassword.validatePassed &&
        repeatSecurityPassword.validatePassed;
    } else if (withdrawalMethod === TYPE.withdrawalMethods.AliPay) {
      readyToSubmit =
        bankAccountName.validatePassed &&
        aliPayCardNo.validatePassed &&
        securityPassword.validatePassed &&
        repeatSecurityPassword.validatePassed;
    } else if (withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin) {
      readyToSubmit =
        bankAccountName.validatePassed &&
        vcName.validatePassed &&
        vcCode.validatePassed &&
        vcCardNo.validatePassed &&
        securityPassword.validatePassed &&
        repeatSecurityPassword.validatePassed;
    }

    return (
      <div className={formCSS.formItem}>
        <SubmitResetButton
          labelWidth={this.LABEL_WIDTH}
          submitDisabled={!readyToSubmit}
          hideReset
          // resetDisabled,
          onSubmitClick={this.onSubmitInfoClick}
          // onResetClick={this.onClearClick}
          submitText="提交"
          // resetText="重置"
          submitWidth="347px"
          // resetWidth="80px"
          marginTop
        />
      </div>
    );
  };

  renderWithdrawForm = () => {
    const {withdrawalMethod, children} = this.props;

    let title, renderForm;
    switch (withdrawalMethod) {
      case TYPE.withdrawalMethods.BankCard:
        title = '银行卡信息';
        renderForm = this.renderBankForm;
        break;
      case TYPE.withdrawalMethods.AliPay:
        title = '支付宝信息';
        renderForm = this.renderAlipayForm;
        break;
      case TYPE.withdrawalMethods.VirtualCoin:
        title = '虚拟币信息';
        renderForm = this.renderVcForm;
        break;
      default:
        break;
    }

    return (
      <ContentContainer title={title}>
        {children}
        {typeof renderForm === 'function' && renderForm()}
      </ContentContainer>
    );
  };

  render() {
    return (
      <div className={formCSS.securityInfo}>
        <div className={css.title_msg}>
          您还未添加任何提款信息，请先选择绑定的提款账户并完善以下信息：
        </div>
        <div className={formCSS.form}>
          {this.renderWithdrawForm()}
          {this.renderWithdrawInfoForm()}
        </div>
      </div>
    );
  }
}

function mapStateToProps({
  userModel,
  formModel,
  gameInfosModel,
  transferModel,
}) {
  const {otherSettings} = gameInfosModel;
  const {
    loadingBank,
    selectableBankOptions,
    foundMatchBank,
    awaitingResponse: transferAwait,
  } = transferModel;
  const {
    bankAccounts,
    dailyWithdrawWithAdminSettingsResult,
    userData,
    awaitingResponse: userAwait,
    withdrawalSetting,
  } = userModel;
  return {
    bankAccounts,
    dailyWithdrawWithAdminSettingsResult,
    userData,
    userAwait,
    withdrawalSetting,
    otherSettings,
    loadingBank,
    foundMatchBank,
    selectableBankOptions,
    transferAwait,
    ...formModel,
  };
}

export default connect(mapStateToProps)(WithdrawalBindingForm);

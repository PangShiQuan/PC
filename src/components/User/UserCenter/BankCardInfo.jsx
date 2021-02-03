import React, {Component} from 'react';
import {connect} from 'dva';
import {Alert} from 'antd';
import {debounce} from 'lodash';

import {type as TYPE} from 'utils';
import {MDIcon, Button, LoadingBar} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import resolve from 'clientResolver';
import DigitInput from '../DigitInput';

const Input = resolve.plugin('ProfileInput');

class BankCardInfo extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentDidMount() {
    const {bankAccounts, userData} = this.props;
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

    this.fetchUpdates(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (
      this.props.accessToken &&
      nextProps.accessToken &&
      this.props.accessToken !== nextProps.accessToken
    ) {
      this.fetchUpdates(nextProps, true);
    }
    if (nextProps.userData !== this.props.userData) {
      this.getUserRealName(nextProps.userData);
    }
    const {withdrawalSetting} = this.props;
    const {hasBankCard} = withdrawalSetting;
    if (hasBankCard) {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          profileSelectedNav: 'withdrawalCtrl',
        },
      });
    }
    if (
      nextProps.bankAccounts.length &&
      nextProps.bankAccounts !== this.props.bankAccounts
    ) {
      this.dispatch({type: 'formModel/getBankCardDetails'});
    }
    if (
      nextProps.bankCardNo.value &&
      nextProps.bankCardNo.value !== this.props.bankCardNo.value
    ) {
      this.validateBankCard(nextProps);
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: ['foundMatchBank'],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'responseMsg',
        'bankAccountName',
        'bankName',
        'realName',
        'securityPassword',
        'repeatSecurityPassword',
        'bankCode',
        'bankAddress',
        'bankCardNo',
      ],
    });
  }

  onResetClick = event => {
    event.persist();
    const eventTarget = event.target;
    const {name} = eventTarget;

    this.dispatch({type: 'formModel/initializeState', payload: [name]});
  };

  onInputChange = event => {
    event.persist();
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    const eventTarget = event.target;
    const {value, max, name} = eventTarget;
    if (`${value}`.length <= max || !max) {
      if (name.indexOf('repeat') > -1) {
        this.validateRepeatInput(event);
      } else {
        this.validateInput(event);
      }
    }
  };
  // 添加银行卡需要判断是否第一次绑卡
  onSubmitInfoClick = () => {
    const {bankCardNo, withdrawalSetting} = this.props;
    const {
      enabledAlipayWithdraw,
      hasAlipayCard,
      hasBankCard,
    } = withdrawalSetting;
    if (!hasAlipayCard && !hasBankCard) {
      this.dispatch({
        type: 'userModel/putRegisterInfo',
        bankCardNo: {
          value: bankCardNo.value,
        },
      });
    } else {
      this.dispatch({
        type: 'userModel/putRegisterCardsInfo',
        bankCardNo: {
          value: bankCardNo.value,
        },
      });
    }
  };

  onBankNameSelect({bankName, bankCode}) {
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

  fetchUpdates(props, switchUser = false) {
    const {bankAccounts, dailyWithdrawWithAdminSettingsResult} = props;

    if (!bankAccounts.length) {
      this.dispatch({type: 'transferModel/getBankOptions'});

      if (!dailyWithdrawWithAdminSettingsResult || switchUser) {
        this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
      }
    }
  }

  validateBankCard = debounce(props => {
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

  validateInput = payload => {
    this.dispatch({
      type: 'formModel/validateInput',
      payload,
    });
  };

  validateRepeatInput = payload => {
    this.dispatch({
      type: 'formModel/validateRepeatInput',
      payload,
    });
  };

  renderBankAccountName() {
    const {
      bankAccountName: {value, inputMsg, icon, color},
      realName,
    } = this.props;
    return (
      <Input
        readOnly
        disabled
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.bankAccountName}`}
        name="bankAccountName"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
        placeholder={`请输入中文、英文的${TYPE.inputFieldRefs.bankAccountName}`}
        value={value || realName.value}
      />
    );
  }

  renderBankAddress() {
    const {bankAddress} = this.props;
    const {value, inputMsg, icon, color} = bankAddress;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.bankAddress}`}
        min="1"
        max="150"
        name="bankAddress"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        pattern="."
        placeholder="请输入省市区（县）"
        value={value}
      />
    );
  }

  renderBankCardNo() {
    const {bankCardNo} = this.props;
    const {value, inputMsg, icon, color} = bankCardNo;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.bankCardNo}`}
        max="19"
        min="16"
        name="bankCardNo"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        pattern="^[0-9]{0,}$"
        placeholder="请输入 16-19 位银行卡号"
        value={value}
      />
    );
  }

  renderSecurityInput() {
    const {
      securityPassword: {value, inputMsg, icon, color},
    } = this.props;
    return (
      <DigitInput
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.securityPassword}`}
        max="4"
        min="4"
        name="securityPassword"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        onClick={this.onResetClick}
        pattern="\d[0-9]\d"
        placeholder="请输入 4 位数字"
        type="password"
        value={value}
      />
    );
  }

  renderRepeatSecurityInput() {
    const {
      repeatSecurityPassword: {value, inputMsg, icon, color},
    } = this.props;
    return (
      <DigitInput
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.repeatSecurityPassword}`}
        max="4"
        min="4"
        name="repeatSecurityPassword"
        onBlur={this.validateRepeatInput}
        onChange={this.onInputChange}
        onClick={this.onResetClick}
        pattern="\d[0-9]\d"
        placeholder="请输入 4 位数字"
        type="password"
        value={value}
      />
    );
  }

  renderResponseMsg() {
    const {
      responseMsg: {msg, color, icon},
    } = this.props;
    if (msg) {
      return (
        <div data-color={color} className={css.profile_formResponse}>
          <MDIcon iconName={icon} />
          <span>{msg}</span>
        </div>
      );
    }
    return null;
  }

  renderRealNameInput() {
    const {
      realName: {value, inputMsg, icon, color},
      bankAccounts,
      userData: {realName},
    } = this.props;
    const realNameExist = Boolean(realName);
    return (
      <Input
        readOnly={bankAccounts.length || realNameExist}
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.realName}`}
        name="realName"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
        placeholder={`请输入中文、英文的${TYPE.inputFieldRefs.realName}`}
        value={value}
        disabled={realNameExist}
      />
    );
  }

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
        className={css.profile_option}
        onClick={this.onBankNameSelect.bind(this, {bankName, bankCode})}>
        <img
          className={css.profile_optionFavicon}
          height="14"
          width="14"
          src={`${bankCardLogoUrlPrefix}${bankCode}.png`}
          alt={bankCode}
        />
        <span className={css.profile_optionSpan__Name}>{bankName}</span>
      </button>
    ));
  };

  renderBankName() {
    const {
      bankCardNo: {validatePassed: cardValidatePassed},
      bankName: {
        value: bankNameValue,
        inputMsg,
        icon,
        color,
        validatePassed: bankNameValidatePassed,
      },
      loadingBank,
      selectableBankOptions,
      foundMatchBank,
      withdrawalSetting,
    } = this.props;
    const {hasBankCard} = withdrawalSetting;
    const accountExist = hasBankCard;
    const noMatch = cardValidatePassed && !bankNameValidatePassed;
    let placeholder = '自动匹配';
    let Msg = null;

    if (!hasBankCard) {
      if (noMatch) {
        if (selectableBankOptions.length) {
          placeholder = '系统无法匹配银行，请选择';
        } else if (!foundMatchBank) {
          placeholder = '';
          Msg = (
            <Alert
              message="添加银行卡提示"
              description="系统暂时不支持该银行，请联系客服"
              type="warning"
              showIcon
            />
          );
        }
      }
      if (loadingBank) placeholder = '银行匹配中...';
    }
    const noOpt = noMatch && !selectableBankOptions.length;
    return (
      <div>
        <Input
          readOnly={accountExist || foundMatchBank}
          disabled={loadingBank || !cardValidatePassed || noOpt}
          dataColor={loadingBank ? 'blue' : color}
          dataIcon={icon}
          dataMsg={inputMsg}
          label={`${TYPE.inputFieldRefs.bankName}`}
          min="2"
          max="10"
          name="bankName"
          onBlur={this.validateInput}
          pattern="[^\u0000-\u00FF]{2,10}$"
          placeholder={placeholder}
          renderOptions={this.renderBankOptions}
          mouseLeaveSensitive
          value={bankNameValue}
        />
        {Msg}
      </div>
    );
  }

  renderBtnRow() {
    const {withdrawalSetting} = this.props;
    const {hasBankCard} = withdrawalSetting;
    if (!hasBankCard) {
      const {
        bankName,
        bankCardNo,
        bankAddress,
        securityPassword,
        repeatSecurityPassword,
        realName,
      } = this.props;
      const readyToSubmit =
        bankAddress.validatePassed &&
        bankName.validatePassed &&
        bankCardNo.validatePassed &&
        securityPassword.validatePassed &&
        repeatSecurityPassword.validatePassed &&
        realName.validatePassed;
      return (
        <div className={css.profile_formBtnRow}>
          <Button
            disabled={!readyToSubmit}
            className={css.profile_formBtn__submit}
            onClick={this.onSubmitInfoClick}
            placeholder="添加银行卡"
          />
        </div>
      );
    }
    return null;
  }

  render() {
    const {
      bankAccounts,
      transferAwait,
      userAwait,
      withdrawalSetting,
    } = this.props;
    const {hasBankCard} = withdrawalSetting;
    return (
      <div>
        {hasBankCard ? null : (
          <div className={css.profile_contentBody}>
            <h4 className={css.profile_formLabel}>
              完善提款信息
              <LoadingBar isLoading={userAwait} />
            </h4>
            <p className={css.profile_disclaimer}>
              <MDIcon
                className={css.profile_disclaimerIcon}
                iconName="security-account"
              />
              <span>
                尊敬的用户，为了保障您的资金安全，请您绑定您的姓名和设置取款密码。
                <strong>如果姓名与开户名不一致，将无法取款。</strong>
              </span>
            </p>
            {this.renderRealNameInput()}
            {this.renderSecurityInput()}
            {this.renderRepeatSecurityInput()}
          </div>
        )}
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            银行卡信息
            <LoadingBar isLoading={transferAwait || userAwait} />
          </h4>
          {this.renderBankAccountName()}
          {this.renderBankCardNo()}
          {this.renderBankName()}
          {this.renderBankAddress()}
        </div>
        {this.renderResponseMsg()}
        {this.renderBtnRow()}
      </div>
    );
  }
}

function mapStatesToProps({
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

export default connect(mapStatesToProps)(BankCardInfo);

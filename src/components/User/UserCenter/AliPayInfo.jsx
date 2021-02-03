import React, {Component} from 'react';
import {connect} from 'dva';
import {debounce} from 'lodash';

import {type as TYPE} from 'utils';
import {MDIcon, SubButton, LoadingBar} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import resolve from 'clientResolver';
import DigitInput from '../DigitInput';

const Input = resolve.plugin('ProfileInput');

class AliPayInfo extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.onInputChange = this.onInputChange.bind(this);
    this.validateInput = this.validateInput.bind(this);
  }

  componentDidMount() {
    const {withdrawalSetting} = this.props;
    const {hasAlipayCard} = withdrawalSetting;
    if (this.props.userData) {
      this.getUserRealName(this.props.userData);
    }
    if (hasAlipayCard) {
      this.dispatch({type: 'formModel/getBankCardDetails'});
    } else {
      this.dispatch({
        type: 'formModel/initializeState',
        payload: ['aliPayCardNo'],
      });
      this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.userData !== this.props.userData) {
      this.getUserRealName(nextProps.userData);
    }
    const {withdrawalSetting} = this.props;
    const {hasAlipayCard} = withdrawalSetting;
    if (hasAlipayCard) {
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
    if (nextProps.bankCardNo.value !== this.props.bankCardNo.value) {
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

  onInputChange(event) {
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
  }

  // 添加支付宝需要判断是否第一次绑卡
  onSubmitInfoClick = () => {
    const {withdrawalSetting, aliPayCardNo} = this.props;
    const {hasBankCard, hasAlipayCard} = withdrawalSetting;
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
    if (!hasAlipayCard && !hasBankCard) {
      // 第一次绑定
      this.dispatch({
        type: 'userModel/putRegisterInfo',
        bankCardNo: {
          value: aliPayCardNo.value,
        },
      });
    } else {
      this.dispatch({
        type: 'userModel/putRegisterCardsInfo',
        bankCardNo: {
          value: aliPayCardNo.value,
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

  validateInput(payload) {
    this.dispatch({
      type: 'formModel/validateInput',
      payload,
    });
  }

  validateRepeatInput = payload => {
    this.dispatch({
      type: 'formModel/validateRepeatInput',
      payload,
    });
  };

  renderBankAccountName() {
    const {bankAccountName, realName} = this.props;
    const {value, inputMsg, icon, color} = bankAccountName;
    return (
      <Input
        readOnly
        disabled
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.aliPayName}`}
        name="bankAccountName"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
        placeholder={`请输入${TYPE.inputFieldRefs.aliPayCardNoName}`}
        value={value || realName.value}
      />
    );
  }

  renderBankCardNo() {
    const {aliPayCardNo} = this.props;
    const {value, inputMsg, icon, color} = aliPayCardNo;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.aliPayCardNo}`}
        name="aliPayCardNo"
        max="50"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        pattern="^19[8,9]\d{8}$|^134[0-8][\d]{7}$|^13[0-35-9]\d{8}$|^14[5,6,7,8,9]\d{8}$|^15[^4]\d{8}$|^16[6]\d{8}$|^17[0,1,2,3,4,5,6,7,8]\d{8}$|^18[\d]{9}|^(([\w]+[\.\-_])|([\w]))+[\w]\@([\w]+[\.\-_])+[\w]+[\w]$"
        placeholder="请输入支付宝账号"
        value={value}
      />
    );
  }

  renderSecurityInput() {
    const {securityPassword} = this.props;
    const {value, inputMsg, icon, color} = securityPassword;
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
    const {repeatSecurityPassword} = this.props;
    const {value, inputMsg, icon, color} = repeatSecurityPassword;
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
    const {responseMsg} = this.props;
    const {msg, color, icon} = responseMsg;
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
    const {realName, bankAccounts, userData} = this.props;
    const {value, inputMsg, icon, color} = realName;
    const realNameExist = userData && userData.realName;
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

  renderBtnRow() {
    const {withdrawalSetting} = this.props;
    const {hasAlipayCard} = withdrawalSetting;
    if (!hasAlipayCard) {
      const {
        aliPayCardNo,
        securityPassword,
        repeatSecurityPassword,
        realName,
      } = this.props;
      const readyToSubmit =
        aliPayCardNo.validatePassed &&
        securityPassword.validatePassed &&
        repeatSecurityPassword.validatePassed &&
        realName.validatePassed;
      return (
        <div className={css.profile_formBtnRow}>
          <SubButton
            disabled={!readyToSubmit}
            className={css.profile_formSubmitBtn}
            onClick={this.onSubmitInfoClick}
            placeholder="添加支付宝"
          />
        </div>
      );
    }
    return null;
  }

  render() {
    const {withdrawalSetting, awaitingResponse} = this.props;
    const {hasAlipayCard} = withdrawalSetting;
    return (
      <div>
        {hasAlipayCard ? null : (
          <div className={css.profile_contentBody}>
            <h4 className={css.profile_formLabel}>
              完善提款信息
              <LoadingBar isLoading={awaitingResponse} />
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
            支付宝信息
            <LoadingBar isLoading={awaitingResponse} />
          </h4>
          {this.renderBankAccountName()}
          {this.renderBankCardNo()}
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
    banksOptions,
    loadingBank,
    selectableBankOptions,
    foundMatchBank,
  } = transferModel;
  const {
    bankAccounts,
    userData,
    awaitingResponse,
    withdrawalSetting,
  } = userModel;
  return {
    bankAccounts,
    userData,
    awaitingResponse,
    withdrawalSetting,
    otherSettings,
    banksOptions,
    loadingBank,
    foundMatchBank,
    selectableBankOptions,
    ...formModel,
  };
}

export default connect(mapStatesToProps)(AliPayInfo);

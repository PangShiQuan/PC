import React, {Component} from 'react';
import {connect} from 'dva';
import {Alert} from 'antd';
import {debounce} from 'lodash';
import {type as TYPE} from 'utils';
import {SubButton, LoadingBar} from 'components/General';
import css from 'styles/User/Base/ProfileIndex1.less';
import resolve from 'clientResolver';

const Input = resolve.plugin('ProfileInput');

class BankCardInfo extends Component {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.onInputChange = this.onInputChange.bind(this);
    this.validateInput = this.validateInput.bind(this);
  }

  componentWillMount() {
    this.public(this.props);
    this.dispatch({type: 'userModel/getAlipayAndBankSettings'});
    if (this.props.bankAccounts.length) {
      this.getUserRealName(this.props.userData);
      this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    }
  }

  public(data) {
    const {withdrawalSetting} = data;
    const {
      enabledAlipayWithdraw,
      hasAlipayCard,
      hasBankCard,
    } = withdrawalSetting;
    if (enabledAlipayWithdraw) {
      if (!hasAlipayCard && !hasBankCard) {
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
    // if (this.props.userData) {
    //   this.getUserRealName(this.props.userData);
    // }
    if (this.props.bankAccounts.length) {
      this.getUserRealName(this.props.userData);
      this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    }
  }

  componentWillReceiveProps(nextProps) {
    const next = nextProps.withdrawalSetting;
    const now = this.props.withdrawalSetting;
    if (nextProps.userData !== this.props.userData) {
      this.getUserRealName(nextProps.userData);
    }
    if (
      nextProps.bankAccounts.length &&
      nextProps.bankAccounts !== this.props.bankAccounts
    ) {
      this.dispatch({type: 'formModel/getBankCardDetails'});
    }
    if (
      next.hasBankCard !== now.hasBankCard ||
      next.hasAlipayCard !== now.hasAlipayCard ||
      next.enabledAlipayWithdraw !== now.enabledAlipayWithdraw
    ) {
      this.public(nextProps);
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

  renderAilpayAccountName() {
    const {aliPayCardNoName, realName} = this.props;
    const {value, inputMsg, icon, color} = aliPayCardNoName;
    return (
      <Input
        readOnly
        disabled
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.aliPayCardNoName}`}
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
        readOnly
        disabled
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
        readOnly
        disabled
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

  renderAliPayCardNo() {
    const {aliPayCardNo} = this.props;
    const {value, inputMsg, icon, color} = aliPayCardNo;
    return (
      <Input
        readOnly
        disabled
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.aliPayCardNo}`}
        name="aliPayCardNo"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        value={value}
      />
    );
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

  renderBankName = () => {
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
  };

  renderBtnRow() {
    const {withdrawalSetting} = this.props;
    const {
      enabledAlipayWithdraw,
      hasAlipayCard,
      hasBankCard,
    } = withdrawalSetting;
    if (!hasBankCard) {
      return (
        <div className={css.profile_formBtnRow}>
          <SubButton
            className={css.profile_formSubmitBtn}
            onClick={this.onSubmitBankInfoClick}
            placeholder="添加银行卡"
          />
        </div>
      );
    }
    if (enabledAlipayWithdraw && !hasAlipayCard) {
      return (
        <div className={css.profile_formBtnRow}>
          <SubButton
            className={css.profile_formSubmitBtn}
            onClick={this.onSubmitAliPayInfoClick}
            placeholder="添加支付宝"
          />
        </div>
      );
    }
    return null;
  }

  onSubmitBankInfoClick = () => {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        profileSelectedNav: 'bankCardInfo',
      },
    });
  };

  onSubmitAliPayInfoClick = () => {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        profileSelectedNav: 'aliPayInfo',
      },
    });
  };

  render() {
    const {awaitingResponse, withdrawalSetting} = this.props;
    const {
      hasAlipayCard,
      hasBankCard,
      enabledAlipayWithdraw,
    } = withdrawalSetting;
    return (
      <div>
        {hasBankCard ? (
          <div className={css.profile_contentBody}>
            <h4 className={css.profile_formLabel}>
              银行卡信息
              <LoadingBar isLoading={awaitingResponse} />
            </h4>
            {this.renderBankAccountName()}
            {this.renderBankCardNo()}
            {this.renderBankName()}
            {this.renderBankAddress()}
          </div>
        ) : null}
        {enabledAlipayWithdraw && hasAlipayCard ? (
          <div className={css.profile_contentBody}>
            <h4 className={css.profile_formLabel}>
              支付宝信息
              <LoadingBar isLoading={awaitingResponse} />
            </h4>
            {this.renderAilpayAccountName()}
            {this.renderAliPayCardNo()}
          </div>
        ) : null}
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
    withdrawalSetting,
    awaitingResponse,
    otherSettings,
    banksOptions,
    loadingBank,
    foundMatchBank,
    selectableBankOptions,
    ...formModel,
  };
}

export default connect(mapStatesToProps)(BankCardInfo);

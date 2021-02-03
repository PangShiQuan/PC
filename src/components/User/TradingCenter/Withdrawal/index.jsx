import React, {PureComponent} from 'react';
import {connect} from 'dva';
import NP from 'number-precision';
import _ from 'lodash';
import {type as TYPE, addCommas, getChargeAmount, rounding} from 'utils';
import {MDIcon} from 'components/General';
import classnames from 'classnames';
import SubmitResetButton from 'components/User/Form/SubmitResetButton';
import InputTextField from 'components/User/Form/InputTextField';
import InputPinField from 'components/User/Form/InputPinField';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import css2 from 'styles/User/TradingCenter/Withdrawal.less';
import withdrawalInfoCSS from 'styles/User/TradingCenter/WithdrawalInfo.less';
import userCSS from 'styles/User/User.less';
import formCSS from 'styles/User/SecurityCenter/SecurityInfo.less';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import {CUSTOM_LIVECHAT_TRIGGER} from 'config';
import WithdrawalBindingForm from './WithdrawalBindingForm';
import WithdrawalInfo from './WithdrawalInfo';
import VirtualCoinForm from './VirtualCoinForm';

const BANKACCOUNT_TYPE = {
  BANK: 'BANK',
  ALIPAY: 'ALIPAY',
  VIRTUAL_COIN: 'VIRTUAL_COIN',
};

class Withdrawal extends PureComponent {
  static showHeadRender(text) {
    return (
      <p className={css.profile_disclaimer}>
        <MDIcon
          className={css.profile_disclaimerIcon}
          iconName="information-outline"
        />
        <span>尊敬的用户，{text}。</span>
      </p>
    );
  }

  LABEL_WIDTH = '110px';

  constructor(props) {
    super(props);
    this.state = {
      minimum: 0,
      maximum: 0,
      sufficientWithdraw: false,
      reminderMsg: '',
      withdrawalMethod: TYPE.withdrawalMethods.BankCard,
    };
    this.dispatch = props.dispatch;
    this.initializeWithdrawalForm = this.initializeWithdrawalForm.bind(this);
  }

  componentDidMount() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'aliPayCardNo',
        'aliPayCardNoName',
        // 'bankAccountName',
        'bankAddress',
        'bankCardNo',
        'bankCode',
        'bankName',
        'bankValue',
        'cardNo',
        'cardType',
        'remarks',
        'securityPassword',
        'repeatSecurityPassword',
        'withdrawalAmount',
        'charge',
        'responseMsg',
        'vcNewCardNo',
        'vcSecurityPassword',
        'repeatVcSecurityPassword',
      ],
    });

    this.dispatch({
      type: 'userModel/getUserTotalRecoverBalance',
      callback: () => {
        this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
      },
    });

    this.dispatch({type: 'userModel/getAlipayAndBankSettings'});

    this.updateShowWithdrawState();
    this.updateBankAccountsState(this.state.withdrawalMethod);
  }

  componentWillReceiveProps(nextProps) {
    if (
      (nextProps.withdrawalSettings !== this.props.withdrawalSettings ||
        nextProps.balance !== this.props.balance) &&
      nextProps.withdrawalSettings
    ) {
      this.validateWithdrawalSettings(nextProps);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.withdrawalMethod !== this.state.withdrawalMethod ||
      !_.isEqual(prevProps.bankAccounts, this.props.bankAccounts)
    ) {
      this.updateBankAccountsState(this.state.withdrawalMethod);
    }

    if (prevProps.withdrawalSetting !== this.props.withdrawalSetting) {
      this.updateShowWithdrawState();
    }

    if (
      prevState.withdrawalMethod !== this.state.withdrawalMethod ||
      (this.props.userBankId && prevProps.userBankId !== this.props.userBankId)
    ) {
      this.validateWithdrawalSettings(this.props);
    }
  }

  componentWillUnmount() {
    this.initializeWithdrawalForm();
  }

  updateShowWithdrawState = () => {
    const {
      bankAccounts,
      withdrawalSetting: {enabledAlipayWithdraw, enabledVcWithdraw},
    } = this.props;

    let withdrawalMethod = TYPE.withdrawalMethods.BankCard;

    if (bankAccounts.length > 0) {
      const defaultAcc = _.find(bankAccounts, account => account.isDefault);
      if (
        defaultAcc &&
        defaultAcc.type === BANKACCOUNT_TYPE.ALIPAY &&
        enabledAlipayWithdraw
      ) {
        withdrawalMethod = TYPE.withdrawalMethods.AliPay;
      } else if (
        defaultAcc &&
        defaultAcc.type === BANKACCOUNT_TYPE.VIRTUAL_COIN &&
        enabledVcWithdraw
      ) {
        withdrawalMethod = TYPE.withdrawalMethods.VirtualCoin;
      }
    }

    this.setState({
      withdrawalMethod,
    });
  };

  updateBankAccountsState = withdrawalMethod => {
    const {bankAccounts} = this.props;
    let payload = {};

    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'bankCardNo',
        'bankName',
        'bankCode',
        'bankAddress',
        'withdrawalAmount',
        'securityPassword',
        'repeatSecurityPassword',
        'vcSecurityPassword',
        'repeatVcSecurityPassword',
      ],
    });

    let bankAccount;
    if (withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin) {
      bankAccount = _.find(
        bankAccounts,
        x => x.type === 'VIRTUAL_COIN' && x.isDefault,
      );
      if (!bankAccounts) {
        bankAccount = _.find(bankAccounts, x => x.type === 'VIRTUAL_COIN');
      }
    } else if (withdrawalMethod === TYPE.withdrawalMethods.BankCard) {
      bankAccount = _.find(
        bankAccounts,
        x => x.type === 'BANK' && x.bankCode !== 'ZHB',
      );
    } else if (withdrawalMethod === TYPE.withdrawalMethods.AliPay) {
      bankAccount = _.find(
        bankAccounts,
        x => x.type === 'ALIPAY' && x.bankCode === 'ZHB',
      );
    }

    if (bankAccount) {
      if (bankAccount.type === 'VIRTUAL_COIN') {
        payload = {
          vcName: {
            value: bankAccount.bankName,
            color: 'green',
            validatePassed: true,
          },
          vcCode: {
            value: bankAccount.bankCode,
            color: 'green',
            validatePassed: true,
          },
          vcCardNo: {
            value: bankAccount.bankCardNo,
            color: 'green',
            validatePassed: true,
          },
          bankAccountName: {
            value: bankAccount.bankAccountName,
            color: 'green',
            validatePassed: true,
          },
        };
      } else {
        payload = {
          bankCardNo: {
            value: bankAccount.bankCardNo,
            color: 'green',
            validatePassed: true,
          },
          bankName: {
            value: bankAccount.bankName,
            color: 'green',
            validatePassed: true,
          },
          bankAccountName: {
            value: bankAccount.bankAccountName,
            color: 'green',
            validatePassed: true,
          },
          bankAddress: {
            value: bankAccount.bankAddress,
            color: 'green',
            validatePassed: true,
          },
        };
      }
      this.dispatch({
        type: 'formModel/updateState',
        payload,
      });
      this.dispatch({
        type: 'transferModel/updateState',
        payload: {userBankId: bankAccount.id},
      });
    }
  };

  onRadioSelect = value => {
    const withdrawalMethod = value;
    this.setState({
      withdrawalMethod,
    });
    this.updateBankAccountsState(withdrawalMethod);
  };

  onRequestSubmit = ({vcWithdrawalAmount, vcFee}) => {
    const {withdrawalMethod} = this.state;
    this.dispatch({
      type: 'transferModel/postWithdrawalRequest',
      payload: {withdrawalMethod, vcWithdrawalAmount, vcFee},
    });
  };

  onVcMethodChange = ({selectedVcBankId}) => {
    this.dispatch({
      type: 'transferModel/updateState',
      payload: {userBankId: selectedVcBankId},
    });
  };

  onRequestAddNewVc = ({selectedVc}) => {
    this.dispatch({
      type: 'userModel/postBindNewVc',
      payload: {
        selectedVc,
      },
    });
  };

  // 添加银行卡
  onToAddBankClick = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['bankAccountName', 'aliPayCardNo'],
    });
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        profileSelectedNav: 'bankCardInfo',
      },
    });
  };

  // 添加支付宝
  onToAddAlipayClick = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['bankAccountName', 'bankCardNo', 'bankName', 'bankAddress'],
    });
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        profileSelectedNav: 'aliPayInfo',
      },
    });
  };

  onResetClick = event => {
    event.persist();
    const eventTarget = event.target;
    const {name} = eventTarget;
    const {dispatch} = this.props;
    dispatch({type: 'formModel/initializeState', payload: [name]});
  };

  onCheckRecordClick = () => {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        profileSelectedNav: 'withdrawalRecord',
        profileExpandedNav: 'record',
      },
    });
  };

  onInputChange = event => {
    event.persist();
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    const eventTarget = event.target;
    const {value, max} = eventTarget;
    if (`${value}`.length <= max) {
      this.validateInput(event);
    }
  };

  onAmountChange = event => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    event.persist();
    const {maximum, minimum, chargeMultiply, maxWithdrawCharge} = this.state;
    const eventTarget = event.target;
    const {placeholder} = eventTarget;
    let {value} = eventTarget;
    value = _.floor(value, 1);
    let inputMsg = placeholder;
    let color = 'green';
    let icon = 'checkbox-marked-circle-outline';
    let validatePassed = false;
    if (value >= maximum) {
      inputMsg = `单次最多可提 ${addCommas(maximum)}元`;
      value = maximum;
      validatePassed = true;
    } else if (value < minimum) {
      inputMsg = `单次提款最少 ${addCommas(minimum)}元`;
      icon = 'close-circle-outline';
      color = 'red';
    } else if (value >= minimum && value <= maximum) {
      inputMsg = '金额通过';
      validatePassed = true;
    }
    const chargeAmount = getChargeAmount({
      amount: value,
      multiply: chargeMultiply,
      maximum: maxWithdrawCharge,
    });
    if (value <= 0) value = '';
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        charge: {value: chargeAmount, inputMsg, color, icon},
        withdrawalAmount: {value, inputMsg, color, icon, validatePassed},
      },
    });
  };

  resetWithdrawalAmountField = () => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['withdrawalAmount'],
    });
  };

  onClearClick = () => {
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: ['transactionTimeuuid'],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg', 'withdrawalAmount', 'securityPassword'],
    });
  };

  setDefaultBankCard = ({bankAccounts}) => {
    const defaultCard = _.find(bankAccounts, 'isDefault');
    if (defaultCard) {
      const {bankCode} = defaultCard;
      this.onRadioSelect(
        bankCode === 'ZHB'
          ? TYPE.withdrawalMethods.AliPay
          : TYPE.withdrawalMethods.BankCard,
      );
    }
  };

  initializeWithdrawalForm = () => {
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: ['foundMatchBank'],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'responseMsg',
        'aliPayCardNo',
        'aliPayName',
        'aliPayCardNoName',
        'bankAccountName',
        'realName',
        'bankCode',
        'bankName',
        'bankAddress',
        'bankCardNo',
        'bankValue',
        'withdrawalAmount',
        'charge',
        'securityPassword',
        'repeatSecurityPassword',
        'vcName',
        'vcCode',
        'vcCardNo',
        'vcNewCardNo',
        'vcSecurityPassword',
        'repeatVcSecurityPassword',
      ],
    });
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: ['transactionTimeuuid', 'userBankId'],
    });
  };

  validateWithdrawalSettings = ({
    aggitionalBetReq, // 额外打码量
    aggregateBets, // 总投注
    surplusFeeWithdrawCount, // 剩余免费出款次数
    surplusMaxWithdraw, // 剩余最大取款金额
    surplusWithdrawCount, // 当天剩余出款将次数
    withdrawalSettings, // 厅主设定的出款信息
  }) => {
    const {withdrawalMethod} = this.state;
    const {
      maximumWithdrawAmount, // 最大出款额度
      minimumWithdrawAmount, // 最小出款额度
      chargeRatioBeyondLimit, // 超过出款出款次数手续费比例
      ratioOfChargeExempt, // 出款手续费比例
      withdrawSwitch, // 打吗量出款开关
      maxWithdrawCharge, // 最高手续费
      integerWithdrawalAmount, // 是否只允许整数输入
    } = withdrawalSettings;
    const {balance} = this.props; // 用户余额
    const outOfWithdrawCount = surplusWithdrawCount <= 0;
    const needBetMore = aggitionalBetReq > 0;
    const canWaveCharge = surplusFeeWithdrawCount > 0;
    const maximumAmountToWithdraw = _.min([
      balance,
      surplusMaxWithdraw,
      maximumWithdrawAmount,
    ]);
    let sufficientWithdraw = false;
    let chargeRatio = 0;
    let chargeMultiply = 0;
    let reminderMsg = '';
    if (balance < minimumWithdrawAmount) {
      sufficientWithdraw = false;
      reminderMsg = [
        '最低提现金额是',
        <span
          className={withdrawalInfoCSS.orange_label}
          key="minimumWithdrawal">
          {addCommas(minimumWithdrawAmount)}
        </span>,
        '元，您目前的余额是',
        <span className={withdrawalInfoCSS.blue_label} key="balance">
          {addCommas(balance)}
        </span>,
        '元不足以提现哦, 不便之处敬请原谅',
      ];
    } else if (outOfWithdrawCount) {
      sufficientWithdraw = false;
      reminderMsg = ['您今日取款额度已经用完，请明日再来'];
    } else {
      sufficientWithdraw = true;
      if (withdrawSwitch) {
        if (needBetMore) {
          sufficientWithdraw = false;
          reminderMsg = [
            '您还需投注',
            <span className={withdrawalInfoCSS.orange_label} key="currentBets">
              {addCommas(aggitionalBetReq)}
            </span>,
            '元可申请提款',
          ];
        } else if (!needBetMore) {
          if (canWaveCharge) {
            chargeRatio = 0;
          } else {
            chargeRatio = ratioOfChargeExempt;
            reminderMsg = [
              '您目前的投注量是',
              <span className={withdrawalInfoCSS.blue_label} key="currentBets">
                {addCommas(aggregateBets)}
              </span>,
              '元，提款需收',
              <span
                className={withdrawalInfoCSS.orange_label}
                key="ratioOfChargeExempt">
                {withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
                  ? `${rounding.roundDown(this.getVcFeeInRmb())}元`
                  : `${chargeRatio}%`}
              </span>,
              '的手续费。',
              `您还需投注`,
              <span
                className={withdrawalInfoCSS.orange_label}
                key="betRequirement">
                {addCommas(aggitionalBetReq)}
              </span>,
              '元可免费提款',
            ];
          }
        }
      } else if (!withdrawSwitch) {
        if (canWaveCharge) {
          chargeRatio = 0;
        } else if (!canWaveCharge) {
          if (needBetMore) {
            chargeRatio = chargeRatioBeyondLimit;
            reminderMsg = [
              '您目前的投注量是',
              <span className={withdrawalInfoCSS.blue_label} key="currentBets">
                {addCommas(aggregateBets)}
              </span>,
              '元，提款需收',
              <span
                className={withdrawalInfoCSS.orange_label}
                key="ratioOfChargeExempt">
                {withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
                  ? `${rounding.roundDown(this.getVcFeeInRmb())}元`
                  : `${chargeRatio}%`}
              </span>,
              '的手续费。',
            ];
          } else {
            chargeRatio = ratioOfChargeExempt;
            reminderMsg = [
              '您今日的免费次数已经用完，提款需收',
              <span
                className={withdrawalInfoCSS.orange_label}
                key="ratioOfChargeExempt">
                {withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
                  ? `${rounding.roundDown(this.getVcFeeInRmb())}元`
                  : `${chargeRatio}%`}
              </span>,
              '的手续费',
            ];
          }
        }
      }
    }

    let maximum = 0;
    if (withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin) {
      if (chargeRatio <= 0) {
        maximum = maximumAmountToWithdraw;
      } else {
        maximum = rounding.roundDown(
          NP.minus(maximumAmountToWithdraw, this.getVcFeeInRmb()),
        );
        if (maximum < 0) {
          maximum = 0;
        }
      }
    } else {
      chargeMultiply = chargeRatio / 100;
      maximum = maximumAmountToWithdraw / (1 + chargeMultiply);
      maximum = _.floor(maximum, Number(!integerWithdrawalAmount));
    }
    this.setState({
      maximum,
      minimum: minimumWithdrawAmount,
      sufficientWithdraw,
      reminderMsg,
      chargeMultiply,
      chargeRatio,
      maxWithdrawCharge,
      integerWithdrawalAmount,
    });
  };

  getVcFeeInRmb = () => {
    const {
      userBankId,
      withdrawalSetting: {vcList},
      bankAccounts,
    } = this.props;
    let vcFeeInRmb = 0;

    if (userBankId) {
      const selectedVcAccount = _.find(
        bankAccounts,
        acc => acc.id === userBankId,
      );
      const selectedVcSetting = _.find(
        vcList,
        vc => vc.code === selectedVcAccount.bankCode,
      );
      if (selectedVcSetting) {
        vcFeeInRmb = NP.divide(
          selectedVcSetting.fee,
          selectedVcSetting.buyRate,
        );
      }
    }
    return vcFeeInRmb;
  };

  validateInput = payload => {
    this.dispatch({
      type: 'formModel/validateInput',
      payload,
    });
  };

  showErrorMsg = ({responseMsg}) => {
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        responseMsg,
      },
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'securityPassword',
        'repeatSecurityPassword',
        'vcSecurityPassword',
        'repeatVcSecurityPassword',
      ],
    });
  };

  renderBankCardNo() {
    const {withdrawalMethod} = this.state;
    const {
      bankCardNo: {value},
    } = this.props;

    let displayValue = '';
    if (withdrawalMethod === TYPE.withdrawalMethods.BankCard) {
      displayValue = `${value.substr(0, 4)}*****${value.substr(-4)}`;
    } else if (withdrawalMethod === TYPE.withdrawalMethods.AliPay) {
      displayValue = value;
    }

    return (
      <div className={formCSS.formItemRow}>
        <div className={classnames(css2.textField_row)}>
          <div
            style={{
              width: this.LABEL_WIDTH,
            }}
            className={css2.label}>
            {withdrawalMethod === TYPE.withdrawalMethods.BankCard
              ? TYPE.inputFieldRefs.bankCardNo
              : TYPE.inputFieldRefs.aliPayCardNo}
          </div>
          <div className={css2.textField}>{displayValue}</div>
        </div>
      </div>
    );
  }

  renderBankName() {
    const {
      bankAccounts,
      bankName: {value},
      otherSettings: {bankCardLogoUrlPrefix},
      pcOtherInfo,
    } = this.props;
    const bank = _.find(bankAccounts, x => x.bankName === value);
    const {onlineServiceUrl} = pcOtherInfo;

    let csLiveChatElement = '在线客服';

    if (CUSTOM_LIVECHAT_TRIGGER) {
      csLiveChatElement = (
        <a
          rel="noopener noreferrer"
          onClick={CUSTOM_LIVECHAT_TRIGGER}
          style={{textDecoration: 'underline'}}>
          在线客服
        </a>
      );
    } else if (onlineServiceUrl) {
      csLiveChatElement = (
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={onlineServiceUrl}
          style={{textDecoration: 'underline'}}>
          在线客服
        </a>
      );
    }

    return (
      bank && (
        <div className={formCSS.formItemRow}>
          <div className={classnames(css2.textField_row)}>
            <div
              style={{
                width: this.LABEL_WIDTH,
              }}
              className={css2.label}>
              {TYPE.inputFieldRefs.bankName}
            </div>
            <div className={css2.textField}>
              <div
                className={css2.bank_image}
                style={{
                  backgroundImage: `url(${bankCardLogoUrlPrefix}${
                    bank.bankCode
                  }.png)`,
                  backgroundSize: '30px',
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'center',
                }}
              />
              {value}{' '}
              <span className={css2.highlight}>
                *如需变更银行卡，请联系 {csLiveChatElement}
              </span>
            </div>
          </div>
        </div>
      )
    );
  }

  renderWithdrawalAmount() {
    const {
      maximum,
      minimum,
      sufficientWithdraw,
      integerWithdrawalAmount,
    } = this.state;

    const {withdrawalAmount, balance} = this.props;
    const {value, inputMsg, icon, color} = withdrawalAmount;
    let placeholderText = '-';
    if (sufficientWithdraw) {
      if (balance < minimum) {
        placeholderText = `提款需${addCommas(minimum)}元起`;
      } else {
        placeholderText = `可提现${addCommas(maximum)}元`;
      }
    }
    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem}>
          <InputTextField
            readOnly={!sufficientWithdraw}
            disabled={!sufficientWithdraw}
            id="withdrawalAmount"
            label={TYPE.inputFieldRefs.withdrawalAmount}
            max={maximum}
            min={minimum}
            value={value}
            onChange={this.onAmountChange}
            labelWidth={this.LABEL_WIDTH}
            placeholder={placeholderText}
            pattern="\d[0-9]\d"
            type="number"
            obj={withdrawalAmount}
          />
        </div>
        <div className={formCSS.formItem_msg} data-color={color}>
          <MDIcon className={formCSS.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  }

  renderCharge() {
    const {chargeRatio, sufficientWithdraw} = this.state;
    const {
      charge,
      withdrawalAmount: {value: amount},
    } = this.props;
    let placeholder = '-';
    let {value} = charge;
    const waveCharge = chargeRatio <= 0;
    if (sufficientWithdraw) {
      if (waveCharge) {
        placeholder = '免手续费';
        value = '';
      } else {
        placeholder = `手续费${chargeRatio}%`;
        value = value < 0 || !/\d+/.test(amount) ? '' : value;
      }
    }
    return (
      <div className={formCSS.formItemRow}>
        <div className={classnames(css2.textField_row)}>
          <div
            style={{
              width: this.LABEL_WIDTH,
            }}
            className={css2.label}>
            {TYPE.inputFieldRefs.charge}
          </div>
          <div className={css2.textField}>{placeholder}</div>
        </div>
      </div>
    );
  }

  renderSecurityPassword() {
    const {sufficientWithdraw} = this.state;
    const {securityPassword} = this.props;
    const {value, inputMsg, icon, color} = securityPassword;
    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem} style={{position: 'relative'}}>
          <InputPinField
            readOnly={!sufficientWithdraw}
            disabled={!sufficientWithdraw}
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
  }

  renderBtnRow() {
    const {sufficientWithdraw} = this.state;
    const {
      transactionTimeuuid,
      securityPassword,
      withdrawalAmount,
    } = this.props;

    if (transactionTimeuuid) {
      return (
        <div className={formCSS.formItem}>
          <SubmitResetButton
            labelWidth={this.LABEL_WIDTH}
            // submitDisabled={!sufficientWithdraw || !btnAvailable}
            // resetDisabled
            // hideReset
            onSubmitClick={this.onCheckRecordClick}
            onResetClick={this.onClearClick}
            submitText="查看提款记录"
            resetText="重置"
            submitWidth="60%"
            resetWidth="30%"
            marginTop
          />
        </div>
      );
    }

    const btnAvailable =
      securityPassword.validatePassed && withdrawalAmount.validatePassed;

    return (
      <div className={formCSS.formItem}>
        <SubmitResetButton
          labelWidth={this.LABEL_WIDTH}
          submitDisabled={!sufficientWithdraw || !btnAvailable}
          // resetDisabled
          hideReset
          onSubmitClick={this.onRequestSubmit}
          // onResetClick={this.onClearClick}
          submitText={sufficientWithdraw ? '提交' : '您暂时无法提款'}
          // resetText="重置"
          submitWidth="100%"
          // resetWidth="80px"
          marginTop
        />
      </div>
    );
  }

  renderWithdrawalForm = () => {
    const {withdrawalMethod} = this.state;
    return (
      <div>
        {this.renderWithdrawalOptions()}
        {withdrawalMethod === TYPE.withdrawalMethods.BankCard &&
          this.renderBankName()}
        {this.renderWithdrawalAmount()}
        {this.renderCharge()}
        {this.renderSecurityPassword()}
        {this.renderBtnRow()}
      </div>
    );
  };

  renderVirtualCoinForm = () => {
    const {
      withdrawalSetting,
      securityPassword,
      bankAccounts,
      vcNewCardNo,
      bankAccountName,
      vcSecurityPassword,
      repeatVcSecurityPassword,
      withdrawalAmount,
    } = this.props;
    const {sufficientWithdraw, chargeRatio} = this.state;
    const {vcList} = withdrawalSetting;
    const vcAccounts = bankAccounts.filter(
      account => account.type === 'VIRTUAL_COIN',
    );

    return (
      <div>
        {this.renderWithdrawalOptions()}
        <VirtualCoinForm
          LABEL_WIDTH={this.LABEL_WIDTH}
          vcAccounts={vcAccounts}
          vcFullList={vcList}
          sufficientWithdraw={sufficientWithdraw}
          chargeRatio={chargeRatio}
          resetWithdrawalAmountField={this.resetWithdrawalAmountField}
          showErrorMsg={this.showErrorMsg}
          onRequestSubmit={this.onRequestSubmit}
          onRequestAddNewVc={this.onRequestAddNewVc}
          onVcMethodChange={this.onVcMethodChange}
          // input fields
          withdrawalAmount={withdrawalAmount}
          bankAccountName={bankAccountName}
          vcNewCardNo={vcNewCardNo}
          securityPasswordProps={securityPassword}
          vcSecurityPasswordProps={vcSecurityPassword}
          repeatVcSecurityPasswordProps={repeatVcSecurityPassword}>
          {this.renderWithdrawalAmount()}
          {this.renderSecurityPassword()}
        </VirtualCoinForm>
      </div>
    );
  };

  renderScene() {
    const {withdrawalMethod} = this.state;
    const {withdrawalSetting, bankAccounts} = this.props;
    const {
      enabledAlipayWithdraw,
      hasBankCard,
      hasAlipayCard,
    } = withdrawalSetting;

    if (
      withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin &&
      _.some(bankAccounts, account => account.type === 'VIRTUAL_COIN')
    ) {
      return this.renderVirtualCoinForm();
    }

    if (
      (withdrawalMethod === TYPE.withdrawalMethods.BankCard && hasBankCard) ||
      (withdrawalMethod === TYPE.withdrawalMethods.AliPay &&
        enabledAlipayWithdraw &&
        hasAlipayCard)
    ) {
      return this.renderWithdrawalForm();
    }

    // not binding yet
    return (
      <WithdrawalBindingForm withdrawalMethod={withdrawalMethod}>
        {this.renderWithdrawalOptions()}
      </WithdrawalBindingForm>
    );
  }

  renderWithdrawalOptions = () => {
    const {withdrawalMethod} = this.state;
    const {withdrawalSetting} = this.props;
    const {enabledAlipayWithdraw, enabledVcWithdraw} = withdrawalSetting;

    return (
      <div className={formCSS.formItemRow}>
        <div className={formCSS.formItem} style={{width: 'unset'}}>
          <div className={formCSS.label} style={{width: this.LABEL_WIDTH}}>
            提款方式
          </div>
          <button
            type="button"
            onClick={() => this.onRadioSelect(TYPE.withdrawalMethods.BankCard)}
            value={TYPE.withdrawalMethods.BankCard}
            data-checked={withdrawalMethod === TYPE.withdrawalMethods.BankCard}
            className={formCSS.optionButton}>
            提款到银行卡
            {withdrawalMethod === TYPE.withdrawalMethods.BankCard && (
              <div className={formCSS.tickIconDiv}>
                <MDIcon className={formCSS.tickIcon} iconName="check" />
              </div>
            )}
          </button>
          {enabledAlipayWithdraw && (
            <button
              type="button"
              onClick={() => this.onRadioSelect(TYPE.withdrawalMethods.AliPay)}
              value={TYPE.withdrawalMethods.AliPay}
              data-checked={withdrawalMethod === TYPE.withdrawalMethods.AliPay}
              className={formCSS.optionButton}
              style={{marginLeft: '17px'}}>
              提款到支付宝
              {withdrawalMethod === TYPE.withdrawalMethods.AliPay && (
                <div className={formCSS.tickIconDiv}>
                  <MDIcon className={formCSS.tickIcon} iconName="check" />
                </div>
              )}
            </button>
          )}
          {enabledVcWithdraw && (
            <button
              type="button"
              onClick={() =>
                this.onRadioSelect(TYPE.withdrawalMethods.VirtualCoin)
              }
              value={TYPE.withdrawalMethods.VirtualCoin}
              data-checked={
                withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin
              }
              className={formCSS.optionButton}
              style={{marginLeft: '17px'}}>
              虚拟币
              {withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin && (
                <div className={formCSS.tickIconDiv}>
                  <MDIcon className={formCSS.tickIcon} iconName="check" />
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    );
  };

  render() {
    const {withdrawalMethod, reminderMsg} = this.state;
    const {withdrawalSetting, bankAccounts} = this.props;
    const {hasAlipayCard, hasBankCard, vcList} = withdrawalSetting;
    let showWithdrawalInfo = false;

    if (
      !_.isEmpty(reminderMsg) &&
      ((withdrawalMethod === TYPE.withdrawalMethods.BankCard && hasBankCard) ||
        (withdrawalMethod === TYPE.withdrawalMethods.AliPay && hasAlipayCard) ||
        (withdrawalMethod === TYPE.withdrawalMethods.VirtualCoin &&
          vcList.length > 0 &&
          _.some(bankAccounts, account => account.type === 'VIRTUAL_COIN')))
    ) {
      showWithdrawalInfo = true;
    }

    return (
      <div>
        <ResponseMessageBar />
        {showWithdrawalInfo && <WithdrawalInfo reminderMsg={reminderMsg} />}
        <div className={userCSS.content_body}>{this.renderScene()}</div>
      </div>
    );
  }
}

function mapStateToProps({
  userModel,
  formModel,
  transferModel,
  gameInfosModel,
}) {
  const {
    bankAccounts,
    dailyWithdrawWithAdminSettingsResult,
    withdrawalSetting,
    balance,
  } = userModel;
  const {otherSettings, pcOtherInfo} = gameInfosModel;
  const {transactionTimeuuid, userBankId} = transferModel;
  return {
    ...dailyWithdrawWithAdminSettingsResult,
    ...formModel,
    balance,
    bankAccounts,
    withdrawalSetting,
    transactionTimeuuid,
    userBankId,
    otherSettings,
    pcOtherInfo,
  };
}

export default connect(mapStateToProps)(Withdrawal);

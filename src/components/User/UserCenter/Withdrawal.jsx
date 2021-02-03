import React, {Component} from 'react';
import {connect} from 'dva';
import _ from 'lodash';
import {type as TYPE, addCommas, getChargeAmount} from 'utils';
import {MDIcon, SubButton, LoadingBar} from 'components/General';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import resolve from 'clientResolver';
import DigitInput from '../DigitInput';

const Input = resolve.plugin('ProfileInput');

class Withdrawal extends Component {
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

  constructor(props) {
    super(props);
    this.state = {
      minimum: 0,
      maximum: 0,
      sufficientWithdraw: false,
      showWithDraw: false,
      reminderMsg: '',
      sufficientBetColor: '',
    };
    this.dispatch = props.dispatch;
    this.initializeWithdrawalForm = this.initializeWithdrawalForm.bind(this);
  }

  componentDidMount() {
    this.dispatch({
      type: 'userModel/getUserTotalRecoverBalance',
      callback: () => {
        this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
      },
    });

    this.dispatch({type: 'userModel/getAlipayAndBankSettings'});
    const {withdrawalSetting} = this.props;
    const {
      hasAlipayCard,
      hasBankCard,
      enabledAlipayWithdraw,
    } = withdrawalSetting;
    if (enabledAlipayWithdraw) {
      if (hasAlipayCard && hasBankCard) {
        this.setState({
          showWithDraw: true,
        });
      } else {
        this.setState({
          showWithDraw: false,
        });
      }
    } else {
      if (!hasBankCard) {
        this.setState({
          showWithDraw: false,
        });
      } else {
        this.setState({
          showWithDraw: true,
        });
      }
    }
    if (this.props.bankAccounts && this.props.bankAccounts.length >= 1) {
      this.setDefaultBankCard(this.props);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.bankAccounts &&
      nextProps.bankAccounts !== this.props.bankAccounts
    ) {
      this.setDefaultBankCard(nextProps);
    }
    if (
      nextProps.withdrawalSettings !== this.props.withdrawalSettings ||
      nextProps.balance !== this.props.balance
    ) {
      this.validateWithdrawalSettings(nextProps);
    }
  }

  componentWillUnmount() {
    this.initializeWithdrawalForm();
  }

  onRequestSubmit = () => {
    this.dispatch({type: 'transferModel/postWithdrawalRequest'});
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

  // 我要提款
  onToWithdrawalsClick = () => {
    this.setState({
      showWithDraw: true,
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

  onBankNameSelect = ({userBankId, bankCardNo, bankName}) => {
    if (bankName === '支付宝提现') {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          profileSelectedNav: 'aliPayInfo',
        },
      });
      return;
    }
    if (bankName === '银行卡提现') {
      this.dispatch({
        type: 'layoutModel/updateState',
        payload: {
          profileSelectedNav: 'bankCardInfo',
        },
      });
      return;
    }
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        bankCardNo: {value: bankCardNo, color: 'green', validatePassed: true},
        bankName: {value: bankName, color: 'green', validatePassed: true},
      },
    });
    this.dispatch({
      type: 'transferModel/updateState',
      payload: {userBankId},
    });
  };

  setDefaultBankCard({bankAccounts}) {
    const defaultCard = _.find(bankAccounts, 'isDefault');
    if (defaultCard) {
      const {id, bankCardNo, bankName} = defaultCard;
      this.onBankNameSelect({userBankId: id, bankCardNo, bankName});
    }
  }

  initializeWithdrawalForm() {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'withdrawalAmount',
        'charge',
        'bankName',
        'bankCardNo',
        'securityPassword',
        'responseMsg',
      ],
    });
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: ['transactionTimeuuid'],
    });
  }

  validateWithdrawalSettings({
    aggitionalBetReq, // 额外打码量
    aggregateBets, // 总投注
    surplusFeeWithdrawCount, // 剩余免费出款次数
    surplusMaxWithdraw, // 剩余最大取款金额
    surplusWithdrawCount, // 当天剩余出款将次数
    withdrawalSettings, // 厅主设定的出款信息
  }) {
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
    let sufficientBetColor = 'green';
    let balanceColor = 'green';
    if (balance < minimumWithdrawAmount) {
      sufficientWithdraw = false;
      reminderMsg = [
        '最低提现金额是',
        <strong key="minimumWithdrawal">
          {addCommas(minimumWithdrawAmount)}元
        </strong>,
        '，您目前的余额是',
        <strong key="balance">{addCommas(balance)}元</strong>,
        '不足以提现哦, 不便之处敬请原谅',
      ];
      balanceColor = 'red';
    } else if (surplusMaxWithdraw < minimumWithdrawAmount) {
      sufficientWithdraw = false;
      reminderMsg = ['您今日取款额度已经用完，请明日再来'];
    } else if (outOfWithdrawCount) {
      sufficientWithdraw = false;
      reminderMsg = [
        '您今日出款次数已经用完，该提款通道目前处于维护期间，暂无法进行提款！',
      ];
    } else {
      sufficientWithdraw = true;
      if (withdrawSwitch) {
        if (needBetMore) {
          sufficientWithdraw = false;
          reminderMsg = [
            '您还需投注',
            <strong key="currentBets">{addCommas(aggitionalBetReq)}元</strong>,
            '元可申请提款',
          ];
          sufficientBetColor = 'red';
        } else if (!needBetMore) {
          if (canWaveCharge) {
            chargeRatio = 0;
          } else {
            chargeRatio = ratioOfChargeExempt;
            reminderMsg = [
              '您目前的投注量是',
              <strong key="currentBets">{addCommas(aggregateBets)}元</strong>,
              '，提款需收',
              <strong key="ratioOfChargeExempt">{chargeRatio}%</strong>,
              '的手续费。',
              `您还需投注`,
              <strong key="betRequirement">
                {addCommas(aggitionalBetReq)}元
              </strong>,
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
              <strong key="currentBets">{addCommas(aggregateBets)}元</strong>,
              '，提款需收',
              <strong key="ratioOfChargeExempt">{chargeRatio}%</strong>,
              '的手续费。',
            ];
          } else {
            chargeRatio = ratioOfChargeExempt;
            reminderMsg = [
              '您今日的免费次数已经用完，提款需收',
              <strong key="ratioOfChargeExempt">{chargeRatio}%</strong>,
              '的手续费',
            ];
          }
        }
      }
    }
    chargeMultiply = chargeRatio / 100;

    let maximum = maximumAmountToWithdraw / (1 + chargeMultiply);
    maximum = _.floor(maximum, Number(!integerWithdrawalAmount));
    this.setState({
      maximum,
      minimum: minimumWithdrawAmount,
      sufficientWithdraw,
      reminderMsg,
      chargeMultiply,
      chargeRatio,
      sufficientBetColor,
      balanceColor,
      maxWithdrawCharge,
      integerWithdrawalAmount,
    });
  }

  validateInput = payload => {
    this.dispatch({
      type: 'formModel/validateInput',
      payload,
    });
  };

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

  renderReminder() {
    const {reminderMsg} = this.state;
    if (reminderMsg) {
      return (
        <p className={css.profile_disclaimer}>
          <MDIcon
            className={css.profile_disclaimerIcon}
            iconName="information-outline"
          />
          <span>尊敬的用户，{reminderMsg}</span>
        </p>
      );
    }
    return null;
  }

  renderBankOptions = () => {
    const {bankAccounts, withdrawalSetting} = this.props;
    const {enabledAlipayWithdraw} = withdrawalSetting;
    const aliList = {
      bankName: '支付宝提现',
      bankCardNo: '',
      id: '2',
    };
    const bankList = {
      bankName: '银行卡提现',
      bankCardNo: '',
      id: '3',
    };
    if (bankAccounts.length === 1) {
      if (enabledAlipayWithdraw) {
        if (bankAccounts[0].bankCode === 'ZHB') {
          bankAccounts.push(bankList);
        } else {
          bankAccounts.push(aliList);
        }
      }
    }
    return _.map(bankAccounts, bank => {
      const {sufficientWithdraw} = this.state;
      const {bankName, bankCardNo, id} = bank;
      const onClick = () =>
        this.onBankNameSelect({
          userBankId: id,
          bankCardNo,
          bankName,
        });
      return (
        <button
          type="button"
          disabled={!sufficientWithdraw}
          key={id}
          className={css.profile_option}
          onClick={onClick}>
          <span className={css.profile_optionSpan__Name}>{bankName}</span>
          {id === '2' || id === '3' ? null : (
            <span className={css.profile_cardNum}>
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <MDIcon iconName="multiplication" />
              <span className={css.profile_cardNum__last4}>
                {bankCardNo.substring(bankCardNo.length - 4, bankCardNo.length)}
              </span>
            </span>
          )}
        </button>
      );
    });
  };

  renderBankCardNoInput() {
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
        pattern="\d[0-9]\d"
        placeholder="请输入 16-19 位银行卡号"
        value={value}
      />
    );
  }

  renderBankAccountsInput() {
    const {sufficientWithdraw} = this.state;
    const {bankName} = this.props;
    const {value, inputMsg, icon, color} = bankName;
    return (
      <Input
        readOnly={!sufficientWithdraw}
        disabled={!sufficientWithdraw}
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.bankName}`}
        min="2"
        max="10"
        name="bankName"
        pattern="[^\u0000-\u00FF]{2,10}$"
        placeholder="请输入 2-10 位中文字符"
        renderOptions={this.renderBankOptions}
        mouseLeaveSensitive
        value={value}
      />
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
      <Input
        readOnly={!sufficientWithdraw}
        disabled={!sufficientWithdraw}
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={`${TYPE.inputFieldRefs.withdrawalAmount}`}
        max={maximum}
        name="withdrawalAmount"
        onChange={this.onAmountChange}
        pattern="\d[0-9]\d"
        type="number"
        dataInvalidKey={integerWithdrawalAmount ? '.' : ''}
        placeholder={placeholderText}
        defaultValue={minimum}
        value={value}
      />
    );
  }

  renderSecurityInput() {
    const {sufficientWithdraw} = this.state;
    const {securityPassword} = this.props;
    const {value, inputMsg, icon, color} = securityPassword;
    return (
      <DigitInput
        readOnly={!sufficientWithdraw}
        disabled={!sufficientWithdraw}
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

  renderChargeInput() {
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
      <Input
        disabled
        readOnly
        label={`${TYPE.inputFieldRefs.charge}`}
        name="charge"
        type="number"
        placeholder={placeholder}
        value={value}
      />
    );
  }

  renderUserCreditInfo() {
    const {balanceColor, sufficientBetColor} = this.state;
    const {balance, aggregateBets, aggitionalBetReq} = this.props;
    return (
      <div className={css.profile_inputInlineRow}>
        <div
          style={{marginRight: '0.5rem'}}
          className={css.profile_inputInlineBlock}>
          <Input
            readOnly
            disabled
            dataColor={balanceColor}
            label="可提取余额"
            value={`${addCommas(balance)}元`}
          />
        </div>
        <div className={css.profile_inputInlineBlock}>
          <Input
            style={{
              borderTopRightRadius: 0,
              borderRight: 0,
              borderBottomRightRadius: 0,
            }}
            dataColor={sufficientBetColor}
            readOnly
            disabled
            label="已达投注量"
            value={`${addCommas(aggregateBets)}元`}
          />
        </div>
        <div className={css.profile_inputInlineBlock}>
          <Input
            style={{
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            }}
            dataColor={sufficientBetColor}
            readOnly
            disabled
            label="还需投注"
            value={`${addCommas(aggitionalBetReq)}元`}
          />
        </div>
      </div>
    );
  }

  renderBtnRow() {
    const {sufficientWithdraw} = this.state;
    const {showWithDraw} = this.state;
    const {
      awaitingResponse,
      transactionTimeuuid,
      securityPassword,
      withdrawalAmount,
      withdrawalSetting,
    } = this.props;
    const {
      enabledAlipayWithdraw,
      hasAlipayCard,
      hasBankCard,
    } = withdrawalSetting;
    // 不是提款页面展示按钮
    if (!showWithDraw) {
      if (enabledAlipayWithdraw) {
        if (!hasAlipayCard && !hasBankCard) {
          return (
            <div className={css.profile_formBtnRow}>
              <SubButton
                className={css.profile_formSubmitBtn}
                onClick={this.onToAddBankClick}
                placeholder="添加银行卡"
              />
              <SubButton
                className={css.profile_formSubmitBtn}
                onClick={this.onToAddAlipayClick}
                placeholder="添加支付宝"
              />
            </div>
          );
        } else {
          return (
            <div className={css.profile_formBtnRow}>
              {!hasAlipayCard ? (
                <div className={css.profile_formBtnRow}>
                  <SubButton
                    className={css.profile_formSubmitBtn}
                    onClick={this.onToAddAlipayClick}
                    placeholder="添加支付宝"
                  />
                  <SubButton
                    className={css.profile_formSubmitBtn}
                    onClick={this.onToWithdrawalsClick}
                    placeholder="不了, 我要提款"
                  />
                </div>
              ) : null}
              {!hasBankCard ? (
                <div className={css.profile_formBtnRow}>
                  <SubButton
                    className={css.profile_formSubmitBtn}
                    onClick={this.onToAddBankClick}
                    placeholder="添加银行卡"
                  />
                  <SubButton
                    className={css.profile_formSubmitBtn}
                    onClick={this.onToWithdrawalsClick}
                    placeholder="不了, 我要提款"
                  />
                </div>
              ) : null}
            </div>
          );
        }
      } else {
        if (!hasBankCard) {
          return (
            <div className={css.profile_formBtnRow}>
              <SubButton
                className={css.profile_formSubmitBtn}
                onClick={this.onToAddBankClick}
                placeholder="添加银行卡"
              />
            </div>
          );
        }
      }
    } else {
      if (transactionTimeuuid) {
        return (
          <div className={css.profile_formBtnRow}>
            <button className={css.profile_formBtn} onClick={this.onClearClick}>
              重置
            </button>
            <SubButton
              className={css.profile_formSubmitBtn}
              onClick={this.onCheckRecordClick}
              placeholder="查看提款记录"
            />
          </div>
        );
      }
      const btnAvailable =
        securityPassword.validatePassed && withdrawalAmount.validatePassed;
      return (
        <div className={css.profile_formBtnRow}>
          <button
            className={css.profile_formBtn}
            disabled={!sufficientWithdraw}
            onClick={this.initializeWithdrawalForm}>
            重置
          </button>
          <SubButton
            loading={awaitingResponse}
            disabled={!sufficientWithdraw || !btnAvailable}
            className={css.profile_formSubmitBtn}
            onClick={this.onRequestSubmit}
            placeholder={awaitingResponse ? '请稍等' : '提交确认'}
          />
        </div>
      );
    }
  }

  renderForm() {
    return (
      <div>
        {this.renderReminder()}
        {this.renderUserCreditInfo()}
        {this.renderBankAccountsInput()}
        {this.renderBankCardNoInput()}
        {this.renderWithdrawalAmount()}
        {this.renderChargeInput()}
        {this.renderSecurityInput()}
      </div>
    );
  }

  renderScene() {
    const {withdrawalSetting} = this.props;
    const {showWithDraw} = this.state;
    const {
      enabledAlipayWithdraw,
      hasAlipayCard,
      hasBankCard,
    } = withdrawalSetting;
    if (showWithDraw) {
      return this.renderForm();
    }
    if (!enabledAlipayWithdraw) {
      if (!hasBankCard) {
        return Withdrawal.showHeadRender('请先添加银行卡');
      }
      return this.renderForm();
    }
    if (hasAlipayCard && hasBankCard) {
      return this.renderForm();
    }
    if (hasAlipayCard || hasBankCard) {
      return Withdrawal.showHeadRender('您可以继续添加提款信息');
    }
    return Withdrawal.showHeadRender('请您先添加提款信息');
  }

  render() {
    const {awaitingResponse} = this.props;
    return (
      <div>
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            账户提现
            <LoadingBar isLoading={awaitingResponse} />
          </h4>
          {this.renderScene()}
        </div>
        {this.renderResponseMsg()}
        {this.renderBtnRow()}
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
  const {otherSettings} = gameInfosModel;
  const {awaitingResponse, transactionTimeuuid} = transferModel;
  return {
    ...dailyWithdrawWithAdminSettingsResult,
    ...formModel,
    balance,
    bankAccounts,
    withdrawalSetting,
    awaitingResponse,
    transactionTimeuuid,
    otherSettings,
  };
}

export default connect(mapStateToProps)(Withdrawal);

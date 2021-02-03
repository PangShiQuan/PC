import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {toNumber, round, find, max as getMax} from 'lodash';
import {MDIcon} from 'components/General';
import css from 'styles/User/TradingCenter/Recharge.less';
import ContentContainer from 'components/User/ContentContainer';
import InputTextField from 'components/User/Form/InputTextField';
import SubmitResetButton from 'components/User/Form/SubmitResetButton';
import QRCodeScan from 'components/User/TradingCenter/Recharge/QRCodeScan';
import {type as TYPE} from 'utils';

class Payment extends PureComponent {
  LABEL_WIDTH = '90px';

  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
    this.state = {
      showDropDown: false,
    };
  }

  componentDidMount() {
    this.addDropDownEventListener('#topupAmount');
    this.addDropDownEventListener('#fixedAmount_dropdownDiv');
  }

  addDropDownEventListener = selector => {
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

  verifyTopupAmountField = event => {
    const {target} = event;
    const {value, name, placeholder} = target;
    let {min, max} = target;
    let inputMsg = placeholder;
    let validatePassed = true;
    let eventValue = value;
    let result = {};

    if (!eventValue || !toNumber(eventValue)) {
      result = {
        value: eventValue,
        color: 'red',
        validatePassed: false,
        inputMsg: `${TYPE.inputFieldRefs[name]}格式不正确`,
      };
    } else {
      eventValue = round(toNumber(eventValue), 2);
      max = toNumber(max);
      min = toNumber(min);
      if (eventValue > max) {
        inputMsg = `金额必须小于${max}`;
        validatePassed = false;
      } else if (eventValue < min) {
        inputMsg = `金额必须大于${min}`;
        validatePassed = false;
      }
      if (validatePassed) {
        inputMsg = `${TYPE.inputFieldRefs[name]}格式正确`;
      }
      result = {
        value: eventValue,
        inputMsg,
        color: validatePassed ? 'green' : 'red',
        icon: validatePassed
          ? 'checkbox-marked-circle-outline'
          : 'close-circle-outline',
        validatePassed,
      };
    }
    return {[name]: result};
  };

  onAmountChange = event => {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({type: 'formModel/validateNumberInput', payload: event});
  };

  onTopupQuerySubmit = () => {
    const {isOdd, paymentId, adminBankId} = this.props;

    if (paymentId) {
      if (isOdd) {
        this.dispatch({type: 'transferModel/putOddTransferQuery'});
      } else {
        this.dispatch({type: 'transferModel/postTopups'});
      }
    } else if (adminBankId) {
      this.dispatch({type: 'transferModel/putBankTransferConfirmation'});
    }
  };

  renderRemarks = () => {
    const {
      cardNoReq,
      mobileNoReq,
      formRealNameReq,
      topupRemarks,
      bankTopupResponse,
      transactionId,
    } = this.props;

    const remark = bankTopupResponse
      ? '订单已生成，请您放心转账，我们收到后会自动增加余额。'
      : topupRemarks;

    const remarks = [];
    if (remark) {
      remarks.push(
        <p
          dangerouslySetInnerHTML={{__html: `备注：尊敬的用户，${remark}`}}
          key="1"
        />,
      );
    }

    if (!transactionId && (cardNoReq || mobileNoReq || formRealNameReq)) {
      remarks.push(
        <p key="2" data-important>
          注明：请务必填写正确存款人信息，否则会入款失败
        </p>,
      );
    }

    return (remarks.length && remarks) || null;
  };

  renderTopUpAmount = () => {
    const {
      adminBankId,
      maxAmount,
      minAmount,
      remainQuota,
      topupAmount,
      fixedAmount,
      minimumTopupAmount,
    } = this.props;

    const {value, icon, color, inputMsg} = topupAmount;

    return (
      <div className={css.formItemRow}>
        <div className={css.formItem}>
          <div style={{position: 'relative'}}>
            <InputTextField
              id="topupAmount"
              label={TYPE.inputFieldRefs.topupAmount}
              min={
                adminBankId
                  ? minAmount
                  : getMax([minAmount, minimumTopupAmount])
              }
              max={remainQuota || maxAmount}
              value={value || ''}
              labelWidth={this.LABEL_WIDTH}
              placeholder="请填写充值金额"
              pattern="\d[0-9]\d"
              type="number"
              obj={topupAmount}
              onBlur={this.validateInput}
              onChange={this.onAmountChange}
              readOnly={fixedAmount}
            />
            {fixedAmount && this.renderDropDownList()}
          </div>
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {inputMsg}
        </div>
      </div>
    );
  };

  renderDropDownList = () => {
    return (
      <div
        className={css.amountOption_dropdownlist}
        id="fixedAmount_dropdownDiv"
        style={{
          width: `calc(100% - ${this.LABEL_WIDTH}`,
          marginLeft: this.LABEL_WIDTH,
          display: this.state.showDropDown ? '' : 'none',
        }}>
        {this.renderAmountOptions()}
      </div>
    );
  };

  renderAmountOptions = () => {
    const {fixedAmount} = this.props;

    return fixedAmount.map(amount => {
      return (
        <button
          type="button"
          key={amount}
          className={css.option}
          onClick={() => this.onAmountSelect(amount)}>
          {amount}元
        </button>
      );
    });
  };

  onAmountSelect = amount => {
    const {paymentId, maxAmount, minAmount, remainQuota} = this.props;

    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({
      type: 'formModel/validateNumberInput',
      payload: {
        name: 'topupAmount',
        value: amount,
        placeholder: '请填写充值金额',
        min: paymentId ? minAmount : 1,
        max: remainQuota || maxAmount,
      },
    });
  };

  renderName = () => {
    const {
      realName,
      topupCardRealname,
      isBankTransfer,
      formRealNameReq,
      transferRealNameReq,
    } = this.props;

    const elem = {
      auto: {
        input: realName,
        name: 'realName',
        label: TYPE.inputFieldRefs.realName,
      },
      bank: {
        input: topupCardRealname,
        name: 'topupCardRealname',
        label: TYPE.inputFieldRefs.topupCardRealname,
      },
    }[
      (formRealNameReq && 'auto') ||
        ((isBankTransfer || transferRealNameReq) && 'bank')
    ];

    if (elem) {
      const {value, icon, color, inputMsg} = elem.input;

      return (
        <div className={css.formItemRow}>
          <div className={css.formItem}>
            <InputTextField
              id={elem.name}
              label={elem.label}
              value={value || ''}
              labelWidth={this.LABEL_WIDTH}
              placeholder={`请输入中文、英文的${elem.label}`}
              pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
              type="text"
              obj={elem.input}
              onBlur={this.validateInput}
              onChange={this.onInputChange}
            />
          </div>
          <div className={css.formItem_msg} data-color={color}>
            <MDIcon className={css.formItem_msgIcon} iconName={icon} />
            {color === 'red'
              ? '请填写正确的中、英文姓名，并确保与绑定的银行卡持有人姓名统一'
              : inputMsg}
          </div>
        </div>
      );
    }

    return null;
  };

  renderMobileNo = () => {
    const {mobileNo} = this.props;
    const {value, icon, color, inputMsg} = mobileNo;
    const elem = {
      input: mobileNo,
      name: 'mobileNo',
      label: TYPE.inputFieldRefs.phoneNumber,
    };

    let msg = '';
    if (color === 'red') {
      msg = '请输入正确11位数字电话号码';
    } else if (color === 'green') {
      msg = '电话号码格式正确';
    }

    return (
      <div className={css.formItemRow}>
        <div className={css.formItem}>
          <InputTextField
            id={elem.name}
            label={elem.label}
            value={value || ''}
            labelWidth={this.LABEL_WIDTH}
            placeholder={`请输入正确11位${TYPE.inputFieldRefs.phoneNumber}`}
            max="11"
            min="11"
            pattern="^19[8,9]\d{8}$|^134[0-8][\d]{7}$|^13[0-35-9]\d{8}$|^14[5,6,7,8,9]\d{8}$|^15[^4]\d{8}$|^16[6]\d{8}$|^17[0,1,2,3,4,5,6,7,8]\d{8}$|^18[\d]{9}$"
            type="text"
            obj={elem.input}
            onBlur={this.validateInput}
            onChange={this.onInputChange}
          />
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {msg}
        </div>
      </div>
    );
  };

  renderCardNo = () => {
    const {cardNo} = this.props;
    const {value, icon, color, inputMsg} = cardNo;
    const elem = {
      input: cardNo,
      name: 'cardNo',
      label: TYPE.inputFieldRefs.bankCardNo,
    };
    return (
      <div className={css.formItemRow}>
        <div className={css.formItem}>
          <InputTextField
            id={elem.name}
            label={elem.label}
            value={value || ''}
            labelWidth={this.LABEL_WIDTH}
            max="19"
            min="16"
            placeholder="请输入 16-19 位银行卡号"
            pattern="^[0-9]{0,}$"
            type="text"
            obj={elem.input}
            onBlur={this.validateInput}
            onChange={this.onInputChange}
          />
        </div>
        <div className={css.formItem_msg} data-color={color}>
          <MDIcon className={css.formItem_msgIcon} iconName={icon} />
          {color === 'red' ? '请输入正确 16-19 位银行卡号' : inputMsg}
        </div>
      </div>
    );
  };

  renderButton() {
    const {
      adminBankId,
      paymentId,
      topupAmount,
      topupCardRealname,
      isBankTransfer,
      transferRealNameReq,
      cardNoReq,
      mobileNoReq,
      formRealNameReq,
      cardNo,
      mobileNo,
      realName,
    } = this.props;

    if (paymentId || adminBankId) {
      const disabled =
        ((isBankTransfer || transferRealNameReq) &&
          !topupCardRealname.validatePassed) ||
        !topupAmount.validatePassed ||
        (cardNoReq && !cardNo.validatePassed) ||
        (mobileNoReq && !mobileNo.validatePassed) ||
        (formRealNameReq && !realName.validatePassed);
      return (
        <div className={css.formItemRow}>
          <div className={css.formItem}>
            <SubmitResetButton
              labelWidth={this.LABEL_WIDTH}
              submitDisabled={disabled}
              hideReset
              onSubmitClick={this.onTopupQuerySubmit}
              submitText="提交申请"
              marginTop
              submitWidth="100%"
            />
          </div>
          <div className={css.formItem_msg} />
        </div>
      );
    }
  }

  render() {
    const {
      selectedTopupGroup,
      topupGroups,
      list,
      adminBankId,
      paymentId,
      cardNoReq,
      mobileNoReq,
    } = this.props;
    const selectedPaymentId = adminBankId || paymentId;
    const selectedPayment = find(list, x => {
      if (x.adminBankId) {
        return x.adminBankId === selectedPaymentId;
      }
      if (x.paymentId) {
        return x.paymentId === selectedPaymentId;
      }
      return false;
    });

    const varCode =
      selectedTopupGroup === 'THIRD_PARTY' ? 'ONLINEBANK' : selectedTopupGroup;
    const selectedGroup = find(topupGroups, x => x.code === varCode);

    const isWeChatPublic =
      selectedPayment &&
      selectedPayment.bankCode &&
      selectedPayment.bankCode === 'WX_PUBLIC';

    return (
      <ContentContainer
        title={`您选择的充值方式为：${selectedGroup &&
          selectedGroup.name} > ${selectedPayment &&
          (selectedPayment.bankName ||
            selectedPayment.merchantName)}，请继续完成以下操作`}
        titleStyle={{marginBottom: '15px'}}>
        <div className={css.remarks}>{this.renderRemarks()}</div>
        {isWeChatPublic ? (
          <QRCodeScan data={selectedPayment} />
        ) : (
          <React.Fragment>
            {this.renderTopUpAmount()}
            {this.renderName()}
            {mobileNoReq && this.renderMobileNo()}
            {cardNoReq && this.renderCardNo()}
            {this.renderButton()}
          </React.Fragment>
        )}
      </ContentContainer>
    );
  }
}

function mapStatesToProps({transferModel, formModel}) {
  const {
    adminBankId,
    isBankTransfer,
    realNameReq: transferRealNameReq,
    paymentId,
    remainQuota,
    isOdd,
    selectedTopupGroup,
    topupGroups,
    topupRemarks,
    bankTopupResponse,
  } = transferModel;
  const {
    realName,
    realNameReq: formRealNameReq,
    topupCardRealname,
    maxAmount,
    minAmount,
    fixedAmount,
    topupAmount,
    cardNoReq,
    mobileNoReq,
    cardNo,
    mobileNo,
  } = formModel;
  return {
    adminBankId,
    isBankTransfer,
    transferRealNameReq,
    paymentId,
    remainQuota,
    isOdd,
    selectedTopupGroup,
    topupGroups,
    topupRemarks,
    bankTopupResponse,
    realName,
    formRealNameReq,
    topupCardRealname,
    maxAmount,
    minAmount,
    fixedAmount,
    topupAmount,
    cardNoReq,
    mobileNoReq,
    cardNo,
    mobileNo,
  };
}
export default connect(mapStatesToProps)(Payment);

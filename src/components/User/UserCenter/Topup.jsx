import React, {Component} from 'react';
import classnames from 'classnames';
import moment from 'moment';
import {connect} from 'dva';
import {Tooltip, Radio} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import {size, find, map, filter, forEach, max as getMax} from 'lodash';

import {
  MDIcon,
  Button,
  QRCode,
  EllipsisLoader,
  LoadingBar,
} from 'components/General';
import {type as TYPE, addCommas, getConcatArray} from 'utils';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import icons from 'styles/iconfont.less';
import resolve from 'clientResolver';
import TransactionRecord from './TransactionRecord';

const Input = resolve.plugin('ProfileInput');
const {inputFieldRefs, defaultAmountOptions} = TYPE;

function AmountButton({placeholder, onSelect, value}) {
  function onClick() {
    onSelect(value);
  }
  return (
    <button type="button" className={css.profile_option} onClick={onClick}>
      <span className={css.profile_optionSpan__Name}>{placeholder}</span>
    </button>
  );
}

function ExpireDisclaimer() {
  const dateNow = Date.now();
  const twentyHourFromNow = moment(dateNow)
    .add(20, 'hours')
    .format('YYYY-MM-DD, HH:mm');

  return (
    <p className={css.profile_paymentDisclaimer}>
      <MDIcon iconName="information" />
      <span>
        如果您在 <strong> {twentyHourFromNow} </strong>
        前未处理入款，我们将取消您的本次操作。
      </span>
    </p>
  );
}

function ClipboardParagraph({
  label,
  onBlur,
  onCopy,
  placeholder,
  tooltipPlaceholder,
  value,
}) {
  return (
    <p className={css.clipboardBox}>
      <span className={css.profile_paymentInfoLabel}>{label}:</span>
      <ClipboardButton onSuccess={onCopy} data-clipboard-text={value}>
        <Tooltip title={tooltipPlaceholder} onVisibleChange={onBlur}>
          <span className={css.profile_tableAnchor}>{placeholder}</span>
        </Tooltip>
      </ClipboardButton>
    </p>
  );
}

const PUBLIC_PAY_ACC = ['WX_PUBLIC'];

class TopUp extends Component {
  static Icon(props) {
    const {isBankTransfer, merchantName, topupType} = props;
    let iconType = topupType;

    if (merchantName.indexOf('qq') > -1 || merchantName.indexOf('QQ') > -1) {
      iconType = 'QQ';
    } else if (isBankTransfer) {
      iconType = 'BANK';
    }
    return icons[iconType];
  }

  static PlatformName(props) {
    const {merchantName, topupType, paymentMethod} = props;
    let paymentMethodName = TYPE.paymentMethodRefs[paymentMethod];
    let topupTypeName = TYPE.paymentTypeRefs[topupType];

    if (merchantName.indexOf('QQ') > -1) {
      topupTypeName = 'QQ支付';
      paymentMethodName = 'QQ支付';
    }

    return paymentMethodName || topupTypeName || '';
  }

  constructor(props, context) {
    super(props, context);
    this.state = {
      QRImageLoading: true,
      tooltipText: '点我复制到剪贴板',
    };
    this.dispatch = props.dispatch;
    this.onAmountChange = this.onAmountChange.bind(this);
    this.onInputChange = this.onInputChange.bind(this);
    this.validateInput = this.validateInput.bind(this);
    this.onCopySuccess = this.onCopySuccess.bind(this);
  }

  componentWillMount() {
    this.dispatch({type: 'transferModel/getPaymentList'});
    this.dispatch({type: 'transferModel/getTopupAgentList'});
    this.dispatch({type: 'transferModel/getBankList'});
    this.dispatch({type: 'transferModel/getTopupAgentAnnouncement'});
  }

  componentWillReceiveProps(nextProps) {
    if (
      PUBLIC_PAY_ACC.includes(nextProps.selectedTopupGroup) &&
      this.props.dataImgUrl !== nextProps.dataImgUrl
    ) {
      this.dispatch({
        type: 'transferModel/updateState',
        payload: {data: nextProps.dataImgUrl, paymentJumpTypeEnum: 'IMG'},
      });
    }
  }

  componentWillUnmount() {
    this.initializeTopupContent();
  }

  onCopySuccess() {
    this.setState({tooltipText: '复制成功！'});
  }

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };

  onQRImgLoad = () => {
    this.setState({QRImageLoading: false});
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

  onInputChange(event) {
    event.persist();
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    const eventTarget = event.target;
    const {value, max} = eventTarget;
    if (value.toString().length <= max || !max) {
      this.validateInput(event);
    }
  }

  onAmountChange(event) {
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({type: 'formModel/validateNumberInput', payload: event});
  }

  onAmountSelect = amount => {
    this.dispatch({
      type: 'formModel/updateState',
      payload: {
        topupAmount: {value: amount, validatePassed: true},
      },
    });
  };

  onCardTypeSelect = event => {
    this.dispatch({
      type: 'formModel/updateState',
      payload: {cardType: {value: event.target.value}},
    });
  };

  onPaymentBankSelect = value => {
    this.dispatch({
      type: 'formModel/updateState',
      payload: {bankValue: {value}},
    });
  };

  onCheckRecordClick = () => {
    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {
        profileSelectedNav: 'topupRecord',
        profileExpandedNav: 'record',
      },
    });
  };

  initializeTopupContent() {
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: [
        'adminBankId',
        'amount',
        'bankTopupResponse',
        'data',
        'dataImg',
        'dataImgUrl',
        'merchantName',
        'minimumTopupAmount',
        'paymentId',
        'paymentJumpTypeEnum',
        'paymentMethod',
        'paymentPlatformCode',
        'paymentPlatformOrderNo',
        'paymentType',
        'receiptName',
        'topupRemarks',
        'topupType',
        'transactionId',
        'transactionNo',
        'transferNo',
        'userPrompt',
        'webview',
      ],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'bankAddress',
        'bankCardNo',
        'bankName',
        'cardNo',
        'fixedAmount',
        'maxAmount',
        'minAmount',
        'mobileNo',
        'realName',
        'receiptName',
        'remarks',
        'responseMsg',
        'topupAmount',
        'topupCardRealname',
        'transferTopupType',
      ],
    });
  }

  validateInput(payload) {
    const {dispatch} = this.props;
    dispatch({
      type: 'formModel/validateInput',
      payload,
    });
  }

  renderPromptMsg() {
    const {userPrompt} = this.props;
    if (!userPrompt) return null;
    return (
      <h5 className={css.profile_userPromptMsg}>
        <MDIcon iconName="information" />
        <span>{userPrompt}</span>
      </h5>
    );
  }

  renderTransactionHeader(id) {
    const {awaitingResponse, merchantName} = this.props;

    return (
      <React.Fragment>
        <h4 className={css.profile_formLabel}>
          <i
            className={classnames(
              css.profile_paymentIcon,
              TopUp.Icon(this.props),
            )}
          />
          <i>{merchantName}</i>
        </h4>
        <LoadingBar isLoading={awaitingResponse} />
        {id ? (
          <div className={css.profile_paymentResponseMsg}>
            <MDIcon iconName="checkbox-marked-circle-outline" />
            <i>订单已生成</i>
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  renderTransactionInfo(id, amount) {
    const stringArry = getConcatArray(id);
    const {
      transferRealNameReq,
      topupCardRealname,
      cardNo,
      mobileNo,
      realName,
      cardNoReq,
      formRealNameReq,
      mobileNoReq,
    } = this.props;
    let Info = null;

    if (
      cardNoReq !== null ||
      formRealNameReq !== null ||
      mobileNoReq !== null
    ) {
      Info = (
        <div>
          {formRealNameReq ? (
            <p className={css.profile_paymentInfoRow__remark}>
              <span className={css.profile_paymentInfoLabel}>
                {TYPE.inputFieldRefs.realName}:
              </span>
              <span className={css.profile_tableText}>{realName.value}</span>
            </p>
          ) : null}
          {mobileNoReq ? (
            <p className={css.profile_paymentInfoRow__remark}>
              <span className={css.profile_paymentInfoLabel}>
                {TYPE.inputFieldRefs.phoneNumber}:
              </span>
              <span className={css.profile_tableText}>{mobileNo.value}</span>
            </p>
          ) : null}
          {cardNoReq ? (
            <p className={css.profile_paymentInfoRow__remark}>
              <span className={css.profile_paymentInfoLabel}>
                {TYPE.inputFieldRefs.bankCardNo}:
              </span>
              <span className={css.profile_tableText}>{cardNo.value}</span>
            </p>
          ) : null}
        </div>
      );
    } else if (transferRealNameReq) {
      Info = (
        <p className={css.profile_paymentInfoRow__remark}>
          <span className={css.profile_paymentInfoLabel}>存款人:</span>
          <span className={css.profile_tableText}>
            {topupCardRealname.value}
          </span>
        </p>
      );
    }

    return (
      <React.Fragment>
        <p className={css.profile_paymentInfoRow}>
          <span className={css.profile_paymentInfoLabel}>订单号:</span>
          <ClipboardButton
            onSuccess={this.onCopySuccess}
            data-clipboard-text={id}>
            <Tooltip
              title={this.state.tooltipText}
              onVisibleChange={this.onToolTipVisibleChange}>
              <span className={css.profile_tableAnchor}>
                <i>{stringArry[0]}</i>
                <MDIcon iconName="multiplication" />
                <MDIcon iconName="multiplication" />
                <MDIcon iconName="multiplication" />
                <MDIcon iconName="multiplication" />
                <i>{stringArry[1]}</i>
              </span>
            </Tooltip>
          </ClipboardButton>
        </p>
        {Info}
        <p className={css.profile_paymentInfoRow}>
          <span className={css.profile_paymentInfoLabel}>支付金额:</span>
          <span className={css.profile_paymentAmount}>¥{amount}</span>
        </p>
      </React.Fragment>
    );
  }

  renderImg(url) {
    const {merchantName} = this.props;
    const {QRImageLoading} = this.state;
    const imgClassName = QRImageLoading
      ? css.profile_paymentImg__hidden
      : css.profile_paymentImg;

    return (
      <div className={css.profile_paymentQRColumn}>
        <div className={css.profile_paymentQRCode}>
          {QRImageLoading ? (
            <p className={css.profile_reminder}>
              正努力加载当中
              <EllipsisLoader duration={3000} />
            </p>
          ) : null}
          <img
            onLoad={this.onQRImgLoad}
            className={imgClassName}
            src={url}
            alt={merchantName}
          />
        </div>
      </div>
    );
  }

  renderQRCode() {
    const {data, transactionId} = this.props;
    return (
      <div className={css.profile_contentBody}>
        {this.renderTransactionHeader(transactionId)}
        <div className={css.profile_paymentQRRow}>
          <div className={css.profile_paymentQRColumn}>
            <div className={css.profile_paymentQRCode}>
              <QRCode text={data} size={250} crisp={false} />
            </div>
          </div>
          {this.renderQRInstruction(transactionId)}
        </div>
      </div>
    );
  }

  renderImgQR() {
    const {data, transactionId} = this.props;
    return (
      <div className={css.profile_contentBody}>
        {this.renderTransactionHeader(transactionId)}
        <div className={css.profile_paymentQRRow}>
          {this.renderImg(data)}
          {this.renderQRInstruction(transactionId)}
        </div>
      </div>
    );
  }

  renderQRInstruction(id) {
    const {amount, selectedTopupGroup} = this.props;
    let Instruction, InsctructionDisclaimer;

    if (PUBLIC_PAY_ACC.includes(selectedTopupGroup)) {
      Instruction = (
        <div className={css.profile_paymentInstructions}>
          <p className={css.profile_paymentInstruction}>
            1. 请扫描二维码，关注公众号
          </p>
          <p className={css.profile_paymentInstruction}>
            2. 进入公众号后，点击下方“在线充值”按钮
          </p>
          <p className={css.profile_paymentInstruction}>
            3. 输入账号、金额，完成充值
          </p>
        </div>
      );
    } else {
      Instruction = (
        <div className={css.profile_paymentInstructions}>
          <p className={css.profile_paymentInstruction}>
            请在{TopUp.PlatformName(this.props)}中打开“扫一扫”
          </p>
          <p className={css.profile_paymentInstruction}>
            扫描二维码，以完成充值。
          </p>
        </div>
      );
      InsctructionDisclaimer = ExpireDisclaimer();
    }

    return (
      <div className={css.profile_paymentInfoColumn}>
        <h4 className={css.profile_paymentInfoHeader}>扫二维码支付</h4>
        {this.renderPromptMsg()}
        {id ? this.renderTransactionInfo(id, amount) : null}
        <div className={css.profile_paymentInstructionRow}>
          <MDIcon
            iconName="qrcode-scan"
            className={css.paymentInstructionIcon}
          />
          {Instruction}
        </div>
        {InsctructionDisclaimer}
      </div>
    );
  }

  renderImage() {
    const {amount, dataImg, paymentPlatformOrderNo, transferNo} = this.props;

    return (
      <div className={css.profile_contentBody}>
        {this.renderTransactionHeader(transferNo)}
        <div className={css.profile_paymentQRRow}>
          {this.renderImg(dataImg)}
          <div className={css.profile_paymentInfoColumn}>
            <h4 className={css.profile_paymentInfoHeader}>扫二维码支付</h4>
            {this.renderTransactionInfo(transferNo, amount)}
            <div className={css.profile_paymentInstructionRow}>
              <MDIcon
                iconName="qrcode-scan"
                className={css.paymentInstructionIcon}
              />
              <div className={css.profile_paymentInstructions}>
                <p className={css.profile_paymentInstruction}>
                  1.) 请在{TopUp.PlatformName(this.props)}中打开“扫一扫”
                </p>
                <p className={css.profile_paymentInstruction}>
                  2.) 输入充值金额
                </p>
                <p className={css.profile_paymentInstruction}>
                  3.) 点击添加备注
                </p>
                <p className={css.profile_paymentInstruction}>
                  4.) 填上备注订单号
                  <ClipboardButton
                    onSuccess={this.onCopySuccess}
                    data-clipboard-text={paymentPlatformOrderNo}>
                    <Tooltip
                      title={this.state.tooltipText}
                      onVisibleChange={this.onToolTipVisibleChange}>
                      <strong className={css.profile_tableAnchor}>
                        {paymentPlatformOrderNo}
                      </strong>
                    </Tooltip>
                  </ClipboardButton>
                </p>
                <p className={css.profile_paymentInstruction}>
                  5.) 付款成功后，点击&quot;支付完成&quot;
                </p>
              </div>
            </div>
            {ExpireDisclaimer()}
          </div>
        </div>
      </div>
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

  renderAmountDropDown = () => {
    const {fixedAmount, maxAmount, minAmount} = this.props;
    const list = fixedAmount || defaultAmountOptions;
    return map(list, (amount, index) => {
      if (amount < minAmount || amount > maxAmount) return null;
      return (
        <AmountButton
          key={amount + index}
          placeholder={`${addCommas(amount)}元`}
          onSelect={this.onAmountSelect}
          value={amount}
        />
      );
    });
  };

  renderPaymentBankDropdown = () => {
    const {paymentBankList} = this.props;
    return map(paymentBankList, (bank, key) => {
      const {bankValue, bankName} = bank;
      if (key === 'UNRECOGNIZED') return null;
      const onClick = () => this.onPaymentBankSelect(bankValue);
      return (
        <button
          type="button"
          key={key}
          className={css.profile_option}
          onClick={onClick}>
          <span className={css.profile_optionSpan__Name}>{bankName}</span>
        </button>
      );
    });
  };

  renderBtnRow() {
    const {
      adminBankId,
      awaitingResponse,
      bankTopupResponse,
      data,
      dataImg,
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
    let disabled = awaitingResponse;
    if (dataImg) {
      return (
        <div className={css.profile_formBtnRow}>
          <Button
            disabled={disabled}
            className={css.profile_formBtn__submit}
            onClick={this.onCheckRecordClick}
            placeholder="支付完成，查看订单"
          />
        </div>
      );
    }
    if (bankTopupResponse || data) {
      return (
        <div className={css.profile_formBtnRow}>
          <Button
            disabled={disabled}
            className={css.profile_formBtn__submit}
            onClick={this.onCheckRecordClick}
            placeholder="查看充值记录"
          />
        </div>
      );
    }
    if (paymentId || adminBankId) {
      disabled =
        awaitingResponse ||
        ((isBankTransfer || transferRealNameReq) &&
          !topupCardRealname.validatePassed) ||
        !topupAmount.validatePassed ||
        (cardNoReq && !cardNo.validatePassed) ||
        (mobileNoReq && !mobileNo.validatePassed) ||
        (formRealNameReq && !realName.validatePassed);
      return (
        <div className={css.profile_formBtnRow}>
          <Button
            loading={awaitingResponse}
            disabled={disabled}
            className={css.profile_formBtn__submit}
            onClick={this.onTopupQuerySubmit}
            placeholder={awaitingResponse ? '请稍等' : '提交申请'}
          />
        </div>
      );
    }
  }

  renderPaymentBankList() {
    const {paymentBankList, awaitingResponse, bankValue} = this.props;
    if (!size(paymentBankList)) return null;
    const {color, icon, inputMsg, value} = bankValue;
    let inputValue = '';
    const selectedBank = find(paymentBankList, {bankValue: value});
    if (selectedBank) inputValue = selectedBank.bankName;
    return (
      <Input
        readOnly={awaitingResponse}
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={TYPE.inputFieldRefs.bankValue}
        min="2"
        max="10"
        name="transferTopupType"
        pattern="[^\u0000-\u00FF]{2,10}$"
        placeholder={`请选择${TYPE.inputFieldRefs.bankValue}`}
        renderOptions={this.renderPaymentBankDropdown}
        mouseLeaveSensitive
        value={inputValue}
      />
    );
  }

  renderBankTypeList() {
    const {bankTypeList, cardType} = this.props;
    if (!size(bankTypeList)) return null;
    return (
      <div className={css.profile_inputBox}>
        <label htmlFor="cardType" className={css.profile_inputLabel}>
          {TYPE.inputFieldRefs.cardType}
        </label>
        <Radio.Group
          name="cardType"
          onChange={this.onCardTypeSelect}
          value={cardType.value}>
          {map(bankTypeList, value => (
            <Radio value={value} key={value}>
              {TYPE.cardTypeRefs[value]}
            </Radio>
          ))}
        </Radio.Group>
      </div>
    );
  }

  renderTopupAmountInput() {
    const {
      adminBankId,
      awaitingResponse,
      maxAmount,
      minAmount,
      minimumTopupAmount,
      remainQuota,
      topupAmount,
      fixedAmount,
    } = this.props;
    const {value, icon, color, inputMsg} = topupAmount;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        label={TYPE.inputFieldRefs.topupAmount}
        min={adminBankId ? minAmount : getMax([minAmount, minimumTopupAmount])}
        max={remainQuota || maxAmount}
        mouseLeaveSensitive
        name="topupAmount"
        onChange={fixedAmount ? null : this.onAmountChange}
        pattern="\d[0-9]\d"
        placeholder={`请选择${fixedAmount ? '' : '或可自行填写'}充值金额`}
        readOnly={awaitingResponse}
        renderOptions={this.renderAmountDropDown}
        type="number"
        value={value}
      />
    );
  }

  renderName() {
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
        (formRealNameReq === null &&
          (isBankTransfer || transferRealNameReq) &&
          'bank')
    ];
    if (elem) {
      const {value, icon, color, inputMsg} = elem.input;

      return (
        <Input
          dataColor={color}
          dataIcon={icon}
          dataMsg={inputMsg}
          label={elem.label}
          name={elem.name}
          onBlur={this.validateInput}
          onChange={this.onInputChange}
          pattern="^([\u4e00-\u9fa5]{1}([·•● ]?[\u4e00-\u9fa5]){1,14})$|^[a-zA-Z\s]{4,30}$"
          required
          placeholder={`请输入中文、英文的${elem.label}`}
          value={value}
        />
      );
    }

    return null;
  }

  renderMobileNo() {
    const {mobileNoReq, mobileNo} = this.props;
    if (!mobileNoReq) return null;
    const {value, icon, color, inputMsg} = mobileNo;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        name="mobileNo"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        required
        placeholder={`请输入正确11位${TYPE.inputFieldRefs.phoneNumber}`}
        value={value}
        {...TYPE.extraInputFieldRefs.phoneNumber}
      />
    );
  }

  renderCardNo() {
    const {cardNoReq, cardNo} = this.props;
    if (!cardNoReq) return null;
    const {value, icon, color, inputMsg} = cardNo;
    return (
      <Input
        dataColor={color}
        dataIcon={icon}
        dataMsg={inputMsg}
        name="cardNo"
        onBlur={this.validateInput}
        onChange={this.onInputChange}
        required
        placeholder={`请输入 16-19 位${TYPE.inputFieldRefs.bankCardNo}`}
        value={value}
        {...TYPE.extraInputFieldRefs.bankCardNo}
      />
    );
  }

  renderRemarks() {
    const {
      cardNoReq,
      mobileNoReq,
      formRealNameReq,
      topupRemarks,
      bankTopupResponse,
      transactionId,
    } = this.props;
    let remark = topupRemarks;
    if (bankTopupResponse) {
      remark = '订单已生成，请您放心转账，我们收到后会自动增加余额。';
    }
    const remarks = [];

    if (remark) {
      remarks.push(
        <div key="1" className={css.profile_remarksflex}>
          备注：尊敬的用户，
          <div dangerouslySetInnerHTML={{__html: remark}} />
        </div>,
      );
    }

    if (!transactionId && (cardNoReq || mobileNoReq || formRealNameReq)) {
      remarks.push(
        <p key="2" data-important>
          注明：请务必填写正确存款人信息，否则会入款失败
        </p>,
      );
    }

    return (
      (remarks.length && (
        <div className={css.profile_remarks}>{remarks}</div>
      )) ||
      null
    );
  }

  renderBankResponses() {
    const {bankTopupResponse, awaitingResponse} = this.props;
    const {tooltipText} = this.state;
    return (
      <div className={css.profile_contentBody}>
        <h4 className={css.profile_formLabel}>
          充值订单已生成
          <LoadingBar isLoading={awaitingResponse} />
        </h4>
        <p className={css.profile_reminder}>
          <MDIcon iconName="lightbulb-on-outline" />
          <i>温馨提示</i>
        </p>
        <ol className={css.profile_reminderOrderList}>
          <li className={css.profile_reminderOrderListItem}>
            请依照系统提供的<strong>金额</strong>以及
            <strong>带有的小数点</strong>，进行汇款可快速自动到账
          </li>
          <li className={css.profile_reminderOrderListItem}>
            为确保您的账户资金安全，请保留您的凭条
          </li>
          <li className={css.profile_reminderOrderListItem}>
            我们的客服会根据银行转账实际到账日，审核该充值订单
          </li>
          <li className={css.profile_reminderOrderListItem}>
            如有疑问，请依据凭条，联系在线客服
          </li>
        </ol>
        <h4 className={css.profile_formLabel}>
          转账收款银行信息
          <LoadingBar />
        </h4>
        <ClipboardParagraph
          label={inputFieldRefs.topupAmount}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.amount}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.amount}
        />
        <ClipboardParagraph
          label={inputFieldRefs.bankAddress}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.bankAddress}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.bankAddress}
        />
        <ClipboardParagraph
          label={inputFieldRefs.bankCardNo}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.bankCardNo}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.bankCardNo}
        />
        <ClipboardParagraph
          label={inputFieldRefs.bankName}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.bankName}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.bankName}
        />
        <ClipboardParagraph
          label={inputFieldRefs.receiptName}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.receiptName}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.receiptName}
        />
        <ClipboardParagraph
          placeholder={bankTopupResponse.transactionNo}
          onBlur={this.onToolTipVisibleChange}
          value={bankTopupResponse.transactionNo}
          label="订单号"
          onCopy={this.onCopySuccess}
          tooltipPlaceholder={tooltipText}
        />
      </div>
    );
  }

  renderVIPTopup() {
    const {paymentList, awaitingResponse} = this.props;
    const vipArray = [];
    const vipList = filter(paymentList, viplist => {
      return viplist.type === 'VIP';
    });
    forEach(vipList, (item, index) => {
      vipArray.push(
        <div className={css.profile_contentBody} key={item.merchantName}>
          <h3 className={css.profile_formLabelVIP}>
            <i>{item.merchantName}</i>
          </h3>
          <LoadingBar isLoading={awaitingResponse} />
          <div className={css.profile_contentVIP}>
            <div className={css.allItemsVIP}>
              <p className={css.itemsVIP}>
                {item.methodName} : {item.methodInfo}
              </p>
              <p className={css.remarksVIP}>{item.remarks}</p>
            </div>
            <div className={css.copyButtonVIP}>
              <ClipboardButton
                onSuccess={this.onCopySuccess}
                data-clipboard-text={item.methodInfo}>
                <Tooltip
                  title={this.state.tooltipText}
                  onVisibleChange={this.onToolTipVisibleChange}>
                  <span className={css.profile_tableAnchor}>复制账号</span>
                </Tooltip>
              </ClipboardButton>
            </div>
          </div>
        </div>,
      );
    });
    return vipArray;
  }

  renderScene() {
    const {
      awaitingResponse,
      bankTopupResponse,
      data,
      dataImg,
      merchantName,
      paymentJumpTypeEnum,
      paymentMethod,
      webview,
    } = this.props;
    if (!webview && paymentMethod !== 'BANK_ONLINE' && data) {
      if (!paymentJumpTypeEnum) {
        return this.renderQRCode();
      }
      if (paymentJumpTypeEnum === 'IMG') {
        return this.renderImgQR();
      }
    } else if (dataImg) {
      return this.renderImage();
    } else if (bankTopupResponse) {
      return this.renderBankResponses();
    } else if (merchantName) {
      return (
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            <i
              className={classnames(
                css.profile_paymentIcon,
                TopUp.Icon(this.props),
              )}
            />
            <i>{merchantName}</i>
          </h4>
          <LoadingBar isLoading={awaitingResponse} />
          {this.renderPaymentBankList()}
          {this.renderBankTypeList()}
          {this.renderTopupAmountInput()}
          {this.renderName()}
          {this.renderMobileNo()}
          {this.renderCardNo()}
        </div>
      );
    }
    return (
      <div>
        <div className={css.profile_contentBody}>
          <h4 className={css.profile_formLabel}>
            充值
            <LoadingBar isLoading={awaitingResponse} />
          </h4>
          <p className={css.profile_reminder}>
            <MDIcon iconName="lightbulb-on-outline" />
            <i>尊敬的用户，请继续选择支付方式</i>
          </p>
        </div>
        <TransactionRecord
          filterBy={['IN_PROGRESS', 'REQ_WITHDRAW_CANCEL']}
          hideHeader
          title="正在处理中的提款"
          type="WITHDRAWAL"
          isTopup={true}
        />
      </div>
    );
  }

  render() {
    const {merchantName} = this.props;
    if (merchantName === 'VIP') {
      return <div>{this.renderVIPTopup()}</div>;
    } else
      return (
        <div>
          {this.renderScene()}
          {this.renderRemarks()}
          {this.renderResponseMsg()}
          {this.renderBtnRow()}
        </div>
      );
  }
}

function mapStatesToProps({transferModel, formModel}) {
  const {realNameReq: formRealNameReq, ...form} = formModel;
  const {realNameReq: transferRealNameReq, ...transfer} = transferModel;

  return {
    formRealNameReq,
    transferRealNameReq,
    // 保留这个次序确保相同值覆盖
    ...transfer,
    ...form,
  };
}

export default connect(mapStatesToProps)(TopUp);

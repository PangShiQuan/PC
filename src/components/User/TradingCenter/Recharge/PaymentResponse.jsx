import React, {PureComponent} from 'react';
import classnames from 'classnames';
import moment from 'moment';
import {connect} from 'dva';
import {MDIcon, QRCode, EllipsisLoader} from 'components/General';
import {type as TYPE, getConcatArray} from 'utils';
import {Tooltip} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import icons from 'styles/iconfont.less';
import userCSS from 'styles/User/User.less';
import css from 'styles/User/Dsf/ProfileIndex1.less';
import rechargeCSS from 'styles/User/TradingCenter/Recharge.less';

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

class PaymentResponse extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;

    this.state = {
      QRImageLoading: true,
      tooltipText: '点我复制到剪贴板',
    };
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: [
        'adminBankId',
        'amount',
        'bankCardNo',
        'bankTopupQuery',
        'bankTopupResponse',
        'bankTypeList',
        'data',
        'dataImg',
        'dataImgUrl',
        'isBankTransfer',
        'merchantName',
        'oddObject',
        'paymentBankList',
        'paymentId',
        'paymentJumpTypeEnum',
        'paymentMethod',
        'paymentPlatformCode',
        'paymentPlatformOrderNo',
        'paymentType',
        'remainQuota',
        'topupRemarks',
        'topupType',
        'transactionId',
        'transferNo',
        'webview',
      ],
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: [
        'bankAddress',
        'bankCardNo',
        'bankName',
        'bankValue',
        'cardNo',
        'cardType',
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
        'topupTime',
        'transferTopupType',
      ],
    });
  }

  icon = props => {
    const {isBankTransfer, merchantName, topupType} = props;
    let iconType = topupType;

    if (merchantName.indexOf('qq') > -1 || merchantName.indexOf('QQ') > -1) {
      iconType = 'QQ';
    } else if (isBankTransfer) {
      iconType = 'BANK';
    }
    return icons[iconType];
  };

  platformName = props => {
    const {merchantName, topupType, paymentMethod} = props;
    let paymentMethodName = TYPE.paymentMethodRefs[paymentMethod];
    let topupTypeName = TYPE.paymentTypeRefs[topupType];

    if (merchantName.indexOf('QQ') > -1) {
      topupTypeName = 'QQ支付';
      paymentMethodName = 'QQ支付';
    }

    return paymentMethodName || topupTypeName || '';
  };

  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
  };

  onQRImgLoad = () => {
    this.setState({QRImageLoading: false});
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

  renderBankResponses() {
    const {bankTopupResponse} = this.props;
    const {tooltipText} = this.state;
    return (
      <div className={css.profile_contentBody}>
        <h4 className={css.profile_formLabel}>充值订单已生成</h4>
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
        <h4 className={css.profile_formLabel}>转账收款银行信息</h4>
        <ClipboardParagraph
          label={TYPE.inputFieldRefs.topupAmount}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.amount}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.amount}
        />
        <ClipboardParagraph
          label={TYPE.inputFieldRefs.bankAddress}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.bankAddress}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.bankAddress}
        />
        <ClipboardParagraph
          label={TYPE.inputFieldRefs.bankCardNo}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.bankCardNo}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.bankCardNo}
        />
        <ClipboardParagraph
          label={TYPE.inputFieldRefs.bankName}
          onBlur={this.onToolTipVisibleChange}
          onCopy={this.onCopySuccess}
          placeholder={bankTopupResponse.bankName}
          tooltipPlaceholder={tooltipText}
          value={bankTopupResponse.bankName}
        />
        <ClipboardParagraph
          label={TYPE.inputFieldRefs.receiptName}
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

  renderTransactionHeader(id) {
    const {merchantName} = this.props;

    return (
      <React.Fragment>
        <h4 className={css.profile_formLabel}>
          <i
            className={classnames(
              css.profile_paymentIcon,
              this.icon(this.props),
            )}
          />
          <i>{merchantName}</i>
        </h4>
        {id ? (
          <div className={css.profile_paymentResponseMsg}>
            <MDIcon iconName="checkbox-marked-circle-outline" />
            <i>订单已生成</i>
          </div>
        ) : null}
      </React.Fragment>
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
            请在{this.platformName(this.props)}中打开「扫一扫」
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

  renderQRCode = () => {
    const {data, transactionId} = this.props;
    return (
      <div>
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
  };

  renderImgQR = () => {
    const {data, transactionId} = this.props;
    return (
      <div>
        {this.renderTransactionHeader(transactionId)}
        <div className={css.profile_paymentQRRow}>
          {this.renderImg(data)}
          {this.renderQRInstruction(transactionId)}
        </div>
      </div>
    );
  };

  renderImg = url => {
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
  };

  renderImage = () => {
    const {amount, dataImg, paymentPlatformOrderNo, transferNo} = this.props;

    return (
      <div>
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
                  1.) 请在{this.platformName(this.props)}中打开「扫一扫」
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
  };

  renderTransactionInfo = (id, amount) => {
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
  };

  renderScene = () => {
    const {
      bankTopupResponse,
      data,
      dataImg,
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
    }

    return (
      <div>
        <div>
          <h4 className={css.profile_formLabel}>充值</h4>
          <p className={css.profile_reminder}>
            <MDIcon iconName="lightbulb-on-outline" />
            <i>尊敬的用户，请继续选择支付方式</i>
          </p>
        </div>
        {/* <TransactionRecord
          filterBy={['IN_PROGRESS', 'REQ_WITHDRAW_CANCEL']}
          hideHeader
          title="正在处理中的提款"
          type="WITHDRAWAL"
          isTopup
        /> */}
      </div>
    );
  };

  renderButton = () => {
    const {bankTopupResponse, data, dataImg} = this.props;

    return (
      <div className={rechargeCSS.button_row}>
        <button
          type="button"
          className={rechargeCSS.submit_button}
          onClick={this.onCheckRecordClick}>
          {bankTopupResponse || data ? '查看充值记录' : '支付完成，查看订单'}
        </button>
      </div>
    );
  };

  render() {
    return (
      <div className={userCSS.content_body}>
        {this.renderScene()}
        {this.renderButton()}
      </div>
    );
  }
}

function mapStatesToProps({transferModel}) {
  return {
    ...transferModel,
  };
}
export default connect(mapStatesToProps)(PaymentResponse);

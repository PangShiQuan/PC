import React, {PureComponent} from 'react';
import moment from 'moment';
import {connect} from 'dva';
import {EllipsisLoader, QRCode, MDIcon} from 'components/General';
import {type as TYPE} from 'utils';
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
    .format('YYYY-MM-DD HH:mm');

  return (
    <div className={rechargeCSS.disclaimer}>
      <span>
        请在{' '}
        <strong className={rechargeCSS.highlight_time}>
          {' '}
          {twentyHourFromNow}{' '}
        </strong>
        前完成以下操作，否则我们将取消您的本次入款
      </span>
    </div>
  );
}

function ClipboardParagraph({
  onBlur,
  onCopy,
  placeholder,
  tooltipPlaceholder,
  value,
}) {
  return (
    <p className={css.clipboardBox}>
      <ClipboardButton onSuccess={onCopy} data-clipboard-text={value}>
        <Tooltip title={tooltipPlaceholder} onVisibleChange={onBlur}>
          {placeholder}
        </Tooltip>
      </ClipboardButton>
    </p>
  );
}

class PaymentResponsePay extends PureComponent {
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

  renderImg = () => {
    const {
      merchantName,
      paymentJumpTypeEnum,
      webview,
      paymentMethod,
      data,
      dataImg,
    } = this.props;
    const {QRImageLoading} = this.state;

    let imgUrl = dataImg;
    let renderImg = true;

    if (!webview && paymentMethod !== 'BANK_ONLINE' && data) {
      imgUrl = data;
      renderImg = paymentJumpTypeEnum === 'IMG';
    }

    return (
      <div>
        {renderImg && QRImageLoading && (
          <p className={rechargeCSS.downloading}>
            正努力加载当中
            <EllipsisLoader duration={3000} />
          </p>
        )}

        {renderImg ? (
          <img onLoad={this.onQRImgLoad} src={imgUrl} alt={merchantName} />
        ) : (
          <QRCode text={imgUrl} size={250} crisp={false} />
        )}
      </div>
    );
  };

  renderBigAmount = () => {
    const {amount} = this.props;
    return <div className={rechargeCSS.big_amount}>¥{amount}</div>;
  };

  renderDescription = () => {
    const {webview, paymentMethod, data} = this.props;

    return (
      <div className={rechargeCSS.instruction}>
        <p>1. 请在{this.platformName(this.props)}中打开「扫一扫」</p>
        {!webview && paymentMethod !== 'BANK_ONLINE' && data ? (
          <p>2. 扫描二维码，以完成充值。</p>
        ) : (
          <React.Fragment>
            <p>2. 输入充值金额</p>
            <p>3. 点击添加备注，填上备注订单号</p>
            <p>4. 付款成功后，点击“支付完成”</p>
          </React.Fragment>
        )}
      </div>
    );
  };

  renderPromptMsg = () => {
    const {userPrompt} = this.props;
    if (!userPrompt) return null;
    return (
      <div className={rechargeCSS.promptMsg}>
        <MDIcon
          iconName="information"
          style={{verticalAlign: 'middle', marginRight: '5px'}}
        />
        <span>{userPrompt}</span>
      </div>
    );
  };

  renderTable = () => {
    const {tooltipText} = this.state;
    const {amount, transactionId, transferNo} = this.props;
    const transId = transactionId || transferNo;

    return (
      <table className={rechargeCSS.bankResponse_table}>
        <tbody>
          <tr>
            <td>订单号</td>
            <td>
              <ClipboardParagraph
                onBlur={this.onToolTipVisibleChange}
                onCopy={this.onCopySuccess}
                placeholder={transId}
                tooltipPlaceholder={tooltipText}
                value={transId}
              />
            </td>
          </tr>
          <tr>
            <td>支付金额</td>
            <td>
              <ClipboardParagraph
                onBlur={this.onToolTipVisibleChange}
                onCopy={this.onCopySuccess}
                placeholder={amount}
                tooltipPlaceholder={tooltipText}
                value={amount}
              />
            </td>
          </tr>
        </tbody>
      </table>
    );
  };

  renderButton = () => {
    return (
      <div className={rechargeCSS.redirect_button}>
        <button
          type="button"
          className={rechargeCSS.submit_button}
          onClick={this.onCheckRecordClick}>
          支付完成，查看订单
        </button>
      </div>
    );
  };

  render() {
    return (
      <div className={userCSS.content_body}>
        <div className={rechargeCSS.payResponse}>
          <div className={rechargeCSS.disclaimer_div}>{ExpireDisclaimer()}</div>
          <div className={rechargeCSS.disclaimer_div}>
            {this.renderPromptMsg()}
          </div>
          <div className={rechargeCSS.content_div}>
            <div className={rechargeCSS.qrCode_div}>{this.renderImg()}</div>
            <div>
              <div>{this.renderBigAmount()}</div>
              <div>{this.renderDescription()}</div>
            </div>
          </div>
          <div className={rechargeCSS.table_div}>{this.renderTable()}</div>
        </div>
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
export default connect(mapStatesToProps)(PaymentResponsePay);

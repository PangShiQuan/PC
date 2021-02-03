import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {type as TYPE} from 'utils';
import {Tooltip} from 'antd';
import ClipboardButton from 'react-clipboard.js';
import userCSS from 'styles/User/User.less';
import css from 'styles/User/TradingCenter/Recharge.less';
import PaymentResponseTips from 'components/User/TradingCenter/Recharge/PaymentResponse/PaymentResponseTips';

function ClipboardParagraph({
  onBlur,
  onCopy,
  placeholder,
  tooltipPlaceholder,
  value,
}) {
  return (
    <p>
      <ClipboardButton onSuccess={onCopy} data-clipboard-text={value}>
        <Tooltip title={tooltipPlaceholder} onVisibleChange={onBlur}>
          {placeholder}
        </Tooltip>
      </ClipboardButton>
    </p>
  );
}

class PaymentResponseBank extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;

    this.state = {
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

  onCopySuccess = () => {
    this.setState({tooltipText: '复制成功！'});
  };

  onToolTipVisibleChange = () => {
    this.setState({tooltipText: '点我复制到剪贴板'});
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

  renderBankResponse = () => {
    const {tooltipText} = this.state;
    const {bankTopupResponse} = this.props;
    return (
      <div>
        <div className={css.bankResponse_title}>转账收款银行信息</div>
        <table className={css.bankResponse_table}>
          <tbody>
            <tr>
              <td>{TYPE.inputFieldRefs.topupAmount}</td>
              <td>
                <ClipboardParagraph
                  onBlur={this.onToolTipVisibleChange}
                  onCopy={this.onCopySuccess}
                  placeholder={bankTopupResponse.amount}
                  tooltipPlaceholder={tooltipText}
                  value={bankTopupResponse.amount}
                />
              </td>
            </tr>
            <tr>
              <td>{TYPE.inputFieldRefs.bankAddress}</td>
              <td>
                <ClipboardParagraph
                  onBlur={this.onToolTipVisibleChange}
                  onCopy={this.onCopySuccess}
                  placeholder={bankTopupResponse.bankAddress}
                  tooltipPlaceholder={tooltipText}
                  value={bankTopupResponse.bankAddress}
                />
              </td>
            </tr>
            <tr>
              <td>{TYPE.inputFieldRefs.bankCardNo}</td>
              <td>
                <ClipboardParagraph
                  onBlur={this.onToolTipVisibleChange}
                  onCopy={this.onCopySuccess}
                  placeholder={bankTopupResponse.bankCardNo}
                  tooltipPlaceholder={tooltipText}
                  value={bankTopupResponse.bankCardNo}
                />
              </td>
            </tr>
            <tr>
              <td>{TYPE.inputFieldRefs.bankName}</td>
              <td>
                <ClipboardParagraph
                  label={TYPE.inputFieldRefs.bankName}
                  onBlur={this.onToolTipVisibleChange}
                  onCopy={this.onCopySuccess}
                  placeholder={bankTopupResponse.bankName}
                  tooltipPlaceholder={tooltipText}
                  value={bankTopupResponse.bankName}
                />
              </td>
            </tr>
            <tr>
              <td>{TYPE.inputFieldRefs.receiptName}</td>
              <td>
                <ClipboardParagraph
                  label={TYPE.inputFieldRefs.receiptName}
                  onBlur={this.onToolTipVisibleChange}
                  onCopy={this.onCopySuccess}
                  placeholder={bankTopupResponse.receiptName}
                  tooltipPlaceholder={tooltipText}
                  value={bankTopupResponse.receiptName}
                />
              </td>
            </tr>
            <tr>
              <td>订单号</td>
              <td>
                <ClipboardParagraph
                  placeholder={bankTopupResponse.transactionNo}
                  onBlur={this.onToolTipVisibleChange}
                  value={bankTopupResponse.transactionNo}
                  label="订单号"
                  onCopy={this.onCopySuccess}
                  tooltipPlaceholder={tooltipText}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  renderButton = () => {
    return (
      <div className={css.redirect_button}>
        <button
          type="button"
          className={css.submit_button}
          onClick={this.onCheckRecordClick}>
          查看充值记录
        </button>
      </div>
    );
  };

  render() {
    return (
      <div className={userCSS.content_body}>
        <PaymentResponseTips />
        <div className={css.bankResponse}>
          {this.renderBankResponse()}
          {this.renderButton()}
        </div>
      </div>
    );
  }
}

function mapStatesToProps({transferModel}) {
  return {
    ...transferModel,
  };
}
export default connect(mapStatesToProps)(PaymentResponseBank);

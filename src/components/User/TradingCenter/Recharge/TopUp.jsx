import React, {PureComponent} from 'react';
import {connect} from 'dva';
import {find} from 'lodash';
import ResponseMessageBar from 'components/User/ResponseMessageBar';
import PaymentGroup from 'components/User/TradingCenter/Recharge/PaymentGroup';
import PaymentMethods from 'components/User/TradingCenter/Recharge/PaymentMethods';
import Payment from 'components/User/TradingCenter/Recharge/Payment';
import TransactionRecord from 'components/User/TradingCenter/TransactionRecord';
import ContentContainer from 'components/User/ContentContainer';
import userCSS from 'styles/User/User.less';
import PaymentResponseBank from 'components/User/TradingCenter/Recharge/PaymentResponse/PaymentResponseBank';
import PaymentResponsePay from 'components/User/TradingCenter/Recharge/PaymentResponse/PaymentResponsePay';
import TAgentPayment from './TAgentPayment';

const filterBy = ['IN_PROGRESS', 'REQ_WITHDRAW_CANCEL'];

class TopUp extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;

    this.state = {
      paymentList: null,
    };
  }

  componentDidMount() {
    this.dispatch({type: 'transferModel/getPaymentList'});
    this.dispatch({type: 'transferModel/getTopupAgentList'});
    this.dispatch({type: 'transferModel/getBankList'});
    this.dispatch({type: 'transferModel/getTopupAgentAnnouncement'});
    this.dispatch({
      type: 'transactionModel/getTransactionHistory',
      payload: {type: 'WITHDRAWAL'},
    });
  }

  onSelectPaymentGroup = list => {
    this.setState({paymentList: list});
  };

  render() {
    const {
      paymentId,
      adminBankId,
      dataImg,
      bankTopupResponse,
      transactionHistory,
      selectedTopupGroup,
      webview,
      paymentMethod,
      data,
    } = this.props;

    const pendingTransactions = transactionHistory.filter(item =>
      filterBy.includes(item.state),
    );

    const {paymentList} = this.state;
    const isVIP = find(paymentList, item => item.type === 'VIP');

    const renderPaymentReponsePay =
      (!webview && paymentMethod !== 'BANK_ONLINE' && data) || dataImg;

    return (
      <React.Fragment>
        <ResponseMessageBar />
        {bankTopupResponse && <PaymentResponseBank />}
        {renderPaymentReponsePay && <PaymentResponsePay />}
        {!renderPaymentReponsePay && !bankTopupResponse && !dataImg && (
          <div className={userCSS.content_body} style={{paddingTop: '4px'}}>
            <div>
              <PaymentGroup setPaymentList={this.onSelectPaymentGroup} />
            </div>
            <div style={{marginTop: '10px'}}>
              {paymentList && paymentList.length > 0 && (
                <PaymentMethods list={paymentList} />
              )}
            </div>
            <div style={{marginTop: '30px'}}>
              {selectedTopupGroup === 'TAGENT' && (
                <TAgentPayment list={paymentList} />
              )}
              {selectedTopupGroup !== 'TAGENT' &&
                !isVIP &&
                (paymentId || adminBankId) && <Payment list={paymentList} />}
            </div>
            {pendingTransactions.length > 0 && (
              <ContentContainer title="您还有正在进行的提款：取消提款后金额将返还至中心钱包">
                <TransactionRecord
                  filterBy={filterBy}
                  type="WITHDRAWAL"
                  isTopup
                />
              </ContentContainer>
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}

function mapStatesToProps({transferModel, transactionModel}) {
  const {transactionHistory} = transactionModel;
  const {
    webview,
    paymentJumpTypeEnum,
    paymentMethod,
    data,
    dataImg,
    bankTopupResponse,
    merchantName,
    paymentId,
    adminBankId,
    paymentList,
    bankList,
    topupGroups,
    selectedTopupGroup,
  } = transferModel;
  return {
    webview,
    paymentJumpTypeEnum,
    paymentMethod,
    data,
    dataImg,
    bankTopupResponse,
    merchantName,
    paymentId,
    adminBankId,
    paymentList,
    bankList,
    topupGroups,
    selectedTopupGroup,
    transactionHistory,
  };
}
export default connect(mapStatesToProps)(TopUp);

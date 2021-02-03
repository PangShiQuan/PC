import React, {PureComponent} from 'react';
import {sortBy, map, filter} from 'lodash';
import {connect} from 'dva';
import css from 'styles/User/TradingCenter/Recharge.less';
import GetPaymentIcon from 'components/User/TradingCenter/Recharge/GetPaymentIcon';

class PaymentGroup extends PureComponent {
  constructor(props) {
    super(props);
    this.dispatch = props.dispatch;
  }

  componentDidUpdate(prevProps) {
    const {paymentList: prevPaymentList, bankList: prevBankList} = prevProps;
    const {paymentList, bankList, topupGroups} = this.props;

    if (
      topupGroups.length > 0 &&
      (prevPaymentList !== paymentList || prevBankList !== bankList)
    ) {
      this.onPaymentGroupClick(
        topupGroups[0].code,
        this.getCompleteList(topupGroups[0].code),
      );
    }
  }

  onPaymentGroupClick = (paymentKey, completeList) => {
    const {setPaymentList} = this.props;
    this.dispatch({
      type: 'transferModel/updateState',
      payload: {
        adminBankId: '',
        paymentId: '',
        selectedTopupGroup: paymentKey,
      },
    });

    setPaymentList(
      paymentKey === 'BANK'
        ? completeList.filter(item => item.bankCode === undefined)
        : completeList,
    );
  };

  getCompleteList = code => {
    const {paymentList, bankList, topupAgentList} = this.props;
    const varCode = code === 'ONLINEBANK' ? 'THIRD_PARTY' : code;
    const varPaymentList = filter(
      paymentList,
      payment => payment.type === varCode && payment.paymentType !== 'WAP',
    );
    let oddObjects = filter(bankList, bank => bank.bankCode === varCode);
    oddObjects = map(oddObjects, oddObj => {
      const payment = oddObj;
      payment.isOdd = true;
      return payment;
    });

    let output = null;

    if (varCode === 'BANK') {
      output = bankList;
    } else if (varCode === 'TAGENT') {
      output = topupAgentList;
    } else {
      output = sortBy([...oddObjects, ...varPaymentList], ['position']);
    }

    return output;
  };

  renderItems = () => {
    const {topupGroups, selectedTopupGroup} = this.props;

    if (topupGroups.length === 0) return <div />;

    return map(topupGroups, (group, index) => {
      const {name, code, popular} = group;
      const varCode = code === 'ONLINEBANK' ? 'THIRD_PARTY' : code;
      const completeList = this.getCompleteList(code);
      const disabled = !completeList || !completeList.length;

      return (
        <button
          key={index}
          type="button"
          onClick={() => this.onPaymentGroupClick(varCode, completeList)}
          data-active={selectedTopupGroup === varCode}
          className={css.groupButton}
          disabled={disabled}>
          <div className={css.group}>
            <GetPaymentIcon code={varCode} />
            {name}
          </div>
          {popular && (
            <div className={css.hotIcon}>
              <GetPaymentIcon code="Hot" />
            </div>
          )}
        </button>
      );
    });
  };

  render() {
    return <div className={css.paymentGroups}>{this.renderItems()}</div>;
  }
}

function mapStatesToProps({transferModel}) {
  const {
    paymentList,
    bankList,
    topupAgentList,
    topupGroups,
    selectedTopupGroup,
  } = transferModel;
  return {
    paymentList,
    bankList,
    topupAgentList,
    topupGroups,
    selectedTopupGroup,
  };
}
export default connect(mapStatesToProps)(PaymentGroup);

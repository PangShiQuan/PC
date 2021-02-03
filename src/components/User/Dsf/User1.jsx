import React, {Component} from 'react';
import {pick, mapValues, find} from 'lodash';
import {connect} from 'dva';
import {PageContainer} from 'components/General';
import profileCss from 'styles/User/Base/ProfileIndex1.less';
import resolve from 'clientResolver';
import TitleBar from 'components/User/TitleBar';
// Trading Center
import TopupCtrl from 'components/User/TradingCenter/Recharge/TopUp';
import WithdrawalCtrl from 'components/User/TradingCenter/Withdrawal';
import TransactionRecord from 'components/User/TradingCenter/TransactionRecord';
import MyCashFlow from 'components/User/TradingCenter/CashFlowList';
import MissionReport from 'components/User/TradingCenter/MissionReport/index';
import SosFundReport from 'components/User/TradingCenter/SosFundReport/index';
// Security Center
import UserProfile from 'components/User/SecurityCenter/UserProfile';
import SecurityInfo from 'components/User/SecurityCenter/SecurityInfo';
import BankCardInfo from 'components/User/SecurityCenter/BankCardInfo';
// News Center
import MyNews from 'components/User/NewsCenter/MyNews';
import Feedback from 'components/User/NewsCenter/Feedback';
// Agent Center
import Member from 'components/User/AgentCenter/Member';
import CommissionReport from 'components/User/AgentCenter/CommissionReport';
import Affiliate from 'components/User/AgentCenter/Affiliate';
import AliPayInfo from 'components/User/UserCenter/AliPayInfo';

// const DrawInfo = resolve.plugin('DrawInfo');
// const BasicInfo = resolve.plugin('BasicInfo');
// const CommissionReport = resolve.plugin('CommissionReport');
// const MemberManage = resolve.plugin('MemberManage');
// const MyCashFlow = resolve.plugin('CashFlowList');
const OrderRecord = resolve.plugin('OrderRecord');
// const AffCodeManage = resolve.plugin('AffCodeManage');
const PersonalReport = resolve.plugin('PersonalReport');
const SideNav = resolve.plugin('SideNavUser');
const TransferReport = resolve.plugin('TransferReport');
const TeamReport = resolve.plugin('TeamReport');
const TransferCtrl = resolve.plugin('Transfer');

const BANK_FIELD = {
  realNameReq: null,
};
const THIRD_PARTY_FIELD = {
  cardNoReq: null,
  mobileNoReq: null,
  realNameReq: null,
};

class UserIndex extends Component {
  static addFormField(fields, {minAmount, maxAmount}) {
    const formField = {};

    if (minAmount >= 0) formField.minAmount = minAmount;
    if (maxAmount) formField.maxAmount = maxAmount;

    return {...THIRD_PARTY_FIELD, ...fields, ...formField};
  }

  constructor(props) {
    super(props);
    this.state = {
      previousSelectedNav: 'basicInfo',
    };
    this.dispatch = props.dispatch;

    this.bankCardInfo = <BankCardInfo />;
    this.aliPayInfo = <AliPayInfo />;
    this.drawInfo = <BankCardInfo />;
    this.basicInfo = <UserProfile />;
    this.commissionReport = <CommissionReport />;
    this.memberManage = <Member onNavSelect={this.onNavSelect} />;
    this.myCashFlow = <MyCashFlow />;
    this.orderRecord = <OrderRecord />;
    this.feedback = <Feedback />;
    this.affCodeManage = <Affiliate />;
    this.securityInfo = <SecurityInfo />;
    this.personalReport = (
      <PersonalReport
        onNavSelect={this.onNavSelect}
        onBackClick={this.onBackClick}
      />
    );
    this.agentPersonalReport = <PersonalReport name="agent" />;
    this.transferReport = <TransferReport />;
    this.teamReport = <TeamReport />;
    this.topupCtrl = <TopupCtrl />;
    this.transferCtrl = <TransferCtrl />;
    this.topupRecord = <TransactionRecord type="TOPUP" />;
    this.withdrawalCtrl = <WithdrawalCtrl />;
    this.withdrawalRecord = <TransactionRecord type="WITHDRAWAL" />;
    this.msgInbox = <MyNews />;
    this.missionReport = <MissionReport />;
    this.sosFundReport = <SosFundReport />;
  }

  componentDidUpdate(prevProps) {
    const {profileSelectedNav: prevProfileSelectedNav} = prevProps;
    const {profileSelectedNav} = this.props;

    if (prevProfileSelectedNav !== profileSelectedNav) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({previousSelectedNav: prevProfileSelectedNav});
    }
  }

  componentWillUnmount() {
    this.dispatch({
      type: 'layoutModel/initializeState',
      payload: ['profileGroupNav', 'profileExpandedNav', 'profileSelectedNav'],
    });
  }

  onNavSelect = profileSelectedNav => {
    const {profileSelectedNav: selectedNav} = this.props;
    if (selectedNav === profileSelectedNav) return;

    this.dispatch({
      type: 'layoutModel/updateState',
      payload: {profileSelectedNav},
    });
    this.dispatch({
      type: 'formModel/initializeState',
      payload: ['responseMsg'],
    });
    this.dispatch({type: 'orderModel/clearOrderDetails'});
    this.dispatch({
      type: 'dataTableModel/initializeState',
      payload: ['pageSize', 'start', 'currentPage'],
    });
    this.dispatch({
      type: 'transactionModel/initializeAll',
    });
    if (profileSelectedNav !== 'agentPersonalReport') {
      this.dispatch({
        type: 'reportModel/initializeAll',
      });
      this.dispatch({
        type: 'teamModel/initializeAll',
      });
    }
  };

  onNavExpandClick(payload) {
    this.dispatch({type: 'layoutModel/updateState', payload});
  }

  onPaymentGroupHover(topupType) {
    this.dispatch({
      type: 'transferModel/updateState',
      payload: {topupType},
    });
  }

  onPaymentGroupLeave() {
    const {paymentId, paymentList, adminBankId} = this.props;
    if (adminBankId) {
      this.dispatch({
        type: 'transferModel/updateState',
        payload: {topupType: 'BANK'},
      });
    } else {
      const selectedPayment = find(paymentList, ['paymentId', paymentId]);
      if (selectedPayment) {
        const topupType = selectedPayment.type;
        this.dispatch({
          type: 'transferModel/updateState',
          payload: {topupType},
        });
      }
    }
  }

  onBackClick = () => {
    this.onNavSelect(this.state.previousSelectedNav);
  };

  onAutoTopupSelect = ({
    dataImg,
    fixedAmount,
    maxAmount,
    merchantName,
    minAmount,
    paymentId,
    paymentType,
    platform,
    remarks,
    type,
    userPrompt,
    cardNoReq,
    mobileNoReq,
    realNameReq,
  }) => {
    this.initializeTopupStatus();
    const payload = {
      dataImg,
      isOdd: false,
      merchantName,
      paymentId,
      paymentType,
      platform,
      topupRemarks: remarks,
      topupType: type,
      userPrompt,
      isBankTransfer: false,
    };
    const formPayload = {
      fixedAmount,
      cardNoReq,
      mobileNoReq,
      realNameReq,
    };
    this.dispatch({
      type: 'formModel/updateState',
      payload: UserIndex.addFormField(formPayload, {minAmount, maxAmount}),
    });
    this.dispatch({
      type: 'transferModel/updateState',
      payload: BANK_FIELD,
    });
    this.dispatch({
      type: 'transferModel/getPaymentBankList',
      payload,
    });
  };

  onOddTopupSelect = oddObject => {
    this.initializeTopupStatus();
    const {minAmount, maxAmount} = oddObject;
    const formPayload = {};
    this.dispatch({
      type: 'transferModel/getOddTransferInfo',
      payload: {oddObject},
    });
    this.dispatch({
      type: 'formModel/updateState',
      payload: UserIndex.addFormField(formPayload, {minAmount, maxAmount}),
    });
  };

  onBankTopupSelect = bankOption => {
    const {
      adminBankId,
      remarks,
      remainQuota,
      receiptName,
      fixedAmount,
      minAmount,
      maxAmount,
      realNameReq,
    } = bankOption;
    this.initializeTopupStatus();
    const neededFormData = pick(bankOption, [
      'bankAddress',
      'bankCardNo',
      'bankName',
      'receiptName',
      'remarks',
    ]);
    const formValues = mapValues(neededFormData, value => ({value}));
    const formPayload = {fixedAmount, ...formValues};
    this.dispatch({
      type: 'transferModel/updateState',
      payload: {
        adminBankId,
        topupRemarks: remarks,
        remainQuota,
        merchantName: receiptName,
        isBankTransfer: true,
        realNameReq,
      },
    });
    this.dispatch({
      type: 'formModel/updateState',
      payload: UserIndex.addFormField(formPayload, {minAmount, maxAmount}),
    });
  };

  initializeTopupStatus = () => {
    this.dispatch({
      type: 'transferModel/initializeState',
      payload: [
        'adminBankId',
        'amount',
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
        'transferTopupType',
      ],
    });
  };

  logoutHandler = () => {
    this.dispatch({
      type: 'userModel/getUserLogout',
    });
  };

  renderContent() {
    const {profileSelectedNav} = this.props;
    if (this[profileSelectedNav]) {
      return this[profileSelectedNav]; // =》 this.aliPay
    }
    return null;
  }

  render() {
    const {userData} = this.props;

    if (userData) {
      const {
        adminBankId,
        bankAccounts,
        bankList,
        gamePlatformList,
        otherSettings,
        paymentId,
        paymentList,
        profileSelectedNav,
        selectedBankCardId,
        selectedTopupGroup,
        topupGroups,
      } = this.props;
      const sideNavProps = {
        adminBankId,
        bankAccounts,
        bankList,
        dispatch: this.dispatch,
        gamePlatformList,
        logoutHandler: this.logoutHandler,
        onAutoTopupSelect: this.onAutoTopupSelect,
        onBackClick: this.onBackClick,
        onBankCardSelect: this.onBankCardSelect,
        onBankTopupSelect: this.onBankTopupSelect,
        onNavSelect: this.onNavSelect,
        onOddTopupSelect: this.onOddTopupSelect,
        otherSettings,
        paymentId,
        paymentList,
        profileSelectedNav,
        selectedBankCardId,
        selectedTopupGroup,
        topupGroups,
        userData,
      };

      return (
        <React.Fragment>
          {userData && (
            <PageContainer>
              <div className={profileCss.profile_page}>
                <SideNav {...sideNavProps} />
                <div className={profileCss.profile_content}>
                  <TitleBar profileSelectedNav={profileSelectedNav} />
                  {this.renderContent()}
                </div>
              </div>
            </PageContainer>
          )}
        </React.Fragment>
      );
    }
    return null;
  }
}

function mapStatesToProps({
  userModel,
  layoutModel,
  transferModel,
  gameInfosModel,
  playerModel,
}) {
  const {gamePlatformList} = playerModel;
  const {otherSettings} = gameInfosModel;
  const {userData, bankAccounts} = userModel;
  const {profileGroupNav, profileSelectedNav, profileExpandedNav} = layoutModel;
  return {
    ...transferModel,
    bankAccounts,
    profileExpandedNav,
    profileGroupNav,
    profileSelectedNav,
    userData,
    otherSettings,
    gamePlatformList,
  };
}

export default connect(mapStatesToProps)(UserIndex);

import React, {Component} from 'react';
import {isEmpty, pick, mapValues, find} from 'lodash';
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
import AuthChannel, {COMMAND} from '../../../messaging/handler/auth';

const Authentication = resolve.plugin('Authentication');
// const DrawInfo = resolve.plugin('DrawInfo');
// const BasicInfo = resolve.plugin('BasicInfo');
// const CommissionReport = resolve.plugin('CommissionReport');
// const MemberManage = resolve.plugin('MemberManage');
// const MyCashFlow = resolve.plugin('CashFlowList');
const OrderRecord = resolve.plugin('OrderRecord');
// const AffCodeManage = resolve.plugin('AffCodeManage');
const PersonalReport = resolve.plugin('PersonalReport');
const SideNav = resolve.plugin('SideNavUser');
const TeamOverallReport = resolve.plugin('TeamOverallReport');

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

    this.authentication = <Authentication />;
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
    this.agentPersonalReport = <PersonalReport name="agent" />;
    this.personalReport = <PersonalReport name="user" searchable={false} />;
    this.teamOverallReport = <TeamOverallReport />;
    this.topupCtrl = <TopupCtrl />;
    this.topupRecord = <TransactionRecord type="TOPUP" />;
    this.withdrawalCtrl = <WithdrawalCtrl />;
    this.withdrawalRecord = <TransactionRecord type="WITHDRAWAL" />;
    this.msgInbox = <MyNews />;
    this.missionReport = <MissionReport />;
    this.sosFundReport = <SosFundReport />;
    this.handlerId = null;
  }

  componentDidMount() {
    this.handlerId = AuthChannel.add(this.handler);
    if (this.props.accessToken) this.initUser(this.props);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.profileSelectedNav !== nextProps.profileSelectedNav) {
      this.setState({previousSelectedNav: this.props.profileSelectedNav});
    }
  }

  componentWillUnmount() {
    AuthChannel.remove({id: this.handlerId});
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
    this.dispatch({
      type: 'reportModel/initializeAll',
    });
    this.dispatch({
      type: 'teamModel/initializeAll',
    });
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
    const {paymentList, adminBankId} = this.props;
    if (adminBankId) {
      this.dispatch({
        type: 'transferModel/updateState',
        payload: {topupType: 'BANK'},
      });
    } else {
      const selectedPayment = find(paymentList, [
        'paymentId',
        this.props.paymentId,
      ]);
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
    this.dispatch({
      type: 'transferModel/updateOddTransferInfo',
      payload: oddObject,
    });

    const {minAmount, maxAmount} = oddObject;
    const formPayload = {};
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

  handler = ({data}) => {
    if (data.command === COMMAND.UNAUTH) {
      this.dispatch({
        type: 'userModel/unauthenticate',
        payload: {trigger: true},
      });
    } else if (data.pkg) {
      if (data.command === COMMAND.AUTH) {
        this.dispatch({
          type: 'userModel/clearUserData',
        });
        this.dispatch({
          type: 'userModel/authenticate',
          payload: {
            accessToken: data.pkg.accessToken,
            sessionId: data.pkg.sessionId,
            trigger: true,
          },
        });
      }
    }
  };

  initUser = (props, switchUser = false) => {
    if (props.sessionId && (switchUser || isEmpty(props.userData)))
      this.dispatch({type: 'userModel/getCurrentUser'});
    if (!props.dailyWithdrawWithAdminSettingsResult || switchUser)
      this.dispatch({type: 'userModel/getCardsAndWithdrawDetail'});
    if (!props.topupGroups || switchUser)
      this.dispatch({type: 'transferModel/getTopupGroups'});
  };

  initializeTopupStatus = () => {
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
    const {
      adminBankId,
      bankAccounts,
      bankList,
      otherSettings,
      paymentId,
      paymentList,
      profileSelectedNav,
      selectedTopupGroup,
      topupGroups,
      userData,
    } = this.props;
    const sideNavProps = {
      adminBankId,
      bankAccounts,
      selectedTopupGroup,
      bankList,
      dispatch: this.dispatch,
      logoutHandler: this.logoutHandler,
      onAutoTopupSelect: this.onAutoTopupSelect,
      onBackClick: this.onBackClick,
      onBankTopupSelect: this.onBankTopupSelect,
      onNavSelect: this.onNavSelect,
      onOddTopupSelect: this.onOddTopupSelect,
      otherSettings,
      paymentId,
      paymentList,
      profileSelectedNav,
      topupGroups,
      userData,
    };

    return (
      <>
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
      </>
    );
  }
}

function mapStatesToProps({
  userModel,
  layoutModel,
  transferModel,
  gameInfosModel,
}) {
  const {otherSettings} = gameInfosModel;
  const {
    accessToken,
    dailyWithdrawWithAdminSettingsResult,
    sessionId,
    userData,
    bankAccounts,
  } = userModel;
  const {profileGroupNav, profileSelectedNav, profileExpandedNav} = layoutModel;
  return {
    ...transferModel,
    accessToken,
    dailyWithdrawWithAdminSettingsResult,
    sessionId,
    bankAccounts,
    profileExpandedNav,
    profileGroupNav,
    profileSelectedNav,
    userData,
    otherSettings,
  };
}

export default connect(mapStatesToProps)(UserIndex);
